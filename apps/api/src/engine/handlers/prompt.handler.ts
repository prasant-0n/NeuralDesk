/**
 * NeuralDesk Prompt Node Handler
 * Compiles prompt template strings with variable substitutions from execution scope.
 */

import { compilePromptTemplate } from "@neuraldesk/shared";
import type { INodeHandler, NodeExecutionContext, NodeExecutionResult } from "./types.js";

export class PromptHandler implements INodeHandler {
  public async execute(ctx: NodeExecutionContext): Promise<NodeExecutionResult> {
    const config = ctx.nodeConfig;
    const template = String(config.template || ctx.inputs.template || "");
    const context = ctx.scope.toContext();

    const compiledPrompt = compilePromptTemplate(template, context);

    const variables: Record<string, unknown> = {};
    if (Array.isArray(config.variables)) {
      for (const v of config.variables) {
        if (v && v.name) {
          variables[v.name] = (context as any)[v.name] ?? v.defaultValue;
        }
      }
    }

    return {
      status: "completed",
      outputs: {
        prompt: compiledPrompt,
        template,
        variables,
      },
      promptResolved: compiledPrompt,
    };
  }
}
