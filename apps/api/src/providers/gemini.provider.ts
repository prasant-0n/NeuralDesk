/**
 * NeuralDesk Google Gemini AI Provider
 * Production integration with @google/genai SDK supporting live streaming,
 * finishReason safety checks, token usage extraction, and cost accounting.
 */

import { GoogleGenAI } from "@google/genai";
import { calculateTokenCost, SUPPORTED_GEMINI_MODELS } from "@neuraldesk/shared";
import type { ILLMProvider, LLMRequestOptions, LLMExecutionResult, LLMChunkHandler } from "./types.js";

export class GeminiProvider implements ILLMProvider {
  public readonly name = "gemini";

  /**
   * Executes prompt streaming against Google Gemini API models.
   */
  public async executeStream(
    options: LLMRequestOptions,
    onChunk?: LLMChunkHandler
  ): Promise<LLMExecutionResult> {
    const apiKey =
      options.apiKey ||
      (process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== "your_gemini_api_key_here"
        ? process.env.GEMINI_API_KEY
        : undefined);
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not configured. Provide an API key or use simulation/mock mode."
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const startTime = Date.now();

    // Map and validate model name
    const model = this.resolveModel(options.model);

    let accumulatedText = "";
    let lastUsageMetadata:
      | {
          promptTokenCount?: number;
          candidatesTokenCount?: number;
          totalTokenCount?: number;
        }
      | undefined;
    let finishReason: string | undefined;

    try {
      const config: Record<string, unknown> = {};

      if (options.systemPrompt) {
        config.systemInstruction = options.systemPrompt;
      }
      if (options.temperature !== undefined) {
        config.temperature = options.temperature;
      }
      if (options.topP !== undefined) {
        config.topP = options.topP;
      }
      if (options.topK !== undefined) {
        config.topK = options.topK;
      }
      if (options.maxTokens !== undefined) {
        config.maxOutputTokens = options.maxTokens;
      }
      if (options.stopSequences && options.stopSequences.length > 0) {
        config.stopSequences = options.stopSequences;
      }
      if (options.jsonMode) {
        config.responseMimeType = "application/json";
        if (options.responseSchema) {
          config.responseSchema = options.responseSchema;
        }
      }

      const responseStream = await ai.models.generateContentStream({
        model,
        contents: options.prompt,
        config: Object.keys(config).length > 0 ? (config as any) : undefined,
      });

      for await (const chunk of responseStream) {
        const text = chunk.text;
        if (text) {
          accumulatedText += text;
          if (onChunk) {
            await onChunk(text);
          }
        }

        if (chunk.usageMetadata) {
          lastUsageMetadata = chunk.usageMetadata;
        }

        if (chunk.candidates && chunk.candidates.length > 0) {
          const candidate = chunk.candidates[0];
          if (candidate.finishReason) {
            finishReason = String(candidate.finishReason);
          }
        }
      }
    } catch (err: any) {
      // Handle known API safety or quota blocks gracefully
      if (err?.message?.includes("SAFETY")) {
        finishReason = "SAFETY";
        accumulatedText =
          accumulatedText ||
          "Generation stopped: Output triggered content safety filters.";
      } else {
        throw err;
      }
    }

    const durationMs = Date.now() - startTime;

    // Inspect finishReason to avoid unhandled crashes
    if (finishReason === "SAFETY") {
      console.warn(`[Gemini Provider] Run flagged for SAFETY by Gemini filters.`);
      if (!accumulatedText) {
        accumulatedText = "{\"warning\": \"Response filtered by Gemini safety system.\"}";
      }
    } else if (finishReason === "RECITATION") {
      console.warn(`[Gemini Provider] Run flagged for RECITATION of copyrighted content.`);
    } else if (finishReason === "MAX_TOKENS") {
      console.warn(`[Gemini Provider] Generation truncated at MAX_TOKENS limit.`);
    }

    // Token extraction
    const promptTokens =
      lastUsageMetadata?.promptTokenCount ??
      Math.max(1, Math.ceil(options.prompt.length / 4));
    const completionTokens =
      lastUsageMetadata?.candidatesTokenCount ??
      Math.max(1, Math.ceil((accumulatedText.length || 1) / 4));
    const totalTokens =
      lastUsageMetadata?.totalTokenCount ?? (promptTokens + completionTokens);

    // Official USD pricing calculation
    const cost = calculateTokenCost(model, promptTokens, completionTokens);

    return {
      text: accumulatedText,
      promptTokens,
      completionTokens,
      totalTokens,
      finishReason: finishReason || "STOP",
      costUsd: cost.totalCostUsd,
      durationMs,
    };
  }

  private resolveModel(modelName: string): string {
    if (
      modelName === "gemini-1.5-flash" ||
      modelName === "gemini-2.0-flash" ||
      modelName === "gemini-2.5-flash"
    ) {
      return "gemini-3.8-flash";
    }
    if (
      modelName === "gemini-1.5-pro" ||
      modelName === "gemini-2.5-pro"
    ) {
      return "gemini-pro-latest";
    }
    const matched = SUPPORTED_GEMINI_MODELS.find((m) => m === modelName);
    return matched || "gemini-3.8-flash";
  }
}
