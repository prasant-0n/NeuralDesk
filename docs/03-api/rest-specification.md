# 03. API — REST API Specification & OpenAPI Contracts

[← Back to Documentation Portal](../README.md) | [Complete Enterprise API Reference Manual →](../API_REFERENCE.md) | [Next: SSE Streaming →](./sse-streaming.md)

---

## 🌟 Interactive API Reference & OpenAPI 3.1.0

NeuralDesk provides modern, interactive documentation and machine-readable specifications:

* **Interactive API Reference Explorer (Scalar UI):** [`http://localhost:3001/docs`](http://localhost:3001/docs) or `/api/docs`
* **Swagger UI Explorer:** [`http://localhost:3001/docs/swagger`](http://localhost:3001/docs/swagger)
* **OpenAPI 3.1.0 JSON Specification:** [`/api/v1/openapi.json`](http://localhost:3001/api/v1/openapi.json) or [`openapi.json`](../../openapi.json)
* **OpenAPI 3.1.0 YAML Specification:** [`openapi.yaml`](../../openapi.yaml)
* **Full Enterprise API Reference Document:** [**`docs/API_REFERENCE.md`**](../API_REFERENCE.md)

---

## 1. Architectural Standards

* **Base URL:** `/api/v1`
* **Transport:** HTTPS with `application/json; charset=utf-8`
* **Real-Time Stream:** `text/event-stream; charset=utf-8` (Server-Sent Events)
* **Error Envelope:** Strict **RFC 7807 Problem Details for HTTP APIs** (`application/problem+json`)
* **Security:** Bearer JWT for tenant operations, HMAC-SHA256 for inbound webhooks, and AES-256-GCM BYOK credential isolation.

---

## 2. Standard RFC 7807 Error Envelope

All API errors conform strictly to the IETF RFC 7807 specification:

```json
{
  "type": "about:blank",
  "title": "Validation Failed",
  "status": 400,
  "detail": "Invalid workflow graph configuration.",
  "instance": "/api/v1/workflows/wf_88201/execute",
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Invalid workflow graph configuration.",
    "status": 400,
    "details": [
      {
        "field": "nodes.llm_1.config.temperature",
        "issue": "Expected number <= 1.0, received 1.5"
      }
    ],
    "timestamp": "2026-11-16T03:00:00.000Z",
    "path": "/api/v1/workflows/wf_88201/execute"
  }
}
```

---

## 3. Core API Endpoints Summary

| Domain | Method | Path | Description |
|---|---|---|---|
| **Health** | `GET` | `/api/v1/health` | Deep readiness probe, DB ping, uptime & memory |
| **Health** | `GET` | `/api/v1/health/live` | Lightweight liveness probe for k8s / load balancer |
| **Workspaces** | `GET` | `/api/v1/workspaces` | List accessible tenant workspaces |
| **Workspaces** | `POST` | `/api/v1/workspaces` | Create new workspace with optional BYOK keys |
| **Workspaces** | `GET` | `/api/v1/workspaces/:id/members` | List workspace members & RBAC roles |
| **Workflows** | `GET` | `/api/v1/workflows` | List workflows (paginated with filters) |
| **Workflows** | `POST` | `/api/v1/workflows` | Create workflow canvas |
| **Workflows** | `GET` | `/api/v1/workflows/:id` | Get workflow DAG nodes, edges & active version |
| **Workflows** | `POST` | `/api/v1/workflows/:id/versions` | Create immutable snapshot of canvas state |
| **Workflows** | `POST` | `/api/v1/workflows/:id/versions/:verId/publish` | Promote version snapshot to production |
| **Workflows** | `POST` | `/api/v1/workflows/:id/validate` | Topological DAG cycle validation (Kahn's alg) |
| **Execution** | `POST` | `/api/v1/workflows/:id/execute` | Trigger DAG execution (returns 202 + stream URL) |
| **Execution** | `GET` | `/api/v1/executions` | List executions with status & duration |
| **Execution** | `GET` | `/api/v1/executions/:id` | Get execution status, tokens & cost |
| **Execution** | `GET` | `/api/v1/executions/:id/runs` | Step-by-step trace waterfall & node I/O |
| **Execution** | `GET` | `/api/v1/executions/:id/stream` | Real-time SSE telemetry stream |
| **Execution** | `POST` | `/api/v1/executions/:id/rerun` | Re-run execution with replay inputs |
| **Execution** | `POST` | `/api/v1/executions/:id/cancel` | Abort in-flight DAG execution |
| **Telemetry** | `GET` | `/api/v1/executions/stats` | Latency SLAs ($P_{50}, P_{90}, P_{95}, P_{99}$), throughput |
| **Governance** | `GET` | `/api/v1/approvals` | List pending Human Gate approval requests |
| **Governance** | `POST` | `/api/v1/approvals/:id/decide` | Submit human approval/rejection decision |
| **AI Agents** | `POST` | `/api/v1/agents/chat` | Multi-turn chat with Gemini function calling |
| **AI Agents** | `GET` | `/api/v1/agents` | List autonomous agent personas |
| **Prompts** | `POST` | `/api/v1/prompts/test` | Live Mustache compiler, tokens & cost preview |
| **Prompts** | `GET` | `/api/v1/prompts` | List versioned prompt templates |
| **Webhooks** | `POST` | `/api/v1/webhooks/ingress/:path` | Cryptographic HMAC-SHA256 verified trigger |

---

*For detailed request payloads, curl snippets, Python/TypeScript SDK examples, and cryptographic verification code, see [**`docs/API_REFERENCE.md`**](../API_REFERENCE.md).*
