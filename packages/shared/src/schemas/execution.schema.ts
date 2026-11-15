/**
 * NeuralDesk Execution Validation Schemas
 * Validates execution triggers, input payloads, pagination query parameters, and telemetry records.
 */

import { z } from "zod";
import { NODE_KINDS } from "../types/node.js";

export const ExecutionStatusSchema = z.enum([
  "pending",
  "validating",
  "running",
  "completed",
  "failed",
  "cancelled",
]);

export const NodeExecutionStatusSchema = z.enum([
  "idle",
  "pending",
  "running",
  "completed",
  "failed",
  "skipped",
]);

export const ExecutionModeSchema = z.enum(["real", "simulation"]);

export const ExecutionTriggerSourceSchema = z.enum(["manual", "webhook", "schedule", "api"]);

export const ExecuteWorkflowRequestSchema = z.object({
  mode: ExecutionModeSchema.default("real"),
  triggerSource: ExecutionTriggerSourceSchema.default("manual"),
  inputs: z.record(z.string(), z.unknown()).default({}),
  versionNumber: z.number().int().min(1).optional(),
});

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const WebhookIngressSchema = z.object({
  workflowId: z.string().min(1),
  timestamp: z.number().int().positive(),
  signature: z.string().min(1),
  payload: z.record(z.string(), z.unknown()),
});

export const TokenUsageMetadataSchema = z.object({
  promptTokens: z.number().int().nonnegative(),
  completionTokens: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
});

export const CostBreakdownSchema = z.object({
  promptCostUsd: z.number().nonnegative(),
  completionCostUsd: z.number().nonnegative(),
  totalCostUsd: z.number().nonnegative(),
  currency: z.literal("USD"),
});

export const StepLatencyWaterfallSchema = z.object({
  nodeKey: z.string().min(1),
  nodeType: z.enum(NODE_KINDS),
  startedAt: z.string(),
  finishedAt: z.string().optional(),
  durationMs: z.number().nonnegative(),
  offsetMs: z.number().nonnegative(),
  status: NodeExecutionStatusSchema,
});

export const NodeRunRecordSchema = z.object({
  id: z.string().min(1),
  executionId: z.string().min(1),
  nodeId: z.string().optional(),
  nodeKey: z.string().min(1),
  nodeType: z.enum(NODE_KINDS),
  status: NodeExecutionStatusSchema,
  inputData: z.record(z.string(), z.unknown()).optional(),
  outputData: z.record(z.string(), z.unknown()).optional(),
  promptResolved: z.string().optional(),
  llmModel: z.string().optional(),
  promptTokens: z.number().int().nonnegative().default(0),
  completionTokens: z.number().int().nonnegative().default(0),
  totalTokens: z.number().int().nonnegative().default(0),
  costEstimateUsd: z.number().nonnegative().default(0),
  durationMs: z.number().nonnegative().default(0),
  errorMessage: z.string().optional(),
  errorStack: z.string().optional(),
  attempt: z.number().int().positive().default(1),
  startedAt: z.string(),
  finishedAt: z.string().optional(),
});
