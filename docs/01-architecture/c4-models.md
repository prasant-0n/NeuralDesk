# 01. Architecture — C4 Architectural Models

[← Back to Documentation Portal](../README.md) | [← Overview](./overview.md) | [Next: Monorepo Structure →](./monorepo-structure.md)

---

## 2.1 C4 Level 1: System Context Diagram

The System Context diagram illustrates how NeuralDesk interacts with human users, external webhook sources, and cloud AI infrastructure:

```mermaid
flowchart TD
    User["Developer / AI Architect (Web Browser)"]
    WebhookSource["External System / SaaS (GitHub, Stripe, Custom Webhooks)"]
    
    subgraph NeuralDeskPlatform["NeuralDesk Intelligence Platform"]
        NeuralDeskSystem["NeuralDesk Platform (Monorepo: Web Canvas + API Engine)"]
    end
    
    NeonDB[("Neon Serverless PostgreSQL Database")]
    GeminiAPI["Google Gemini API (Gemini 1.5 Pro/Flash, Gemini 2.0)"]

    User -->|"Designs DAGs, inspects telemetry, triggers manual runs"| NeuralDeskSystem
    WebhookSource -->|"Delivers automated event payloads (HMAC-signed HTTP POST)"| NeuralDeskSystem
    NeuralDeskSystem -->|"Persists workflows, runs, and audit logs (Drizzle ORM / Neon Pool)"| NeonDB
    NeuralDeskSystem -->|"Executes LLM reasoning & structured extraction (@google/genai SDK)"| GeminiAPI
```

---

## 2.2 C4 Level 2: Container Diagram

The Container diagram delineates the high-level technical boundaries of the NeuralDesk system:

```mermaid
flowchart TD
    User["Developer / Operator (Browser Client)"]
    WebhookSender["External Webhook Emitter (Third-party Service)"]

    subgraph NeuralDeskSystem["NeuralDesk Monorepo Boundaries"]
        WebSPA["apps/web (Next.js / Vite SPA: @xyflow/react, Zustand, TanStack Query)"]
        APIGateway["apps/api (Node.js / Hono Engine: REST, SSE Dispatcher, Gemini SDK)"]
        SharedPkg["packages/shared (Zod Schemas, Core Types, DAG Kahn Topo-Sort)"]
        DBPkg["packages/db (Drizzle ORM, Migrations, Neon HTTP Connection Pool)"]
    end

    NeonServerless[("Neon PostgreSQL (Serverless DB Free Tier)")]
    GoogleGemini["Google Gemini Cloud API (Flash 1.5/2.0, Pro 1.5)"]

    User -->|"Navigates UI, manipulates nodes (HTTPS)"| WebSPA
    User -->|"Listens to live node execution stream (SSE)"| APIGateway
    WebSPA -->|"Dispatches CRUD & execution commands (REST / JSON)"| APIGateway
    WebhookSender -->|"Posts HMAC SHA-256 events"| APIGateway

    WebSPA -.->|"Imports shared schemas & types"| SharedPkg
    APIGateway -.->|"Imports shared schemas & types"| SharedPkg
    APIGateway -->|"Queries & writes records"| DBPkg
    DBPkg -->|"Executes SQL queries over HTTP pool"| NeonServerless
    APIGateway -->|"Issues AI generation requests (@google/genai)"| GoogleGemini
```

---

## 2.3 C4 Level 3: Component Diagram for `apps/api`

```mermaid
flowchart TD
    subgraph API_Application["apps/api (Backend Engine)"]
        HTTPRouter["API Router & Middleware (Hono / Express: Auth Guard, CORS, Rate Limiter, HMAC)"]
        ExecutionController["Execution Controller (Validates inputs, generates session, spawns runner)"]
        DAGOrchestrator["Graph Orchestrator (Kahn Topological Sorter, Cycle Guard, State Machine)"]
        GeminiRunner["Gemini SDK Provider (@google/genai: Streaming, JSON Schema, Token Meter)"]
        MockRunner["Deterministic Mock Provider (Seeded PRNG, Jitter Simulation, Zero-Cost Tokens)"]
        ExpressionEngine["AST Expression Engine (Safe Condition Evaluator, Mustache Compiler)"]
        SSEDispatcher["SSE Stream Dispatcher (text/event-stream Manager, Chunk Broadcaster)"]
        DBRepo["Data Repository Layer (packages/db: Drizzle ORM, Execution Logger)"]
    end

    HTTPRouter -->|"Routes execution request"| ExecutionController
    ExecutionController -->|"Dispatches DAG definition"| DAGOrchestrator
    DAGOrchestrator -->|"Parses conditions & compiles templates"| ExpressionEngine
    DAGOrchestrator -->|"Invokes real LLM"| GeminiRunner
    DAGOrchestrator -->|"Invokes mock simulation"| MockRunner
    DAGOrchestrator -->|"Emits node:start, chunk, complete"| SSEDispatcher
    DAGOrchestrator -->|"Persists state transitions & tokens"| DBRepo
```

---

## 2.4 C4 Level 3: Component Diagram for `apps/web`

```mermaid
flowchart TD
    subgraph Web_Application["apps/web (Frontend Architecture)"]
        CanvasEngine["Visual Canvas Engine (@xyflow/react / React Flow 12: Nodes, Edges, Wiring)"]
        ZustandStore["Zustand Workflow Store (useWorkflowStore: Immutable Graph, Undo/Redo)"]
        QueryLayer["TanStack Query Cache (Workflows, History, Optimistic Autosave)"]
        SSEListener["SSE Stream Consumer (useExecutionStream Hook: EventSource Connection)"]
        InspectorDrawer["Slide-Over Inspector Drawer (Node Configs, Port Inspector, Live Logs)"]
        TraceViewer["Live Trace & Telemetry Viewer (Latency Waterfall, Cost Breakdown)"]
    end

    CanvasEngine <-->|"Subscribes & dispatches state"| ZustandStore
    SSEListener -->|"Streams node chunks & statuses"| ZustandStore
    ZustandStore -->|"Triggers drawer updates"| InspectorDrawer
    ZustandStore -->|"Updates timeline & gauges"| TraceViewer
    QueryLayer <-->|"Syncs persistent DAG with backend"| ZustandStore
```

---

[← Previous: Overview](./overview.md) | [Next: Monorepo Structure →](./monorepo-structure.md)
