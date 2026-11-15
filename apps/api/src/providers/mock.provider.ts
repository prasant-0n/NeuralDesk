/**
 * NeuralDesk Mock / Offline LLM Provider
 * Pure deterministic mock engine powered by MurmurHash3 + Mulberry32 PRNG.
 * Generates realistic streaming tokens, structured JSON schemas, and 150-350ms synthetic latencies.
 */

import { calculateTokenCost } from "@neuraldesk/shared";
import type { ILLMProvider, LLMRequestOptions, LLMExecutionResult, LLMChunkHandler } from "./types.js";

/**
 * 32-bit MurmurHash3 algorithm for deterministic string hashing.
 */
export function murmurhash3(key: string, seed = 0): number {
  let h1 = seed >>> 0;
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;

  const remainder = key.length & 3;
  const bytes = key.length - remainder;

  for (let i = 0; i < bytes; i += 4) {
    let k1 =
      (key.charCodeAt(i) & 0xff) |
      ((key.charCodeAt(i + 1) & 0xff) << 8) |
      ((key.charCodeAt(i + 2) & 0xff) << 16) |
      ((key.charCodeAt(i + 3) & 0xff) << 24);

    k1 = Math.imul(k1, c1);
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = Math.imul(k1, c2);

    h1 ^= k1;
    h1 = (h1 << 13) | (h1 >>> 19);
    h1 = Math.imul(h1, 5) + 0xe6546b64;
  }

  let k1 = 0;
  if (remainder >= 3) {
    k1 ^= (key.charCodeAt(bytes + 2) & 0xff) << 16;
  }
  if (remainder >= 2) {
    k1 ^= (key.charCodeAt(bytes + 1) & 0xff) << 8;
  }
  if (remainder >= 1) {
    k1 ^= key.charCodeAt(bytes) & 0xff;
    k1 = Math.imul(k1, c1);
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = Math.imul(k1, c2);
    h1 ^= k1;
  }

  h1 ^= key.length;
  h1 ^= h1 >>> 16;
  h1 = Math.imul(h1, 0x85ebca6b);
  h1 ^= h1 >>> 13;
  h1 = Math.imul(h1, 0xc2b2ae35);
  h1 ^= h1 >>> 16;

  return h1 >>> 0;
}

/**
 * Mulberry32 PRNG yielding uniform pseudo-random floats [0, 1).
 */
