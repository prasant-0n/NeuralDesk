/**
 * NeuralDesk Execution & Telemetry Domain Contracts
 * Tracks execution states, step latency waterfalls, token usage metadata, and costs.
 */

import type { NodeKind } from "./node.js";

export const EXECUTION_STATUSES = [
  "pending",
  "validating",
  "running",
  "completed",
  "failed",
  "cancelled",
] as const;

export type ExecutionStatus = (typeof EXECUTION_STATUSES)[number];

export const NODE_EXECUTION_STATUSES = [
  "idle",
  "pending",
  "running",
  "completed",
  "failed",
  "skipped",
] as const;

export type NodeExecutionStatus = (typeof NODE_EXECUTION_STATUSES)[number];

export type ExecutionMode = "real" | "simulation";

export type ExecutionTriggerSource = "manual" | "webhook" | "schedule" | "api";

export interface TokenUsageMetadata {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface CostBreakdown {
  promptCostUsd: number;
  completionCostUsd: number;
  totalCostUsd: number;
  currency: "USD";
}

export interface StepLatencyWaterfall {
  nodeKey: string;
  nodeType: NodeKind;
  startedAt: string;
  finishedAt?: string;
  durationMs: number;
  offsetMs: number;
  status: NodeExecutionStatus;
}

export interface NodeRunRecord {
  id: string;
  executionId: string;
  nodeId?: string;
  nodeKey: string;
  nodeType: NodeKind;
  status: NodeExecutionStatus;
  inputData?: Record<string, unknown>;
  outputData?: Record<string, unknown>;
  promptResolved?: string;
  llmModel?: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costEstimateUsd: number;
  durationMs: number;
  errorMessage?: string;
  errorStack?: string;
  attempt: number;
  startedAt: string;
  finishedAt?: string;
}

export interface ExecutionTrace {
  id: string;
  workflowId: string;
  workflowVersionId?: string;
  versionNumber?: number;
  triggeredBy?: string;
  triggerSource: ExecutionTriggerSource;
  mode: ExecutionMode;
  status: ExecutionStatus;
  initialInputs: Record<string, unknown>;
  finalOutputs?: Record<string, unknown>;
  totalTokensUsed: number;
  promptTokens: number;
  completionTokens: number;
  costEstimateUsd: number;
  durationMs: number;
  errorMessage?: string;
  startedAt: string;
  finishedAt?: string;
  nodeRuns: NodeRunRecord[];
  waterfall: StepLatencyWaterfall[];
  costBreakdown: CostBreakdown;
}

export interface ExecuteWorkflowRequest {
  mode?: ExecutionMode;
  triggerSource?: ExecutionTriggerSource;
  inputs?: Record<string, unknown>;
  versionNumber?: number;
}

export interface ExecuteWorkflowResponse {
  executionId: string;
  workflowId: string;
  versionNumber: number;
  mode: ExecutionMode;
  status: ExecutionStatus;
  startedAt: string;
  streamUrl: string;
}
