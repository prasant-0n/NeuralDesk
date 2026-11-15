/**
 * NeuralDesk In-Memory Execution & Run Telemetry Store
 * Provides low-latency thread-safe cache for active streaming, real-time metrics, and DB fallback.
 */

export interface StoredExecution {
  id: string;
  workflowId: string;
  workflowVersionId?: string | null;
  versionNumber: number;
  status: "pending" | "running" | "completed" | "failed" | "cancelled" | "waiting_for_approval";
  triggerType: "manual" | "webhook" | "schedule" | "api";
  triggerPayload: Record<string, unknown>;
  startedAt: string;
  completedAt?: string | null;
  durationMs: number;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  totalCostUsd: number;
  errorMessage?: string | null;
  executionMode: "real" | "simulation" | "mock" | "live";
  finalOutputs?: Record<string, unknown>;
}

export interface StoredNodeRun {
  id: string;
  executionId: string;
  nodeKey: string;
  nodeType: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped" | "waiting_for_approval";
  durationMs: number;
  promptTokens: number;
  completionTokens: number;
  costEstimateUsd: number;
  outputData: Record<string, unknown>;
  inputData: Record<string, unknown>;
  errorMessage?: string;
  finishReason?: string;
  startedAt: string;
  completedAt?: string;
}

export const inMemoryExecutions = new Map<string, StoredExecution>();
export const inMemoryNodeRuns = new Map<string, StoredNodeRun[]>();
export const inMemoryApprovals = new Map<string, any>();
