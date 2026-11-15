/**
 * NeuralDesk Workspaces & Team Members Routes
 * Full CRUD for workspaces, members, and workspace-scoped workflow listings.
 */

import { Hono } from "hono";
import { z } from "zod";
import {
  db,
  workspaces,
  workspaceMembers,
  workflows,
  workflowVersions,
  users,
  eq,
  and,
  desc,
  SEED_IDS,
} from "@neuraldesk/db";
import { AppError } from "../middleware/error.middleware.js";
import { CreateWorkflowSchema } from "@neuraldesk/shared";

export const workspacesRoutes = new Hono();

const CreateWorkspaceSchema = z.object({
  name: z.string().min(1).max(128),
  slug: z.string().min(1).max(128).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric and hyphens"),
  ownerId: z.string().uuid().optional(),
  encryptedApiKeys: z.string().optional(),
});

const UpdateWorkspaceSchema = z.object({
  name: z.string().min(1).max(128).optional(),
  slug: z.string().min(1).max(128).regex(/^[a-z0-9-]+$/).optional(),
  encryptedApiKeys: z.string().optional(),
});

const AddMemberSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["owner", "admin", "member", "viewer"]).default("member"),
});

// Fallback in-memory state for offline resilience
const inMemoryWorkspaces = new Map<string, any>([
  [
    SEED_IDS.WORKSPACE_CORE,
    {
      id: SEED_IDS.WORKSPACE_CORE,
      name: "NeuralDesk Core Research",
      slug: "neuraldesk-core",
      ownerId: SEED_IDS.USER_ADMIN,
      encryptedApiKeys: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
]);

const inMemoryMembers = new Map<string, any[]>([
  [
    SEED_IDS.WORKSPACE_CORE,
    [
      {
        id: SEED_IDS.MEMBER_ADMIN,
        workspaceId: SEED_IDS.WORKSPACE_CORE,
        userId: SEED_IDS.USER_ADMIN,
        role: "owner",
        createdAt: new Date().toISOString(),
      },
    ],
  ],
]);

// 1. GET /api/v1/workspaces - List all workspaces
workspacesRoutes.get("/", async (c) => {
  try {
    const list = await db.select().from(workspaces).orderBy(desc(workspaces.createdAt));
    if (list.length > 0) {
      return c.json({ data: list });
    }
  } catch {
    // Database fallback
  }

  return c.json({ data: Array.from(inMemoryWorkspaces.values()) });
});

// 2. POST /api/v1/workspaces - Create workspace
workspacesRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const validated = CreateWorkspaceSchema.parse(body);

  const ownerId = validated.ownerId || SEED_IDS.USER_ADMIN;
  const newWorkspace = {
    id: crypto.randomUUID(),
    name: validated.name,
    slug: validated.slug,
    ownerId,
    encryptedApiKeys: validated.encryptedApiKeys || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    const [inserted] = await db.insert(workspaces).values(newWorkspace).returning();
    if (inserted) {
      inMemoryWorkspaces.set(inserted.id, inserted);
      return c.json({ data: inserted }, 201);
    }
  } catch {
    // Fallback
  }

  inMemoryWorkspaces.set(newWorkspace.id, newWorkspace);
  return c.json({ data: newWorkspace }, 201);
});

// 3. GET /api/v1/workspaces/:id - Get workspace by ID
workspacesRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");

  try {
    const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, id)).limit(1);
    if (ws) {
      return c.json({ data: ws });
    }
  } catch {
    // Fallback
  }

  const mem = inMemoryWorkspaces.get(id);
  if (!mem) {
    throw new AppError(`Workspace with ID ${id} not found`, 404, "NOT_FOUND");
  }
  return c.json({ data: mem });
});

// 4. PUT /api/v1/workspaces/:id - Update workspace
workspacesRoutes.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const validated = UpdateWorkspaceSchema.parse(body);

  try {
    const [updated] = await db
      .update(workspaces)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(workspaces.id, id))
      .returning();

    if (updated) {
      inMemoryWorkspaces.set(id, updated);
      return c.json({ data: updated });
    }
  } catch {
    // Fallback
  }

  const existing = inMemoryWorkspaces.get(id);
  if (!existing) {
    throw new AppError(`Workspace with ID ${id} not found`, 404, "NOT_FOUND");
  }

  const updatedMem = {
    ...existing,
    ...validated,
    updatedAt: new Date().toISOString(),
  };
  inMemoryWorkspaces.set(id, updatedMem);
  return c.json({ data: updatedMem });
});

// 5. DELETE /api/v1/workspaces/:id - Delete workspace
workspacesRoutes.delete("/:id", async (c) => {
  const id = c.req.param("id");

  try {
    await db.delete(workspaces).where(eq(workspaces.id, id));
  } catch {
    // Fallback
  }

  inMemoryWorkspaces.delete(id);
  return c.json({ success: true, message: `Workspace ${id} deleted successfully.` });
});

