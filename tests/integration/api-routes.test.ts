/**
 * NeuralDesk Full Integration Test Suite
 * Validates REST API routes, RFC 7807 error envelopes, Webhook HMAC signatures, and SSE streaming.
 */

import http from "node:http";
import crypto from "node:crypto";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { getRequestListener } from "@hono/node-server";
import { app } from "../../apps/api/src/app.js";
import { SEED_IDS } from "../../packages/db/src/seed.js";
import { DEFAULT_WEBHOOK_SECRET } from "../../apps/api/src/routes/webhooks.routes.js";
import { sseManager } from "../../apps/api/src/services/sse-manager.js";

describe("NeuralDesk API Integration Test Suite", () => {
  let server: http.Server;

  beforeAll(() => {
    server = http.createServer(getRequestListener(app.fetch));
  });

  afterAll(async () => {
    sseManager.reset();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  // -------------------------------------------------------------------------
  // 1. Health & Server Telemetry
  // -------------------------------------------------------------------------
  describe("Health Probes & Telemetry", () => {
    it("GET /api/v1/health should return 200 with server status, uptime, and database metrics", async () => {
      const response = await request(server).get("/api/v1/health");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("server", "ok");
      expect(response.body).toHaveProperty("version", "1.0.0");
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("uptimeSeconds");
      expect(response.body).toHaveProperty("database");
      expect(response.body.database).toHaveProperty("status");
      expect(response.body).toHaveProperty("activeExecutions");
      expect(response.body).toHaveProperty("memory");
      expect(response.body.memory).toHaveProperty("heapUsedMb");
    });

    it("GET /health root alias should redirect to /api/v1/health", async () => {
      const response = await request(server).get("/health");
      expect([200, 302]).toContain(response.status);
    });

    it("GET /api/health convenience alias should redirect to /api/v1/health", async () => {
      const response = await request(server).get("/api/health");
      expect([200, 302]).toContain(response.status);
    });
  });

  // -------------------------------------------------------------------------
  // 2. Workspaces & Member Management
  // -------------------------------------------------------------------------
  describe("Workspaces & Members API", () => {
    let createdWorkspaceId: string;

    it("GET /api/v1/workspaces should list workspaces", async () => {
      const response = await request(server).get("/api/v1/workspaces");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it("POST /api/v1/workspaces should create a new workspace with valid slug", async () => {
      const payload = {
        name: "Enterprise Analytics Lab",
        slug: "enterprise-analytics-lab",
      };

      const response = await request(server)
        .post("/api/v1/workspaces")
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.name).toBe("Enterprise Analytics Lab");
      expect(response.body.data.slug).toBe("enterprise-analytics-lab");
      createdWorkspaceId = response.body.data.id;
    });

    it("GET /api/v1/workspaces/:id should fetch details of created workspace", async () => {
      const response = await request(server).get(`/api/v1/workspaces/${createdWorkspaceId}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(createdWorkspaceId);
    });

    it("PUT /api/v1/workspaces/:id should update workspace details", async () => {
      const response = await request(server)
        .put(`/api/v1/workspaces/${createdWorkspaceId}`)
        .send({ name: "Updated Analytics Lab" });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe("Updated Analytics Lab");
    });

    it("GET /api/v1/workspaces/:wsId/workflows should return paginated workflows", async () => {
      const response = await request(server).get(
        `/api/v1/workspaces/${SEED_IDS.WORKSPACE_CORE}/workflows?page=1&limit=10`
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("pagination");
      expect(response.body.pagination.page).toBe(1);
    });
  });

  // -------------------------------------------------------------------------
  // 3. Workflows & Canvas Lifecycle
  // -------------------------------------------------------------------------
  describe("Workflows Lifecycle & Version Snapshots", () => {
    let createdWfId: string;

    it("GET /api/v1/workflows should return seeded reference workflows", async () => {
      const response = await request(server).get("/api/v1/workflows");

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      const supportWf = response.body.data.find(
        (w: any) => w.id === SEED_IDS.WF_SUPPORT
      );
      expect(supportWf).toBeDefined();
    });

    it("POST /api/v1/workflows should create a new draft workflow canvas", async () => {
      const payload = {
        name: "Security Vulnerability Auto-Remediator",
        description: "Scans repository alerts and drafts patches with Gemini.",
        category: "security",
        initialDefinition: {
          nodes: [
            {
              id: "trigger_node",
              type: "trigger",
              position: { x: 50, y: 100 },
              data: {
                label: "Security Alert Webhook",
                inputs: [],
                outputs: [{ id: "out", name: "alert", type: "object" }],
                config: { triggerType: "webhook" },
              },
            },
          ],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1.0 },
        },
      };

      const response = await request(server)
        .post("/api/v1/workflows")
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.status).toBe("draft");
      expect(response.body.data.version.versionNumber).toBe(1);
      createdWfId = response.body.data.id;
    });

    it("GET /api/v1/workflows/:id should fetch workflow graph with nodes and edges", async () => {
      const response = await request(server).get(`/api/v1/workflows/${createdWfId}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(createdWfId);
      expect(response.body.data.version.definition.nodes).toHaveLength(1);
      expect(response.body.data.version.definition.nodes[0].id).toBe("trigger_node");
    });

    it("PUT /api/v1/workflows/:id should update canvas nodes and metadata", async () => {
      const response = await request(server)
        .put(`/api/v1/workflows/${createdWfId}`)
        .send({
          description: "Updated description for security remediator.",
          definition: {
            nodes: [
              {
                id: "trigger_node",
                type: "trigger",
                position: { x: 50, y: 100 },
                data: {
                  label: "Security Alert Webhook",
                  inputs: [],
                  outputs: [],
                  config: { triggerType: "webhook" },
                },
              },
              {
                id: "llm_analyzer",
                type: "llm",
                position: { x: 300, y: 100 },
                data: {
                  label: "Gemini Vulnerability Analyzer",
                  inputs: [],
                  outputs: [],
                  config: {
                    provider: "gemini",
                    model: "gemini-1.5-flash",
                    systemPrompt: "Analyze CVE descriptions",
                    temperature: 0.1,
                  },
                },
              },
            ],
            edges: [
              {
                id: "e1",
                source: "trigger_node",
                sourceHandle: "out",
                target: "llm_analyzer",
                targetHandle: "in",
              },
            ],
            viewport: { x: 0, y: 0, zoom: 1.0 },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.data.description).toBe("Updated description for security remediator.");
    });

    it("POST /api/v1/workflows/:id/versions should snapshot immutable version 2", async () => {
      const response = await request(server)
        .post(`/api/v1/workflows/${createdWfId}/versions`)
        .send({
          definition: {
            nodes: [
              {
                id: "n1",
                type: "trigger",
                position: { x: 0, y: 0 },
                data: { label: "T", inputs: [], outputs: [], config: { triggerType: "manual" } },
              },
            ],
            edges: [],
            viewport: { x: 0, y: 0, zoom: 1 },
          },
          changelog: "Added LLM analyzer integration",
          isPublished: true,
        });

      expect(response.status).toBe(201);
      expect(response.body.data.versionNumber).toBe(2);
      expect(response.body.data.isPublished).toBe(true);
    });

    it("POST /api/v1/workflows/:id/rollback should revert to version 1", async () => {
      const response = await request(server)
        .post(`/api/v1/workflows/${createdWfId}/rollback`)
        .send({ versionNumber: 1 });

      expect(response.status).toBe(200);
      expect(response.body.data.activeVersionNumber).toBe(1);
    });
  });

  // -------------------------------------------------------------------------
  // 4. Workflow Execution & Real-Time Telemetry
  // -------------------------------------------------------------------------
  describe("Workflow Execution Engine", () => {
    let executionId: string;

    it("POST /api/v1/workflows/:id/execute should return 202 Accepted and stream_url", async () => {
      const response = await request(server)
        .post(`/api/v1/workflows/${SEED_IDS.WF_SUPPORT}/execute`)
        .send({
          mode: "mock",
          trigger_source: "manual",
          inputs: {
            customer_message: "Production API latency exceeded 5000ms threshold!",
            priority: "critical",
          },
        });

      expect(response.status).toBe(202);
      expect(response.body).toHaveProperty("execution_id");
      expect(response.body.status).toBe("running");
      expect(response.body).toHaveProperty("stream_url");
      executionId = response.body.execution_id;
    });

    it("GET /api/v1/executions should list active and recent executions", async () => {
      const response = await request(server).get("/api/v1/executions");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      const found = response.body.data.find((e: any) => e.id === executionId);
      expect(found).toBeDefined();
    });

    it("GET /api/v1/executions/:id should fetch execution summary and economics", async () => {
      // Allow async execution DAG to progress
      await new Promise((resolve) => setTimeout(resolve, 200));

      const response = await request(server).get(`/api/v1/executions/${executionId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(executionId);
      expect(["running", "completed"]).toContain(response.body.status);
      expect(response.body).toHaveProperty("total_tokens_used");
      expect(response.body).toHaveProperty("cost_estimate_usd");
    });

    it("GET /api/v1/executions/:id/runs should return step telemetry waterfall", async () => {
      const response = await request(server).get(`/api/v1/executions/${executionId}/runs`);

      expect(response.status).toBe(200);
      expect(response.body.execution_id).toBe(executionId);
      expect(Array.isArray(response.body.runs)).toBe(true);
      expect(response.body.runs.length).toBeGreaterThan(0);
      expect(response.body.runs[0]).toHaveProperty("node_key");
      expect(response.body.runs[0]).toHaveProperty("status");
    });

    it("GET /api/v1/executions/:id/stream should return text/event-stream headers", async () => {
      const response = await request(server)
        .get(`/api/v1/executions/${executionId}/stream`)
        .set("Accept", "text/event-stream");

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("text/event-stream");
    });

    it("POST /api/v1/approvals/:id/decide should record human review decision", async () => {
      const response = await request(server)
        .post("/api/v1/approvals/approval_99/decide")
        .send({
          decision: "approved",
          comments: "Verified output accuracy. Approved for dispatch.",
        });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe("approved");
    });
  });

  // -------------------------------------------------------------------------
  // 5. Inbound Webhook Ingress & HMAC-SHA256 Verification
  // -------------------------------------------------------------------------
  describe("Webhook Ingress & Cryptographic Security", () => {
    it("should accept valid HMAC-SHA256 signed inbound webhook requests", async () => {
      const rawPayload = JSON.stringify({
        event: "ticket.created",
        customer_email: "enterprise@acme.corp",
        subject: "Outage Report",
      });

      const timestamp = Math.floor(Date.now() / 1000);
      const signaturePayload = `${timestamp}.${rawPayload}`;
      const validHmac = crypto
        .createHmac("sha256", DEFAULT_WEBHOOK_SECRET)
        .update(signaturePayload, "utf8")
        .digest("hex");

      const signatureHeader = `t=${timestamp},v1=${validHmac}`;

      const response = await request(server)
        .post("/api/v1/webhooks/trigger/token_12345")
        .set("Content-Type", "application/json")
        .set("X-NeuralDesk-Signature", signatureHeader)
        .send(rawPayload);

      expect(response.status).toBe(202);
      expect(response.body.status).toBe("accepted");
      expect(response.body).toHaveProperty("execution_id");
    });

    it("should reject tampered HMAC signature with 401 Unauthorized", async () => {
      const rawPayload = JSON.stringify({ event: "order.created" });
      const signatureHeader = "t=1700000000,v1=9999999999999999999999999999999999999999999999999999999999999999";

      const response = await request(server)
        .post("/api/v1/webhooks/trigger/token_12345")
        .set("Content-Type", "application/json")
        .set("X-NeuralDesk-Signature", signatureHeader)
        .send(rawPayload);

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe("UNAUTHORIZED");
      expect(response.body).toHaveProperty("type");
      expect(response.body).toHaveProperty("title");
    });

    it("should reject webhook request missing signature header", async () => {
      const response = await request(server)
        .post("/api/v1/webhooks/trigger/token_12345")
        .send({ event: "order.created" });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe("UNAUTHORIZED");
    });

    it("should reject signature with timestamp exceeding 300s tolerance window", async () => {
      const rawPayload = JSON.stringify({ event: "test" });
      // Timestamp from 1 hour ago
      const expiredTimestamp = Math.floor(Date.now() / 1000) - 3600;
      const hmac = crypto
        .createHmac("sha256", DEFAULT_WEBHOOK_SECRET)
        .update(`${expiredTimestamp}.${rawPayload}`, "utf8")
        .digest("hex");

      const response = await request(server)
        .post("/api/v1/webhooks/trigger/token_12345")
        .set("X-NeuralDesk-Signature", `t=${expiredTimestamp},v1=${hmac}`)
        .send(rawPayload);

      expect(response.status).toBe(401);
      expect(response.body.error.message).toContain("tolerance window");
    });

    it("should support X-Idempotency-Key exactly-once replay semantics", async () => {
      const rawPayload = JSON.stringify({ test_key: "idempotent_order_01" });
      const idempotencyKey = `idemp_${crypto.randomUUID()}`;
      const timestamp = Math.floor(Date.now() / 1000);
      const hmac = crypto
        .createHmac("sha256", DEFAULT_WEBHOOK_SECRET)
        .update(`${timestamp}.${rawPayload}`, "utf8")
        .digest("hex");

      // First call
      const firstRes = await request(server)
        .post("/api/v1/webhooks/trigger/token_12345")
        .set("X-NeuralDesk-Signature", `t=${timestamp},v1=${hmac}`)
        .set("X-Idempotency-Key", idempotencyKey)
        .send(rawPayload);

      expect(firstRes.status).toBe(202);
      const originalExecId = firstRes.body.execution_id;

      // Second call with same idempotency key
      const secondRes = await request(server)
        .post("/api/v1/webhooks/trigger/token_12345")
        .set("X-NeuralDesk-Signature", `t=${timestamp},v1=${hmac}`)
        .set("X-Idempotency-Key", idempotencyKey)
        .send(rawPayload);

      expect(secondRes.status).toBe(202);
      expect(secondRes.body.execution_id).toBe(originalExecId);
      expect(secondRes.headers["x-idempotent-replay"]).toBe("true");
    });
  });

  // -------------------------------------------------------------------------
  // 6. Agents & Prompt Templates
  // -------------------------------------------------------------------------
  describe("Agents & Prompt Templates API", () => {
    it("GET /api/v1/agents should return list of agent personas", async () => {
      const response = await request(server).get("/api/v1/agents");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it("POST /api/v1/agents should create new agent persona", async () => {
      const payload = {
        name: "Security Lead Bot",
        slug: "security-lead-bot",
        description: "Reviews compliance policies.",
        systemPrompt: "You are a CISSP security auditor.",
        defaultModel: "gemini-1.5-flash",
        temperature: 0.2,
      };

      const response = await request(server).post("/api/v1/agents").send(payload);

      expect(response.status).toBe(201);
      expect(response.body.data.slug).toBe("security-lead-bot");
    });

    it("GET /api/v1/prompts should list prompt templates", async () => {
      const response = await request(server).get("/api/v1/prompts");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it("POST /api/v1/prompts should create a new prompt template", async () => {
      const payload = {
        name: "Summarize Bug Report",
        slug: "summarize-bug-report",
        content: "Summarize this issue: {{issue_description}}",
        variables: ["issue_description"],
        category: "engineering",
      };

      const response = await request(server).post("/api/v1/prompts").send(payload);

      expect(response.status).toBe(201);
      expect(response.body.data.variables).toContain("issue_description");
    });
  });

  // -------------------------------------------------------------------------
  // 7. RFC 7807 Error Envelope Compliance
  // -------------------------------------------------------------------------
  describe("RFC 7807 Standard Error Formatting", () => {
    it("should return RFC 7807 problem json on 404 route not found", async () => {
      const response = await request(server).get("/api/v1/non-existent-endpoint-1234");

      expect(response.status).toBe(404);
      expect(response.headers["content-type"]).toContain("application/problem+json");
      expect(response.body).toHaveProperty("type");
      expect(response.body).toHaveProperty("title", "Not Found");
      expect(response.body).toHaveProperty("status", 404);
      expect(response.body).toHaveProperty("detail");
      expect(response.body).toHaveProperty("instance", "/api/v1/non-existent-endpoint-1234");
      expect(response.body).toHaveProperty("error");
      expect(response.body.error.code).toBe("NOT_FOUND");
    });

    it("should return RFC 7807 problem json with field details on Zod validation failure", async () => {
      // POST /api/v1/workspaces with invalid slug (uppercase & spaces disallowed)
      const invalidPayload = {
        name: "Test Workspace",
        slug: "INVALID SLUG WITH SPACES",
      };

      const response = await request(server)
        .post("/api/v1/workspaces")
        .send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.headers["content-type"]).toContain("application/problem+json");
      expect(response.body.title).toBe("Validation Failed");
      expect(response.body.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_FAILED");
      expect(Array.isArray(response.body.error.details)).toBe(true);
      expect(response.body.error.details.length).toBeGreaterThan(0);
      expect(response.body.error.details[0]).toHaveProperty("field");
      expect(response.body.error.details[0]).toHaveProperty("issue");
    });
  });

  // -------------------------------------------------------------------------
  // 8. OpenAPI 3.1.0 Specification & Interactive Documentation Endpoints
  // -------------------------------------------------------------------------
  describe("OpenAPI 3.1.0 & Interactive Documentation", () => {
    it("GET /api/v1/openapi.json should return standard OpenAPI 3.1.0 document", async () => {
      const response = await request(server).get("/api/v1/openapi.json");

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(response.body.openapi).toBe("3.1.0");
      expect(response.body.info).toHaveProperty("title");
      expect(response.body.info).toHaveProperty("version", "1.0.0");
      expect(response.body.paths).toHaveProperty("/api/v1/health");
      expect(response.body.paths).toHaveProperty("/api/v1/workflows/{id}/execute");
      expect(response.body.paths).toHaveProperty("/api/v1/executions/stats");
      expect(response.body.paths).toHaveProperty("/api/v1/agents/chat");
      expect(response.body.paths).toHaveProperty("/api/v1/prompts/test");
    });

    it("GET /docs should serve interactive Scalar API documentation UI", async () => {
      const response = await request(server).get("/docs");

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("text/html");
      expect(response.text).toContain("NeuralDesk API Reference");
      expect(response.text).toContain("scalar/api-reference");
    });
  });
});
