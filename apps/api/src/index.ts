/**
 * NeuralDesk API Server Entrypoint
 * Boots Hono on Node.js using @hono/node-server with graceful shutdown handling.
 */

import * as dotenv from "dotenv";
dotenv.config();

import { serve } from "@hono/node-server";
import { app } from "./app.js";
import { sseManager } from "./services/sse-manager.js";

const PORT = parseInt(process.env.PORT || "3001", 10);
const HOST = process.env.HOST || "0.0.0.0";

console.log("⚡ Starting NeuralDesk API Server...");

const server = serve(
  {
    fetch: app.fetch,
    port: PORT,
    hostname: HOST,
  },
  () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║              NeuralDesk API Engine v1.0.0                ║
║  Enterprise Fullstack AI Workflow Intelligence Platform   ║
╠══════════════════════════════════════════════════════════╣
║  • Status:      ONLINE                                   ║
║  • Port:        ${PORT}                                     ║
║  • Host:        http://${HOST}:${PORT}                     ║
║  • Health:      http://${HOST}:${PORT}/api/v1/health       ║
║  • Environment: ${(process.env.NODE_ENV || "development").padEnd(41)}║
╚══════════════════════════════════════════════════════════╝
    `);
  }
);

// Graceful Shutdown Handler
function gracefulShutdown(signal: string) {
  console.log(`\n🛑 Received ${signal}. Initiating graceful shutdown...`);

  // Close active SSE subscriptions
  sseManager.reset();

  server.close((err) => {
    if (err) {
      console.error("Error during server shutdown:", err);
      process.exit(1);
    }
    console.log("Server stopped successfully. Goodbye!");
    process.exit(0);
  });

  // Force shutdown after timeout if pending connections hang
  setTimeout(() => {
    console.error("⚠️ Forcefully shutting down after timeout.");
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

export default server;
