/**
 * NeuralDesk Node Execution Handlers Registry
 */

export * from "./types.js";
export * from "./trigger.handler.js";
export * from "./prompt.handler.js";
export * from "./llm.handler.js";
export * from "./condition.handler.js";
export * from "./transform.handler.js";
export * from "./tool.handler.js";
export * from "./approval.handler.js";
export * from "./output.handler.js";

import { TriggerHandler } from "./trigger.handler.js";
import { PromptHandler } from "./prompt.handler.js";
import { LLMHandler } from "./llm.handler.js";
import { ConditionHandler } from "./condition.handler.js";
import { TransformHandler } from "./transform.handler.js";
import { ToolHandler } from "./tool.handler.js";
import { ApprovalHandler } from "./approval.handler.js";
import { OutputHandler } from "./output.handler.js";
import type { INodeHandler } from "./types.js";

const handlers: Record<string, INodeHandler> = {
  trigger: new TriggerHandler(),
  prompt: new PromptHandler(),
  llm: new LLMHandler(),
  condition: new ConditionHandler(),
  transform: new TransformHandler(),
  tool: new ToolHandler(),
  approval: new ApprovalHandler(),
  output: new OutputHandler(),
  evaluator: new LLMHandler(), // Evaluator node uses LLM-based evaluation
};

export function getNodeHandler(nodeType: string): INodeHandler {
  const handler = handlers[nodeType.toLowerCase()];
  if (!handler) {
    throw new Error(`Unsupported node execution type: '${nodeType}'`);
  }
  return handler;
}
