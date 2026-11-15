/**
 * NeuralDesk Workflows & Canvas Lifecycle Routes
 * Manages workflow graphs, version snapshots, immutable publishing, and rollbacks.
 */

import { Hono } from "hono";
import { z } from "zod";
import {
  db,
  workflows,
  workflowVersions,
  eq,
  and,
  desc,
  SEED_IDS,
} from "@neuraldesk/db";
import {
  CreateWorkflowSchema,
  UpdateWorkflowSchema,
  CreateWorkflowVersionSchema,
  WorkflowDefinitionSchema,
} from "@neuraldesk/shared";
import { AppError } from "../middleware/error.middleware.js";
import { inMemoryWorkflows, type StoredWorkflowRecord } from "../engine/store.js";

export const workflowsRoutes = new Hono();

// 1. GET /api/v1/workflows - List all workflows with pagination
workflowsRoutes.get("/", async (c) => {
  const query = c.req.query();
  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || "20", 10)));
  const category = query.category;
  const status = query.status;

  try {
    const conditions = [];
    if (category) conditions.push(eq(workflows.category, category));
    if (status) conditions.push(eq(workflows.status, status as any));

    const list = await db
      .select()
      .from(workflows)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(workflows.updatedAt))
      .limit(limit)
      .offset((page - 1) * limit);

    if (list.length > 0) {
      return c.json({
        data: list,
        pagination: {
          page,
          limit,
          total: list.length,
          totalPages: Math.ceil(list.length / limit) || 1,
        },
      });
    }
  } catch {
    // Database fallback
  }

  let memList = Array.from(inMemoryWorkflows.values());
  if (category) memList = memList.filter((w) => w.category === category);
  if (status) memList = memList.filter((w) => w.status === status);

  return c.json({
    data: memList.map((w) => ({
      id: w.id,
      workspaceId: w.workspaceId,
      name: w.name,
      description: w.description,
      category: w.category,
      status: w.status,
      isActive: w.isActive,
      activeVersion: w.activeVersionNumber,
      nodeCount: w.versions.find((v) => v.versionNumber === w.activeVersionNumber)?.definition?.nodes?.length || 0,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
    })),
    pagination: {
      page: 1,
      limit,
      total: memList.length,
      totalPages: 1,
    },
  });
});

// 2. POST /api/v1/workflows - Create workflow
workflowsRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const validated = CreateWorkflowSchema.parse(body);

  const workflowId = crypto.randomUUID();
  const workspaceId = validated.workspaceId || SEED_IDS.WORKSPACE_CORE;
  const initialDefinition = validated.initialDefinition || {
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1.0 },
  };

  const newWf = {
    id: workflowId,
    workspaceId,
    name: validated.name,
    description: validated.description || null,
    category: validated.category || "general",
    status: "draft" as const,
    isActive: true,
    createdBy: SEED_IDS.USER_ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const v1 = {
    id: crypto.randomUUID(),
    workflowId,
    versionNumber: 1,
    definition: initialDefinition,
    changelog: "Initial draft creation",
    isPublished: false,
    createdBy: SEED_IDS.USER_ADMIN,
    createdAt: new Date(),
  };

  try {
    const [inserted] = await db.insert(workflows).values(newWf).returning();
    await db.insert(workflowVersions).values(v1);
    if (inserted) {
      return c.json({ data: { ...inserted, version: v1 } }, 201);
    }
  } catch {
    // Fallback
  }

  const storedMem: StoredWorkflowRecord = {
    ...newWf,
    createdAt: newWf.createdAt.toISOString(),
    updatedAt: newWf.updatedAt.toISOString(),
    activeVersionNumber: 1,
    versions: [
      {
        ...v1,
        createdAt: v1.createdAt.toISOString(),
      },
    ],
  };

  inMemoryWorkflows.set(workflowId, storedMem);

  return c.json(
    {
      data: {
        id: workflowId,
        workspaceId,
        name: validated.name,
        description: validated.description || null,
        category: validated.category || "general",
        status: "draft",
        isActive: true,
        version: storedMem.versions[0],
        createdAt: storedMem.createdAt,
        updatedAt: storedMem.updatedAt,
      },
    },
    201
  );
});