export function createMulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class MockProvider implements ILLMProvider {
  public readonly name = "mock";

  public async executeStream(
    options: LLMRequestOptions,
    onChunk?: LLMChunkHandler
  ): Promise<LLMExecutionResult> {
    const startTime = Date.now();

    // 1. Seed deterministic PRNG with prompt context
    const seedString = `${options.prompt}:${options.systemPrompt || ""}:${options.model}`;
    const hash = murmurhash3(seedString);
    const rand = createMulberry32(hash);

    // 2. Compute synthetic latency strictly in 150ms-350ms range
    const syntheticLatencyMs = 150 + Math.floor(rand() * 200);

    // 3. Generate realistic simulated text
    const responseText = this.generateDeterministicResponse(options, rand);

    // 4. Divide text into simulated streaming chunks
    const chunks = this.tokenizeIntoChunks(responseText);
    const delayPerChunk = Math.max(10, Math.floor(syntheticLatencyMs / chunks.length));

    for (const chunk of chunks) {
      if (delayPerChunk > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayPerChunk));
      }
      if (onChunk) {
        await onChunk(chunk);
      }
    }

    const durationMs = Date.now() - startTime;

    // 5. Realistic token estimation
    const promptTokens = Math.max(14, Math.ceil(options.prompt.length / 3.8));
    const completionTokens = Math.max(18, Math.ceil(responseText.length / 3.8));
    const totalTokens = promptTokens + completionTokens;

    // 6. Token economics calculation using shared pricing formulas
    const cost = calculateTokenCost(options.model || "gemini-1.5-flash", promptTokens, completionTokens);

    return {
      text: responseText,
      promptTokens,
      completionTokens,
      totalTokens,
      finishReason: "STOP",
      costUsd: cost.totalCostUsd,
      durationMs,
    };
  }

  /**
   * Deterministically synthesizes realistic LLM response.
   */
  private generateDeterministicResponse(
    options: LLMRequestOptions,
    rand: () => number
  ): string {
    const combinedContext = `${options.prompt} ${options.systemPrompt || ""}`.toLowerCase();

    if (options.jsonMode) {
      // If response schema exists, generate conforming keys
      if (options.responseSchema && typeof options.responseSchema === "object") {
        return this.synthesizeFromSchema(options.responseSchema, combinedContext, rand);
      }

      // Customer support sentiment classification workflow
      if (
        combinedContext.includes("sentiment") ||
        combinedContext.includes("ticket") ||
        combinedContext.includes("support") ||
        combinedContext.includes("urgency")
      ) {
        const urgencyScore = 75 + Math.floor(rand() * 25); // 75 - 99
        return JSON.stringify(
          {
            sentiment: "NEGATIVE",
            urgencyScore,
            category: "Infrastructure Outage & API Latency",
            summary: "Customer reports continuous 5000ms timeouts on high-traffic production endpoints.",
            suggestedAction: "Trigger high-priority pager incident and route to on-call engineering team.",
            requiresHumanReview: true,
          },
          null,
          2
        );
      }

      // Document summarizer workflow
      if (
        combinedContext.includes("summar") ||
        combinedContext.includes("document") ||
        combinedContext.includes("insight")
      ) {
        return JSON.stringify(
          {
            title: "Document Analysis & Executive Findings",
            keyInsights: [
              "System architectural throughput bottlenecks localized to database connection pool limits.",
              "Latency p99 spikes correlate with un-indexed foreign key queries during peak load.",
              "Recommended immediate horizontal scaling of API workers.",
            ],
            confidenceScore: Number((0.92 + rand() * 0.07).toFixed(2)),
          },
          null,
          2
        );
      }

      // Generic JSON response
      return JSON.stringify(
        {
          status: "success",
          analysis: "Operation completed successfully under simulated execution engine.",
          confidence: Number((0.9 + rand() * 0.09).toFixed(2)),
          timestamp: new Date().toISOString(),
        },
        null,
        2
      );
    }

    // Contextual text responses
    if (combinedContext.includes("reply") || combinedContext.includes("customer")) {
      return (
        "Dear Customer,\n\n" +
        "Thank you for reaching out to NeuralDesk Support. We have received your high-priority ticket regarding the production API latency. " +
        "Our engineering team has been dispatched to investigate the database pool saturation immediately. " +
        "We will provide you with a resolution update within the hour.\n\n" +
        "Sincerely,\nNeuralDesk Tier-3 Support Team"
      );
    }

    return (
      "Analysis complete. The workflow execution DAG successfully evaluated all node dependencies, " +
      "processed input attributes deterministically, and formatted the output according to the requested contract."
    );
  }

  /**
   * Generates schema-matching JSON object deterministically.
   */
  private synthesizeFromSchema(
    schema: Record<string, any>,
    _context: string,
    rand: () => number
  ): string {
    const result: Record<string, unknown> = {};
    const props = schema.properties || {};

    for (const [key, propDef] of Object.entries<any>(props)) {
      const type = propDef.type || "string";

      if (propDef.enum && Array.isArray(propDef.enum)) {
        const idx = Math.floor(rand() * propDef.enum.length);
        result[key] = propDef.enum[idx];
      } else if (type === "number" || type === "integer") {
        if (key.toLowerCase().includes("score") || key.toLowerCase().includes("urgency")) {
          result[key] = 85;
        } else {
          result[key] = Math.floor(rand() * 100);
        }
      } else if (type === "boolean") {
        result[key] = rand() > 0.3;
      } else if (type === "array") {
        result[key] = ["Item 1: Analysis completed", "Item 2: Follow-up required"];
      } else {
        // String
        if (key === "sentiment") {
          result[key] = "NEGATIVE";
        } else if (key === "summary") {
          result[key] = "Critical production incident identified by automated analysis.";
        } else if (key === "suggestedAction" || key === "action") {
          result[key] = "Route to Slack escalation channel #urgent-support-escalations.";
        } else {
          result[key] = `Simulated ${key} for node execution`;
        }
      }
    }

    return JSON.stringify(result, null, 2);
  }

  /**
   * Splits text into realistic token-sized stream chunks.
   */
  private tokenizeIntoChunks(text: string): string[] {
    const words = text.split(" ");
    if (words.length <= 4) {
      return [text];
    }

    const chunks: string[] = [];
    const chunkSize = Math.max(2, Math.floor(words.length / 5));

    for (let i = 0; i < words.length; i += chunkSize) {
      const slice = words.slice(i, i + chunkSize).join(" ");
      chunks.push(i + chunkSize < words.length ? `${slice} ` : slice);
    }

    return chunks;
  }
}
