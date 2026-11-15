/**
 * NeuralDesk Health Check Routes
 * Provides deep service health verification including database ping, uptime, and active execution metrics.
 */

import { Hono } from "hono";
import { db, sql } from "@neuraldesk/db";
import { sseManager } from "../services/sse-manager.js";

export const healthRoutes = new Hono();

// ND-SEC-17: Public lightweight liveness probe (no internal telemetry leak)
healthRoutes.get("/live", (c) => {
  return c.json({ status: "ok", uptimeSeconds: Math.floor(process.uptime()) }, 200);
});

// Deep readiness & diagnostics probe
healthRoutes.get("/", async (c) => {
  const startedAt = Date.now();
  let dbStatus: "connected" | "unreachable" = "unreachable";
  let dbLatencyMs = 0;

  try {
    const pingStart = Date.now();
    await db.execute(sql`SELECT 1 as ping`);
    dbLatencyMs = Date.now() - pingStart;
    dbStatus = "connected";
  } catch {
    dbStatus = "unreachable";
  }

  const memory = process.memoryUsage();
  const uptimeSeconds = Math.floor(process.uptime());

  const healthData = {
    status: dbStatus === "connected" ? "healthy" : "degraded",
    server: "ok",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    uptimeSeconds,
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
    },
    activeExecutions: sseManager.getActiveExecutionCount(),
    activeSubscribers: sseManager.getActiveSubscriberCount(),
    memory: {
      heapUsedMb: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100,
      heapTotalMb: Math.round((memory.heapTotal / 1024 / 1024) * 100) / 100,
      rssMb: Math.round((memory.rss / 1024 / 1024) * 100) / 100,
    },
    totalCheckDurationMs: Date.now() - startedAt,
  };

  const httpStatus = healthData.status === "healthy" ? 200 : 200; // Always return 200 for health probes with degraded detail
  return c.json(healthData, httpStatus);
});
