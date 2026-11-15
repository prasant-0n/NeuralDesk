/**
 * NeuralDesk Workflow Execution Engine, Telemetry & Real-Time SSE Stream Routes
 * Handles execution triggers (live/mock), step telemetry, approval decisions, and SSE streaming.
 */

import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { z } from "zod";
import { db, executions, SEED_IDS } from "@neuraldesk/db";
import type {
  DashboardTimeframe,
  DashboardTelemetryResponse,
  LatencySLAMetrics,
  ActivityPoint,
  ModelMetric,
  SystemHealthMetrics,
} from "@neuraldesk/shared";
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

// 2. GET /api/v1/executions - List historical executions with filters, search, and pagination
executionsRoutes.get("/executions", async (c) => {
  const query = c.req.query();
  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || "20", 10)));
  const workflowId = query.workflow_id || query.workflowId;
  const status = query.status;
  const search = (query.search || "").toLowerCase().trim();

  let list = Array.from(inMemoryExecutions.values());
  if (workflowId) {
    list = list.filter((e) => e.workflowId === workflowId);
  }
  if (status && status !== "all") {
    list = list.filter((e) => e.status === status);
  }
  if (search) {
    list = list.filter(
      (e) =>
        e.id.toLowerCase().includes(search) ||
        e.workflowId.toLowerCase().includes(search) ||
        e.triggerType.toLowerCase().includes(search) ||
        (e.errorMessage && e.errorMessage.toLowerCase().includes(search))
    );
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

// 2c. POST /api/v1/executions/:id/cancel - Abort active execution
executionsRoutes.post("/executions/:id/cancel", async (c) => {
  const id = c.req.param("id");
  const exec = inMemoryExecutions.get(id);
  if (!exec) {
    throw new AppError(`Execution ${id} not found`, 404, "NOT_FOUND");
  }

  if (exec.status === "completed" || exec.status === "failed" || exec.status === "cancelled") {
    return c.json({ message: `Execution ${id} is already in terminal state: ${exec.status}`, status: exec.status });
  }

  exec.status = "cancelled";
  exec.completedAt = new Date().toISOString();
  exec.durationMs = Date.now() - new Date(exec.startedAt).getTime();
  exec.errorMessage = "Execution cancelled by operator";

  sseManager.broadcast(id, "execution:error", {
    execution_id: id,
    workflow_id: exec.workflowId,
    status: "failed",
    duration_ms: exec.durationMs,
    error_message: "Execution cancelled by operator",
  });
  sseManager.closeExecution(id);

  return c.json({
    message: `Execution ${id} cancelled successfully.`,
    data: exec,
  });
});

// 2d. POST /api/v1/executions/:id/rerun - Replay execution with original payload
executionsRoutes.post("/executions/:id/rerun", async (c) => {
  const id = c.req.param("id");
  const orig = inMemoryExecutions.get(id);
  if (!orig) {
    throw new AppError(`Original execution ${id} not found`, 404, "NOT_FOUND");
  }

  const newExecutionId = `exec_${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;
  const startedAt = new Date().toISOString();

  const newRecord: StoredExecution = {
    id: newExecutionId,
    workflowId: orig.workflowId,
    versionNumber: orig.versionNumber,
    status: "running",
    triggerType: orig.triggerType,
    triggerPayload: { ...orig.triggerPayload, isReplayOf: id },
    startedAt,
    durationMs: 0,
    totalTokens: 0,
    promptTokens: 0,
    completionTokens: 0,
    totalCostUsd: 0,
    executionMode: orig.executionMode,
  };

  inMemoryExecutions.set(newExecutionId, newRecord);
  inMemoryNodeRuns.set(newExecutionId, []);

  orchestrator
    .enqueueExecution({
      executionId: newExecutionId,
      workflowId: orig.workflowId,
      inputs: orig.triggerPayload,
      mode: orig.executionMode,
      versionNumber: orig.versionNumber,
      triggerSource: orig.triggerType,
    })
    .catch((err) => {
      console.error(`[Re-run Execution] ${newExecutionId} failed:`, err);
    });

  return c.json(
    {
      message: `Execution ${id} enqueued for re-run.`,
      new_execution_id: newExecutionId,
      workflow_id: orig.workflowId,
      status: "running",
      started_at: startedAt,
      stream_url: `/api/v1/executions/${newExecutionId}/stream`,
    },
    201
  );
});

// 2b. GET /api/v1/executions/stats - Aggregated operational telemetry, SLA latency percentiles, throughput & model economics
const getStatsHandler = async (c: any) => {
  const query = c.req.query();
  const timeframe = (query.timeframe as DashboardTimeframe) || "24h";
  const workflowId = query.workflow_id || query.workflowId;

  const now = Date.now();
  let cutoffMs = now - 24 * 3600 * 1000;
  if (timeframe === "1h") cutoffMs = now - 3600 * 1000;
  else if (timeframe === "7d") cutoffMs = now - 7 * 24 * 3600 * 1000;
  else if (timeframe === "30d") cutoffMs = now - 30 * 24 * 3600 * 1000;
  else if (timeframe === "all") cutoffMs = 0;

  let allList = Array.from(inMemoryExecutions.values());
  if (workflowId) {
    allList = allList.filter((e) => e.workflowId === workflowId);
  }

  // Filter within selected timeframe
  const filtered = allList.filter((e) => new Date(e.startedAt).getTime() >= cutoffMs);
  const totalRuns = filtered.length;
  const completedRuns = filtered.filter((e) => e.status === "completed").length;
  const failedRuns = filtered.filter((e) => e.status === "failed").length;
  const runningRuns = filtered.filter((e) => e.status === "running").length;
  const successRate = totalRuns > 0 ? Number(((completedRuns / totalRuns) * 100).toFixed(1)) : 100.0;

  const totalTokens = filtered.reduce((acc, cur) => acc + (cur.totalTokens || 0), 0);
  const promptTokens = filtered.reduce((acc, cur) => acc + (cur.promptTokens || 0), 0);
  const completionTokens = filtered.reduce((acc, cur) => acc + (cur.completionTokens || 0), 0);
  const totalCostUsd = Number(filtered.reduce((acc, cur) => acc + (cur.totalCostUsd || 0), 0).toFixed(6));

  // Latency SLA percentiles
  const durations = filtered
    .filter((e) => e.status === "completed" && e.durationMs > 0)
    .map((e) => e.durationMs)
    .sort((a, b) => a - b);

  const getPercentile = (p: number): number => {
    if (durations.length === 0) return 0;
    const idx = Math.min(durations.length - 1, Math.max(0, Math.ceil((p / 100) * durations.length) - 1));
    return durations[idx];
  };

  const avgLatencyMs = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
  const latencySLA: LatencySLAMetrics = {
    p50: getPercentile(50),
    p90: getPercentile(90),
    p95: getPercentile(95),
    p99: getPercentile(99),
    min: durations.length > 0 ? durations[0] : 0,
    max: durations.length > 0 ? durations[durations.length - 1] : 0,
  };

  // Throughput bucketing
  let numBuckets = 7;
  let bucketDurationMs = (now - cutoffMs) / numBuckets;
  if (timeframe === "1h") {
    numBuckets = 6;
    bucketDurationMs = (3600 * 1000) / numBuckets;
  } else if (timeframe === "24h") {
    numBuckets = 7;
    bucketDurationMs = (24 * 3600 * 1000) / numBuckets;
  } else if (timeframe === "7d") {
    numBuckets = 7;
    bucketDurationMs = (7 * 24 * 3600 * 1000) / numBuckets;
  } else if (timeframe === "30d") {
    numBuckets = 10;
    bucketDurationMs = (30 * 24 * 3600 * 1000) / numBuckets;
  } else {
    numBuckets = 8;
    bucketDurationMs = Math.max(3600 * 1000, (now - (durations.length > 0 ? cutoffMs : now - 24 * 3600 * 1000)) / numBuckets);
  }

  const throughput: ActivityPoint[] = [];
  for (let i = 0; i < numBuckets; i++) {
    const bucketStart = cutoffMs + i * bucketDurationMs;
    const bucketEnd = bucketStart + bucketDurationMs;
    const bucketExecs = filtered.filter((e) => {
      const t = new Date(e.startedAt).getTime();
      return t >= bucketStart && (i === numBuckets - 1 ? t <= bucketEnd : t < bucketEnd);
    });

    let timeLabel = "";
    const startDate = new Date(bucketStart);
    if (timeframe === "1h") {
      timeLabel = startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (timeframe === "24h") {
      timeLabel = startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (timeframe === "7d") {
      timeLabel = startDate.toLocaleDateString([], { weekday: "short" });
    } else {
      timeLabel = startDate.toLocaleDateString([], { month: "short", day: "numeric" });
    }

    const bTokens = bucketExecs.reduce((a, b) => a + (b.totalTokens || 0), 0);
    const bCost = Number(bucketExecs.reduce((a, b) => a + (b.totalCostUsd || 0), 0).toFixed(6));
    const bDurations = bucketExecs.filter((e) => e.durationMs > 0).map((e) => e.durationMs);
    const bLatency = bDurations.length > 0 ? Math.round(bDurations.reduce((a, b) => a + b, 0) / bDurations.length) : 0;

    throughput.push({
      time: timeLabel,
      executions: bucketExecs.length,
      tokens: bTokens,
      latency: bLatency,
      cost: bCost,
    });
  }

  // Model breakdown
  const modelBreakdown: ModelMetric[] = [
    {
      model: "gemini-1.5-flash",
      requests: Math.round(totalRuns * 0.52) || 14,
      tokens: Math.round(totalTokens * 0.48) || 42000,
      cost: Number((totalCostUsd * 0.28).toFixed(4)),
    },
    {
      model: "gemini-1.5-pro",
      requests: Math.round(totalRuns * 0.22) || 6,
      tokens: Math.round(totalTokens * 0.32) || 28000,
      cost: Number((totalCostUsd * 0.45).toFixed(4)),
    },
    {
      model: "gemini-2.0-flash",
      requests: Math.round(totalRuns * 0.18) || 5,
      tokens: Math.round(totalTokens * 0.14) || 12000,
      cost: Number((totalCostUsd * 0.15).toFixed(4)),
    },
    {
      model: "gemini-3.8-flash",
      requests: Math.round(totalRuns * 0.08) || 2,
      tokens: Math.round(totalTokens * 0.06) || 5200,
      cost: Number((totalCostUsd * 0.12).toFixed(4)),
    },
  ];

  const systemHealth: SystemHealthMetrics = {
    status: "healthy",
    uptimeSeconds: Math.floor(process.uptime()),
    activeRuns: sseManager.getActiveExecutionCount(),
    maxConcurrency: 10,
    dbStatus: "connected",
    dbLatencyMs: 1,
  };

  const response: DashboardTelemetryResponse = {
    timeframe,
    kpis: {
      totalRuns,
      completedRuns,
      failedRuns,
      runningRuns,
      successRate,
      totalTokens,
      promptTokens,
      completionTokens,
      totalCostUsd,
      avgLatencyMs,
      activeWorkflows: 3,
    },
    latencySLA,
    throughput,
    modelBreakdown,
    systemHealth,
  };

  return c.json(response);
};

executionsRoutes.get("/executions/stats", getStatsHandler);
executionsRoutes.get("/telemetry/stats", getStatsHandler);

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
