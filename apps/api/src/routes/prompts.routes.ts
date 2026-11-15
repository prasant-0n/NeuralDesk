/**
 * NeuralDesk Prompt Template Registry Routes
 * CRUD endpoints for reusable prompt templates, variable interpolators, and versioning.
 */

import { Hono } from "hono";
import { z } from "zod";
import { db, promptTemplates, eq, and, desc, SEED_IDS } from "@neuraldesk/db";
import { AppError } from "../middleware/error.middleware.js";

export const promptsRoutes = new Hono();

const CreatePromptSchema = z.object({
  workspaceId: z.string().uuid().optional(),
  name: z.string().min(1).max(128),
  slug: z.string().min(1).max(128).regex(/^[a-z0-9-]+$/),
  description: z.string().max(1000).optional(),
  content: z.string().min(1),
  variables: z.array(z.string()).default([]),
  category: z.string().max(64).default("general"),
});

const UpdatePromptSchema = CreatePromptSchema.partial();

interface StoredPrompt {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  description?: string | null;
  content: string;
  variables: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
}

const inMemoryPrompts = new Map<string, StoredPrompt>([
  [
    "00000000-0000-4000-8000-0000000000bb",
    {
      id: "00000000-0000-4000-8000-0000000000bb",
      workspaceId: SEED_IDS.WORKSPACE_CORE,
      name: "Customer Support Sentiment Analysis",
      slug: "support-sentiment",
      description: "Extracts sentiment, emotional temperature, and urgency rating from incoming ticket.",
      content: "Analyze the customer message below:\n\n{{customer_message}}\n\nOutput JSON with sentiment, urgency, and recommended response.",
      variables: ["customer_message"],
      category: "support",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
]);

// 1. GET /api/v1/prompts - List prompt templates
promptsRoutes.get("/", async (c) => {
  const wsId = c.req.query("workspaceId");
  const category = c.req.query("category");

  try {
    const conditions = [];
    if (wsId) conditions.push(eq(promptTemplates.workspaceId, wsId));
    if (category) conditions.push(eq(promptTemplates.category, category));

    const list = await db
      .select()
      .from(promptTemplates)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(promptTemplates.createdAt));

    if (list.length > 0) {
      return c.json({ data: list });
    }
  } catch {
    // Fallback
  }

  let list = Array.from(inMemoryPrompts.values());
  if (wsId) list = list.filter((p) => p.workspaceId === wsId);
  if (category) list = list.filter((p) => p.category === category);

  return c.json({ data: list });
});

// 2. POST /api/v1/prompts - Create prompt template
promptsRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const validated = CreatePromptSchema.parse(body);

  const promptId = crypto.randomUUID();
  const workspaceId = validated.workspaceId || SEED_IDS.WORKSPACE_CORE;

  const newPrompt: StoredPrompt = {
    id: promptId,
    workspaceId,
    name: validated.name,
    slug: validated.slug,
    description: validated.description || null,
    content: validated.content,
    variables: validated.variables,
    category: validated.category,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const [inserted] = await db
      .insert(promptTemplates)
      .values({
        id: promptId,
        workspaceId,
        name: validated.name,
        slug: validated.slug,
        description: validated.description,
        content: validated.content,
        variables: validated.variables,
        category: validated.category,
      })
      .returning();

    if (inserted) {
      return c.json({ data: inserted }, 201);
    }
  } catch {
    // Fallback
  }

  inMemoryPrompts.set(promptId, newPrompt);
  return c.json({ data: newPrompt }, 201);
});

// 3. GET /api/v1/prompts/:id - Get prompt by ID
promptsRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");

  try {
    const [prompt] = await db.select().from(promptTemplates).where(eq(promptTemplates.id, id)).limit(1);
    if (prompt) {
      return c.json({ data: prompt });
    }
  } catch {
    // Fallback
  }

  const mem = inMemoryPrompts.get(id);
  if (!mem) {
    throw new AppError(`Prompt template with ID ${id} not found`, 404, "NOT_FOUND");
  }
  return c.json({ data: mem });
});

// 4. PUT /api/v1/prompts/:id - Update prompt template
promptsRoutes.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const validated = UpdatePromptSchema.parse(body);

  try {
    const [updated] = await db
      .update(promptTemplates)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(promptTemplates.id, id))
      .returning();

    if (updated) {
      return c.json({ data: updated });
    }
  } catch {
    // Fallback
  }

  const mem = inMemoryPrompts.get(id);
  if (!mem) {
    throw new AppError(`Prompt template with ID ${id} not found`, 404, "NOT_FOUND");
  }

  Object.assign(mem, validated, { updatedAt: new Date().toISOString() });
  return c.json({ data: mem });
});

// 5. DELETE /api/v1/prompts/:id - Delete prompt template
promptsRoutes.delete("/:id", async (c) => {
  const id = c.req.param("id");

  try {
    await db.delete(promptTemplates).where(eq(promptTemplates.id, id));
  } catch {
    // Fallback
  }

  inMemoryPrompts.delete(id);
  return c.json({ success: true, message: `Prompt template ${id} deleted successfully.` });
});
