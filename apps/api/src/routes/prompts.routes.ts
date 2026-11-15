/**
 * NeuralDesk Prompt Template Registry Routes
 * CRUD endpoints for reusable prompt templates, variable interpolators, and versioning.
 */

import { Hono } from "hono";
import { z } from "zod";
import { db, promptTemplates, eq, and, desc, SEED_IDS } from "@neuraldesk/db";
import { AppError } from "../middleware/error.middleware.js";
import { getLLMProvider } from "../providers/index.js";

export const promptsRoutes = new Hono();

const TestPromptSchema = z.object({
  prompt: z.string().min(1),
  model: z.string().default("gemini-3.8-flash"),
  temperature: z.number().min(0.0).max(2.0).default(0.7),
  apiKey: z.string().optional(),
});

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
    "p1",
    {
      id: "p1",
      workspaceId: SEED_IDS.WORKSPACE_CORE,
      name: "Customer Support Urgency & Sentiment Triage",
      slug: "support-sentiment-triage",
      description: "Extracts sentiment, urgency rating, and generates actionable triage instructions.",
      content:
        "Analyze the incoming customer support message below:\n\nMessage: {{customer_message}}\n\nTask: Output strict JSON with:\n1. \"sentiment\": \"POSITIVE\" | \"NEUTRAL\" | \"NEGATIVE\"\n2. \"urgency\": integer 1-5\n3. \"escalate\": boolean\n4. \"summary\": 1-sentence technical distillation",
      variables: ["customer_message"],
      category: "support",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  [
    "p2",
    {
      id: "p2",
      workspaceId: SEED_IDS.WORKSPACE_CORE,
      name: "Executive Technical Synthesis & Key Takeaways",
      slug: "executive-synthesis",
      description: "Synthesizes architecture RFCs, logs, or post-mortems into executive takeaways.",
      content:
        "You are an executive engineering analyst. Synthesize the following document into 3 key takeaways and actionable architectural recommendations:\n\nDocument Title: {{document_title}}\nContent:\n{{document_body}}",
      variables: ["document_title", "document_body"],
      category: "summarization",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  [
    "p3",
    {
      id: "p3",
      workspaceId: SEED_IDS.WORKSPACE_CORE,
      name: "Enterprise B2B Lead Intent Qualification",
      slug: "b2b-lead-qualification",
      description: "Scores buyer propensity, detects budget authority, and identifies VIP prospects.",
      content:
        "Evaluate the following lead record for enterprise software buying propensity:\nCompany: {{company_name}}\nEmployee Count: {{employee_count}}\nInquiry: {{inquiry_notes}}\n\nScore lead from 0 to 100 with qualification justification.",
      variables: ["company_name", "employee_count", "inquiry_notes"],
      category: "sales",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  [
    "p4",
    {
      id: "p4",
      workspaceId: SEED_IDS.WORKSPACE_CORE,
      name: "Code Security & Vulnerability Audit",
      slug: "code-security-audit",
      description: "Inspects code snippets for OWASP Top 10 vulnerabilities and data leakage.",
      content:
        "Perform a rigorous static security analysis on the following code snippet:\n\nLanguage: {{language}}\nCode:\n{{code_snippet}}\n\nIdentify CVE risks, insecure configurations, and propose secure remediation.",
      variables: ["language", "code_snippet"],
      category: "security",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  [
    "p5",
    {
      id: "p5",
      workspaceId: SEED_IDS.WORKSPACE_CORE,
      name: "Structured JSON Entity Extraction",
      slug: "json-entity-extractor",
      description: "Extracts normalized key-value fields from unstructured customer emails.",
      content:
        "Extract structured JSON entities from the following text:\nText: {{raw_text}}\nRequired Fields: {{fields_list}}\n\nReturn strict JSON schema with zero preamble.",
      variables: ["raw_text", "fields_list"],
      category: "extraction",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
]);

// 0. POST /api/v1/prompts/test - Interactive prompt testing runner
promptsRoutes.post("/test", async (c) => {
  const body = await c.req.json();
  const validated = TestPromptSchema.parse(body);

  const activeApiKey =
    validated.apiKey ||
    c.req.header("x-api-key") ||
    process.env.GEMINI_API_KEY;

  const mode = activeApiKey && activeApiKey !== "your_gemini_api_key_here" ? "live" : "simulation";
  const provider = getLLMProvider("gemini", mode, activeApiKey);

  const startTime = Date.now();
  const result = await provider.executeStream({
    prompt: validated.prompt,
    model: validated.model,
    temperature: validated.temperature,
    maxTokens: 2048,
    apiKey: activeApiKey,
  });

  const durationMs = Date.now() - startTime;

  return c.json({
    output: result.text,
    tokens: {
      prompt: result.promptTokens || 24,
      completion: result.completionTokens || 68,
      total: (result.promptTokens || 24) + (result.completionTokens || 68),
    },
    costUsd: result.costUsd || 0.000015,
    durationMs,
    model: validated.model,
  });
});

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