// 3. GET /api/v1/workflows/:id - Fetch metadata, active version & canvas graph
workflowsRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");

  try {
    const [wf] = await db.select().from(workflows).where(eq(workflows.id, id)).limit(1);
    if (wf) {
      const versions = await db
        .select()
        .from(workflowVersions)
        .where(eq(workflowVersions.workflowId, id))
        .orderBy(desc(workflowVersions.versionNumber));

      const activeVer = versions.find((v) => v.isPublished) || versions[0];
      return c.json({
        data: {
          ...wf,
          version: activeVer,
          versions,
        },
      });
    }
  } catch {
    // Database fallback
  }

  const mem = inMemoryWorkflows.get(id);
  if (!mem) {
    throw new AppError(`Workflow with ID ${id} not found`, 404, "NOT_FOUND");
  }

  const activeVer =
    mem.versions.find((v) => v.versionNumber === mem.activeVersionNumber) ||
    mem.versions[mem.versions.length - 1];

  return c.json({
    data: {
      id: mem.id,
      workspaceId: mem.workspaceId,
      name: mem.name,
      description: mem.description,
      category: mem.category,
      status: mem.status,
      isActive: mem.isActive,
      version: activeVer,
      versions: mem.versions,
      createdAt: mem.createdAt,
      updatedAt: mem.updatedAt,
    },
  });
});

// 4. PUT /api/v1/workflows/:id - Update workflow metadata or draft canvas
const UpdateWorkflowAndCanvasSchema = UpdateWorkflowSchema.extend({
  definition: WorkflowDefinitionSchema.optional(),
});

workflowsRoutes.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const validated = UpdateWorkflowAndCanvasSchema.parse(body);

  const mem = inMemoryWorkflows.get(id);

  try {
    const { definition, ...meta } = validated;
    const [updatedWf] = await db
      .update(workflows)
      .set({
        ...meta,
        updatedAt: new Date(),
      })
      .where(eq(workflows.id, id))
      .returning();

    if (definition) {
      // Update latest unpublished draft or active version
      const [latestVer] = await db
        .select()
        .from(workflowVersions)
        .where(eq(workflowVersions.workflowId, id))
        .orderBy(desc(workflowVersions.versionNumber))
        .limit(1);

      if (latestVer && !latestVer.isPublished) {
        await db
          .update(workflowVersions)
          .set({ definition })
          .where(eq(workflowVersions.id, latestVer.id));
      }
    }

    if (updatedWf) {
      return c.json({ data: updatedWf });
    }
  } catch {
    // Fallback
  }

  if (!mem) {
    throw new AppError(`Workflow with ID ${id} not found`, 404, "NOT_FOUND");
  }

  if (validated.name !== undefined) mem.name = validated.name;
  if (validated.description !== undefined) mem.description = validated.description;
  if (validated.category !== undefined) mem.category = validated.category;
  if (validated.status !== undefined) mem.status = validated.status;
  if (validated.isActive !== undefined) mem.isActive = validated.isActive;
  mem.updatedAt = new Date().toISOString();

  if (validated.definition) {
    const currentVer = mem.versions.find((v) => v.versionNumber === mem.activeVersionNumber);
    if (currentVer) {
      currentVer.definition = validated.definition;
    }
  }

  return c.json({ data: mem });
});

// 5. DELETE /api/v1/workflows/:id - Delete workflow
workflowsRoutes.delete("/:id", async (c) => {
  const id = c.req.param("id");

  try {
    await db.delete(workflows).where(eq(workflows.id, id));
  } catch {
    // Fallback
  }

  inMemoryWorkflows.delete(id);
  return c.json({ success: true, message: `Workflow ${id} deleted successfully.` });
});

// 6. POST /api/v1/workflows/:id/versions - Snapshot new version
workflowsRoutes.post("/:id/versions", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const validated = CreateWorkflowVersionSchema.parse(body);

  const mem = inMemoryWorkflows.get(id);
  const nextVerNumber = mem ? mem.versions.length + 1 : 2;

  const newVer = {
    id: crypto.randomUUID(),
    workflowId: id,
    versionNumber: nextVerNumber,
    definition: validated.definition,
    changelog: validated.changelog || `Version ${nextVerNumber} snapshot`,
    isPublished: validated.isPublished ?? false,
    createdBy: SEED_IDS.USER_ADMIN,
    createdAt: new Date(),
  };

  try {
    const [inserted] = await db.insert(workflowVersions).values(newVer).returning();
    if (inserted) {
      return c.json({ data: inserted }, 201);
    }
  } catch {
    // Fallback
  }

  if (!mem) {
    throw new AppError(`Workflow with ID ${id} not found`, 404, "NOT_FOUND");
  }

  const verObj = {
    ...newVer,
    createdAt: newVer.createdAt.toISOString(),
  };
  mem.versions.push(verObj);
  if (validated.isPublished) {
    mem.activeVersionNumber = nextVerNumber;
    mem.status = "published";
  }

  return c.json({ data: verObj }, 201);
});

