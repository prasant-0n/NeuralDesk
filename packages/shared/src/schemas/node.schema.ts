/**
 * NeuralDesk Node Validation Schemas
 * Strict Zod validation schemas for every node kind with discriminated union validation.
 */

import { z } from "zod";
import { GEMINI_SAFETY_THRESHOLDS } from "../constants/models.js";

export const NodePortSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["string", "number", "boolean", "object", "array", "any"]),
  required: z.boolean().default(false),
  description: z.string().optional(),
  defaultValue: z.unknown().optional(),
});

export const NodePositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

// ---------------------------------------------------------------------------
// 1. Trigger Node Schema
// ---------------------------------------------------------------------------
export const TriggerNodeConfigSchema = z.object({
  triggerType: z.enum(["manual", "webhook", "schedule"]).default("manual"),
  webhookPath: z.string().optional(),
  webhookMethod: z.enum(["GET", "POST", "PUT"]).optional(),
  cronExpression: z.string().optional(),
  timezone: z.string().optional(),
  inputSchema: z.record(z.string(), z.unknown()).optional(),
  samplePayload: z.record(z.string(), z.unknown()).optional(),
});

// ---------------------------------------------------------------------------
// 2. LLM Node Schema
// ---------------------------------------------------------------------------
export const LLMNodeConfigSchema = z.object({
  provider: z.enum(["gemini", "ollama", "mock"]).default("gemini"),
  model: z.string().min(1).default("gemini-1.5-flash"),
  systemPrompt: z.string().optional(),
  userPromptTemplate: z.string().optional(),
  temperature: z.number().min(0.0).max(2.0).default(0.7),
  topP: z.number().min(0.0).max(1.0).default(0.95),
  topK: z.number().int().min(1).max(128).optional(),
  maxTokens: z.number().int().min(1).max(65536).default(2048),
  jsonMode: z.boolean().default(false),
  responseSchema: z.record(z.string(), z.unknown()).optional(),
  safetyThreshold: z.enum(GEMINI_SAFETY_THRESHOLDS).optional(),
  stopSequences: z.array(z.string()).optional(),
});

// ---------------------------------------------------------------------------
// 3. Prompt Node Schema
// ---------------------------------------------------------------------------
export const PromptVariableSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["string", "number", "boolean", "object", "array", "any"]).default("string"),
  defaultValue: z.unknown().optional(),
  required: z.boolean().default(true),
  description: z.string().optional(),
});

export const PromptNodeConfigSchema = z.object({
  template: z.string(),
  variables: z.array(PromptVariableSchema).default([]),
  description: z.string().optional(),
});

// ---------------------------------------------------------------------------
// 4. Condition Node Schema
// ---------------------------------------------------------------------------
export const ConditionRuleSchema = z.object({
  leftPath: z.string(),
  operator: z.enum([
    "==",
    "!=",
    ">",
    "<",
    ">=",
    "<=",
    "contains",
    "matches",
    "in",
    "not_in",
    "is_null",
    "is_not_null",
  ]),
  rightValue: z.unknown(),
});

export const ConditionNodeConfigSchema = z.object({
  expression: z.string().optional(),
  logicalOperator: z.enum(["AND", "OR"]).default("AND"),
  rules: z.array(ConditionRuleSchema).optional(),
  fallbackBranch: z.enum(["true", "false", "default"]).default("false"),
});

// ---------------------------------------------------------------------------
// 5. Transform Node Schema
// ---------------------------------------------------------------------------
export const TransformRuleSchema = z.object({
  targetKey: z.string().min(1),
  sourceExpression: z.string(),
  operation: z
    .enum([
      "json_pick",
      "string_template",
      "regex_extract",
      "math_op",
      "type_cast",
      "array_map",
      "custom_expression",
    ])
    .optional(),
  defaultValue: z.unknown().optional(),
});

export const TransformNodeConfigSchema = z.object({
  transformType: z
    .enum([
      "json_pick",
      "string_template",
      "regex_extract",
      "math_op",
      "type_cast",
      "array_map",
      "custom_expression",
    ])
    .default("json_pick"),
  rules: z.array(TransformRuleSchema).default([]),
});

// ---------------------------------------------------------------------------
// 6. Tool / API Node Schema
// ---------------------------------------------------------------------------
export const ToolNodeConfigSchema = z.object({
  toolType: z.enum(["http_request", "database_query", "custom_function"]).default("http_request"),
  httpMethod: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).default("GET"),
  url: z.string().url().optional(),
  headers: z.record(z.string(), z.string()).optional(),
  queryParams: z.record(z.string(), z.string()).optional(),
  bodyTemplate: z.string().optional(),
  timeoutMs: z.number().int().min(100).max(60000).default(10000),
  retryCount: z.number().int().min(0).max(5).default(0),
  authType: z.enum(["none", "bearer", "basic", "api_key"]).default("none"),
  authSecretKeyRef: z.string().optional(),
});

// ---------------------------------------------------------------------------
// 7. Human Approval Node Schema
// ---------------------------------------------------------------------------
export const ApprovalNodeConfigSchema = z.object({
  approverRole: z.string().min(1).default("admin"),
  approverEmails: z.array(z.string().email()).optional(),
  timeoutMinutes: z.number().int().min(1).max(10080).optional(),
  autoActionOnTimeout: z.enum(["approve", "reject"]).optional(),
  instructions: z.string().optional(),
  requireComment: z.boolean().default(false),
});

