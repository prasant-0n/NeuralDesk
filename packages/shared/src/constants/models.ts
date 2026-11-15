/**
 * NeuralDesk AI Model Registry & Token Economics Constants
 * Authoritative pricing rates, safety categories, and execution hyperparameters.
 */

export const SUPPORTED_GEMINI_MODELS = [
  "gemini-3.8-flash",
  "gemini-flash-latest",
  "gemini-pro-latest",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-2.0-flash",
  "gemini-2.0-flash-thinking-exp",
] as const;

export type GeminiModel = (typeof SUPPORTED_GEMINI_MODELS)[number];

export const SUPPORTED_OLLAMA_MODELS = [
  "llama3.2",
  "llama3.1",
  "mistral",
  "qwen2.5",
  "phi3",
  "gemma2",
] as const;

export type OllamaModel = (typeof SUPPORTED_OLLAMA_MODELS)[number];

export type SupportedModel = GeminiModel | OllamaModel | (string & {});

export interface ModelPricingTier {
  promptPer1M: number;
  completionPer1M: number;
}

/**
 * Official Google Gemini & Local Model Token Rates (USD per 1,000,000 tokens)
 * Reference: Google Cloud Vertex AI / Gemini API Official Pricing
 */
export const MODEL_PRICING: Record<string, ModelPricingTier> = {
  "gemini-3.8-flash": {
    promptPer1M: 0.075,
    completionPer1M: 0.3,
  },
  "gemini-flash-latest": {
    promptPer1M: 0.075,
    completionPer1M: 0.3,
  },
  "gemini-pro-latest": {
    promptPer1M: 1.25,
    completionPer1M: 5.0,
  },
  "gemini-1.5-flash": {
    promptPer1M: 0.075,
    completionPer1M: 0.3,
  },
  "gemini-1.5-pro": {
    promptPer1M: 1.25,
    completionPer1M: 5.0,
  },
  "gemini-2.0-flash": {
    promptPer1M: 0.1,
    completionPer1M: 0.4,
  },
  "gemini-2.0-flash-thinking-exp": {
    promptPer1M: 0.0,
    completionPer1M: 0.0,
  },
  // Ollama local self-hosted models incur zero external API USD cost
  "llama3.2": { promptPer1M: 0.0, completionPer1M: 0.0 },
  "llama3.1": { promptPer1M: 0.0, completionPer1M: 0.0 },
  "mistral": { promptPer1M: 0.0, completionPer1M: 0.0 },
  "qwen2.5": { promptPer1M: 0.0, completionPer1M: 0.0 },
  "phi3": { promptPer1M: 0.0, completionPer1M: 0.0 },
  "gemma2": { promptPer1M: 0.0, completionPer1M: 0.0 },
};

/**
 * Standard Safety Categories defined by Google Gemini SDK
 */
export const GEMINI_SAFETY_CATEGORIES = [
  "HARM_CATEGORY_HARASSMENT",
  "HARM_CATEGORY_HATE_SPEECH",
  "HARM_CATEGORY_SEXUALLY_EXPLICIT",
  "HARM_CATEGORY_DANGEROUS_CONTENT",
  "HARM_CATEGORY_CIVIC_INTEGRITY",
] as const;

export type GeminiSafetyCategory = (typeof GEMINI_SAFETY_CATEGORIES)[number];

export const GEMINI_SAFETY_THRESHOLDS = [
  "BLOCK_NONE",
  "BLOCK_ONLY_HIGH",
  "BLOCK_MEDIUM_AND_ABOVE",
  "BLOCK_LOW_AND_ABOVE",
] as const;

export type GeminiSafetyThreshold = (typeof GEMINI_SAFETY_THRESHOLDS)[number];

export interface ModelHyperparameters {
  defaultTemperature: number;
  minTemperature: number;
  maxTemperature: number;
  defaultTopP: number;
  defaultTopK?: number;
  defaultMaxTokens: number;
  maxOutputLimit: number;
  contextWindowLimit: number;
}

export const MODEL_HYPERPARAMETERS: Record<GeminiModel, ModelHyperparameters> = {
  "gemini-3.8-flash": {
    defaultTemperature: 0.7,
    minTemperature: 0.0,
    maxTemperature: 2.0,
    defaultTopP: 0.95,
    defaultTopK: 40,
    defaultMaxTokens: 2048,
    maxOutputLimit: 8192,
    contextWindowLimit: 1_048_576,
  },
  "gemini-flash-latest": {
    defaultTemperature: 0.7,
    minTemperature: 0.0,
    maxTemperature: 2.0,
    defaultTopP: 0.95,
    defaultTopK: 40,
    defaultMaxTokens: 2048,
    maxOutputLimit: 8192,
    contextWindowLimit: 1_048_576,
  },
  "gemini-pro-latest": {
    defaultTemperature: 0.5,
    minTemperature: 0.0,
    maxTemperature: 2.0,
    defaultTopP: 0.95,
    defaultTopK: 40,
    defaultMaxTokens: 4096,
    maxOutputLimit: 8192,
    contextWindowLimit: 2_097_152,
  },
  "gemini-1.5-flash": {
    defaultTemperature: 0.7,
    minTemperature: 0.0,
    maxTemperature: 2.0,
    defaultTopP: 0.95,
    defaultTopK: 40,
    defaultMaxTokens: 2048,
    maxOutputLimit: 8192,
    contextWindowLimit: 1_048_576,
  },
  "gemini-1.5-pro": {
    defaultTemperature: 0.5,
    minTemperature: 0.0,
    maxTemperature: 2.0,
    defaultTopP: 0.95,
    defaultTopK: 40,
    defaultMaxTokens: 4096,
    maxOutputLimit: 8192,
    contextWindowLimit: 2_097_152,
  },
  "gemini-2.0-flash": {
    defaultTemperature: 0.7,
    minTemperature: 0.0,
    maxTemperature: 2.0,
    defaultTopP: 0.95,
    defaultTopK: 40,
    defaultMaxTokens: 4096,
    maxOutputLimit: 8192,
    contextWindowLimit: 1_048_576,
  },
  "gemini-2.0-flash-thinking-exp": {
    defaultTemperature: 0.7,
    minTemperature: 0.0,
    maxTemperature: 2.0,
    defaultTopP: 0.95,
    defaultTopK: 64,
    defaultMaxTokens: 8192,
    maxOutputLimit: 65536,
    contextWindowLimit: 1_048_576,
  },
};

/**
 * Calculates exact USD token expense given model name, prompt tokens, and candidate tokens.
 */
export function calculateTokenCost(
  model: string,
  promptTokens: number,
  completionTokens: number
): {
  promptCostUsd: number;
  completionCostUsd: number;
  totalCostUsd: number;
  currency: "USD";
} {
  const tier = MODEL_PRICING[model] ?? { promptPer1M: 0.075, completionPer1M: 0.3 };
  const promptCostUsd = Number(((promptTokens / 1_000_000) * tier.promptPer1M).toFixed(7));
  const completionCostUsd = Number(((completionTokens / 1_000_000) * tier.completionPer1M).toFixed(7));
  const totalCostUsd = Number((promptCostUsd + completionCostUsd).toFixed(6));

  return {
    promptCostUsd,
    completionCostUsd,
    totalCostUsd,
    currency: "USD",
  };
}