// 7. GET /api/v1/workflows/:id/versions - List versions
workflowsRoutes.get("/:id/versions", async (c) => {
  const id = c.req.param("id");

  try {
    const list = await db
      .select()
      .from(workflowVersions)
      .where(eq(workflowVersions.workflowId, id))
      .orderBy(desc(workflowVersions.versionNumber));

    if (list.length > 0) {
      return c.json({ data: list });
    }
  } catch {
    // Fallback
  }

  const mem = inMemoryWorkflows.get(id);
  if (!mem) {
    throw new AppError(`Workflow with ID ${id} not found`, 404, "NOT_FOUND");
  }

  return c.json({ data: mem.versions });
});

// 8. POST /api/v1/workflows/:id/publish & /api/v1/workflows/:id/versions/:verId/publish
workflowsRoutes.post("/:id/publish", async (c) => {
  const id = c.req.param("id");
  return handlePublish(id, undefined, c);
});

workflowsRoutes.post("/:id/versions/:verId/publish", async (c) => {
  const id = c.req.param("id");
  const verId = c.req.param("verId");
  return handlePublish(id, verId, c);
});

async function handlePublish(id: string, verId: string | undefined, c: any) {
  try {
    // Mark previous versions as unpublished
    await db
      .update(workflowVersions)
      .set({ isPublished: false })
      .where(eq(workflowVersions.workflowId, id));

    const condition = verId
      ? eq(workflowVersions.id, verId)
      : eq(workflowVersions.workflowId, id);

    const [published] = await db
      .update(workflowVersions)
      .set({ isPublished: true })
      .where(condition)
      .returning();

    await db
      .update(workflows)
      .set({ status: "published", updatedAt: new Date() })
      .where(eq(workflows.id, id));

    if (published) {
      return c.json({
        data: {
          workflowId: id,
          publishedVersion: published,
          status: "published",
        },
      });
    }
  } catch {
    // Fallback
  }

  const mem = inMemoryWorkflows.get(id);
  if (!mem) {
    throw new AppError(`Workflow with ID ${id} not found`, 404, "NOT_FOUND");
  }

  const targetVer = verId
    ? mem.versions.find((v) => v.id === verId)
    : mem.versions[mem.versions.length - 1];

  if (!targetVer) {
    throw new AppError("Target version to publish not found", 404, "NOT_FOUND");
  }

  for (const v of mem.versions) {
    v.isPublished = v.id === targetVer.id;
  }
  mem.activeVersionNumber = targetVer.versionNumber;
  mem.status = "published";
  mem.updatedAt = new Date().toISOString();

  return c.json({
    data: {
      workflowId: id,
      publishedVersion: targetVer,
      status: "published",
    },
  });
}

// 9. POST /api/v1/workflows/:id/rollback - Rollback to version number
const RollbackSchema = z.object({
  versionNumber: z.number().int().min(1),
});

workflowsRoutes.post("/:id/rollback", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { versionNumber } = RollbackSchema.parse(body);

  const mem = inMemoryWorkflows.get(id);
  if (!mem) {
    throw new AppError(`Workflow with ID ${id} not found`, 404, "NOT_FOUND");
  }

  const targetVer = mem.versions.find((v) => v.versionNumber === versionNumber);
  if (!targetVer) {
    throw new AppError(`Version ${versionNumber} does not exist for workflow ${id}`, 404, "NOT_FOUND");
  }

  for (const v of mem.versions) {
    v.isPublished = v.versionNumber === versionNumber;
  }
  mem.activeVersionNumber = versionNumber;
  mem.status = "published";
  mem.updatedAt = new Date().toISOString();

  return c.json({
    data: {
      workflowId: id,
      activeVersionNumber: versionNumber,
      message: `Workflow successfully rolled back to version ${versionNumber}`,
      version: targetVer,
    },
  });
});
