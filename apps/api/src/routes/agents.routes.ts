/**
 * NeuralDesk Agent Personas Management Routes
 * CRUD endpoints for AI agent configurations, system prompts, model defaults, and generation hyperparameters.
 */

import { Hono } from "hono";
import { z } from "zod";
import { db, agents, eq, and, desc, SEED_IDS } from "@neuraldesk/db";
import { AppError } from "../middleware/error.middleware.js";
import { getLLMProvider } from "../providers/index.js";

export const agentsRoutes = new Hono();

const ChatRequestSchema = z.object({
  agentId: z.string().optional(),
  message: z.string().min(1),
  history: z
    .array(
      z.object({
        sender: z.enum(["user", "agent"]),
        text: z.string(),
      })
    )
    .default([]),
  model: z.string().default("gemini-3.8-flash"),
  temperature: z.number().min(0.0).max(2.0).default(0.7),
  systemPrompt: z.string().optional(),
  apiKey: z.string().optional(),
});

const CreateAgentSchema = z.object({
  workspaceId: z.string().uuid().optional(),
  name: z.string().min(1).max(128),
  slug: z.string().min(1).max(128).regex(/^[a-z0-9-]+$/),
  description: z.string().max(1000).optional(),
  systemPrompt: z.string().min(1),
  defaultModel: z.string().default("gemini-1.5-flash"),
  temperature: z.number().min(0.0).max(2.0).default(0.7),
  topP: z.number().min(0.0).max(1.0).default(0.95),
  maxTokens: z.number().int().min(1).max(65536).default(2048),
});

const UpdateAgentSchema = CreateAgentSchema.partial();

interface StoredAgent {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  description?: string | null;
  systemPrompt: string;
  defaultModel: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

const inMemoryAgents = new Map<string, StoredAgent>([
  [
    "00000000-0000-4000-8000-0000000000aa",
    {
      id: "00000000-0000-4000-8000-0000000000aa",
      workspaceId: SEED_IDS.WORKSPACE_CORE,
      name: "Senior Triage Engineer",
      slug: "triage-engineer",
      description: "Classifies ticket sentiment, detects anomalies, and drafts responses.",
      systemPrompt: "You are a senior enterprise customer support engineer. Categorize issues by urgency and sentiment.",
      defaultModel: "gemini-1.5-flash",
      temperature: 0.2,
      topP: 0.95,
      maxTokens: 2048,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
]);

// 0. POST /api/v1/agents/chat - Interactive conversation with real Gemini or simulated persona
agentsRoutes.post("/chat", async (c) => {
  const body = await c.req.json();
  const validated = ChatRequestSchema.parse(body);

  const activeApiKey =
    validated.apiKey ||
    c.req.header("x-api-key") ||
    process.env.GEMINI_API_KEY;

  const mode = activeApiKey && activeApiKey !== "your_gemini_api_key_here" ? "live" : "simulation";
  const provider = getLLMProvider("gemini", mode, activeApiKey);

  // Build conversational context
  let historyContext = "";
  if (validated.history && validated.history.length > 0) {
    historyContext =
      validated.history
        .slice(-6)
        .map((h) => `${h.sender === "user" ? "User" : "Agent"}: ${h.text}`)
        .join("\n\n") + "\n\n";
  }

  const fullPrompt = `${historyContext}User: ${validated.message}\nAgent:`;
  const systemPrompt = validated.systemPrompt || "You are a professional enterprise AI assistant.";

  // Generate response
  const startTime = Date.now();
  const result = await provider.executeStream({
    prompt: fullPrompt,
    systemPrompt,
    model: validated.model,
    temperature: validated.temperature,
    maxTokens: 2048,
    apiKey: activeApiKey,
  });

  const durationMs = Date.now() - startTime;

  // Tool Call Detection / Simulation
  let toolCall: { name: string; args: Record<string, unknown>; status: string } | undefined;
  const msgLower = validated.message.toLowerCase();
  if (validated.agentId === "agent_sales" || /lead|crm|company|prospect|evaluat/i.test(msgLower)) {
    toolCall = {
      name: "crm_lead_enricher",
      args: { query: validated.message.slice(0, 30), source: "enterprise_crm_v2" },
      status: "200 OK (Enriched)",
    };
  } else if (validated.agentId === "agent_triage" || /ticket|incident|urgent|timeout|bug/i.test(msgLower)) {
    toolCall = {
      name: "slack_pager_router",
      args: { channel: "#incident-escalations", priority: "P1" },
      status: "200 OK (Dispatched)",
    };
  }

  return c.json({
    text: result.text,
    tokens: {
      prompt: result.promptTokens || 35,
      completion: result.completionTokens || 85,
      total: (result.promptTokens || 35) + (result.completionTokens || 85),
    },
    costUsd: result.costUsd || 0.00002,
    durationMs,
    model: validated.model,
    toolCall,
  });
});

// 1. GET /api/v1/agents - List agents
agentsRoutes.get("/", async (c) => {
  const wsId = c.req.query("workspaceId");

  try {
    const query = wsId
      ? db.select().from(agents).where(and(eq(agents.workspaceId, wsId), eq(agents.isArchived, false)))
      : db.select().from(agents).where(eq(agents.isArchived, false));

    const list = await query.orderBy(desc(agents.createdAt));
    if (list.length > 0) {
      return c.json({ data: list });
    }
  } catch {
    // Fallback
  }

  let list = Array.from(inMemoryAgents.values()).filter((a) => !a.isArchived);
  if (wsId) {
    list = list.filter((a) => a.workspaceId === wsId);
  }
  return c.json({ data: list });
});

// 2. POST /api/v1/agents - Create agent
agentsRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const validated = CreateAgentSchema.parse(body);

  const agentId = crypto.randomUUID();
  const workspaceId = validated.workspaceId || SEED_IDS.WORKSPACE_CORE;

  const newAgent: StoredAgent = {
    id: agentId,
    workspaceId,
    name: validated.name,
    slug: validated.slug,
    description: validated.description || null,
    systemPrompt: validated.systemPrompt,
    defaultModel: validated.defaultModel,
    temperature: validated.temperature,
    topP: validated.topP,
    maxTokens: validated.maxTokens,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const [inserted] = await db
      .insert(agents)
      .values({
        id: agentId,
        workspaceId,
        name: validated.name,
        slug: validated.slug,
        description: validated.description,
        systemPrompt: validated.systemPrompt,
        defaultModel: validated.defaultModel,
        temperature: validated.temperature.toString(),
        topP: validated.topP.toString(),
        maxTokens: validated.maxTokens,
      })
      .returning();

    if (inserted) {
      return c.json({ data: inserted }, 201);
    }
  } catch {
    // Fallback
  }

  inMemoryAgents.set(agentId, newAgent);
  return c.json({ data: newAgent }, 201);
});

// 3. GET /api/v1/agents/:id - Get agent by ID
agentsRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");

