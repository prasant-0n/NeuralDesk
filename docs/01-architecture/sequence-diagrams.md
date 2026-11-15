# 01. Architecture — Execution Sequence Diagrams

[← Back to Documentation Portal](../README.md) | [← Monorepo Structure](./monorepo-structure.md) | [Next Section: Database →](../02-database/er-diagram.md)

---

## 4.1 End-to-End Workflow Execution Sequence

The following sequence diagram tracks a complete execution cycle from visual trigger to Gemini streaming and database persistence:

```mermaid
sequenceDiagram
    autonumber
    actor User as Developer (Browser)
    participant Web as apps/web (Canvas Store)
    participant API as apps/api (Gateway & Router)
    participant Engine as Graph Execution Engine
    participant Gemini as Google Gemini 1.5/2.0 API
    participant SSE as SSE Broadcaster
    participant DB as Neon PostgreSQL (Drizzle)

    User->>Web: Clicks "Run Workflow" (Manual Trigger)
    Web->>API: POST /api/v1/workflows/:id/execute { mode: "real", inputs: {} }
    API->>DB: INSERT INTO executions (status: "running", started_at: NOW)
    API-->>Web: 202 Accepted { execution_id: "exec_101", status: "running" }
    
    Web->>API: GET /api/v1/executions/exec_101/stream (SSE Connection)
    API->>SSE: Open text/event-stream connection
    SSE-->>Web: event: execution:start { execution_id: "exec_101", nodes: 4 }

    API->>Engine: Run DAG (Nodes: Trigger -> Prompt -> LLM -> Output)
    Engine->>Engine: Kahn Topological Sort & Cycle Validation (Acyclic Verified)
    
    %% Trigger Node
    Engine->>SSE: event: node:start { node_key: "trigger_1", status: "running" }
    SSE-->>Web: Update Canvas: Node trigger_1 glows indigo
    Engine->>DB: INSERT INTO node_execution_runs (status: "completed")
    Engine->>SSE: event: node:complete { node_key: "trigger_1", outputs: { payload: "text" } }
    SSE-->>Web: Update Canvas: Node trigger_1 glows emerald

    %% Prompt Node
    Engine->>SSE: event: node:start { node_key: "prompt_1" }
    Engine->>Engine: Interpolate Mustache template {{trigger_1.payload}}
    Engine->>SSE: event: node:complete { node_key: "prompt_1", outputs: { compiled: "Prompt text" } }

    %% LLM Node Streaming
    Engine->>SSE: event: node:start { node_key: "llm_1", model: "gemini-1.5-flash" }
    SSE-->>Web: Update Canvas: Node llm_1 pulse animation
    Engine->>Gemini: generateContentStream({ model: "gemini-1.5-flash", contents: [...] })
    
    loop Streaming Chunks
        Gemini-->>Engine: Chunk "Analyzing"
        Engine->>SSE: event: node:stream:chunk { node_key: "llm_1", chunk: "Analyzing" }
        SSE-->>Web: Stream token directly to Node Inspector
    end

    Gemini-->>Engine: Stream Complete + usageMetadata { promptTokens: 32, candidateTokens: 140 }
    Engine->>Engine: Calculate cost ($0.000044) & duration (412ms)
    Engine->>DB: INSERT INTO node_execution_runs (node_key: "llm_1", tokens: 172, cost: 0.000044)
    Engine->>SSE: event: node:complete { node_key: "llm_1", duration_ms: 412, tokens: 172 }
    SSE-->>Web: Update Canvas: Node llm_1 glows emerald, cost badge updated

    %% Output Node
    Engine->>SSE: event: node:start { node_key: "output_1" }
    Engine->>SSE: event: node:complete { node_key: "output_1", outputs: { result: "..." } }

    %% Execution Complete
    Engine->>DB: UPDATE executions SET status = "completed", duration_ms = 850, total_tokens = 172
    Engine->>SSE: event: execution:complete { status: "completed", duration_ms: 850, total_tokens: 172 }
    SSE-->>Web: Execution finished. Render Execution Trace Summary.
```

---

[← Previous: Monorepo Structure](./monorepo-structure.md) | [Next Section: Database →](../02-database/er-diagram.md)
