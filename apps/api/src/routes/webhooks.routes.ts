/**
 * NeuralDesk Inbound Webhook Ingress Routes
 * Handles authenticated third-party webhooks with HMAC-SHA256 signature checks and idempotency.
 */

import { Hono } from "hono";
import { z } from "zod";
import {
  db,
  webhooks,
  eq,
  desc,
  SEED_IDS,
} from "@neuraldesk/db";
import { verifyWebhookSignature } from "../middleware/hmac.middleware.js";
import { idempotencyMiddleware } from "../middleware/idempotency.middleware.js";
import { AppError } from "../middleware/error.middleware.js";
import { sseManager } from "../services/sse-manager.js";

export const webhooksRoutes = new Hono();

interface StoredWebhook {
  id: string;
  workflowId: string;
  urlToken: string;
  name: string;
  secret: string;
  isActive: boolean;
  createdAt: string;
  lastTriggeredAt?: string | null;
}

// Default secret for test suites and initial dev
export const DEFAULT_WEBHOOK_SECRET = "whsec_sample_secret_key_for_local_testing";

// ND-SEC-12: In-memory webhook replay cache for 300s tolerance window
const processedSignatures = new Map<string, number>();
setInterval(() => {
  const now = Date.now();
  for (const [sig, exp] of processedSignatures.entries()) {
    if (exp <= now) processedSignatures.delete(sig);
  }
}, 60 * 1000).unref();

// In-memory registry with sample pre-registered webhooks
const inMemoryWebhooks = new Map<string, StoredWebhook>([
  [
    "token_12345",
    {
      id: SEED_IDS.WF_SUPPORT_WH,
      workflowId: SEED_IDS.WF_SUPPORT,
      urlToken: "token_12345",
      name: "Customer Support Inbound Webhook",
      secret: DEFAULT_WEBHOOK_SECRET,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastTriggeredAt: null,
    },
  ],
  [
    "wh_lead_token_01",
    {
      id: SEED_IDS.WF_LEAD_WH,
      workflowId: SEED_IDS.WF_LEAD_ENRICHMENT,
      urlToken: "wh_lead_token_01",
      name: "HubSpot / Stripe Inbound Lead Webhook",
      secret: DEFAULT_WEBHOOK_SECRET,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastTriggeredAt: null,
    },
  ],
]);

