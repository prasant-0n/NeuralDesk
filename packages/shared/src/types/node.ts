/**
 * NeuralDesk Node Domain Contracts & Discriminated Unions
 * Defines node categories, handle ports, specialized configs, and React Flow compatible nodes.
 */

import type { GeminiModel, OllamaModel, GeminiSafetyThreshold } from "../constants/models.js";

export const NODE_KINDS = [
  "trigger",
  "llm",
  "prompt",
  "condition",
  "transform",
  "tool",
  "approval",
  "evaluator",
  "output",
] as const;

export type NodeKind = (typeof NODE_KINDS)[number];

export type PortDataType = "string" | "number" | "boolean" | "object" | "array" | "any";

export interface NodePort {
  id: string;
  name: string;
  type: PortDataType;
  required?: boolean;
  description?: string;
  defaultValue?: unknown;
}

// ---------------------------------------------------------------------------
// 1. Trigger Node
// ---------------------------------------------------------------------------
export type TriggerType = "manual" | "webhook" | "schedule";

export interface TriggerNodeConfig {
  triggerType: TriggerType;
  webhookPath?: string;
  webhookMethod?: "GET" | "POST" | "PUT";
  cronExpression?: string;
  timezone?: string;
  inputSchema?: Record<string, unknown>;
  samplePayload?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// 2. LLM Node
// ---------------------------------------------------------------------------
export type LLMProvider = "gemini" | "ollama" | "mock";

export interface LLMNodeConfig {
  provider: LLMProvider;
  model: GeminiModel | OllamaModel | string;
  systemPrompt?: string;
  userPromptTemplate?: string;
  temperature: number;
  topP: number;
  topK?: number;
  maxTokens: number;
  jsonMode: boolean;
  responseSchema?: Record<string, unknown>;
  safetyThreshold?: GeminiSafetyThreshold;
  stopSequences?: string[];
}

// ---------------------------------------------------------------------------
// 3. Prompt Node
// ---------------------------------------------------------------------------
export interface PromptVariable {
  name: string;
  type: PortDataType;
  defaultValue?: unknown;
  required?: boolean;
  description?: string;
}

export interface PromptNodeConfig {
  template: string;
  variables: PromptVariable[];
  description?: string;
}

// ---------------------------------------------------------------------------
// 4. Condition Node
// ---------------------------------------------------------------------------
export type ConditionOperator =
  | "=="
  | "!="
  | ">"
  | "<"
  | ">="
  | "<="
  | "contains"
  | "matches"
  | "in"
  | "not_in"
  | "is_null"
  | "is_not_null";

export interface ConditionRule {
  leftPath: string;
  operator: ConditionOperator;
  rightValue: unknown;
}

export interface ConditionNodeConfig {
  expression?: string;
  logicalOperator?: "AND" | "OR";
  rules?: ConditionRule[];
  fallbackBranch: "true" | "false" | "default";
}

// ---------------------------------------------------------------------------
// 5. Transform Node
// ---------------------------------------------------------------------------
export type TransformOperation =
  | "json_pick"
  | "string_template"
  | "regex_extract"
  | "math_op"
  | "type_cast"
  | "array_map"
  | "custom_expression";

export interface TransformRule {
  targetKey: string;
  sourceExpression: string;
  operation?: TransformOperation;
  defaultValue?: unknown;
}

export interface TransformNodeConfig {
  transformType: TransformOperation;
  rules: TransformRule[];
}

// ---------------------------------------------------------------------------
// 6. Tool / API Node
// ---------------------------------------------------------------------------
export type ToolHttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type ToolAuthType = "none" | "bearer" | "basic" | "api_key";

export interface ToolNodeConfig {
  toolType: "http_request" | "database_query" | "custom_function";
  httpMethod?: ToolHttpMethod;
  url?: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  bodyTemplate?: string;
  timeoutMs?: number;
  retryCount?: number;
  authType?: ToolAuthType;
  authSecretKeyRef?: string;
}

// ---------------------------------------------------------------------------
// 7. Human Approval Node
// ---------------------------------------------------------------------------
export interface ApprovalNodeConfig {
  approverRole: string;
  approverEmails?: string[];
  timeoutMinutes?: number;
  autoActionOnTimeout?: "approve" | "reject";
  instructions?: string;
  requireComment?: boolean;
}

// ---------------------------------------------------------------------------
// 8. Evaluator Node
// ---------------------------------------------------------------------------
export type EvaluatorMetric =
  | "exact_match"
  | "similarity"
  | "json_schema"
  | "toxicity"
  | "hallucination_check"
  | "llm_as_judge"
  | "custom_regex";

export interface EvaluatorNodeConfig {
  metric: EvaluatorMetric;
  expectedSchema?: Record<string, unknown>;
  similarityThreshold?: number;
  judgePrompt?: string;
  judgeModel?: GeminiModel | string;
  passThreshold?: number;
}

// ---------------------------------------------------------------------------
// 9. Output Node
// ---------------------------------------------------------------------------
export type OutputFormat = "json" | "markdown" | "text" | "html";

export interface OutputNodeConfig {
  outputFormat: OutputFormat;
  primaryOutputKey?: string;
  renderTemplate?: string;
  enableDownload?: boolean;
}

// ---------------------------------------------------------------------------
// Discriminated Unions for Node Configs & Node Data
// ---------------------------------------------------------------------------
export interface NodeConfigMap {
  trigger: TriggerNodeConfig;
  llm: LLMNodeConfig;
  prompt: PromptNodeConfig;
  condition: ConditionNodeConfig;
  transform: TransformNodeConfig;
  tool: ToolNodeConfig;
  approval: ApprovalNodeConfig;
  evaluator: EvaluatorNodeConfig;
  output: OutputNodeConfig;
}

export interface NodePosition {
  x: number;
  y: number;
}

export interface TypedNodeData<K extends NodeKind> {
  label: string;
  description?: string;
  inputs: NodePort[];
  outputs: NodePort[];
  config: NodeConfigMap[K];
}

export type TriggerNodeData = TypedNodeData<"trigger">;
export type LLMNodeData = TypedNodeData<"llm">;
export type PromptNodeData = TypedNodeData<"prompt">;
export type ConditionNodeData = TypedNodeData<"condition">;
export type TransformNodeData = TypedNodeData<"transform">;
export type ToolNodeData = TypedNodeData<"tool">;
export type ApprovalNodeData = TypedNodeData<"approval">;
export type EvaluatorNodeData = TypedNodeData<"evaluator">;
export type OutputNodeData = TypedNodeData<"output">;

export type WorkflowNodeData =
  | ({ kind: "trigger" } & TriggerNodeData)
  | ({ kind: "llm" } & LLMNodeData)
  | ({ kind: "prompt" } & PromptNodeData)
  | ({ kind: "condition" } & ConditionNodeData)
  | ({ kind: "transform" } & TransformNodeData)
  | ({ kind: "tool" } & ToolNodeData)
  | ({ kind: "approval" } & ApprovalNodeData)
  | ({ kind: "evaluator" } & EvaluatorNodeData)
  | ({ kind: "output" } & OutputNodeData);

export interface WorkflowNode<K extends NodeKind = NodeKind> {
  id: string;
  type: K;
  position: NodePosition;
  data: TypedNodeData<K>;
}

export type TriggerNode = WorkflowNode<"trigger">;
export type LLMNode = WorkflowNode<"llm">;
export type PromptNode = WorkflowNode<"prompt">;
export type ConditionNode = WorkflowNode<"condition">;
export type TransformNode = WorkflowNode<"transform">;
export type ToolNode = WorkflowNode<"tool">;
export type ApprovalNode = WorkflowNode<"approval">;
export type EvaluatorNode = WorkflowNode<"evaluator">;
export type OutputNode = WorkflowNode<"output">;

export type AnyWorkflowNode =
  | TriggerNode
  | LLMNode
  | PromptNode
  | ConditionNode
  | TransformNode
  | ToolNode
  | ApprovalNode
  | EvaluatorNode
  | OutputNode;