// ---------------------------------------------------------------------------
// 8. Evaluator Node Schema
// ---------------------------------------------------------------------------
export const EvaluatorNodeConfigSchema = z.object({
  metric: z
    .enum([
      "exact_match",
      "similarity",
      "json_schema",
      "toxicity",
      "hallucination_check",
      "llm_as_judge",
      "custom_regex",
    ])
    .default("exact_match"),
  expectedSchema: z.record(z.string(), z.unknown()).optional(),
  similarityThreshold: z.number().min(0.0).max(1.0).optional(),
  judgePrompt: z.string().optional(),
  judgeModel: z.string().optional(),
  passThreshold: z.number().min(0.0).max(100.0).optional(),
});

// ---------------------------------------------------------------------------
// 9. Output Node Schema
// ---------------------------------------------------------------------------
export const OutputNodeConfigSchema = z.object({
  outputFormat: z.enum(["json", "markdown", "text", "html"]).default("json"),
  primaryOutputKey: z.string().optional(),
  renderTemplate: z.string().optional(),
  enableDownload: z.boolean().default(false),
});

// ---------------------------------------------------------------------------
// Concrete Node Schemas
// ---------------------------------------------------------------------------
export const TriggerNodeSchema = z.object({
  id: z.string().min(1),
  type: z.literal("trigger"),
  position: NodePositionSchema,
  data: z.object({
    label: z.string().min(1),
    description: z.string().optional(),
    inputs: z.array(NodePortSchema).default([]),
    outputs: z.array(NodePortSchema).default([]),
    config: TriggerNodeConfigSchema,
  }),
});

export const LLMNodeSchema = z.object({
  id: z.string().min(1),
  type: z.literal("llm"),
  position: NodePositionSchema,
  data: z.object({
    label: z.string().min(1),
    description: z.string().optional(),
    inputs: z.array(NodePortSchema).default([]),
    outputs: z.array(NodePortSchema).default([]),
    config: LLMNodeConfigSchema,
  }),
});

export const PromptNodeSchema = z.object({
  id: z.string().min(1),
  type: z.literal("prompt"),
  position: NodePositionSchema,
  data: z.object({
    label: z.string().min(1),
    description: z.string().optional(),
    inputs: z.array(NodePortSchema).default([]),
    outputs: z.array(NodePortSchema).default([]),
    config: PromptNodeConfigSchema,
  }),
});

export const ConditionNodeSchema = z.object({
  id: z.string().min(1),
  type: z.literal("condition"),
  position: NodePositionSchema,
  data: z.object({
    label: z.string().min(1),
    description: z.string().optional(),
    inputs: z.array(NodePortSchema).default([]),
    outputs: z.array(NodePortSchema).default([]),
    config: ConditionNodeConfigSchema,
  }),
});

export const TransformNodeSchema = z.object({
  id: z.string().min(1),
  type: z.literal("transform"),
  position: NodePositionSchema,
  data: z.object({
    label: z.string().min(1),
    description: z.string().optional(),
    inputs: z.array(NodePortSchema).default([]),
    outputs: z.array(NodePortSchema).default([]),
    config: TransformNodeConfigSchema,
  }),
});

export const ToolNodeSchema = z.object({
  id: z.string().min(1),
  type: z.literal("tool"),
  position: NodePositionSchema,
  data: z.object({
    label: z.string().min(1),
    description: z.string().optional(),
    inputs: z.array(NodePortSchema).default([]),
    outputs: z.array(NodePortSchema).default([]),
    config: ToolNodeConfigSchema,
  }),
});

export const ApprovalNodeSchema = z.object({
  id: z.string().min(1),
  type: z.literal("approval"),
  position: NodePositionSchema,
  data: z.object({
    label: z.string().min(1),
    description: z.string().optional(),
    inputs: z.array(NodePortSchema).default([]),
    outputs: z.array(NodePortSchema).default([]),
    config: ApprovalNodeConfigSchema,
  }),
});

export const EvaluatorNodeSchema = z.object({
  id: z.string().min(1),
  type: z.literal("evaluator"),
  position: NodePositionSchema,
  data: z.object({
    label: z.string().min(1),
    description: z.string().optional(),
    inputs: z.array(NodePortSchema).default([]),
    outputs: z.array(NodePortSchema).default([]),
    config: EvaluatorNodeConfigSchema,
  }),
});

export const OutputNodeSchema = z.object({
  id: z.string().min(1),
  type: z.literal("output"),
  position: NodePositionSchema,
  data: z.object({
    label: z.string().min(1),
    description: z.string().optional(),
    inputs: z.array(NodePortSchema).default([]),
    outputs: z.array(NodePortSchema).default([]),
    config: OutputNodeConfigSchema,
  }),
});

// ---------------------------------------------------------------------------
// Discriminated Union of All Workflow Nodes
// ---------------------------------------------------------------------------
export const WorkflowNodeSchema = z.discriminatedUnion("type", [
  TriggerNodeSchema,
  LLMNodeSchema,
  PromptNodeSchema,
  ConditionNodeSchema,
  TransformNodeSchema,
  ToolNodeSchema,
  ApprovalNodeSchema,
  EvaluatorNodeSchema,
  OutputNodeSchema,
]);
