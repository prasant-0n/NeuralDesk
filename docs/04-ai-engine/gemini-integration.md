# 04. AI Engine — Google Gemini SDK & Token Economics

[← Back to Documentation Portal](../README.md) | [← Graph Orchestration](./graph-orchestration.md) | [Next: Deterministic Simulation →](./deterministic-simulation.md)

---

## 2.1 Gemini 1.5 & 2.0 Runner (`apps/api/src/providers/gemini.ts`)

```typescript
import { GoogleGenAI } from "@google/genai";

export interface GeminiRunOptions {
  model: "gemini-1.5-flash" | "gemini-1.5-pro" | "gemini-2.0-flash";
  systemInstruction?: string;
  prompt: string;
  temperature?: number;
  topP?: number;
  maxOutputTokens?: number;
  responseMimeType?: "text/plain" | "application/json";
  responseSchema?: Record<string, unknown>;
  onChunk?: (textChunk: string) => void;
}

export interface GeminiRunResult {
  text: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
  durationMs: number;
}

export const MODEL_PRICING = {
  "gemini-1.5-flash": { promptPer1M: 0.075, completionPer1M: 0.30 },
  "gemini-1.5-pro": { promptPer1M: 1.25, completionPer1M: 5.00 },
  "gemini-2.0-flash": { promptPer1M: 0.10, completionPer1M: 0.40 },
};

export async function executeGeminiNode(
  apiKey: string,
  options: GeminiRunOptions
): Promise<GeminiRunResult> {
  const startTime = Date.now();
  const ai = new GoogleGenAI({ apiKey });

  const config: Record<string, unknown> = {
    temperature: options.temperature ?? 0.7,
    topP: options.topP ?? 0.95,
    maxOutputTokens: options.maxOutputTokens ?? 2048,
  };

  if (options.systemInstruction) config.systemInstruction = options.systemInstruction;
  if (options.responseMimeType === "application/json") {
    config.responseMimeType = "application/json";
    if (options.responseSchema) config.responseSchema = options.responseSchema;
  }

  let accumulatedText = "";
  const responseStream = await ai.models.generateContentStream({
    model: options.model,
    contents: [options.prompt],
    config,
  });

  let promptTokens = 0;
  let completionTokens = 0;
  let totalTokens = 0;

  for await (const chunk of responseStream) {
    const chunkText = chunk.text ?? "";
    accumulatedText += chunkText;
    if (options.onChunk && chunkText) options.onChunk(chunkText);
    
    if (chunk.usageMetadata) {
      promptTokens = chunk.usageMetadata.promptTokenCount ?? promptTokens;
      completionTokens = chunk.usageMetadata.candidatesTokenCount ?? completionTokens;
      totalTokens = chunk.usageMetadata.totalTokenCount ?? totalTokens;
    }
  }

  const durationMs = Date.now() - startTime;
  const pricing = MODEL_PRICING[options.model];
  const costUsd =
    (promptTokens / 1_000_000) * pricing.promptPer1M +
    (completionTokens / 1_000_000) * pricing.completionPer1M;

  return {
    text: accumulatedText,
    promptTokens,
    completionTokens,
    totalTokens,
    costUsd: Number(costUsd.toFixed(6)),
    durationMs,
  };
}
```

---

## 2.2 Token Economics Formulation

Cost per step is computed with micro-cent precision:

$$	ext{Cost} = \left(rac{	ext{Prompt Tokens}}{1{,}000{,}000} 	imes P_{	ext{input}}ight) + \left(rac{	ext{Completion Tokens}}{1{,}000{,}000} 	imes P_{	ext{output}}ight)$$

* **Gemini 1.5 Flash:** \$0.075 / 1M prompt, \$0.30 / 1M completion
* **Gemini 1.5 Pro:** \$1.25 / 1M prompt, \$5.00 / 1M completion
* **Gemini 2.0 Flash:** \$0.10 / 1M prompt, \$0.40 / 1M completion

---

## 2.3 Gemini Safety Filter & Finish Reason Handling

When Gemini evaluates content, Google's safety classifiers may block output generation. Rather than allowing uncaught exceptions to crash the Node process, NeuralDesk inspects candidate finish states:

```typescript
export interface SafetyCheckResult {
  isBlocked: boolean;
  finishReason?: string;
  safetyRatings?: Array<{ category: string; probability: string }>;
}

export function handleCandidateFinishReason(candidate: any): SafetyCheckResult {
  const reason = candidate?.finishReason;
  if (reason === "SAFETY" || reason === "RECITATION" || reason === "BLOCKLIST") {
    return {
      isBlocked: true,
      finishReason: reason,
      safetyRatings: candidate?.safetyRatings ?? [],
    };
  }
  return { isBlocked: false, finishReason: reason };
}
```

* **UI Feedback:** When blocked, the canvas node glows red and renders a badge: `⚠️ Blocked by Safety Guardrail: [Category]`.
* **Flow Control:** If an `on_failure` edge is wired from the node, execution transitions along the fallback error route rather than aborting the entire workflow.

---

## 2.4 Node Execution Timeout & AbortSignal

To prevent hanging connections from exhausting server memory, every node execution enforces a strict timeout:

```typescript
const timeoutMs = options.timeoutMs ?? 30000;
const abortController = new AbortController();
const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);

try {
  // Pass abortController.signal to network/SDK call
} finally {
  clearTimeout(timeoutId);
}
```

---

## 2.5 Local Offline LLM Provider (Ollama / LocalAI)

For air-gapped, privacy-sensitive enterprise environments, NeuralDesk natively supports local models via **Ollama** (`http://localhost:11434/v1`):

* **Zero Cloud Calls:** All prompts run locally on the user's GPU/CPU.
* **Open-Weights Support:** Seamlessly switch between `llama3.3:8b`, `mistral`, `deepseek-r1`, or `qwen2.5-coder`.
* **Cost:** 100% Free ($0.00 / 1M tokens).

---

[← Previous: Graph Orchestration](./graph-orchestration.md) | [Next: Deterministic Simulation →](./deterministic-simulation.md)
