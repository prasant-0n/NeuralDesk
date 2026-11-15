# 03. API — REST API Specification & Contracts

[← Back to Documentation Portal](../README.md) | [Next: SSE Streaming →](./sse-streaming.md)

---

## 1.1 Conventions & Error Standard

* **Base URL:** `/api/v1`
* **Transport:** HTTPS with `application/json; charset=utf-8`

### Standard RFC 7807 Error Envelope
```json
{
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
    "timestamp": "2026-11-15T12:00:00.000Z",
    "path": "/api/v1/workflows/wf_88201/execute"
  }
}
```

---

## 1.2 Core Endpoints Reference

### 1. Workflows Management
* **`GET /api/v1/workspaces/:wsId/workflows`**: List workspace workflows with pagination & filters.
* **`POST /api/v1/workspaces/:wsId/workflows`**: Create a new workflow canvas.
* **`GET /api/v1/workflows/:id`**: Fetch active workflow graph definition and nodes.
* **`PUT /api/v1/workflows/:id`**: Save updated canvas nodes and edges.
* **`DELETE /api/v1/workflows/:id`**: Soft-delete workflow.

### 2. Versioning
* **`POST /api/v1/workflows/:id/versions`**: Create an immutable snapshot of current canvas state.
* **`POST /api/v1/workflows/:id/versions/:verId/publish`**: Designate version as active production version.

### 3. Execution Management
* **`POST /api/v1/workflows/:id/execute`**: Trigger asynchronous execution.

**Request Payload:**
```json
{
  "mode": "real",
  "trigger_source": "manual",
  "inputs": {
    "customer_message": "Our database connection dropped again! Urgent fix needed.",
    "customer_tier": "enterprise"
  }
}
```

**Response `202 Accepted`:**
```json
{
  "execution_id": "exec_55aa88ff",
  "workflow_id": "wf_9a8b7c6d",
  "version_number": 3,
  "mode": "real",
  "status": "running",
  "started_at": "2026-11-15T12:05:00.120Z",
  "stream_url": "/api/v1/executions/exec_55aa88ff/stream"
}
```

* **`GET /api/v1/executions/:id`**: Fetch execution telemetry and token economics.
* **`GET /api/v1/executions/:id/runs`**: Retrieve granular step run records.
* **`POST /api/v1/executions/:id/cancel`**: Abort in-flight execution.

---

[Next: SSE Streaming →](./sse-streaming.md)
