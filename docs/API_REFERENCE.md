# NeuralDesk — Enterprise API Reference Manual
**Version:** 1.0.0 &bull; **OpenAPI:** 3.1.0 &bull; **Protocol:** RESTful HTTPS &bull; **Real-Time Stream:** Server-Sent Events (SSE)

---

## 1. Architectural Principles & Standards

The **NeuralDesk API** is built to meet the rigorous design, security, and observability standards expected in modern distributed platforms (such as Stripe, Twilio, and GitHub).

```
               Client Tier (React SPA / SDK / Third-Party Webhook)
                                       │
                                       │ HTTPS / TLS 1.3
                                       ▼
                     ┌───────────────────────────────────┐
                     │     Edge Gateway / Reverse Proxy  │
                     │  (Rate Limiter, CORS, X-Request)  │
                     └─────────────────┬─────────────────┘
                                       │
                        ┌──────────────┴──────────────┐
                        ▼                             ▼
       ┌────────────────────────────────┐  ┌─────────────────────────────────┐
       │   Synchronous REST Operations  │  │   Asynchronous Real-Time Stream │
       │      (RFC 7807 Problem JSON)   │  │   (HTTP text/event-stream SSE)  │
       │  • Workspaces & RBAC           │  │  • Execution step waterfalls    │
       │  • DAG Validation (Kahn's Alg) │  │  • Active node execution halos  │
       │  • AI Agent Studio & Prompts   │  │  • Live token economics deltas  │
       │  • Webhook HMAC Verification   │  │  • Human approval pauses        │
       └────────────────┬───────────────┘  └────────────────┬────────────────┘
                        │                             │
                        ▼                             ▼
       ┌─────────────────────────────────────────────────────────────────────┐
       │     Topological Execution Engine & BYOK In-Memory Decryption        │
       │      (Gemini 1.5/2.0 Real AI + MurmurHash3 Deterministic PRNG)      │
       └─────────────────────────────────────────────────────────────────────┘
```

### Core API Contracts:
1. **Resource-Oriented REST:** Nouns represent resources (`/workflows`, `/executions`, `/agents`), HTTP verbs define mutations (`GET`, `POST`, `PATCH`, `PUT`, `DELETE`).
2. **Standard Serialization:** All payloads are formatted strictly as `application/json; charset=utf-8`.
3. **RFC 7807 Problem Details:** All error responses return `application/problem+json` containing machine-readable error codes, human explanations, field validation arrays, and correlated trace IDs.
4. **Microsecond Precision:** All timestamps are formatted according to **ISO 8601 UTC** (`YYYY-MM-DDTHH:mm:ss.sssZ`).
5. **Idempotency Support:** Mutating operations (`POST /api/v1/workflows/:id/execute`, `POST /api/v1/executions/:id/rerun`) accept an optional `X-Idempotency-Key` header to prevent duplicate execution dispatches under network retries.
6. **Zero-Trust BYOK Isolation:** API credentials (e.g. Gemini API keys) are stored using **AES-256-GCM** encryption at rest and decrypted ephemerally only within the worker memory during inference.

---

## 2. Interactive Documentation & Schema Downloads

