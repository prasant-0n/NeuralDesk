/**
 * NeuralDesk LLM Node Handler
 * Dispatches prompt execution to selected AI provider (Gemini, Mock, Ollama) with streaming,
 * JSON mode structured decoding, token counting, and cost tracking.
 */

import { compilePromptTemplate } from "@neuraldesk/shared";
import { getLLMProvider } from "../../providers/index.js";
import type { INodeHandler, NodeExecutionContext, NodeExecutionResult } from "./types.js";

export class LLMHandler implements INodeHandler {
  public async execute(ctx: NodeExecutionContext): Promise<NodeExecutionResult> {
    const config = ctx.nodeConfig;
    const context = ctx.scope.toContext();

    // 1. Resolve Prompt
    let prompt = "";
    if (config.userPromptTemplate) {
      prompt = compilePromptTemplate(String(config.userPromptTemplate), context);
    } else if (typeof ctx.inputs.prompt === "string" && ctx.inputs.prompt) {
      prompt = compilePromptTemplate(ctx.inputs.prompt, context);
    } else if (typeof ctx.inputs.customer_message === "string") {
      prompt = ctx.inputs.customer_message;
    } else if (typeof ctx.inputs.message === "string") {
      prompt = ctx.inputs.message;
    } else {
      const last = ctx.scope.getLastOutput();
      if (last && typeof last.prompt === "string") {
        prompt = last.prompt;
      } else if (last) {
        prompt = JSON.stringify(last);
      } else {
        prompt = "Analyze the provided input and produce the requested output.";
      }
    }

    // 2. Resolve System Prompt
    let systemPrompt: string | undefined;
    if (config.systemPrompt) {
      systemPrompt = compilePromptTemplate(String(config.systemPrompt), context);
    }

    const providerName = String(config.provider || "gemini");
    const model = String(config.model || "gemini-1.5-flash");
    const provider = getLLMProvider(providerName, ctx.mode);

    // 3. Execute streaming inference
    const result = await provider.executeStream(
      {
        model,
        prompt,
        systemPrompt,
        temperature: typeof config.temperature === "number" ? config.temperature : 0.7,
        topP: typeof config.topP === "number" ? config.topP : 0.95,
        topK: typeof config.topK === "number" ? config.topK : undefined,
        maxTokens: typeof config.maxTokens === "number" ? config.maxTokens : 2048,
        jsonMode: Boolean(config.jsonMode),
        responseSchema: (config.responseSchema as Record<string, unknown>) || undefined,
        stopSequences: Array.isArray(config.stopSequences) ? config.stopSequences : undefined,
        apiKey: ctx.apiKey,
      },
      ctx.onStreamChunk
    );

    // 4. Parse JSON if jsonMode is requested
    let parsedOutputs: Record<string, unknown> = {};
    if (config.jsonMode) {
      try {
        let cleanText = result.text.trim();
        // Strip markdown code fences if present
        if (cleanText.startsWith("```json")) {
          cleanText = cleanText.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
        } else if (cleanText.startsWith("```")) {
          cleanText = cleanText.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }
        parsedOutputs = JSON.parse(cleanText);
      } catch {
        // Fallback if parsing fails
        parsedOutputs = {
          raw: result.text,
          error: "Failed to parse LLM output as strict JSON",
        };
      }
    } else {
      parsedOutputs = {
        text: result.text,
      };
    }

    return {
      status: "completed",
      outputs: parsedOutputs,
      promptResolved: prompt,
      llmModel: model,
      tokensUsed: result.totalTokens,
      promptTokens: result.promptTokens,
      completionTokens: result.completionTokens,
      costEstimateUsd: result.costUsd,
      finishReason: result.finishReason,
    };
  }
}