// 1. POST /api/v1/webhooks/trigger/:urlToken - Ingress trigger endpoint
webhooksRoutes.post(
  "/trigger/:urlToken",
  idempotencyMiddleware({ required: false }),
  async (c) => {
    const urlToken = c.req.param("urlToken");
    const rawBody = await c.req.text();

    const signatureHeader =
      c.req.header("X-NeuralDesk-Signature") ||
      c.req.header("x-neuraldesk-signature");

    // Lookup webhook config by token
    let webhookRecord = inMemoryWebhooks.get(urlToken);

    if (!webhookRecord) {
      try {
        const [found] = await db
          .select()
          .from(webhooks)
          .where(eq(webhooks.urlToken, urlToken))
          .limit(1);

        if (found) {
          webhookRecord = {
            id: found.id,
            workflowId: found.workflowId,
            urlToken: found.urlToken,
            name: found.name,
            secret: found.secretHash || DEFAULT_WEBHOOK_SECRET,
            isActive: found.isActive,
            createdAt: found.createdAt.toISOString(),
            lastTriggeredAt: found.lastTriggeredAt?.toISOString(),
          };
        }
      } catch {
        // Fallback
      }
    }

    if (!webhookRecord || !webhookRecord.isActive) {
      throw new AppError(
        `Webhook with token ${urlToken} not found or inactive.`,
        404,
        "WEBHOOK_NOT_FOUND"
      );
    }

    const secret = webhookRecord.secret || DEFAULT_WEBHOOK_SECRET;

    // Cryptographic signature check
    const validation = verifyWebhookSignature(rawBody, signatureHeader, secret, 300);
    if (!validation.valid) {
      throw new AppError(
        `Webhook HMAC verification failed: ${validation.reason}`,
        401,
        "UNAUTHORIZED"
      );
    }

    // ND-SEC-12: Reject duplicate replay of identical signed webhook within tolerance window
    const replayKey = `${urlToken}:${signatureHeader}`;
    const nowMs = Date.now();
    const existingSigExp = processedSignatures.get(replayKey);
    if (existingSigExp && existingSigExp > nowMs) {
      throw new AppError(
        "Webhook signature has already been processed (replay detected).",
        409,
        "REPLAY_DETECTED"
      );
    }
    processedSignatures.set(replayKey, nowMs + 300 * 1000);

    // Parse payload
    let parsedPayload: Record<string, unknown> = {};
    if (rawBody && rawBody.trim() !== "") {
      try {
        parsedPayload = JSON.parse(rawBody);
      } catch {
        throw new AppError("Malformed JSON payload in webhook body", 400, "BAD_REQUEST");
      }
    }

    webhookRecord.lastTriggeredAt = new Date().toISOString();

    const executionId = `exec_${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;
    const startedAt = new Date().toISOString();

    // Trigger async event stream
    sseManager.broadcast(executionId, "execution:start", {
      execution_id: executionId,
      workflow_id: webhookRecord.workflowId,
      mode: "real",
      total_nodes: 3,
      ordered_keys: ["webhook_trigger", "gemini_sentiment", "escalation_router"],
      started_at: startedAt,
      inputs: parsedPayload,
    });

    return c.json(
      {
        execution_id: executionId,
        workflow_id: webhookRecord.workflowId,
        trigger_source: "webhook",
        webhook_name: webhookRecord.name,
        status: "accepted",
        started_at: startedAt,
        stream_url: `/api/v1/executions/${executionId}/stream`,
      },
      202
    );
  }
);

// 2. GET /api/v1/webhooks - List all registered webhooks (ND-SEC-04: Sanitized, secretHash stripped)
webhooksRoutes.get("/", async (c) => {
  try {
    const list = await db
      .select({
        id: webhooks.id,
        workflowId: webhooks.workflowId,
        urlToken: webhooks.urlToken,
        name: webhooks.name,
        isActive: webhooks.isActive,
        createdAt: webhooks.createdAt,
        lastTriggeredAt: webhooks.lastTriggeredAt,
      })
      .from(webhooks)
      .orderBy(desc(webhooks.createdAt));
    if (list.length > 0) {
      return c.json({ data: list });
    }
  } catch {
    // Fallback
  }

  const memList = Array.from(inMemoryWebhooks.values()).map((w) => ({
    id: w.id,
    workflowId: w.workflowId,
    urlToken: w.urlToken,
    name: w.name,
    isActive: w.isActive,
    createdAt: w.createdAt,
    lastTriggeredAt: w.lastTriggeredAt,
  }));

  return c.json({ data: memList });
});

// 3. POST /api/v1/webhooks - Register new webhook
const RegisterWebhookSchema = z.object({
  workflowId: z.string().min(1),
  name: z.string().min(1).max(128),
  secret: z.string().min(16).optional(),
});

webhooksRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const validated = RegisterWebhookSchema.parse(body);

  const urlToken = crypto.randomUUID().replace(/-/g, "");
  const secret = validated.secret || DEFAULT_WEBHOOK_SECRET;
  const newWh: StoredWebhook = {
    id: crypto.randomUUID(),
    workflowId: validated.workflowId,
    urlToken,
    name: validated.name,
    secret,
    isActive: true,
    createdAt: new Date().toISOString(),
    lastTriggeredAt: null,
  };

  try {
    await db.insert(webhooks).values({
      id: newWh.id,
      workflowId: newWh.workflowId.includes("-") ? newWh.workflowId : SEED_IDS.WF_SUPPORT,
      urlToken: newWh.urlToken,
      secretHash: secret,
      name: newWh.name,
      isActive: true,
    });
  } catch {
    // Fallback
  }

  inMemoryWebhooks.set(urlToken, newWh);

  return c.json(
    {
      data: {
        id: newWh.id,
        workflowId: newWh.workflowId,
        urlToken: newWh.urlToken,
        name: newWh.name,
        secret,
        ingressUrl: `/api/v1/webhooks/trigger/${urlToken}`,
        isActive: newWh.isActive,
        createdAt: newWh.createdAt,
      },
    },
    201
  );
});
