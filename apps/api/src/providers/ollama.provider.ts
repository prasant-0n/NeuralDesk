/**
 * NeuralDesk Local Ollama LLM Provider
 * Connects to local air-gapped Ollama instance via OpenAI-compatible endpoint (http://localhost:11434/v1).
 * Supports zero-cost local LLM inference with real-time SSE streaming.
 */

import type { ILLMProvider, LLMRequestOptions, LLMExecutionResult, LLMChunkHandler } from "./types.js";

export class OllamaProvider implements ILLMProvider {
  public readonly name = "ollama";
  private readonly baseUrl: string;

  constructor(baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1") {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  public async executeStream(
    options: LLMRequestOptions,
    onChunk?: LLMChunkHandler
  ): Promise<LLMExecutionResult> {
    const startTime = Date.now();
    const endpoint = `${this.baseUrl}/chat/completions`;

    const messages: Array<{ role: "system" | "user"; content: string }> = [];
    if (options.systemPrompt) {
      messages.push({ role: "system", content: options.systemPrompt });
    }
    messages.push({ role: "user", content: options.prompt });

    const payload = {
      model: options.model || "llama3.2",
      messages,
      temperature: options.temperature ?? 0.7,
      top_p: options.topP ?? 0.95,
      stream: true,
      ...(options.jsonMode ? { response_format: { type: "json_object" } } : {}),
    };

    let response: Response;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout

      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);
    } catch (err: any) {
      throw new Error(
        `Failed to connect to local Ollama instance at ${this.baseUrl}: ${err?.message || "Connection refused"}. Ensure Ollama is running ('ollama serve').`
      );
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `Ollama API error (${response.status} ${response.statusText}): ${errorText}`
      );
    }

    if (!response.body) {
      throw new Error("Ollama returned an empty response body.");
    }

    let accumulatedText = "";
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data:")) continue;

          const dataString = trimmed.replace(/^data:\s*/, "").trim();
          if (dataString === "[DONE]") break;

          try {
            const parsed = JSON.parse(dataString);
            const deltaContent = parsed.choices?.[0]?.delta?.content;
            if (deltaContent) {
              accumulatedText += deltaContent;
              if (onChunk) {
                await onChunk(deltaContent);
              }
            }
          } catch {
            // Partial JSON chunk line - ignore
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    const durationMs = Date.now() - startTime;
    const promptTokens = Math.max(1, Math.ceil(options.prompt.length / 4));
    const completionTokens = Math.max(1, Math.ceil((accumulatedText.length || 1) / 4));

    return {
      text: accumulatedText,
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
      finishReason: "STOP",
      costUsd: 0.0, // Local self-hosted Ollama incurs 0 external USD cost
      durationMs,
    };
  }
}
