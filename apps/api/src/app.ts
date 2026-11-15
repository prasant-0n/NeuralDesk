/**
 * NeuralDesk API Application
 * Production-grade Hono setup with RFC 7807 error handling, CORS, logging, and REST/SSE routing.
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { bodyLimit } from "hono/body-limit";
import { errorHandler, notFoundHandler, AppError } from "./middleware/error.middleware.js";
import { authMiddleware } from "./middleware/auth.middleware.js";

// Routes
import { healthRoutes } from "./routes/health.routes.js";
import { workspacesRoutes } from "./routes/workspaces.routes.js";
import { workflowsRoutes } from "./routes/workflows.routes.js";
import { executionsRoutes } from "./routes/executions.routes.js";
import { webhooksRoutes } from "./routes/webhooks.routes.js";
import { agentsRoutes } from "./routes/agents.routes.js";
import { promptsRoutes } from "./routes/prompts.routes.js";

export function createApp(): Hono {
  const app = new Hono();

  // 1. Request ID Middleware
  app.use("*", async (c, next) => {
    const incomingId =
      c.req.header("X-Request-Id") ||
      c.req.header("x-request-id") ||
      crypto.randomUUID();
    c.header("X-Request-Id", incomingId);
    c.header("X-Trace-Id", incomingId);
    await next();
  });

  // 2. Request Body Size Limit (Mitigates memory exhaustion and payload flood DoS)
  app.use(
    "*",
    bodyLimit({
      maxSize: 2 * 1024 * 1024, // 2MB
      onError: () => {
        throw new AppError("Request payload exceeds 2MB limit", 413, "PAYLOAD_TOO_LARGE");
      },
    })
  );

  // 3. Structured Request Logger (disabled in test runs)
  if (process.env.NODE_ENV !== "test") {
    app.use("*", logger());
  }

  // 3. CORS Configuration
  const configuredOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
    : [];
  const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:3001",
    ...configuredOrigins,
  ].filter(Boolean);

  app.use(
    "*",
    cors({
      origin: (origin) => {
        if (!origin) return "*";
        if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) return origin;
        if (process.env.NODE_ENV !== "production") return origin;
        return null;
      },
      allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowHeaders: [
        "Content-Type",
        "Authorization",
        "X-Request-Id",
        "X-NeuralDesk-Signature",
        "X-Idempotency-Key",
        "X-Workspace-Id",
        "Last-Event-ID",
        "Accept",
      ],
      exposeHeaders: [
        "X-Request-Id",
        "X-Trace-Id",
        "X-Idempotent-Replay",
        "X-Cache-Lookup",
        "Content-Length",
        "Content-Type",
      ],
      maxAge: 86400,
      credentials: true,
    })
  );

  // 4. Global Error & 404 Handlers
  app.onError(errorHandler);
  app.notFound(notFoundHandler);

  // 5. Root convenience health endpoints
  app.get("/health", (c) => c.redirect("/api/v1/health"));
  app.get("/api/health", (c) => c.redirect("/api/v1/health"));

  // 6. Namespaced REST API v1 Routes
  const v1 = new Hono();

  // Public unauthenticated endpoints
  v1.route("/health", healthRoutes);
  v1.route("/webhooks", webhooksRoutes);

  // Authenticated tenant endpoints (ND-SEC-01)
  v1.use("/workspaces/*", authMiddleware());
  v1.use("/workspaces", authMiddleware());
  v1.use("/workflows/*", authMiddleware());
  v1.use("/workflows", authMiddleware());
  v1.use("/executions/*", authMiddleware());
  v1.use("/executions", authMiddleware());
  v1.use("/approvals/*", authMiddleware());
  v1.use("/approvals", authMiddleware());
  v1.use("/agents/*", authMiddleware());
  v1.use("/agents", authMiddleware());
  v1.use("/prompts/*", authMiddleware());
  v1.use("/prompts", authMiddleware());

  v1.route("/workspaces", workspacesRoutes);
  v1.route("/workflows", workflowsRoutes);
  v1.route("/", executionsRoutes); // /workflows/:id/execute, /executions, /approvals
  v1.route("/agents", agentsRoutes);
  v1.route("/prompts", promptsRoutes);

  app.route("/api/v1", v1);

  return app;
}

export const app = createApp();
