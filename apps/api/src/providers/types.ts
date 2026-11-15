/**
 * NeuralDesk AI Model Providers - Shared Type Contracts
 */

export interface LLMRequestOptions {
  model: string;
  systemPrompt?: string;
  prompt: string;
  temperature?: number;
  topP?: number;
  topK?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  responseSchema?: Record<string, unknown>;
  safetyThreshold?: string;
  stopSequences?: string[];
  apiKey?: string;
}

export interface LLMExecutionResult {
  text: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  finishReason?: string;
  costUsd: number;
  durationMs: number;
}

export type LLMChunkHandler = (chunk: string) => void | Promise<void>;

export interface ILLMProvider {
  readonly name: string;
  executeStream(
    options: LLMRequestOptions,
    onChunk?: LLMChunkHandler
  ): Promise<LLMExecutionResult>;
}