| Asset | Location / Endpoint | Description |
|---|---|---|
| **Interactive Scalar API Explorer** | [`http://localhost:3001/docs`](http://localhost:3001/docs) or `/api/docs` | Modern, responsive API reference with interactive "Try it out", schema viewer, and code generation. |
| **Interactive Swagger UI** | [`http://localhost:3001/docs/swagger`](http://localhost:3001/docs/swagger) | Classic OpenAPI specification explorer. |
| **OpenAPI 3.1.0 JSON** | [`/api/v1/openapi.json`](http://localhost:3001/api/v1/openapi.json) | Full machine-readable OpenAPI 3.1.0 schema (70+ KB). |
| **OpenAPI 3.1.0 YAML** | [`openapi.yaml`](../openapi.yaml) | Repository root YAML specification for CI/CD linting, Postman, or Insomnia import. |

---

## 3. Authentication & Security Schemes

### 3.1 Bearer JWT Authentication
Authenticated tenant endpoints require an HTTP `Authorization` header containing a valid JSON Web Token:
```http
Authorization: Bearer <your_jwt_session_token>
```

### 3.2 Tenant Context Header
Multi-tenant operations can be pinned to a specific workspace using the optional workspace context header:
```http
X-Workspace-Id: ws_default_production
```

### 3.3 Webhook HMAC-SHA256 Signatures
Inbound webhooks dispatched to `/api/v1/webhooks/ingress/:webhookPath` must include a cryptographic signature header computed with your secret key:
```http
X-NeuralDesk-Signature: sha256=a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890
```

---

## 4. Standard Headers

### Request Headers
| Header | Type | Required | Description |
|---|---|---|---|
| `Content-Type` | String | Yes (for POST/PATCH) | Must be `application/json` |
| `Authorization` | String | Conditional | `Bearer <token>` for authenticated routes |
| `X-Workspace-Id` | String | Optional | Tenant workspace boundary identifier |
| `X-Request-Id` | String | Optional | Client-assigned idempotency trace UUID |
| `X-Idempotency-Key` | String | Optional | Deduplication key for execution dispatches |
| `X-NeuralDesk-Signature`| String | Conditional | HMAC-SHA256 signature for webhook ingress |

### Response Headers
| Header | Description |
|---|---|
| `X-Request-Id` | Unique UUID assigned to the HTTP request cycle |
| `X-Trace-Id` | Correlated distributed trace identifier matching server logs |
| `Content-Type` | `application/json; charset=utf-8` or `application/problem+json` |

---

## 5. RFC 7807 Error Response Specification

When an error occurs, the server responds with HTTP status 4xx or 5xx and an RFC 7807 Problem Details envelope:

```json
{
  "type": "about:blank",
  "title": "Validation Failed",
  "status": 400,
  "detail": "Invalid workflow graph configuration.",
  "instance": "/api/v1/workflows/wf_customer_support/execute",
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Invalid workflow graph configuration.",
    "status": 400,
    "details": [
      {
        "field": "inputs.customerEmail",
        "issue": "Invalid email address format"
      }
    ],
    "timestamp": "2026-11-16T03:30:00.000Z",
    "path": "/api/v1/workflows/wf_customer_support/execute"
  }
}
```

### Canonical Error Codes Catalog:
| Error Code | HTTP Status | Meaning |
|---|---|---|
| `VALIDATION_FAILED` | `400 Bad Request` | Request payload failed strict Zod schema validation. |
| `UNAUTHORIZED` | `401 Unauthorized` | Missing or expired Bearer JWT authentication. |
| `WEBHOOK_INVALID_SIGNATURE` | `401 Unauthorized` | Webhook HMAC-SHA256 payload digest mismatch. |
| `FORBIDDEN` | `403 Forbidden` | Authenticated user lacks RBAC permissions for resource. |
| `NOT_FOUND` | `404 Not Found` | Requested workspace, workflow, or execution ID does not exist. |
| `CYCLE_DETECTED` | `400 Bad Request` | Kahn's Algorithm detected a directed cycle in the DAG. |
| `PAYLOAD_TOO_LARGE` | `413 Payload Too Large` | Request body exceeded the strict 2MB memory threshold. |
| `RATE_LIMITED` | `429 Too Many Requests` | Request volume exceeded concurrency or rate limits. |
| `INTERNAL_ERROR` | `500 Internal Error` | Unexpected server error captured with trace ID. |

---

## 6. Endpoints Directory & API Reference

### 6.1 System & Health Probes

#### `GET /api/v1/health`
**Summary:** Deep Readiness & Diagnostic Probe  
**Authentication:** Public (No token required)  
**Description:** Performs deep health verification including a live PostgreSQL connection ping (`SELECT 1`), memory utilization figures, active Server-Sent Events subscribers, and server uptime.

**Response (`200 OK`):**
```json
{
  "status": "healthy",
  "server": "ok",
  "version": "1.0.0",
  "environment": "production",
  "timestamp": "2026-11-16T03:40:00.000Z",
  "uptimeSeconds": 14400,
  "database": {
    "status": "connected",
    "latencyMs": 1
  },
  "activeExecutions": 0,
  "activeSubscribers": 2,
  "memory": {
    "heapUsedMb": 42.15,
    "heapTotalMb": 68.20,
    "rssMb": 110.45
  },
  "totalCheckDurationMs": 2
}
```

#### `GET /api/v1/health/live`
**Summary:** Lightweight Liveness Probe  
**Authentication:** Public  
**Description:** Rapid liveness probe for Kubernetes pod health checks, Docker healthcheck, or load balancer routing.

**Response (`200 OK`):**
```json
{
  "status": "ok",
  "uptimeSeconds": 14400
}
```

---

### 6.2 Workspaces & Tenant Governance

#### `GET /api/v1/workspaces`
**Summary:** List Accessible Workspaces  
**Authentication:** Bearer JWT  
**Response (`200 OK`):**
```json
{
  "data": [
    {
      "id": "ws_default_production",
      "name": "NeuralDesk Production",
      "slug": "neuraldesk-prod",
      "ownerId": "usr_9a8b7c6d-0000-0000-0000-000000000001",
      "createdAt": "2026-11-15T00:00:00.000Z",
      "updatedAt": "2026-11-15T00:00:00.000Z"
    }
  ]
}
```

#### `POST /api/v1/workspaces`
**Summary:** Create New Workspace  
**Authentication:** Bearer JWT  
**Request Body:**
```json
{
  "name": "Enterprise AI Engineering",
  "slug": "enterprise-ai-eng",
  "encryptedApiKeys": "ciphertext_sample_aes_gcm"
}
```
**Response (`201 Created`):** Returns the initialized `Workspace` object.

#### `GET /api/v1/workspaces/:id/members`
**Summary:** List Workspace Members & RBAC Roles  
**Authentication:** Bearer JWT  
**Response (`200 OK`):**
```json
{
  "data": [
    {
      "id": "mem_1",
      "workspaceId": "ws_default_production",
      "userId": "usr_admin",
      "role": "owner",
      "createdAt": "2026-11-15T00:00:00.000Z"
    }
  ]
}
```

---

### 6.3 Workflows & Visual DAG Management

#### `GET /api/v1/workflows`
**Summary:** List Workflows  
**Authentication:** Bearer JWT  
**Query Parameters:**
* `page` (integer, default: 1): Page number.
* `limit` (integer, default: 20): Page size.
* `category` (string, optional): Filter by category (`support`, `sales`, `security`).
* `status` (string, optional): Filter by status (`draft`, `published`, `archived`).

**Response (`200 OK`):**
```json
{
  "data": [
    {
      "id": "wf_customer_support",
      "workspaceId": "ws_default_production",
      "name": "Customer Support Triage & Sentiment Escalation",
      "description": "Classifies incoming customer tickets, scores urgency, and alerts Slack",
      "category": "support",
      "status": "published",
      "createdAt": "2026-11-15T00:00:00.000Z",
      "updatedAt": "2026-11-15T02:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

#### `GET /api/v1/workflows/:id`
**Summary:** Get Workflow Canvas Definition & Snapshots  
**Authentication:** Bearer JWT  
**Description:** Returns the workflow metadata, current active published version snapshot, and full historical versions list.

**Response (`200 OK`):**
```json
{
  "data": {
    "id": "wf_customer_support",
    "name": "Customer Support Triage & Sentiment Escalation",
    "description": "Classifies ticket sentiment and scores urgency",
    "status": "published",
    "version": {
      "id": "ver_1",
      "workflowId": "wf_customer_support",
      "versionNumber": 1,
      "isPublished": true,
      "definition": {
        "nodes": [
          { "id": "webhook_trigger", "type": "trigger", "position": { "x": 100, "y": 200 } },
          { "id": "gemini_sentiment", "type": "llm", "position": { "x": 400, "y": 200 } }
        ],
        "edges": [
          { "id": "e1", "source": "webhook_trigger", "target": "gemini_sentiment" }
        ]
      }
    },
    "versions": [
      { "id": "ver_1", "versionNumber": 1, "isPublished": true }
    ]
  }
}
```

#### `POST /api/v1/workflows/:id/validate`
**Summary:** Topological DAG Validation & Invariant Check  
**Authentication:** Bearer JWT  
**Description:** Performs topological sort using **Kahn's Algorithm** to detect any circular dependencies, unlinked input handles, or missing node configuration properties before publishing or execution.

**Response (`200 OK`):**
```json
{
  "valid": true,
  "nodeCount": 6,
  "edgeCount": 5,
  "executionOrder": [
    "webhook_trigger",
    "prompt_formatter",
    "gemini_sentiment",
    "urgency_router",
    "slack_pager_alert"
  ],
  "warnings": []
}
```

---

### 6.4 Workflow Execution Engine & Telemetry

#### `POST /api/v1/workflows/:id/execute`
**Summary:** Trigger DAG Workflow Execution  
**Authentication:** Bearer JWT  
**Description:** Dispatches asynchronous DAG execution through the topological orchestrator. Returns `202 Accepted` immediately with the unique `executionId` and the dedicated Server-Sent Events stream URL.

**Request Payload:**
```json
{
  "mode": "real",
  "triggerSource": "api",
  "inputs": {
    "customerEmail": "cto@enterprise.com",
    "subject": "Payment API timeouts on checkout endpoint",
    "messageBody": "We are experiencing 504 timeouts on EU production cluster."
  }
}
```

**Response (`202 Accepted`):**
```json
{
  "executionId": "exec_8f9a2b10",
  "workflowId": "wf_customer_support",
  "versionNumber": 1,
  "mode": "real",
  "status": "running",
  "startedAt": "2026-11-16T03:42:00.120Z",
  "streamUrl": "/api/v1/executions/exec_8f9a2b10/stream"
}
```

#### `GET /api/v1/executions`
**Summary:** List Workflow Executions  
**Authentication:** Bearer JWT  
**Query Parameters:**
* `status` (`running`, `completed`, `failed`, `cancelled`, `waiting_for_approval`)
* `workflow_id` (string, optional)
* `page` (integer, default: 1)
* `limit` (integer, default: 15)

**Response (`200 OK`):**
```json
{
  "data": [
    {
      "id": "exec_8f9a2b10",
      "workflowId": "wf_customer_support",
      "status": "completed",
      "triggerSource": "api",
      "startedAt": "2026-11-16T03:42:00.120Z",
      "completedAt": "2026-11-16T03:42:00.862Z",
      "durationMs": 742,
      "promptTokens": 280,
      "completionTokens": 138,
      "totalTokens": 418,
      "costUsd": 0.0002
    }
  ],
  "pagination": { "page": 1, "limit": 15, "total": 34, "totalPages": 3 }
}
```

#### `GET /api/v1/executions/:id/runs`
**Summary:** Step-by-Step Node Traces Waterfall  
**Authentication:** Bearer JWT  
**Description:** Returns the microsecond forensic breakdown of every node executed in the DAG, including exact input payloads, output responses, execution durations, and error details.

**Response (`200 OK`):**
```json
{
  "data": [
    {
      "id": "run_node_gemini_sentiment",
      "executionId": "exec_8f9a2b10",
      "nodeId": "gemini_sentiment",
      "status": "completed",
      "startedAt": "2026-11-16T03:42:00.220Z",
      "completedAt": "2026-11-16T03:42:00.602Z",
      "durationMs": 382,
      "inputPayload": {
        "text": "We are experiencing 504 timeouts on EU production cluster."
      },
      "outputPayload": {
        "sentiment": "NEGATIVE",
        "urgencyScore": 5,
        "escalate": true,
        "summary": "Critical payment outage in European infrastructure."
      }
    }
  ]
}
```

#### `POST /api/v1/executions/:id/rerun`
**Summary:** Re-run Execution Replay  
**Authentication:** Bearer JWT  
**Description:** Re-executes the DAG using original inputs or overridden parameters. Returns a new execution record with `202 Accepted`.

#### `POST /api/v1/executions/:id/cancel`
**Summary:** Abort In-Flight Execution  
**Authentication:** Bearer JWT  
**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Execution exec_8f9a2b10 successfully cancelled"
}
```

#### `GET /api/v1/executions/stats`
**Summary:** Aggregated Operations Telemetry & SLA Percentiles  
**Authentication:** Bearer JWT  
**Query Parameters:**
* `timeframe` (`1h`, `24h`, `7d`, `30d`, `all`, default: `24h`)

**Response (`200 OK`):**
```json
{
  "timeframe": "24h",
  "activeWorkflows": 3,
  "totalExecutions": 34,
  "successRate": 94.1,
  "tokensConsumed": 34350,
  "totalSpendUsd": 0.0051,
  "slaMetrics": {
    "p50LatencyMs": 524,
    "p90LatencyMs": 703,
    "p95LatencyMs": 739,
    "p99LatencyMs": 746,
    "minLatencyMs": 280,
    "maxLatencyMs": 746,
    "avgLatencyMs": 518
  },
  "throughputSeries": [
    { "timestamp": "00:00", "runs": 2, "tokens": 1200 },
    { "timestamp": "12:00", "runs": 14, "tokens": 15400 }
  ],
  "modelMetrics": [
    { "model": "gemini-1.5-flash", "invocations": 1420, "spendUsd": 0.0035 },
    { "model": "gemini-1.5-pro", "invocations": 380, "spendUsd": 0.0016 }
  ],
  "systemHealth": {
    "engineStatus": "healthy",
    "databasePingMs": 1,
    "activeConcurrency": 0,
    "maxConcurrency": 10
  }
}
```

---

### 6.5 Real-Time Telemetry: Server-Sent Events (SSE)

#### `GET /api/v1/executions/:id/stream`
**Summary:** Live Execution Event Stream  
**Authentication:** Bearer JWT  
**Protocol:** HTTP/1.1 `text/event-stream`  
**Headers Sent by Server:**
```http
Content-Type: text/event-stream; charset=utf-8
Cache-Control: no-cache, no-transform
Connection: keep-alive
X-Accel-Buffering: no
```

#### SSE Event Taxonomy:
| Event Name | Description | Payload Data Structure |
|---|---|---|
| `execution:started` | Workflow DAG execution began | `{ "executionId": "...", "mode": "real", "startedAt": "..." }` |
| `node:running` | Node began processing | `{ "executionId": "...", "nodeId": "...", "status": "running" }` |
| `node:completed` | Node finished successfully | `{ "executionId": "...", "nodeId": "...", "durationMs": 382, "output": { ... } }` |
| `node:failed` | Node error or timeout | `{ "executionId": "...", "nodeId": "...", "error": "API Timeout" }` |
| `execution:waiting_for_approval` | DAG paused at Human Gate | `{ "executionId": "...", "nodeId": "...", "approvalId": "..." }` |
| `execution:completed` | All terminal nodes finished | `{ "executionId": "...", "status": "completed", "totalTokens": 418, "costUsd": 0.0002 }` |

**Raw Stream Example:**
```http
event: execution:started
data: {"executionId":"exec_8f9a2b10","startedAt":"2026-11-16T03:42:00.120Z"}

event: node:running
data: {"executionId":"exec_8f9a2b10","nodeId":"gemini_sentiment","status":"running"}

event: node:completed
data: {"executionId":"exec_8f9a2b10","nodeId":"gemini_sentiment","status":"completed","durationMs":382}

event: execution:completed
data: {"executionId":"exec_8f9a2b10","status":"completed","durationMs":742,"totalTokens":418}
```

---

### 6.6 Human-in-the-Loop Governance

#### `GET /api/v1/approvals`
**Summary:** List Pending Human Gate Approvals  
**Authentication:** Bearer JWT  
**Response (`200 OK`):**
```json
{
  "data": [
    {
      "id": "appr_7c8d9e",
      "executionId": "exec_8f9a2b10",
      "nodeId": "human_gate_sre",
      "status": "pending",
      "promptMessage": "Confirm high-value refund authorization of $4,500.00",
      "contextData": { "refundAmount": 4500, "customerTier": "enterprise" },
      "createdAt": "2026-11-16T03:42:01.000Z"
    }
  ]
}
```

#### `POST /api/v1/approvals/:id/decide`
**Summary:** Submit Approval Decision  
**Authentication:** Bearer JWT  
**Request Body:**
```json
{
  "decision": "approved",
  "feedback": "Approved following SRE verification",
  "decidedBy": "usr_sre_lead"
}
```
**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Approval decision applied. Workflow execution resumed."
}
```

---

### 6.7 AI Agent Studio & Autonomous Personas

#### `POST /api/v1/agents/chat`
**Summary:** Multi-Turn Conversational Inference & Tool Calling  
**Authentication:** Bearer JWT  
**Request Body:**
```json
{
  "message": "Classify this ticket: 'Customer reporting checkout API 500 error'. If urgency > 4, call slack_pager_router.",
  "agentId": "agent_triage_sentinel",
  "model": "gemini-1.5-flash",
  "temperature": 0.2
}
```
**Response (`200 OK`):**
```json
{
  "reply": "Inbound ticket classified as CRITICAL urgency (Score: 5). Dispatched high-priority alert to #support-escalations via `slack_pager_router`.",
  "toolCalls": [
    {
      "name": "slack_pager_router",
      "parameters": {
        "channel": "#support-escalations",
        "urgency": 5,
        "summary": "Customer reporting checkout API 500 error"
      },
      "result": { "dispatched": true, "messageTs": "1731728520.001" }
    }
  ],
  "tokensUsed": 342,
  "latencyMs": 480,
  "model": "gemini-1.5-flash"
}
```

#### `GET /api/v1/agents`
**Summary:** List Agent Personas  
**Authentication:** Bearer JWT  
**Response (`200 OK`):** Returns array of configured agent personas (`Triage Sentinel`, `Synthesizer Pro`, `Pipeline Scout`).

---

### 6.8 Prompt Template Library

#### `POST /api/v1/prompts/test`
**Summary:** Live Mustache Compiler & Token Cost Estimator  
**Authentication:** Bearer JWT  
**Request Body:**
```json
{
  "template": "Analyze the customer message: {{customer_message}}\nOutput sentiment: POSITIVE | NEGATIVE.",
  "variables": {
    "customer_message": "Our checkout is failing on step 3!"
  },
  "model": "gemini-1.5-flash"
}
```
**Response (`200 OK`):**
```json
{
  "compiledPrompt": "Analyze the customer message: Our checkout is failing on step 3!\nOutput sentiment: POSITIVE | NEGATIVE.",
  "extractedVariables": ["customer_message"],
  "projectedTokens": 48,
  "estimatedCostUsd": 0.0000036,
  "testOutput": "NEGATIVE",
  "latencyMs": 284
}
```

#### `GET /api/v1/prompts`
**Summary:** List Prompt Templates  
**Authentication:** Bearer JWT  
**Query Parameters:** `category` (`support`, `summarization`, `sales`, `security`, `extraction`).

---

### 6.9 Webhook Gateway & Ingress

#### `POST /api/v1/webhooks/ingress/:webhookPath`
**Summary:** External Webhook Ingress  
**Authentication:** HMAC-SHA256 Signature Header (`X-NeuralDesk-Signature`)  
**Description:** Public gateway for external triggers (Stripe, GitHub, PagerDuty, Salesforce). Validates payload signature against shared secret using timing-safe comparison, then asynchronously triggers workflow.

**Request Headers:**
```http
Content-Type: application/json
X-NeuralDesk-Signature: sha256=<hex_digest>
```
**Response (`202 Accepted`):**
```json
{
  "success": true,
  "executionId": "exec_98af21d0",
  "workflowId": "wf_customer_support",
  "status": "running"
}
```

---

## 7. Webhook HMAC-SHA256 Signature Verification Guide

NeuralDesk computes signatures using the **HMAC-SHA256** standard over raw UTF-8 request bytes.

### Node.js (TypeScript) Implementation
```typescript
import crypto from "node:crypto";

export function verifyNeuralDeskWebhook(
  rawBody: string,
  signatureHeader: string,
  secret: string
): boolean {
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) {
    return false;
  }

  const expectedSignature = signatureHeader.slice(7); // Remove 'sha256=' prefix
  const computedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");

  // Mitigates timing attacks using constant-time comparison
  return crypto.timingSafeEqual(
    Buffer.from(computedSignature, "hex"),
    Buffer.from(expectedSignature, "hex")
  );
}
```

### Python Implementation
```python
import hmac
import hashlib

def verify_neuraldesk_webhook(raw_body: bytes, signature_header: str, secret: str) -> bool:
    if not signature_header or not signature_header.startswith("sha256="):
        return False
    
    expected_signature = signature_header[7:]
    computed_signature = hmac.new(
        secret.encode("utf-8"),
        raw_body,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(computed_signature, expected_signature)
```

---

## 8. Client Code Examples

### 8.1 TypeScript / JavaScript (`fetch`)
```typescript
const NEURALDESK_API = "http://localhost:3001/api/v1";
const TOKEN = "your_jwt_token_here";

// Trigger workflow execution
const response = await fetch(`${NEURALDESK_API}/workflows/wf_customer_support/execute`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${TOKEN}`
  },
  body: JSON.stringify({
    mode: "real",
    inputs: {
      customerEmail: "vp_eng@enterprise.com",
      subject: "Urgent: Infrastructure cluster down"
    }
  })
});

const { executionId, streamUrl } = await response.json();
console.log(`Execution started: ${executionId}`);

// Listen to real-time execution telemetry via SSE
const eventSource = new EventSource(`${NEURALDESK_API}${streamUrl}`);

eventSource.addEventListener("node:completed", (event) => {
  const nodeData = JSON.parse(event.data);
  console.log(`Node ${nodeData.nodeId} finished in ${nodeData.durationMs}ms`);
});

eventSource.addEventListener("execution:completed", (event) => {
  const result = JSON.parse(event.data);
  console.log(`Workflow complete. Total cost: $${result.costUsd}`);
  eventSource.close();
});
```

### 8.2 Python (`requests`)
```python
import requests

API_URL = "http://localhost:3001/api/v1"
HEADERS = {
    "Content-Type": "application/json",
    "Authorization": "Bearer your_jwt_token_here"
}

payload = {
    "mode": "real",
    "inputs": {
        "customerEmail": "cto@techcorp.io",
        "subject": "504 Gateway Timeout during peak traffic"
    }
}

res = requests.post(f"{API_URL}/workflows/wf_customer_support/execute", json=payload, headers=HEADERS)
data = res.json()

print(f"Dispatched execution: {data['executionId']}")
print(f"SSE Telemetry Stream URL: {data['streamUrl']}")
```

### 8.3 cURL
```bash
# 1. Check system health
curl -s http://localhost:3001/api/v1/health | jq

# 2. Trigger workflow execution
curl -s -X POST http://localhost:3001/api/v1/workflows/wf_customer_support/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mock_jwt_admin_user" \
  -d '{"mode":"real","inputs":{"customerEmail":"user@test.com","subject":"Urgent issue"}}' | jq

# 3. Stream real-time execution trace
curl -N -H "Authorization: Bearer mock_jwt_admin_user" \
  http://localhost:3001/api/v1/executions/exec_8f9a2b10/stream

# 4. Fetch latency SLA percentiles (P50, P90, P95, P99)
curl -s http://localhost:3001/api/v1/executions/stats?timeframe=24h \
  -H "Authorization: Bearer mock_jwt_admin_user" | jq .slaMetrics
```
