# 03. API — Server-Sent Events (SSE) Streaming Protocol

[← Back to Documentation Portal](../README.md) | [← REST Specification](./rest-specification.md) | [Next: Webhook Ingress →](./webhook-ingress.md)

---

## 2.1 Connection Setup

Clients open a reactive stream to observe workflow progress in real time:
`GET /api/v1/executions/:id/stream`

### Required Response Headers
```http
HTTP/1.1 200 OK
Content-Type: text/event-stream; charset=utf-8
Cache-Control: no-cache, no-transform
Connection: keep-alive
X-Accel-Buffering: no
```

---

## 2.2 Event Specification Matrix

| Event Name | Trigger Phase | Key Payload Properties |
| :--- | :--- | :--- |
| `execution:start` | Workflow initialization | `execution_id`, `total_nodes`, `ordered_keys` |
| `node:start` | Node scheduler initiates execution | `execution_id`, `node_key`, `node_type`, `started_at` |
| `node:stream:chunk` | Real-time token streaming from Gemini SDK | `execution_id`, `node_key`, `chunk`, `accumulated_length` |
| `node:complete` | Node completes successfully | `execution_id`, `node_key`, `duration_ms`, `tokens`, `cost_usd`, `outputs` |
| `node:error` | Node throws unhandled exception | `execution_id`, `node_key`, `error_message`, `stack` |
| `node:skip` | Node unreachable due to condition branch | `execution_id`, `node_key`, `reason` |
| `execution:complete`| All DAG paths successfully finished | `execution_id`, `status: "completed"`, `total_cost_usd`, `duration_ms` |
| `execution:error` | Workflow aborted due to fatal error | `execution_id`, `status: "failed"`, `error_message` |

---

## 2.3 Raw Stream Wire Sample

```http
event: execution:start
id: msg_001
data: {"execution_id":"exec_55aa88ff","total_nodes":3,"ordered_keys":["trigger_1","llm_1","output_1"]}

event: node:start
id: msg_002
data: {"execution_id":"exec_55aa88ff","node_key":"trigger_1","node_type":"trigger","started_at":"2026-11-15T12:05:00.125Z"}

event: node:complete
id: msg_003
data: {"execution_id":"exec_55aa88ff","node_key":"trigger_1","duration_ms":10,"outputs":{"text":"Urgent ticket"}}

event: node:start
id: msg_004
data: {"execution_id":"exec_55aa88ff","node_key":"llm_1","node_type":"llm","model":"gemini-1.5-flash"}

event: node:stream:chunk
id: msg_005
data: {"execution_id":"exec_55aa88ff","node_key":"llm_1","chunk":"Class"}

event: node:stream:chunk
id: msg_006
data: {"execution_id":"exec_55aa88ff","node_key":"llm_1","chunk":"ification: NEGATIVE"}

event: node:complete
id: msg_007
data: {"execution_id":"exec_55aa88ff","node_key":"llm_1","duration_ms":480,"prompt_tokens":120,"completion_tokens":25,"cost_usd":0.0000165,"outputs":{"sentiment":"NEGATIVE"}}

event: execution:complete
id: msg_008
data: {"execution_id":"exec_55aa88ff","status":"completed","duration_ms":512,"total_tokens":145,"total_cost_usd":0.0000165}
```

---

## 2.4 Disconnection & Replay Recovery (`Last-Event-ID`)

In enterprise environments, mobile networks and browser tab throttling can cause transient SSE connection drops. NeuralDesk implements standard W3C reconnection semantics:

1. **Client Reconnect:** When the browser `EventSource` reconnects, it automatically delivers the last observed ID via the HTTP header:
   ```http
   GET /api/v1/executions/exec_55aa88ff/stream
   Last-Event-ID: msg_004
   ```
2. **Replay Buffer:** The backend checks the in-memory execution event log (or database `node_execution_runs`). Any events emitted *after* `msg_004` (e.g. `msg_005`, `msg_006`, `msg_007`, `msg_008`) are immediately replayed in chronological order before resuming live streaming.
3. **Canvas Synchronization:** Ensures the visual canvas never freezes or displays stale "running" indicators if the client temporarily loses internet connectivity.

---

[← Previous: REST Specification](./rest-specification.md) | [Next: Webhook Ingress →](./webhook-ingress.md)
