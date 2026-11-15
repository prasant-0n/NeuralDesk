/**
 * NeuralDesk API Wire Protocol & Envelope Contracts
 * RFC 7807 standard error formatting, standard API responses, pagination, webhooks, and SSE envelopes.
 */

import type { NodeKind } from "./node.js";
import type { ExecutionMode } from "./execution.js";

// ---------------------------------------------------------------------------
// RFC 7807 Standard Error Envelope
// ---------------------------------------------------------------------------
export interface ApiErrorDetail {
  field?: string;
  issue: string;
  code?: string;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  status: number;
  details?: ApiErrorDetail[];
  timestamp: string;
  path?: string;
  traceId?: string;
}

export interface ApiErrorResponse {
  error: ApiErrorBody;
}

// ---------------------------------------------------------------------------
// Standard Success & Pagination Envelopes
// ---------------------------------------------------------------------------
export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// ---------------------------------------------------------------------------
// Webhook Ingress
// ---------------------------------------------------------------------------
export interface WebhookIngressPayload {
  workflowId: string;
  timestamp: number;
  signature: string;
  payload: Record<string, unknown>;
  headers?: Record<string, string>;
}

export interface WebhookSignatureValidation {
  valid: boolean;
  reason?: string;
}

// ---------------------------------------------------------------------------
// Server-Sent Events (SSE) Wire Protocol
// ---------------------------------------------------------------------------
export const SSE_EVENT_TYPES = [
  "execution:start",
  "execution:complete",
  "execution:error",
  "execution:waiting_for_approval",
  "node:start",
  "node:stream:chunk",
  "node:complete",
  "node:error",
  "node:skip",
  "heartbeat",
] as const;

export type SSEEventType = (typeof SSE_EVENT_TYPES)[number];

export interface SSEEventEnvelope<T = unknown> {
  id: string;
  event: SSEEventType;
  data: T;
  retry?: number;
}

export interface SSEExecutionStartData {
  execution_id: string;
  workflow_id: string;
  mode: ExecutionMode;
  total_nodes: number;
  ordered_keys: string[];
  started_at: string;
}

export interface SSENodeStartData {
  execution_id: string;
  node_key: string;
  node_type: NodeKind;
  model?: string;
  started_at: string;
}

export interface SSENodeChunkData {
  execution_id: string;
  node_key: string;
  chunk: string;
  accumulated_length?: number;
}

export interface SSENodeCompleteData {
  execution_id: string;
  node_key: string;
  duration_ms: number;
  prompt_tokens?: number;
  completion_tokens?: number;
  tokens?: number;
  cost_usd?: number;
  outputs?: Record<string, unknown>;
}

export interface SSENodeErrorData {
  execution_id: string;
  node_key: string;
  error_message: string;
  stack?: string;
}

export interface SSENodeSkipData {
  execution_id: string;
  node_key: string;
  reason: string;
}

export interface SSEExecutionCompleteData {
  execution_id: string;
  workflow_id: string;
  status: "completed";
  duration_ms: number;
  total_tokens: number;
  total_cost_usd: number;
  final_outputs?: Record<string, unknown>;
}

export interface SSEExecutionErrorData {
  execution_id: string;
  workflow_id: string;
  status: "failed";
  duration_ms?: number;
  error_message: string;
  failing_node_key?: string;
}

export interface SSEHeartbeatData {
  timestamp: string;
  active_execution_id?: string;
}
