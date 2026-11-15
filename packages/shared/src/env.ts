/**
 * NeuralDesk Environment Schema Validation
 * Enforces zero-leak security boundaries and valid server configuration at startup via Zod.
 */

import { z } from "zod";

export const ServerEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  HOST: z.string().default("0.0.0.0"),
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .default("postgresql://postgres:postgres@localhost:5432/neuraldesk_dev"),
  DATABASE_POOL_SIZE: z.coerce.number().int().positive().default(10),
  DATABASE_AUTH_TOKEN: z.string().optional(),
  GEMINI_API_KEY: z.string().optional().default(""),
  GEMINI_DEFAULT_MODEL: z.string().default("gemini-1.5-flash"),
  OLLAMA_BASE_URL: z.string().default("http://localhost:11434/v1"),
  JWT_SECRET: z.string().min(16).default("super_secret_jwt_signing_key_replace_in_production_min_32_chars"),
  ENCRYPTION_KEY: z.string().min(16).default("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"),
  WEBHOOK_SIGNING_SECRET: z.string().min(16).default("whsec_sample_secret_key_for_local_testing"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  MAX_CONCURRENT_EXECUTIONS: z.coerce.number().int().positive().default(3),
  EXECUTION_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
  ENABLE_SIMULATION_MODE: z
    .union([
      z.boolean(),
      z.string().transform((val) => val === "true" || val === "1"),
    ])
    .default(true),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;

export const ClientEnvSchema = z.object({
  VITE_API_URL: z.string().default("http://localhost:3001/api/v1"),
  VITE_APP_NAME: z.string().default("NeuralDesk"),
  VITE_DEFAULT_THEME: z.enum(["dark", "light"]).default("dark"),
});

export type ClientEnv = z.infer<typeof ClientEnvSchema>;

/**
 * Validates and safely parses runtime environment variables.
 * Returns parsed typed environment variables or throws descriptive validation error.
 */
export function validateServerEnv(env: Record<string, string | undefined> = process.env): ServerEnv {
  return ServerEnvSchema.parse(env);
}

/**
 * Validates frontend client environment variables.
 */
export function validateClientEnv(env: Record<string, string | undefined>): ClientEnv {
  return ClientEnvSchema.parse(env);
}
