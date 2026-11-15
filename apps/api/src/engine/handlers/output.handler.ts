/**
 * NeuralDesk Output Node Handler
 * Formats terminal workflow outputs into json, markdown, text, or html with render template support.
 */

import { compilePromptTemplate, resolveContextPath } from "@neuraldesk/shared";
import type { INodeHandler, NodeExecutionContext, NodeExecutionResult } from "./types.js";

export class OutputHandler implements INodeHandler {
  public async execute(ctx: NodeExecutionContext): Promise<NodeExecutionResult> {
    const config = ctx.nodeConfig;
    const context = ctx.scope.toContext();
    const format = String(config.outputFormat || "json").toLowerCase();
    const primaryKey = config.primaryOutputKey ? String(config.primaryOutputKey) : undefined;
    const renderTemplate = config.renderTemplate ? String(config.renderTemplate) : undefined;

    let finalContent: unknown;

    if (renderTemplate) {
      finalContent = compilePromptTemplate(renderTemplate, context);
    } else if (primaryKey) {
      finalContent = resolveContextPath(primaryKey, context) ?? (ctx.inputs as any)[primaryKey];
      if (finalContent === undefined) {
        // Look up across all node outputs
        const last = ctx.scope.getLastOutput();
        finalContent = last ? (last[primaryKey] !== undefined ? last[primaryKey] : last) : ctx.inputs;
      }
    } else {
      // Pick last output or inputs
      finalContent = ctx.scope.getLastOutput() ?? ctx.inputs;
    }

    let formattedOutput: Record<string, unknown>;

    switch (format) {
      case "markdown":
      case "text":
      case "html": {
        const textValue = typeof finalContent === "object" ? JSON.stringify(finalContent, null, 2) : String(finalContent ?? "");
        formattedOutput = {
          content: textValue,
          format,
          ...(primaryKey ? { [primaryKey]: textValue } : {}),
        };
        break;
      }
      case "json":
      default: {
        if (typeof finalContent === "object" && finalContent !== null) {
          formattedOutput = {
            ...(finalContent as Record<string, unknown>),
            ...(primaryKey ? { [primaryKey]: finalContent } : {}),
          };
        } else {
          formattedOutput = {
            result: finalContent,
            ...(primaryKey ? { [primaryKey]: finalContent } : {}),
          };
        }
        break;
      }
    }

    return {
      status: "completed",
      outputs: formattedOutput,
    };
  }
}
