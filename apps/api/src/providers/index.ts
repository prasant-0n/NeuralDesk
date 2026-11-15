/**
 * NeuralDesk AI Model Providers Index & Factory
 */

export * from "./types.js";
export * from "./gemini.provider.js";
export * from "./mock.provider.js";
export * from "./ollama.provider.js";

import { GeminiProvider } from "./gemini.provider.js";
import { MockProvider } from "./mock.provider.js";
import { OllamaProvider } from "./ollama.provider.js";
import type { ILLMProvider } from "./types.js";

const geminiInstance = new GeminiProvider();
const mockInstance = new MockProvider();
const ollamaInstance = new OllamaProvider();

/**
 * Returns the appropriate LLM provider instance based on provider name and runtime execution mode.
 */
export function getLLMProvider(
  providerName: string,
  mode: "real" | "simulation" | "live" | "mock" = "real"
): ILLMProvider {
  // If execution mode is mock or simulation, always use deterministic MockProvider
  if (mode === "mock" || mode === "simulation") {
    return mockInstance;
  }

  const normalized = providerName.toLowerCase();
  switch (normalized) {
    case "mock":
    case "simulation":
      return mockInstance;
    case "ollama":
      return ollamaInstance;
    case "gemini":
    default:
      // If live mode requested but GEMINI_API_KEY is not configured, fall back to mock with warning
      if (!process.env.GEMINI_API_KEY) {
        console.warn(
          "[Provider Factory] GEMINI_API_KEY is not configured. Falling back to deterministic MockProvider."
        );
        return mockInstance;
      }
      return geminiInstance;
  }
}