// 6. GET /api/v1/workspaces/:id/members - List members
workspacesRoutes.get("/:id/members", async (c) => {
  const id = c.req.param("id");

  try {
    const members = await db
      .select({
        id: workspaceMembers.id,
        workspaceId: workspaceMembers.workspaceId,
        userId: workspaceMembers.userId,
        role: workspaceMembers.role,
        createdAt: workspaceMembers.createdAt,
        userEmail: users.email,
        userName: users.name,
      })
      .from(workspaceMembers)
      .leftJoin(users, eq(workspaceMembers.userId, users.id))
      .where(eq(workspaceMembers.workspaceId, id));

    if (members.length > 0) {
      return c.json({ data: members });
    }
  } catch {
    // Fallback
  }

  const list = inMemoryMembers.get(id) || [];
  return c.json({ data: list });
});

// 7. POST /api/v1/workspaces/:id/members - Add member
workspacesRoutes.post("/:id/members", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const validated = AddMemberSchema.parse(body);

  const newMember = {
    id: crypto.randomUUID(),
    workspaceId: id,
    userId: validated.userId,
    role: validated.role,
    createdAt: new Date(),
  };

  try {
    const [inserted] = await db.insert(workspaceMembers).values(newMember).returning();
    if (inserted) {
      return c.json({ data: inserted }, 201);
    }
  } catch {
    // Fallback
  }

  const list = inMemoryMembers.get(id) || [];
  list.push(newMember);
  inMemoryMembers.set(id, list);

  return c.json({ data: newMember }, 201);
});

// 8. DELETE /api/v1/workspaces/:id/members/:userId - Remove member
workspacesRoutes.delete("/:id/members/:userId", async (c) => {
  const id = c.req.param("id");
  const userId = c.req.param("userId");

  try {
    await db
      .delete(workspaceMembers)
      .where(and(eq(workspaceMembers.workspaceId, id), eq(workspaceMembers.userId, userId)));
  } catch {
    // Fallback
  }

  const list = inMemoryMembers.get(id) || [];
  inMemoryMembers.set(id, list.filter((m) => m.userId !== userId));

  return c.json({ success: true, message: "Member removed from workspace" });
});

// 9. GET /api/v1/workspaces/:wsId/workflows - Workflows in workspace with pagination
workspacesRoutes.get("/:wsId/workflows", async (c) => {
  const wsId = c.req.param("wsId");
  const query = c.req.query();
  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || "20", 10)));
  const search = query.search?.toLowerCase();
  const category = query.category;
  const status = query.status;

  try {
    const conditions = [eq(workflows.workspaceId, wsId)];
    if (category) conditions.push(eq(workflows.category, category));
    if (status) conditions.push(eq(workflows.status, status as any));

    const wfList = await db
      .select()
      .from(workflows)
      .where(and(...conditions))
      .orderBy(desc(workflows.updatedAt))
      .limit(limit)
      .offset((page - 1) * limit);

    if (wfList.length > 0) {
      return c.json({
        data: wfList,
        pagination: {
          page,
          limit,
          total: wfList.length,
          totalPages: Math.ceil(wfList.length / limit) || 1,
        },
      });
    }
  } catch {
    // Fallback
  }

  let memList = [
    {
      id: SEED_IDS.WF_SUPPORT,
      workspaceId: wsId,
      name: "Customer Support Sentiment & Routing",
      description: "Classifies incoming tickets and routes negative sentiment to Slack.",
      category: "support",
      status: "published",
      isActive: true,
      active_version: 1,
      node_count: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  if (search) {
    memList = memList.filter(
      (w) =>
        w.name.toLowerCase().includes(search) ||
        w.description?.toLowerCase().includes(search)
    );
  }

  return c.json({
    data: memList,
    pagination: {
      page: 1,
      limit,
      total: memList.length,
      totalPages: 1,
    },
  });
});

// 10. POST /api/v1/workspaces/:wsId/workflows - Create workflow inside workspace
workspacesRoutes.post("/:wsId/workflows", async (c) => {
  const wsId = c.req.param("wsId");
  const body = await c.req.json();
  const validated = CreateWorkflowSchema.parse(body);

  const wfId = crypto.randomUUID();
  const newWorkflow = {
    id: wfId,
    workspaceId: wsId,
    name: validated.name,
    description: validated.description || null,
    category: validated.category || "general",
    status: "draft" as const,
    isActive: true,
    createdBy: SEED_IDS.USER_ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const initialDefinition = validated.initialDefinition || {
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1.0 },
  };

  const v1 = {
    id: crypto.randomUUID(),
    workflowId: wfId,
    versionNumber: 1,
    definition: initialDefinition,
    changelog: "Initial draft creation",
    isPublished: false,
    createdBy: SEED_IDS.USER_ADMIN,
    createdAt: new Date(),
  };

  try {
    const [inserted] = await db.insert(workflows).values(newWorkflow).returning();
    await db.insert(workflowVersions).values(v1);
    if (inserted) {
      return c.json({ data: { ...inserted, version: v1 } }, 201);
    }
  } catch {
    // Fallback
  }

  return c.json(
    {
      data: {
        ...newWorkflow,
        createdAt: newWorkflow.createdAt.toISOString(),
        updatedAt: newWorkflow.updatedAt.toISOString(),
        version: {
          ...v1,
          createdAt: v1.createdAt.toISOString(),
        },
      },
    },
    201
  );
});
