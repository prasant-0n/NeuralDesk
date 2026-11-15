/**
 * NeuralDesk Environment Schema Validation
 * Enforces zero-leak security boundaries and valid server configuration at startup.
 */

import { z } from "zod";

export const ServerEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required for real mode"),
  WEBHOOK_SIGNING_SECRET: z.string().min(16).default("dev-default-neuraldesk-secret-key-32b"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  ENABLE_SIMULATION_MODE: z
    .string()
    .transform((val) => val === "true" || val === "1")
    .default("true"),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;