  try {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id)).limit(1);
    if (agent) {
      return c.json({ data: agent });
    }
  } catch {
    // Fallback
  }

  const mem = inMemoryAgents.get(id);
  if (!mem) {
    throw new AppError(`Agent persona with ID ${id} not found`, 404, "NOT_FOUND");
  }
  return c.json({ data: mem });
});

// 4. PUT /api/v1/agents/:id - Update agent
agentsRoutes.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const validated = UpdateAgentSchema.parse(body);

  try {
    const updateData: Record<string, any> = { ...validated, updatedAt: new Date() };
    if (validated.temperature !== undefined) updateData.temperature = validated.temperature.toString();
    if (validated.topP !== undefined) updateData.topP = validated.topP.toString();

    const [updated] = await db.update(agents).set(updateData).where(eq(agents.id, id)).returning();
    if (updated) {
      return c.json({ data: updated });
    }
  } catch {
    // Fallback
  }

  const mem = inMemoryAgents.get(id);
  if (!mem) {
    throw new AppError(`Agent persona with ID ${id} not found`, 404, "NOT_FOUND");
  }

  Object.assign(mem, validated, { updatedAt: new Date().toISOString() });
  return c.json({ data: mem });
});

// 5. DELETE /api/v1/agents/:id - Archive or delete agent
agentsRoutes.delete("/:id", async (c) => {
  const id = c.req.param("id");

  try {
    await db.update(agents).set({ isArchived: true }).where(eq(agents.id, id));
  } catch {
    // Fallback
  }

  const mem = inMemoryAgents.get(id);
  if (mem) {
    mem.isArchived = true;
  }

  return c.json({ success: true, message: `Agent ${id} archived successfully.` });
});
