/**
 * NeuralDesk Workflow Execution Engine, Telemetry & Real-Time SSE Stream Routes
 * Handles execution triggers (live/mock), step telemetry, approval decisions, and SSE streaming.
 */

import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { z } from "zod";
import { db, executions, SEED_IDS } from "@neuraldesk/db";
import { sseManager } from "../services/sse-manager.js";
import { AppError } from "../middleware/error.middleware.js";
import { orchestrator } from "../engine/orchestrator.js";
import {
  inMemoryExecutions,
  inMemoryNodeRuns,
  inMemoryApprovals,
  type StoredExecution,
  type StoredNodeRun,
} from "../engine/store.js";

export { inMemoryExecutions, inMemoryNodeRuns, inMemoryApprovals, type StoredExecution, type StoredNodeRun };

export const executionsRoutes = new Hono();

// Flexible trigger request schema supporting camelCase and snake_case
const TriggerExecutionSchema = z.object({
  mode: z.enum(["real", "simulation", "mock", "live"]).default("real"),
  trigger_source: z.enum(["manual", "webhook", "schedule", "api"]).optional(),
  triggerSource: z.enum(["manual", "webhook", "schedule", "api"]).optional(),
  inputs: z.record(z.string(), z.unknown()).default({}),
  version_number: z.number().int().min(1).optional(),
  versionNumber: z.number().int().min(1).optional(),
  workflow_definition: z.any().optional(),
  workflowDefinition: z.any().optional(),
  api_key: z.string().optional(),
  apiKey: z.string().optional(),
});

