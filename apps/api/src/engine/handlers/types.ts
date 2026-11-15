/**
 * NeuralDesk Node Execution Handlers - Contracts & Interfaces
 */

import type { ExecutionScope } from "../scope.js";

export interface NodeExecutionContext {
  executionId: string;
  workflowId: string;
  nodeKey: string;
  nodeType: string;
  nodeConfig: Record<string, unknown>;
  inputs: Record<string, unknown>;
  scope: ExecutionScope;
  mode: "real" | "simulation" | "live" | "mock";
  onStreamChunk?: (chunk: string) => void | Promise<void>;
  apiKey?: string;
}

export interface NodeExecutionResult {
  status: "completed" | "skipped" | "waiting_for_approval";
  outputs: Record<string, unknown>;
  branch?: "true" | "false" | "default" | "on_failure";
  promptResolved?: string;
  llmModel?: string;
  tokensUsed?: number;
  promptTokens?: number;
  completionTokens?: number;
  costEstimateUsd?: number;
  finishReason?: string;
  approvalId?: string;
}

export interface INodeHandler {
  execute(ctx: NodeExecutionContext): Promise<NodeExecutionResult>;
}
