# 04. AI Engine — Deterministic Simulation Engine

[← Back to Documentation Portal](../README.md) | [← Gemini Integration](./gemini-integration.md) | [Next Section: Frontend →](../05-frontend/canvas-architecture.md)

---

## 3.1 Purpose & Offline Philosophy

NeuralDesk includes a **Deterministic Mock Simulation Engine** allowing developers and CI/CD pipelines to run workflows offline with zero external network calls, zero API token costs, and 100% reproducible execution traces.

---

## 3.2 Seeded PRNG Generator (`apps/api/src/providers/mock-simulator.ts`)

```typescript
function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

export async function executeDeterministicMockNode(
  workflowId: string,
  nodeKey: string,
  prompt: string,
  onChunk?: (chunk: string) => void
) {
  const seedString = `${workflowId}:${nodeKey}:${prompt.length}`;
  const seed = xmur3(seedString)();
  
  // Synthetic latency: 150ms to 450ms
  const durationMs = 150 + (seed % 300);
  await new Promise((resolve) => setTimeout(resolve, durationMs));

  let responseText = "";
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes("sentiment")) {
    const sentiments = ["POSITIVE", "NEUTRAL", "NEGATIVE"];
    responseText = JSON.stringify({
      sentiment: sentiments[seed % sentiments.length],
      confidence: 0.85 + (seed % 14) / 100,
    });
  } else if (lowerPrompt.includes("summarize") || lowerPrompt.includes("summary")) {
    responseText = "Deterministic Executive Summary: Telemetry confirms stable operations with zero detected anomalies.";
  } else {
    responseText = `[SIMULATED RESPONSE] Workflow ${workflowId} step ${nodeKey} completed.`;
  }

  if (onChunk) {
    const tokens = responseText.split(" ");
    for (const t of tokens) onChunk(t + " ");
  }

  const promptTokens = Math.max(10, Math.floor(prompt.length / 4));
  const completionTokens = Math.max(15, Math.floor(responseText.length / 4));

  return {
    text: responseText,
    promptTokens,
    completionTokens,
    totalTokens: promptTokens + completionTokens,
    costUsd: 0.0,
    durationMs,
  };
}
```

---

[← Previous: Gemini Integration](./gemini-integration.md) | [Next Section: Frontend →](../05-frontend/canvas-architecture.md)