// 1. POST /api/v1/workflows/:id/execute - Trigger execution
executionsRoutes.post("/workflows/:id/execute", async (c) => {
  const workflowId = c.req.param("id");
  const rawBody = await c.req.json().catch(() => ({}));
  const body = TriggerExecutionSchema.parse(rawBody);

  const executionId = `exec_${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;
  const triggerSource = body.trigger_source || body.triggerSource || "manual";
  const versionNumber = body.version_number || body.versionNumber || 1;
  const mode = body.mode;
  const startedAt = new Date().toISOString();

  const executionRecord: StoredExecution = {
    id: executionId,
    workflowId,
    versionNumber,
    status: "running",
    triggerType: triggerSource,
    triggerPayload: body.inputs,
    startedAt,
    durationMs: 0,
    totalTokens: 0,
    promptTokens: 0,
    completionTokens: 0,
    totalCostUsd: 0,
    executionMode: mode,
  };

  inMemoryExecutions.set(executionId, executionRecord);
  inMemoryNodeRuns.set(executionId, []);

  // Persist to DB if accessible
  const dbExecutionId = crypto.randomUUID();
  try {
    await db.insert(executions).values({
      id: dbExecutionId,
      workflowId: workflowId.includes("-") ? workflowId : SEED_IDS.WF_SUPPORT,
      status: "running",
      triggerType: triggerSource as any,
      triggerPayload: body.inputs,
      startedAt: new Date(),
      executionMode: mode === "real" ? "live" : "mock",
    });
  } catch {
    // Database fallback
  }

  // Initiate background DAG execution asynchronously via orchestrator concurrency queue
  const customDefinition = body.workflow_definition || body.workflowDefinition;
  const passedApiKey = body.api_key || body.apiKey;

  orchestrator
    .enqueueExecution({
      executionId,
      workflowId,
      workflowDefinition: customDefinition,
      inputs: body.inputs,
      mode,
      versionNumber,
      triggerSource: triggerSource as any,
      apiKey: passedApiKey,
      dbExecutionId,
    })
    .catch((err) => {
      console.error(`[Execution Engine] Run ${executionId} failed:`, err);
    });

  return c.json(
    {
      execution_id: executionId,
      workflow_id: workflowId,
      version_number: versionNumber,
      mode,
      status: "running",
      started_at: startedAt,
      stream_url: `/api/v1/executions/${executionId}/stream`,
    },
    202
  );
});

// 2. GET /api/v1/executions - List historical executions
executionsRoutes.get("/executions", async (c) => {
  const query = c.req.query();
  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || "20", 10)));
  const workflowId = query.workflow_id || query.workflowId;
  const status = query.status;

  let list = Array.from(inMemoryExecutions.values());
  if (workflowId) {
    list = list.filter((e) => e.workflowId === workflowId);
  }
  if (status) {
    list = list.filter((e) => e.status === status);
  }

  // Sort newest first
  list.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  const paginated = list.slice((page - 1) * limit, page * limit);

  return c.json({
    data: paginated,
    pagination: {
      page,
      limit,
      total: list.length,
      totalPages: Math.ceil(list.length / limit) || 1,
    },
  });
});

// 3. GET /api/v1/executions/:id - Execution summary & economics
executionsRoutes.get("/executions/:id", async (c) => {
  const id = c.req.param("id");
  const exec = inMemoryExecutions.get(id);

  if (!exec) {
    throw new AppError(`Execution ${id} not found`, 404, "NOT_FOUND");
  }

  return c.json({
    id: exec.id,
    workflow_id: exec.workflowId,
    status: exec.status,
    mode: exec.executionMode,
    total_tokens_used: exec.totalTokens,
    prompt_tokens: exec.promptTokens,
    completion_tokens: exec.completionTokens,
    cost_estimate_usd: exec.totalCostUsd,
    duration_ms: exec.durationMs,
    started_at: exec.startedAt,
    finished_at: exec.completedAt,
    final_outputs: exec.finalOutputs || {},
    error_message: exec.errorMessage,
  });
});

// 4. GET /api/v1/executions/:id/runs - Step telemetry waterfall
executionsRoutes.get("/executions/:id/runs", async (c) => {
  const id = c.req.param("id");
  const runs = inMemoryNodeRuns.get(id);

  if (!runs) {
    throw new AppError(`Execution ${id} runs not found`, 404, "NOT_FOUND");
  }

  return c.json({
    execution_id: id,
    runs: runs.map((r) => ({
      node_key: r.nodeKey,
      node_type: r.nodeType,
      status: r.status,
      duration_ms: r.durationMs,
      prompt_tokens: r.promptTokens,
      completion_tokens: r.completionTokens,
      cost_estimate_usd: r.costEstimateUsd,
      output_data: r.outputData,
      input_data: r.inputData,
      error_message: r.errorMessage,
    })),
  });
});

// 5. GET /api/v1/executions/:id/stream - Real-time Server-Sent Events stream
executionsRoutes.get("/executions/:id/stream", async (c) => {
  const executionId = c.req.param("id");
  const lastEventId =
    c.req.header("Last-Event-ID") ||
    c.req.header("last-event-id") ||
    c.req.query("lastEventId");

  return streamSSE(c, async (stream) => {
    // Subscribe to real-time events and catch-up buffer
    const unsubscribe = await sseManager.subscribe(executionId, stream, lastEventId);

    // Keep stream open until client disconnects or execution completes/errors
    await new Promise<void>((resolve) => {
      let isDone = false;
      const finish = () => {
        if (!isDone) {
          isDone = true;
          unsubscribe();
          resolve();
        }
      };

      stream.onAbort(finish);

      sseManager.onTerminal(executionId, () => {
        // Allow time for final completion chunk to flush
        setTimeout(finish, 800);
      });

      // If already terminated prior to connecting:
      if (sseManager.isTerminated(executionId)) {
        setTimeout(finish, 600);
      }
    });
  });
});

// 6. POST /api/v1/approvals/:id/decide - Human-in-the-loop review decision
const ApprovalDecisionSchema = z.object({
  decision: z.enum(["approved", "rejected", "modified"]),
  modifiedOutput: z.string().optional(),
  comments: z.string().optional(),
  reviewerId: z.string().uuid().optional(),
});

executionsRoutes.post("/approvals/:id/decide", async (c) => {
  const user = c.get("user");
  if (user && user.role === "viewer") {
    throw new AppError("Viewers are not permitted to record human review decisions.", 403, "FORBIDDEN");
  }

  const id = c.req.param("id");
  const body = await c.req.json();
  const validated = ApprovalDecisionSchema.parse(body);

  const approval = inMemoryApprovals.get(id);
  const reviewedAt = new Date().toISOString();

  const updatedRecord = {
    id,
    status: validated.decision,
    modifiedOutput: validated.modifiedOutput || null,
    reviewedAt,
    comments: validated.comments || null,
    reviewerId: validated.reviewerId || user?.id || null,
  };

  inMemoryApprovals.set(id, updatedRecord);

  // Resume or abort associated execution
  if (approval?.executionId) {
    const exec = inMemoryExecutions.get(approval.executionId);
    if (exec) {
      if (validated.decision === "approved" || validated.decision === "modified") {
        exec.status = "running";
      } else {
        exec.status = "cancelled";
        exec.errorMessage = "Execution rejected by human reviewer";
      }
    }
  }

  return c.json({
    data: updatedRecord,
    message: `Approval decision '${validated.decision}' recorded successfully.`,
  });
});

// 7. GET /api/v1/approvals - List pending approvals
executionsRoutes.get("/approvals", async (c) => {
  const list = Array.from(inMemoryApprovals.values());
  return c.json({ data: list });
});
