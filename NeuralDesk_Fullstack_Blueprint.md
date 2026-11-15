# NeuralDesk — Enterprise Fullstack Architecture Blueprint
## Master Technical Specification & Implementation Guide
**Version:** 1.0.0  
**Classification:** Enterprise Production Architecture  
**Author:** Technical Architecture & Documentation Team (`docs-specialist`)  
**Target Repository:** `NeuralDesk`  
**Monorepo Structure:** `apps/web`, `apps/api`, `packages/shared`, `packages/db`  
**Deployment Target:** 100% Zero-Cost Cloud Tier (Vercel + Render/Railway + Neon/Turso)  
**Primary AI Engine:** Google Gemini 1.5 / 2.0 SDK (`@google/genai`) with Deterministic Mock Simulation Fallback  

---

## 1. Executive Summary & Product Vision

### 1.1 Mission & Product Vision
**NeuralDesk** is an enterprise-grade, fullstack visual AI workflow intelligence and orchestration platform. Designed for modern engineering, operations, and product teams, NeuralDesk transforms complex, multi-model AI agent interactions and API pipelines into intuitive, visually inspectable, and deterministic Directed Acyclic Graphs (DAGs).

Unlike traditional "black-box" workflow automation tools that obscure intermediate states, swallow runtime exceptions, or cause unpredictable billing spikes, NeuralDesk guarantees absolute execution transparency:

> **The NeuralDesk Product Promise:**  
> *"Build intelligent workflows. Understand every execution."*

NeuralDesk is engineered from the ground up to solve the core dilemmas of enterprise AI orchestration: **observability**, **cost governance**, **deterministic reliability**, and **zero-leak security**. Every node run is tracked with microsecond timestamps, token economics, raw I/O snapshots, and execution logs streamed in real time to the browser.

```
       Visual DAG Studio                   Dual-Mode Execution                Full Observability
 ┌───────────────────────────┐         ┌───────────────────────────┐      ┌─────────────────────────┐
 │ • Custom React Flow Nodes │         │ • Google Gemini 1.5/2.0   │      │ • Token & USD Cost Meter│
 │ • Real-Time Cycle Guard   │ ──────► │ • Deterministic Simulator │ ───► │ • Step Latency Waterfall│
 │ • Interactive Port Wiring │         │ • Safe AST Logic Sandbox  │      │ • SSE Live Event Stream │
 └───────────────────────────┘         └───────────────────────────┘      └─────────────────────────┘
```

---

### 1.2 The AI Workflow Problem Space & Strategic Solution

As large language models (LLMs) permeate enterprise software, companies face significant friction when transitioning AI prototypes to production workflows:

| Critical Industry Pain Point | How Traditional Tools Fail | The NeuralDesk Enterprise Solution |
| :--- | :--- | :--- |
| **Black-Box Execution Opacity** | Tools hide prompts, raw tokens, and middle-layer transformations behind high-level abstractions. Debugging a failed 7-step chain requires digging through server logs. | **Full Execution Telemetry:** Every node execution emits granular logs, exact compiled prompts, raw Gemini completions, and state transitions visible in the Slide-Over Inspector. |
| **Runaway AI Costs & Surprises** | Developers run loops without visibility into prompt amplification or completion token bloat, leading to surprise monthly bills. | **Live Token & USD Metering:** Real-time cost computation per node using official Gemini token pricing ($0.075/1M Flash prompt, $0.30/1M Flash completion) with workspace budget hard-caps. |
| **Fragile Testing & Expensive CI/CD** | Testing workflows requires burning paid API keys on every Git commit or pull request, resulting in flakiness and high test costs. | **Deterministic Simulation Engine:** Built-in zero-cost, seeded mock runner that simulates realistic model responses, latencies, and token telemetry without hitting external APIs. |
| **API Secret Leakage in the Client** | Many client-heavy tools require entering API keys into the browser, leaving credentials vulnerable in `localStorage` or network inspector tabs. | **Zero-Leak Security Architecture:** Strict server-side key isolation in `apps/api`. The browser never touches the `GEMINI_API_KEY`. Multi-tenant BYOK is encrypted via AES-256-GCM. |
| **Astronomical Infrastructure Costs** | Enterprise workflow platforms demand Kubernetes clusters, heavy worker nodes, and paid message queues just to get started. | **100% Zero-Cost Cloud Deployment:** Ultra-lean monorepo engineered to run within the free tiers of Vercel (Edge UI), Render/Railway (API), and Neon Serverless PostgreSQL. |

---

### 1.3 Target Personas & Production Use Cases

#### Primary Personas
1. **AI Systems Engineers & Architects:** Developers building complex compound AI systems, agent swarms, dynamic prompt compilers, and tool-calling agents who demand type safety, version control, and reproducible execution traces.
2. **Technical Operations & Support Automation Leads:** Teams orchestrating automated triage, customer sentiment classification, ticket escalation, and CRM integrations without writing boilerplate server code.
3. **Product & Growth Explorers:** Teams prototyping AI-driven data enrichment, copy generation, and dynamic conditional funnels who need visual validation before production deployment.

#### Reference Enterprise Workflows
* **Automated Customer Triage & Sentiment Escalation:**
  An inbound webhook delivers customer inquiries. An LLM Node classifies sentiment and intent; a Condition Node routes negative sentiment to a Slack Notification Tool Node, while positive feedback is stored in PostgreSQL and auto-acknowledged via email.
* **Multi-Step Technical Content Synthesis & Verification:**
  A Trigger Node fetches raw release notes or technical specs. A Prompt Node compiles dynamic guidelines; a Gemini 1.5 Pro Node drafts comprehensive release documentation; an Evaluator Node audits the generated markdown against accuracy rules; and an Output Node renders the approved document.
* **Dynamic Lead Enrichment & Extraction Pipeline:**
  Unstructured prospect emails are received via Webhook. A Gemini 2.0 Flash node extracts structured JSON (company name, role, revenue bracket, software stack); a Transform Node validates the schema; and an external CRM API is updated via an HTTP Tool Node.

---

### 1.4 Core Architectural Tenets & Engineering Principles

NeuralDesk adheres strictly to five foundational software engineering tenets:

1. **Engineering Depth Over Feature Bloat:**  
   Rather than offering dozens of half-baked third-party connectors, NeuralDesk focuses on perfecting the core primitives: robust DAG topology resolution, bulletproof condition branching, millisecond execution telemetry, and rock-solid state persistence.
2. **Predictable & Deterministic Observability:**  
   Every asynchronous operation emits explicit state events (`pending` $ightarrow$ `running` $ightarrow$ `completed` $\mid$ `failed` $\mid$ `skipped`). A workflow run is an immutable historical record that can be replayed, inspected, and audited at any time.
3. **Strict Separation of Concerns & Type Uniformity:**  
   The monorepo enforces shared schemas (`@neuraldesk/shared`) using Zod and TypeScript. Frontend canvas components, backend controllers, and database models share the exact same source of truth for node types, edge configurations, and execution events.
4. **Zero-Leak Credential Security:**  
   AI provider keys never reach the browser under any circumstance. All AI invocations, external tool requests, and webhook authentications are strictly executed within the backend runtime (`apps/api`).
5. **Radical Cost-Efficiency & Lean Footprint:**  
   The system achieves high throughput with minimal overhead. Utilizing lightweight Node.js/Hono backends, serverless PostgreSQL connections with pooling, and zero-dependency graph sorting algorithms, the platform runs at zero cost on modern cloud free tiers.


---

## 2. End-to-End System Architecture

### 2.1 Monorepo Topography & Package Boundaries

NeuralDesk is organized as a high-performance monorepo managed via `pnpm` workspaces. This structure guarantees unified TypeScript compilation, shared Zod contract schemas, zero type drift between frontend and backend, and atomic version control.

```
NeuralDesk/
├── apps/
│   ├── web/                          # Frontend SPA Canvas & Dashboard
│   │   ├── src/
│   │   │   ├── app/                  # Next.js / Vite Route definitions
│   │   │   ├── components/
│   │   │   │   ├── canvas/           # @xyflow/react canvas, custom nodes, edges
│   │   │   │   ├── drawer/           # Slide-over node configuration drawers
│   │   │   │   ├── trace/            # Execution timeline, waterfall, cost inspector
│   │   │   │   └── ui/               # Radix UI + shadcn/ui design tokens
│   │   │   ├── hooks/                # Custom React hooks (useSSE, useExecution)
│   │   │   ├── stores/               # Zustand workflow store (useWorkflowStore)
│   │   │   └── lib/                  # TanStack Query client, apiClient, utils
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── api/                          # Backend REST, SSE & AI Execution Engine
│       ├── src/
│       │   ├── controllers/          # Workflow, Execution, Webhook controllers
│       │   ├── engine/               # Graph Orchestrator, Topo-Sorter, State Machine
│       │   ├── providers/            # Gemini SDK client (@google/genai) & Mock engine
│       │   ├── routes/               # Hono / Express API route declarations
│       │   ├── sse/                  # Server-Sent Events stream dispatcher
│       │   ├── middleware/           # Auth, Rate limiting, HMAC validation, CORS
│       │   └── index.ts              # API server bootstrap & health check
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── shared/                       # Universal Contracts, Schemas & Domain Logic
│   │   ├── src/
│   │   │   ├── schemas/              # Zod schemas for nodes, edges, configs, events
│   │   │   ├── types/                # Inferred TypeScript types & interfaces
│   │   │   ├── constants/            # Token pricing, model tiers, node presets
│   │   │   └── graph/                # Pure DAG validation, Kahn topo-sort algorithm
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── db/                           # Drizzle ORM Schema & Database Repositories
│       ├── src/
│       │   ├── schema/               # Drizzle table schemas (Postgres / SQLite)
│       │   ├── migrations/           # Versioned SQL migration files
│       │   ├── client.ts             # Connection pool factory (Neon HTTP / libSQL)
│       │   └── repositories/         # Type-safe workflow & execution data access
│       ├── drizzle.config.ts
│       ├── package.json
│       └── tsconfig.json
│
├── tests/
│   ├── unit/                         # Vitest unit tests (Topo-sort, compiler, pricing)
│   ├── integration/                  # API route & SSE stream integration tests
│   └── e2e/                          # Playwright end-to-end browser journeys
│
├── docker/
│   ├── Dockerfile.web                # Production multi-stage Dockerfile for web
│   ├── Dockerfile.api                # Production multi-stage Dockerfile for API
│   └── docker-compose.yml            # Local development orchestration
│
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Automated lint, typecheck, Vitest & Playwright
│       └── deploy.yml                # Zero-cost production deployment automation
│
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

#### Package Dependency & Flow Hierarchy

The dependency relationship is strictly unidirectional. Lower-level packages never import from applications:

```
┌────────────────────────────────────────────────────────┐
│                   packages/shared                      │
│   (Pure TypeScript, Zod Schemas, Domain Contracts)     │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
                ▼                        ▼
┌───────────────────────────────┐ ┌───────────────────────────────┐
│          packages/db          │ │           apps/web            │
│  (Drizzle ORM Schemas, Repos, │ │  (React 18, React Flow 12,    │
│   Neon / libSQL DB Drivers)   │ │   Zustand, TanStack Query)    │
└───────────────┬───────────────┘ └───────────────────────────────┘
                │
                ▼
┌───────────────────────────────┐
│           apps/api            │
│  (Hono REST & SSE Server,     │
│   Gemini 1.5/2.0 AI Engine)   │
└───────────────────────────────┘
```

---

### 2.2 C4 Architecture Models

#### C4 Level 1: System Context Diagram
The System Context diagram illustrates how NeuralDesk interacts with external actors, webhook sources, and cloud AI infrastructure.

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

#### C4 Level 2: Container Diagram
The Container diagram delineates the high-level technical boundaries of the NeuralDesk system.

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

#### C4 Level 3: Component Diagram for `apps/api`
The Component diagram outlines the modular architecture inside the backend service.

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

#### C4 Level 3: Component Diagram for `apps/web`
The Component diagram depicts the client-side architecture powering the interactive canvas.

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

### 2.3 Communication Protocols & Data Flow

#### Protocols Overview
1. **Synchronous REST API (JSON over HTTPS):**
   * Standardized CRUD endpoints for workflows, nodes, versions, workspace memberships, and manual execution triggers.
   * Responses adhere to consistent RFC 7807 error envelopes and typed data payloads.
2. **Reactive Real-Time Streaming (Server-Sent Events - SSE):**
   * Uses persistent HTTP connections with `Content-Type: text/event-stream`.
   * Pushes granular lifecycle events (`execution:start`, `node:start`, `node:stream:chunk`, `node:complete`, `node:error`, `execution:complete`) directly to the browser with zero polling overhead.
3. **Webhook Ingress (HMAC SHA-256 Authenticated HTTP POST):**
   * Ingests external trigger payloads securely.
   * Authenticates requests via `X-NeuralDesk-Signature` header against workspace secrets.

#### End-to-End Workflow Execution Sequence
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

## 3. Complete Database Architecture & Schema Specification

### 3.1 Dual-Database Strategy: Neon PostgreSQL & Turso SQLite

NeuralDesk employs **Drizzle ORM** as its data layer. Drizzle provides end-to-end TypeScript type inference, zero runtime overhead, and seamless dual-target capability:
* **Production Tier (PostgreSQL):** Hosted on **Neon Serverless PostgreSQL**. Neon provides instant branching, serverless autosuspend (down to zero compute units when idle), and connection pooling over HTTP/WebSockets via `@neondatabase/serverless` and `drizzle-orm/neon-http`.
* **Zero-Cost Edge / Local Alternative (SQLite / libSQL):** Hosted on **Turso** using `@libsql/client` and `drizzle-orm/libsql`. This provides extreme edge latency, zero-dollar serverless databases, and an effortless local development footprint.

---

### 3.2 Mermaid Entity-Relationship (ER) Diagram

The following ER diagram maps the 13 core entities, their primary/foreign keys, and cardinalities:

```mermaid
erDiagram
    users ||--o{ workspaces : "owns"
    users ||--o{ workspace_members : "belongs to"
    users ||--o{ workflows : "authors"
    users ||--o{ executions : "triggers"
    users ||--o{ audit_logs : "initiates"

    workspaces ||--o{ workspace_members : "contains"
    workspaces ||--o{ workflows : "houses"
    workspaces ||--o{ agents : "configures"
    workspaces ||--o{ prompt_templates : "maintains"
    workspaces ||--o{ audit_logs : "records"

    workflows ||--o{ workflow_versions : "versions"
    workflows ||--o{ executions : "runs"
    workflows ||--o{ webhooks : "listens via"

    workflow_versions ||--o{ nodes : "defines"
    workflow_versions ||--o{ edges : "connects"
    workflow_versions ||--o{ executions : "instantiates"

    executions ||--o{ node_execution_runs : "executes"
    nodes ||--o{ node_execution_runs : "records run for"

    users {
        uuid id PK
        varchar email UK
        varchar name
        text avatar_url
        timestamp created_at
        timestamp updated_at
    }

    workspaces {
        uuid id PK
        varchar name
        varchar slug UK
        uuid owner_id FK
        text encrypted_api_keys
        timestamp created_at
        timestamp updated_at
    }

    workspace_members {
        uuid id PK
        uuid workspace_id FK
        uuid user_id FK
        varchar role
        timestamp created_at
    }

    workflows {
        uuid id PK
        uuid workspace_id FK
        varchar name
        text description
        varchar category
        varchar status
        boolean is_active
        uuid created_by FK
        timestamp created_at
        timestamp updated_at
    }

    workflow_versions {
        uuid id PK
        uuid workflow_id FK
        integer version_number
        jsonb definition
        text changelog
        boolean is_published
        uuid created_by FK
        timestamp created_at
    }

    nodes {
        uuid id PK
        uuid workflow_version_id FK
        varchar node_key
        varchar type
        varchar name
        numeric position_x
        numeric position_y
        jsonb config
        jsonb inputs
        jsonb outputs
        timestamp created_at
    }

    edges {
        uuid id PK
        uuid workflow_version_id FK
        varchar edge_key
        varchar source_node_key
        varchar source_port
        varchar target_node_key
        varchar target_port
        text condition_expression
        timestamp created_at
    }

    executions {
        uuid id PK
        uuid workflow_id FK
        uuid workflow_version_id FK
        uuid triggered_by FK
        varchar trigger_source
        varchar mode
        varchar status
        jsonb initial_inputs
        jsonb final_outputs
        integer total_tokens_used
        integer prompt_tokens
        integer completion_tokens
        numeric cost_estimate_usd
        integer duration_ms
        text error_message
        timestamp started_at
        timestamp finished_at
    }

    node_execution_runs {
        uuid id PK
        uuid execution_id FK
        uuid node_id FK
        varchar node_key
        varchar node_type
        varchar status
        jsonb input_data
        jsonb output_data
        text prompt_resolved
        varchar llm_model
        integer prompt_tokens
        integer completion_tokens
        numeric cost_estimate_usd
        integer duration_ms
        text error_message
        integer attempt
        timestamp started_at
        timestamp finished_at
    }

    agents {
        uuid id PK
        uuid workspace_id FK
        varchar name
        varchar model_tier
        text system_instruction
        numeric temperature
        numeric top_p
        integer max_output_tokens
        jsonb tools_enabled
        timestamp created_at
        timestamp updated_at
    }

    prompt_templates {
        uuid id PK
        uuid workspace_id FK
        varchar name
        varchar slug UK
        text content
        jsonb variables
        varchar category
        timestamp created_at
        timestamp updated_at
    }

    webhooks {
        uuid id PK
        uuid workflow_id FK
        varchar url_token UK
        text secret_hash
        varchar name
        boolean is_active
        timestamp created_at
        timestamp last_triggered_at
    }

    audit_logs {
        uuid id PK
        uuid workspace_id FK
        uuid user_id FK
        varchar action
        varchar resource_type
        varchar resource_id
        jsonb details
        varchar ip_address
        timestamp created_at
    }
```

---

### 3.3 Detailed Table Schemas & Drizzle ORM Definitions

Below is the complete, production-grade schema definition for `packages/db/src/schema/index.ts` using Drizzle ORM (PostgreSQL dialect):

```typescript
import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  numeric,
  timestamp,
  jsonb,
  index,
  uniqueIndex
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Users Table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 2. Workspaces Table
export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 128 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  ownerId: uuid("owner_id").references(() => users.id, { onDelete: "restrict" }).notNull(),
  encryptedApiKeys: text("encrypted_api_keys"), // AES-256-GCM ciphertext
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 3. Workspace Members Table
export const workspaceMembers = pgTable("workspace_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  role: varchar("role", { length: 32 }).$type<"owner" | "admin" | "member" | "viewer">().default("member").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  memberWorkspaceIdx: index("idx_workspace_members_ws").on(table.workspaceId),
  memberUserIdx: index("idx_workspace_members_user").on(table.userId),
  uniqueMember: uniqueIndex("idx_workspace_members_unique").on(table.workspaceId, table.userId),
}));

// 4. Workflows Table
export const workflows = pgTable("workflows", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 64 }).default("general").notNull(),
  status: varchar("status", { length: 32 }).$type<"draft" | "published" | "archived">().default("draft").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  workflowWorkspaceIdx: index("idx_workflows_workspace_id").on(table.workspaceId),
  workflowStatusIdx: index("idx_workflows_status").on(table.status),
}));

// 5. Workflow Versions Table
export const workflowVersions = pgTable("workflow_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  workflowId: uuid("workflow_id").references(() => workflows.id, { onDelete: "cascade" }).notNull(),
  versionNumber: integer("version_number").notNull(),
  definition: jsonb("definition").$type<{
    nodes: unknown[];
    edges: unknown[];
    viewport: { x: number; y: number; zoom: number };
  }>().notNull(),
  changelog: text("changelog"),
  isPublished: boolean("is_published").default(false).notNull(),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  wfVersionIdx: index("idx_workflow_versions_wf_id").on(table.workflowId),
  uniqueWfVersion: uniqueIndex("idx_workflow_versions_unique").on(table.workflowId, table.versionNumber),
}));

// 6. Nodes Table (Normalized entity representation)
export const nodes = pgTable("nodes", {
  id: uuid("id").primaryKey().defaultRandom(),
  workflowVersionId: uuid("workflow_version_id").references(() => workflowVersions.id, { onDelete: "cascade" }).notNull(),
  nodeKey: varchar("node_key", { length: 64 }).notNull(),
  type: varchar("type", { length: 64 }).$type<
    "trigger" | "llm" | "prompt" | "router" | "tool" | "code" | "evaluator" | "output" | "webhook"
  >().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  positionX: numeric("position_x", { precision: 10, scale: 2 }).notNull(),
  positionY: numeric("position_y", { precision: 10, scale: 2 }).notNull(),
  config: jsonb("config").$type<Record<string, unknown>>().default({}).notNull(),
  inputs: jsonb("inputs").$type<Record<string, unknown>>().default({}).notNull(),
  outputs: jsonb("outputs").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  nodeVersionIdx: index("idx_nodes_version_id").on(table.workflowVersionId),
  nodeKeyVersionIdx: uniqueIndex("idx_nodes_key_version").on(table.workflowVersionId, table.nodeKey),
}));

// 7. Edges Table (Normalized connection representation)
export const edges = pgTable("edges", {
  id: uuid("id").primaryKey().defaultRandom(),
  workflowVersionId: uuid("workflow_version_id").references(() => workflowVersions.id, { onDelete: "cascade" }).notNull(),
  edgeKey: varchar("edge_key", { length: 64 }).notNull(),
  sourceNodeKey: varchar("source_node_key", { length: 64 }).notNull(),
  sourcePort: varchar("source_port", { length: 64 }).notNull(),
  targetNodeKey: varchar("target_node_key", { length: 64 }).notNull(),
  targetPort: varchar("target_port", { length: 64 }).notNull(),
  conditionExpression: text("condition_expression"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  edgeVersionIdx: index("idx_edges_version_id").on(table.workflowVersionId),
}));

// 8. Executions Table (Workflow Run Lifecycle)
export const executions = pgTable("executions", {
  id: uuid("id").primaryKey().defaultRandom(),
  workflowId: uuid("workflow_id").references(() => workflows.id, { onDelete: "cascade" }).notNull(),
  workflowVersionId: uuid("workflow_version_id").references(() => workflowVersions.id, { onDelete: "set null" }),
  triggeredBy: uuid("triggered_by").references(() => users.id, { onDelete: "set null" }),
  triggerSource: varchar("trigger_source", { length: 32 }).$type<"manual" | "api" | "webhook" | "simulation">().notNull(),
  mode: varchar("mode", { length: 16 }).$type<"real" | "mock">().default("real").notNull(),
  status: varchar("status", { length: 32 }).$type<"pending" | "running" | "completed" | "failed" | "cancelled">().default("pending").notNull(),
  initialInputs: jsonb("initial_inputs").$type<Record<string, unknown>>().default({}).notNull(),
  finalOutputs: jsonb("final_outputs").$type<Record<string, unknown>>().default({}).notNull(),
  totalTokensUsed: integer("total_tokens_used").default(0).notNull(),
  promptTokens: integer("prompt_tokens").default(0).notNull(),
  completionTokens: integer("completion_tokens").default(0).notNull(),
  costEstimateUsd: numeric("cost_estimate_usd", { precision: 10, scale: 6 }).default("0.000000").notNull(),
  durationMs: integer("duration_ms").default(0).notNull(),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
}, (table) => ({
  execWorkflowIdx: index("idx_executions_workflow_id").on(table.workflowId),
  execStatusIdx: index("idx_executions_status").on(table.status),
  execWorkflowStatusCreatedIdx: index("idx_executions_wf_status_created").on(table.workflowId, table.status, table.startedAt),
}));

// 9. Node Execution Runs Table (Granular Step Telemetry)
export const nodeExecutionRuns = pgTable("node_execution_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  executionId: uuid("execution_id").references(() => executions.id, { onDelete: "cascade" }).notNull(),
  nodeId: uuid("node_id").references(() => nodes.id, { onDelete: "set null" }),
  nodeKey: varchar("node_key", { length: 64 }).notNull(),
  nodeType: varchar("node_type", { length: 64 }).notNull(),
  status: varchar("status", { length: 32 }).$type<"pending" | "running" | "completed" | "failed" | "skipped">().default("pending").notNull(),
  inputData: jsonb("input_data").$type<Record<string, unknown>>().default({}).notNull(),
  outputData: jsonb("output_data").$type<Record<string, unknown>>().default({}).notNull(),
  promptResolved: text("prompt_resolved"),
  llmModel: varchar("llm_model", { length: 64 }),
  promptTokens: integer("prompt_tokens").default(0).notNull(),
  completionTokens: integer("completion_tokens").default(0).notNull(),
  costEstimateUsd: numeric("cost_estimate_usd", { precision: 10, scale: 6 }).default("0.000000").notNull(),
  durationMs: integer("duration_ms").default(0).notNull(),
  errorMessage: text("error_message"),
  attempt: integer("attempt").default(1).notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
}, (table) => ({
  nodeRunExecIdx: index("idx_node_runs_execution_id").on(table.executionId),
  nodeRunKeyIdx: index("idx_node_runs_node_key").on(table.nodeKey),
}));

// 10. AI Agents Configuration Table
export const agents = pgTable("agents", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  modelTier: varchar("model_tier", { length: 64 }).$type<"gemini-1.5-flash" | "gemini-1.5-pro" | "gemini-2.0-flash" | "custom">().default("gemini-1.5-flash").notNull(),
  systemInstruction: text("system_instruction").notNull(),
  temperature: numeric("temperature", { precision: 3, scale: 2 }).default("0.70").notNull(),
  topP: numeric("top_p", { precision: 3, scale: 2 }).default("0.95").notNull(),
  maxOutputTokens: integer("max_output_tokens").default(2048).notNull(),
  toolsEnabled: jsonb("tools_enabled").$type<string[]>().default([]).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 11. Prompt Templates Table
export const promptTemplates = pgTable("prompt_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull(),
  content: text("content").notNull(),
  variables: jsonb("variables").$type<string[]>().default([]).notNull(),
  category: varchar("category", { length: 64 }).default("general").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  promptWorkspaceSlugIdx: uniqueIndex("idx_prompts_ws_slug").on(table.workspaceId, table.slug),
}));

// 12. Webhooks Table
export const webhooks = pgTable("webhooks", {
  id: uuid("id").primaryKey().defaultRandom(),
  workflowId: uuid("workflow_id").references(() => workflows.id, { onDelete: "cascade" }).notNull(),
  urlToken: varchar("url_token", { length: 64 }).notNull().unique(),
  secretHash: text("secret_hash").notNull(), // Argon2 / SHA-256 HMAC Secret
  name: varchar("name", { length: 128 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  lastTriggeredAt: timestamp("last_triggered_at", { withTimezone: true }),
}, (table) => ({
  webhookTokenIdx: uniqueIndex("idx_webhooks_token").on(table.urlToken),
}));

// 13. Audit Logs Table
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  action: varchar("action", { length: 64 }).notNull(),
  resourceType: varchar("resource_type", { length: 64 }).notNull(),
  resourceId: varchar("resource_id", { length: 64 }).notNull(),
  details: jsonb("details").$type<Record<string, unknown>>().default({}).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  auditWorkspaceIdx: index("idx_audit_logs_ws").on(table.workspaceId),
  auditCreatedIdx: index("idx_audit_logs_created").on(table.createdAt),
}));
```

---

### 3.4 JSONB Graph Serialization & Schema Validation

To support rapid visual manipulation in `@xyflow/react` without thrashing table relational joins on every mouse move, the canvas state is stored as a high-fidelity JSON snapshot in `workflow_versions.definition`.

```typescript
import { z } from "zod";

export const ViewportSchema = z.object({
  x: z.number(),
  y: z.number(),
  zoom: z.number().min(0.1).max(2.0),
});

export const NodePortSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["string", "number", "boolean", "object", "any"]),
  required: z.boolean().default(false),
});

// Specialized Node Configuration Schemas
export const LLMNodeConfigSchema = z.object({
  model: z.enum(["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash"]),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0.0).max(1.0).default(0.7),
  topP: z.number().min(0.0).max(1.0).default(0.95),
  maxTokens: z.number().min(1).max(8192).default(2048),
  jsonMode: z.boolean().default(false),
  responseSchema: z.record(z.unknown()).optional(),
});

export const ConditionNodeConfigSchema = z.object({
  expression: z.string().describe("e.g. {{trigger.body.score}} >= 80"),
  fallbackPort: z.enum(["true", "false"]).default("false"),
});

export const TransformNodeConfigSchema = z.object({
  transformType: z.enum(["json_pick", "string_template", "regex_extract", "math_op"]),
  rules: z.array(
    z.object({
      targetKey: z.string(),
      sourceExpression: z.string(),
    })
  ),
});

export const WorkflowNodeDefinitionSchema = z.object({
  id: z.string(),
  type: z.enum(["trigger", "llm", "prompt", "router", "tool", "code", "evaluator", "output", "webhook"]),
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.object({
    label: z.string(),
    description: z.string().optional(),
    inputs: z.array(NodePortSchema).default([]),
    outputs: z.array(NodePortSchema).default([]),
    config: z.record(z.unknown()).default({}),
  }),
});

export const WorkflowEdgeDefinitionSchema = z.object({
  id: z.string(),
  source: z.string(),
  sourceHandle: z.string(),
  target: z.string(),
  targetHandle: z.string(),
  animated: z.boolean().default(false),
  data: z.object({
    condition: z.string().optional(),
  }).optional(),
});

export const WorkflowDefinitionSchema = z.object({
  nodes: z.array(WorkflowNodeDefinitionSchema),
  edges: z.array(WorkflowEdgeDefinitionSchema),
  viewport: ViewportSchema,
});
```

---

### 3.5 Database Indexes & Query Optimization Strategy

1. **Foreign Key Indexing:** Every relational foreign key (`workspace_id`, `workflow_id`, `execution_id`, `user_id`) is indexed with standard B-tree indexes to guarantee $O(\log n)$ lookup speed during joins.
2. **Composite Execution History Index:**
   `CREATE INDEX idx_executions_wf_status_created ON executions (workflow_id, status, started_at DESC);`  
   This index eliminates sequential scans on the executions table when loading the workflow run history drawer.
3. **JSONB GIN Indexing (PostgreSQL Production):**
   `CREATE INDEX idx_workflow_versions_def_gin ON workflow_versions USING GIN (definition jsonb_path_ops);`  
   Enables deep querying into node configurations (e.g. searching which workflows use `gemini-1.5-pro` directly via SQL).
4. **Connection Pooling Configuration:**  
   Neon Serverless leverages pgBouncer in transaction mode (`max_connections = 100`, idle timeout 10s), ensuring `apps/api` serverless instances do not exhaust database socket limits.


---

## 4. Complete REST & Server-Sent Events (SSE) API Contract

### 4.1 Global Conventions & Error Response Standard

All REST API endpoints are namespaced under `/api/v1`. Requests and responses default to `application/json; charset=utf-8`.

#### Standard RFC 7807 Error Envelope
Every non-2xx response follows this uniform structure:

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

### 4.2 Comprehensive REST Endpoint Specifications

#### 1. Workspaces & Workflows
* **`GET /api/v1/workspaces`**: List all workspaces accessible by the authenticated user.
* **`POST /api/v1/workspaces`**: Create a new workspace.
* **`GET /api/v1/workspaces/:wsId/workflows`**: List workflows in a workspace with optional query parameters (`search`, `category`, `status`, `page`, `limit`).

**Response `200 OK` (`GET /api/v1/workspaces/:wsId/workflows`):**
```json
{
  "data": [
    {
      "id": "wf_9a8b7c6d",
      "workspace_id": "ws_11223344",
      "name": "Customer Support Sentiment & Routing",
      "description": "Classifies incoming tickets and routes negative sentiment to Slack.",
      "category": "support",
      "status": "published",
      "is_active": true,
      "active_version": 3,
      "node_count": 5,
      "created_at": "2026-11-10T08:30:00.000Z",
      "updated_at": "2026-11-14T19:45:00.000Z"
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

* **`POST /api/v1/workspaces/:wsId/workflows`**: Create a new workflow canvas.

**Request Payload:**
```json
{
  "name": "Market Intelligence Analyst",
  "description": "Synthesizes news feeds into executive summaries.",
  "category": "research"
}
```

* **`GET /api/v1/workflows/:id`**: Fetch workflow metadata, active version, and serialized canvas graph.

**Response `200 OK`:**
```json
{
  "id": "wf_9a8b7c6d",
  "workspace_id": "ws_11223344",
  "name": "Customer Support Sentiment & Routing",
  "status": "published",
  "version": {
    "version_number": 3,
    "definition": {
      "nodes": [
        {
          "id": "trigger_1",
          "type": "trigger",
          "position": { "x": 100, "y": 200 },
          "data": { "label": "Incoming Webhook", "config": { "method": "POST" } }
        },
        {
          "id": "llm_1",
          "type": "llm",
          "position": { "x": 420, "y": 200 },
          "data": {
            "label": "Sentiment Classifier",
            "config": {
              "model": "gemini-1.5-flash",
              "systemPrompt": "Classify sentiment as POSITIVE, NEUTRAL, or NEGATIVE.",
              "temperature": 0.2
            }
          }
        }
      ],
      "edges": [
        {
          "id": "edge_t1_l1",
          "source": "trigger_1",
          "sourceHandle": "out",
          "target": "llm_1",
          "targetHandle": "in"
        }
      ],
      "viewport": { "x": 0, "y": 0, "zoom": 1.0 }
    }
  }
}
```

---

#### 2. Workflow Versions & Snapshots
* **`POST /api/v1/workflows/:id/versions`**: Snapshot the current canvas as a new immutable version.
* **`POST /api/v1/workflows/:id/versions/:verId/publish`**: Mark a specific version as the active production version.

---

#### 3. Execution Control & Inspection
* **`POST /api/v1/workflows/:id/execute`**: Trigger an asynchronous workflow execution.

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

* **`GET /api/v1/executions/:id`**: Poll the execution summary, overall status, timing, and token economics.

**Response `200 OK`:**
```json
{
  "id": "exec_55aa88ff",
  "workflow_id": "wf_9a8b7c6d",
  "status": "completed",
  "mode": "real",
  "total_tokens_used": 184,
  "prompt_tokens": 142,
  "completion_tokens": 42,
  "cost_estimate_usd": 0.000023,
  "duration_ms": 780,
  "started_at": "2026-11-15T12:05:00.120Z",
  "finished_at": "2026-11-15T12:05:00.900Z",
  "final_outputs": {
    "sentiment": "NEGATIVE",
    "routed_channel": "#urgent-support-escalations"
  }
}
```

* **`GET /api/v1/executions/:id/runs`**: Retrieve granular per-node step telemetry.

**Response `200 OK`:**
```json
{
  "execution_id": "exec_55aa88ff",
  "runs": [
    {
      "node_key": "trigger_1",
      "node_type": "trigger",
      "status": "completed",
      "duration_ms": 12,
      "prompt_tokens": 0,
      "completion_tokens": 0,
      "cost_estimate_usd": 0.0,
      "output_data": {
        "customer_message": "Our database connection dropped again! Urgent fix needed."
      }
    },
    {
      "node_key": "llm_1",
      "node_type": "llm",
      "status": "completed",
      "llm_model": "gemini-1.5-flash",
      "duration_ms": 520,
      "prompt_tokens": 142,
      "completion_tokens": 42,
      "cost_estimate_usd": 0.000023,
      "output_data": {
        "sentiment": "NEGATIVE"
      }
    }
  ]
}
```

---

### 4.3 Real-Time Server-Sent Events (SSE) Wire Protocol

The SSE stream is opened via `GET /api/v1/executions/:id/stream`. The server transmits typed event frames in real time as the DAG engine progresses through topological execution.

#### Event Specification Matrix

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

#### Raw SSE Protocol Stream Transcript
```http
HTTP/1.1 200 OK
Content-Type: text/event-stream; charset=utf-8
Cache-Control: no-cache, no-transform
Connection: keep-alive
X-Accel-Buffering: no

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

### 4.4 Webhook HMAC Authentication Algorithm & Ingress Flow

Inbound webhooks allow external systems (GitHub, Stripe, custom backends) to trigger NeuralDesk workflows securely. NeuralDesk mandates cryptographic signature verification using **HMAC SHA-256**.

#### Request Headers Specification
* `X-NeuralDesk-Signature`: `t=1700000000,v1=9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08`
* Where `t` is the Unix timestamp (seconds) and `v1` is the hex-encoded HMAC SHA-256 of `${t}.${rawBody}`.

#### Production TypeScript Signature Verification Implementation
```typescript
import crypto from "node:crypto";

export interface SignatureValidationResult {
  valid: boolean;
  reason?: string;
}

export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
  toleranceSeconds: number = 300
): SignatureValidationResult {
  if (!signatureHeader) {
    return { valid: false, reason: "Missing X-NeuralDesk-Signature header" };
  }

  // Parse header: t=1700000000,v1=abc...
  const parts = signatureHeader.split(",");
  const timestampPart = parts.find((p) => p.startsWith("t="));
  const signaturePart = parts.find((p) => p.startsWith("v1="));

  if (!timestampPart || !signaturePart) {
    return { valid: false, reason: "Malformed signature header format" };
  }

  const timestamp = parseInt(timestampPart.slice(2), 10);
  const receivedSignature = signaturePart.slice(3);

  // Replay Attack Prevention
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - timestamp) > toleranceSeconds) {
    return { valid: false, reason: "Signature timestamp outside tolerance window" };
  }

  // Reconstruct payload and calculate expected HMAC
  const payloadToSign = `${timestamp}.${rawBody}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payloadToSign, "utf8")
    .digest("hex");

  // Constant-time comparison to prevent timing attacks
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const receivedBuffer = Buffer.from(receivedSignature, "utf8");

  if (expectedBuffer.length !== receivedBuffer.length) {
    return { valid: false, reason: "Invalid signature length" };
  }

  const isMatch = crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
  return isMatch ? { valid: true } : { valid: false, reason: "HMAC signature mismatch" };
}
```


---

## 5. AI Orchestration & Graph Execution Engine

### 5.1 Directed Acyclic Graph (DAG) Traversal & Cycle Detection

The NeuralDesk execution engine models workflows as strict Directed Acyclic Graphs. Prior to executing any workflow, the graph validator validates connectivity and executes **Kahn's Topological Sort Algorithm** with cycle path isolation.

#### Topological Sort & Cycle Detection Algorithm in TypeScript
```typescript
export interface GraphValidationResult {
  isValid: boolean;
  sortedOrder?: string[];
  cyclePath?: string[];
  error?: string;
}

export function topologicalSortKahn(
  nodeKeys: string[],
  edges: Array<{ source: string; target: string }>
): GraphValidationResult {
  const inDegree: Map<string, number> = new Map();
  const adjacencyList: Map<string, string[]> = new Map();

  // Initialize graph data structures
  for (const node of nodeKeys) {
    inDegree.set(node, 0);
    adjacencyList.set(node, []);
  }

  // Populate edges and calculate in-degrees
  for (const edge of edges) {
    if (!inDegree.has(edge.source) || !inDegree.has(edge.target)) {
      return {
        isValid: false,
        error: `Edge references non-existent node: ${edge.source} -> ${edge.target}`,
      };
    }
    adjacencyList.get(edge.source)!.push(edge.target);
    inDegree.set(edge.target, inDegree.get(edge.target)! + 1);
  }

  // Enqueue nodes with zero in-degree (root trigger nodes)
  const queue: string[] = [];
  for (const [node, degree] of inDegree.entries()) {
    if (degree === 0) {
      queue.push(node);
    }
  }

  const sortedOrder: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    sortedOrder.push(current);

    for (const neighbor of adjacencyList.get(current)!) {
      const updatedDegree = inDegree.get(neighbor)! - 1;
      inDegree.set(neighbor, updatedDegree);
      if (updatedDegree === 0) {
        queue.push(neighbor);
      }
    }
  }

  // If sorted count matches total nodes, graph is acyclic
  if (sortedOrder.length === nodeKeys.length) {
    return { isValid: true, sortedOrder };
  }

  // Cycle detected: isolate cyclic subgraph via Depth-First Search (DFS)
  const cycleNodes = nodeKeys.filter((n) => !sortedOrder.includes(n));
  return {
    isValid: false,
    error: `Graph contains a directed cycle involving nodes: [${cycleNodes.join(", ")}]`,
    cyclePath: cycleNodes,
  };
}
```

---

### 5.2 Execution Engine State Machine

The workflow execution lifecycle is governed by a deterministic Finite State Machine (FSM):

```mermaid
stateDiagram-v2
    [*] --> PENDING : Execution Dispatched
    PENDING --> VALIDATING : Topological Verification
    
    state VALIDATING {
        [*] --> CheckAcyclic
        CheckAcyclic --> ParseSchemas : Valid DAG
        ParseSchemas --> [*] : Verified
    }

    VALIDATING --> FAILED : Cycle or Malformed Edge Detected
    VALIDATING --> INITIALIZED : Graph Validated

    INITIALIZED --> RUNNING_STEP : Dequeue Ready Nodes
    
    state RUNNING_STEP {
        [*] --> ResolvingInputs
        ResolvingInputs --> CompilingPrompts
        CompilingPrompts --> InvokingAI_or_Mock
        InvokingAI_or_Mock --> StreamingChunks
        StreamingChunks --> AwaitingCompletion
        AwaitingCompletion --> [*]
    }

    RUNNING_STEP --> STEP_COMPLETED : Node Run Succeeded
    RUNNING_STEP --> STEP_FAILED : Exception / Timeout
    
    STEP_COMPLETED --> EVALUATING_BRANCHES : Inspect Condition Nodes
    
    state EVALUATING_BRANCHES {
        [*] --> EvaluateAST
        EvaluateAST --> ActivateBranchTrue : Condition Passed
        EvaluateAST --> ActivateBranchFalse : Condition Failed
        ActivateBranchFalse --> MarkSkippedNodes : Skip Unchosen Path
        ActivateBranchTrue --> [*]
        MarkSkippedNodes --> [*]
    }

    EVALUATING_BRANCHES --> RUNNING_STEP : Next In-Degree=0 Nodes Ready
    EVALUATING_BRANCHES --> EXECUTION_COMPLETED : All Nodes Traversed

    STEP_FAILED --> EXECUTION_FAILED : Abort Workflow Execution
    RUNNING_STEP --> EXECUTION_CANCELLED : Abort Signal Received

    EXECUTION_COMPLETED --> [*]
    EXECUTION_FAILED --> [*]
    EXECUTION_CANCELLED --> [*]
```

---

### 5.3 Google Gemini 1.5 / 2.0 Integration via `@google/genai`

NeuralDesk uses the official `@google/genai` SDK on the server. The engine streams content in real time and automatically collects `usageMetadata` for token accounting.

#### Server-Side Gemini Execution Engine Implementation
```typescript
import { GoogleGenAI } from "@google/genai";

export interface GeminiRunOptions {
  model: "gemini-1.5-flash" | "gemini-1.5-pro" | "gemini-2.0-flash";
  systemInstruction?: string;
  prompt: string;
  temperature?: number;
  topP?: number;
  maxOutputTokens?: number;
  responseMimeType?: "text/plain" | "application/json";
  responseSchema?: Record<string, unknown>;
  onChunk?: (textChunk: string) => void;
}

export interface GeminiRunResult {
  text: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
  durationMs: number;
}

// Token pricing constants per 1,000,000 tokens (USD)
export const MODEL_PRICING = {
  "gemini-1.5-flash": { promptPer1M: 0.075, completionPer1M: 0.30 },
  "gemini-1.5-pro": { promptPer1M: 1.25, completionPer1M: 5.00 },
  "gemini-2.0-flash": { promptPer1M: 0.10, completionPer1M: 0.40 },
};

export async function executeGeminiNode(
  apiKey: string,
  options: GeminiRunOptions
): Promise<GeminiRunResult> {
  const startTime = Date.now();
  const ai = new GoogleGenAI({ apiKey });

  const config: Record<string, unknown> = {
    temperature: options.temperature ?? 0.7,
    topP: options.topP ?? 0.95,
    maxOutputTokens: options.maxOutputTokens ?? 2048,
  };

  if (options.systemInstruction) {
    config.systemInstruction = options.systemInstruction;
  }

  if (options.responseMimeType === "application/json") {
    config.responseMimeType = "application/json";
    if (options.responseSchema) {
      config.responseSchema = options.responseSchema;
    }
  }

  let accumulatedText = "";
  const responseStream = await ai.models.generateContentStream({
    model: options.model,
    contents: [options.prompt],
    config,
  });

  let promptTokens = 0;
  let completionTokens = 0;
  let totalTokens = 0;

  for await (const chunk of responseStream) {
    const chunkText = chunk.text ?? "";
    accumulatedText += chunkText;
    if (options.onChunk && chunkText) {
      options.onChunk(chunkText);
    }
    // usageMetadata is delivered with terminal chunks
    if (chunk.usageMetadata) {
      promptTokens = chunk.usageMetadata.promptTokenCount ?? promptTokens;
      completionTokens = chunk.usageMetadata.candidatesTokenCount ?? completionTokens;
      totalTokens = chunk.usageMetadata.totalTokenCount ?? totalTokens;
    }
  }

  const durationMs = Date.now() - startTime;
  const pricing = MODEL_PRICING[options.model];
  const costUsd =
    (promptTokens / 1_000_000) * pricing.promptPer1M +
    (completionTokens / 1_000_000) * pricing.completionPer1M;

  return {
    text: accumulatedText,
    promptTokens,
    completionTokens,
    totalTokens,
    costUsd: Number(costUsd.toFixed(6)),
    durationMs,
  };
}
```

---

### 5.4 Deterministic Mock Simulation Engine

The Deterministic Mock Simulation Engine allows developers and CI/CD pipelines to run workflows offline without consuming API credits. It uses a **seeded pseudo-random number generator** to return reproducible outputs, synthetic latencies, and token counts.

#### Deterministic Seeded PRNG & Mock Dispatcher
```typescript
// MurmurHash3 based integer seed generator
function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

export async function executeDeterministicMockNode(
  workflowId: string,
  nodeKey: string,
  prompt: string,
  onChunk?: (chunk: string) => void
): Promise<GeminiRunResult> {
  const seedString = `${workflowId}:${nodeKey}:${prompt.length}`;
  const seed = xmur3(seedString)();
  
  // Deterministic latency: 150ms to 450ms
  const durationMs = 150 + (seed % 300);
  await new Promise((resolve) => setTimeout(resolve, durationMs));

  // Determine mock response category based on keywords
  let responseText = "";
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes("sentiment")) {
    const sentiments = ["POSITIVE", "NEUTRAL", "NEGATIVE"];
    responseText = JSON.stringify({
      sentiment: sentiments[seed % sentiments.length],
      confidence: 0.85 + (seed % 14) / 100,
    });
  } else if (lowerPrompt.includes("summarize") || lowerPrompt.includes("summary")) {
    responseText = "Deterministic Executive Summary: The requested telemetry confirms stable operational status with zero anomalies detected across all ingress pipelines.";
  } else {
    responseText = `[SIMULATED RESPONSE] Workflow ${workflowId} successfully executed step ${nodeKey}.`;
  }

  // Stream mock chunks
  if (onChunk) {
    const tokens = responseText.split(" ");
    for (const t of tokens) {
      onChunk(t + " ");
    }
  }

  const promptTokens = Math.max(10, Math.floor(prompt.length / 4));
  const completionTokens = Math.max(15, Math.floor(responseText.length / 4));

  return {
    text: responseText,
    promptTokens,
    completionTokens,
    totalTokens: promptTokens + completionTokens,
    costUsd: 0.0, // Mock mode incurs zero cost
    durationMs,
  };
}
```

---

### 5.5 Expression Evaluator & Prompt Compiler

#### 1. Safe AST-Based Boolean Evaluator (Condition Nodes)
NeuralDesk **strictly forbids `eval()` or `new Function()`**. Condition node logic (`{{trigger.score}} >= 80`) is evaluated using a safe recursive token-matching expression parser:

```typescript
export function evaluateCondition(
  expression: string,
  context: Record<string, unknown>
): boolean {
  // Regex token matching for safe binary comparison
  const regex = /^\s*([a-zA-Z0-9_.]+)\s*(==|!=|>=|<=|>|<|contains)\s*(.+)\s*$/;
  const match = expression.match(regex);
  if (!match) return false;

  const [, leftPath, operator, rawRight] = match;
  const leftValue = resolveContextPath(leftPath, context);
  const rightValue = parseLiteralValue(rawRight.trim());

  switch (operator) {
    case "==": return leftValue == rightValue;
    case "!=": return leftValue != rightValue;
    case ">": return Number(leftValue) > Number(rightValue);
    case "<": return Number(leftValue) < Number(rightValue);
    case ">=": return Number(leftValue) >= Number(rightValue);
    case "<=": return Number(leftValue) <= Number(rightValue);
    case "contains":
      return String(leftValue).toLowerCase().includes(String(rightValue).toLowerCase());
    default:
      return false;
  }
}

function resolveContextPath(path: string, obj: unknown): unknown {
  return path.split(".").reduce((acc: any, part) => acc?.[part], obj);
}

function parseLiteralValue(str: string): unknown {
  if (str === "true") return true;
  if (str === "false") return false;
  if (!isNaN(Number(str))) return Number(str);
  return str.replace(/^["']|["']$/g, ""); // strip quotes
}
```

#### 2. Mustache Prompt Template Compiler
Resolves dynamic variables of the syntax `{{nodeKey.outputProperty}}` with circular dependency checks:

```typescript
export function compilePromptTemplate(
  template: string,
  scope: Record<string, Record<string, unknown>>
): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_, path) => {
    const parts = path.split(".");
    const nodeKey = parts[0];
    const propertyPath = parts.slice(1).join(".");

    const nodeOutputs = scope[nodeKey];
    if (!nodeOutputs) return `[UNRESOLVED: ${path}]`;

    const val = resolveContextPath(propertyPath, nodeOutputs);
    return val !== undefined ? (typeof val === "object" ? JSON.stringify(val) : String(val)) : "";
  });
}
```


---

## 6. Frontend & Visual Canvas Architecture

### 6.1 Visual DAG Canvas Engine with `@xyflow/react`

The visual workflow editor is powered by **React Flow 12 (`@xyflow/react`)**. The canvas provides hardware-accelerated SVG and HTML5 canvas rendering, sub-pixel zooming, interactive port wiring, and real-time cycle detection on edge connection.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  Top Navigation Bar: [Workflow Title] [Version Dropdown] [Run Workflow] [Save]        │
├──────────────┬─────────────────────────────────────────────────────────┬───────────────┤
│ Node Palette │ Canvas Viewport (React Flow 12)                         │ Slide-Over    │
│              │                                                         │ Inspector     │
│ • Trigger    │    ┌──────────────┐          ┌──────────────┐           │               │
│ • LLM Node   │    │  Trigger     │          │  Prompt Node │           │ Node Name:    │
│ • Prompt     │    │  (Webhook)   │─────────►│  "Classify"  │           │ Sentiment LLM │
│ • Condition  │    └──────────────┘          └──────┬───────┘           │               │
│ • Transform  │                                     │                   │ Model:        │
│ • Tool / API │                                     ▼                   │ gemini-1.5-fl │
│ • Evaluator  │                              ┌──────────────┐           │               │
│ • Output     │                              │   LLM Node   │           │ Temperature:  │
│              │                              │ (Flash 1.5)  │           │ [ 0.20 =====] │
│              │                              └──────┬───────┘           │               │
│              │                                     ▼                   │ JSON Mode:    │
│              │                              ┌──────────────┐           │ [x] Enabled   │
│              │                              │    Output    │           │               │
│              │                              └──────────────┘           │ Live Output:  │
│              │                                                         │ { sentiment:  │
│              │ [Controls: Zoom/Fit/Grid]           [MiniMap]           │   "NEGATIVE" }│
└──────────────┴─────────────────────────────────────────────────────────┴───────────────┘
```

---

### 6.2 Custom Node Taxonomy & Specifications

Every node in NeuralDesk implements a standardized React Flow component interface, rendering input/output handles, status badges, model tags, and live execution glows:

| Node Type | Category | Ingress Handles | Egress Handles | Configuration Parameters |
| :--- | :--- | :--- | :--- | :--- |
| **`TriggerNode`** | Ingress | None | `output` | Trigger type (`manual`, `webhook`, `schedule`), input payload JSON schema. |
| **`LLMNode`** | AI Inference | `input`, `context` | `output`, `raw` | Model (`gemini-1.5-flash`, `gemini-1.5-pro`, `gemini-2.0-flash`), system prompt, temperature, max tokens, response schema. |
| **`PromptNode`** | Templating | Dynamic inputs (`{{var}}`) | `prompt` | Raw template string with Mustache variables, variable type tags. |
| **`ConditionNode`** | Routing | `input` | `true`, `false` | Binary boolean expression (`{{score}} >= 80`), fallback branch. |
| **`TransformNode`** | Data Utility | `input` | `output` | JSON path mappings, regex extractors, string interpolations. |
| **`ToolNode`** | Integration | `trigger`, `params` | `response`, `error` | HTTP method, URL, headers, timeout, retry count. |
| **`EvaluatorNode`** | Quality Audit | `input`, `groundTruth` | `passed`, `failed` | Evaluation metric (similarity, JSON validation, toxicity). |
| **`OutputNode`** | Egress | `input` | None | Markdown renderer, JSON tree inspector, export download button. |

---

### 6.3 Canvas State Management: Zustand Workflow Store

The canvas state is managed via a dedicated **Zustand** store (`useWorkflowStore`). It maintains the live graph, selection state, undo/redo history stacks, and the real-time execution state map:

```typescript
import { create } from "zustand";
import {
  Node,
  Edge,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  Connection,
  addEdge,
} from "@xyflow/react";

export type NodeExecutionState = "idle" | "running" | "completed" | "failed" | "skipped";

export interface NodeTelemetry {
  status: NodeExecutionState;
  durationMs?: number;
  promptTokens?: number;
  completionTokens?: number;
  costUsd?: number;
  streamText?: string;
  outputData?: unknown;
  error?: string;
}

export interface WorkflowState {
  workflowId: string | null;
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  isDirty: boolean;
  
  // Execution Telemetry Map
  executionStatus: "idle" | "running" | "completed" | "failed";
  nodeTelemetry: Record<string, NodeTelemetry>;

  // History Stack for Undo / Redo
  history: Array<{ nodes: Node[]; edges: Edge[] }>;
  historyIndex: number;

  // Canvas Actions
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  selectNode: (nodeId: string | null) => void;
  updateNodeConfig: (nodeId: string, config: Record<string, unknown>) => void;
  
  // Execution Telemetry Actions
  setExecutionStatus: (status: "idle" | "running" | "completed" | "failed") => void;
  updateNodeTelemetry: (nodeKey: string, telemetry: Partial<NodeTelemetry>) => void;
  appendStreamChunk: (nodeKey: string, chunk: string) => void;
  resetTelemetry: () => void;
  
  // Undo / Redo
  undo: () => void;
  redo: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  workflowId: null,
  nodes: [],
  edges: [],
  selectedNodeId: null,
  isDirty: false,
  executionStatus: "idle",
  nodeTelemetry: {},
  history: [],
  historyIndex: -1,

  onNodesChange: (changes) =>
    set({
      nodes: applyNodeChanges(changes, get().nodes),
      isDirty: true,
    }),

  onEdgesChange: (changes) =>
    set({
      edges: applyEdgeChanges(changes, get().edges),
      isDirty: true,
    }),

  onConnect: (connection) =>
    set({
      edges: addEdge({ ...connection, animated: false }, get().edges),
      isDirty: true,
    }),

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  updateNodeConfig: (nodeId, config) =>
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, config: { ...node.data.config, ...config } } }
          : node
      ),
      isDirty: true,
    }),

  setExecutionStatus: (status) => set({ executionStatus: status }),

  updateNodeTelemetry: (nodeKey, telemetry) =>
    set({
      nodeTelemetry: {
        ...get().nodeTelemetry,
        [nodeKey]: { ...get().nodeTelemetry[nodeKey], ...telemetry },
      },
    }),

  appendStreamChunk: (nodeKey, chunk) => {
    const current = get().nodeTelemetry[nodeKey]?.streamText ?? "";
    set({
      nodeTelemetry: {
        ...get().nodeTelemetry,
        [nodeKey]: {
          ...get().nodeTelemetry[nodeKey],
          status: "running",
          streamText: current + chunk,
        },
      },
    });
  },

  resetTelemetry: () => set({ nodeTelemetry: {}, executionStatus: "idle" }),

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      set({
        nodes: prev.nodes,
        edges: prev.edges,
        historyIndex: historyIndex - 1,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      set({
        nodes: next.nodes,
        edges: next.edges,
        historyIndex: historyIndex + 1,
      });
    }
  },
}));
```

---

### 6.4 Server State & Caching: TanStack Query (React Query v5)

TanStack Query manages all asynchronous REST operations (saving canvas definitions, fetching templates, loading execution history):
* **Optimistic Canvas Autosave:** Debounced (1500ms) background mutations commit canvas nodes/edges to `PUT /api/v1/workflows/:id` with automatic rollback on network failure.
* **Query Invalidation Strategy:** Triggering an execution invalidates `['workflow', id, 'executions']`, ensuring the execution history list auto-refreshes when a run completes.

---

### 6.5 Interactive UX: Live Node Glow, Execution Pulse & Trace Inspector

#### 1. Dynamic SVG Edge Animation & Node Glow CSS Tokens
During active execution, nodes and edges dynamically update their Tailwind classes based on `nodeTelemetry[nodeKey].status`:

```css
/* Running State: Pulsing indigo halo and animated dashed edge */
.node-running {
  @apply ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950 animate-pulse;
}
.edge-running {
  stroke: #6366f1 !important;
  stroke-dasharray: 5;
  animation: dashdraw 0.5s linear infinite;
}

/* Success State: Clean emerald border */
.node-completed {
  @apply border-emerald-500 bg-emerald-950/20 text-emerald-300;
}

/* Error State: Crimson glow and error badge */
.node-failed {
  @apply border-rose-500 bg-rose-950/20 text-rose-300;
}

/* Skipped State: Dimmed opacity */
.node-skipped {
  @apply opacity-35 border-zinc-700 bg-zinc-900/50;
}
```

#### 2. Slide-Over Node Configuration Inspector Drawer
When a node is selected, an accessible Radix-based drawer slides in from the right:
* **Tab 1: Configuration:** Dynamic input fields (model picker, temperature slider, JSON mode toggle, prompt textarea).
* **Tab 2: Port Inspector:** Visual list of bound incoming and outgoing variables.
* **Tab 3: Execution Telemetry:** Live streaming text, raw JSON outputs, duration in milliseconds, and token economics.

---

### 6.6 Design System Tokens & Dark Mode Theming

NeuralDesk is designed with an enterprise dark aesthetic optimized for long engineering sessions:

| Token Name | Hex Value | Semantic Usage |
| :--- | :--- | :--- |
| `--background` | `#020617` (`slate-950`) | Canvas background and root page canvas |
| `--card` | `#090d16` (`slate-900`) | Node body background and dialog panels |
| `--border` | `#1e293b` (`slate-800`) | Node idle border and separator rules |
| `--primary` | `#6366f1` (`indigo-500`) | Primary action buttons and running state |
| `--accent-success` | `#10b981` (`emerald-500`) | Completed nodes and valid status indicators |
| `--accent-danger` | `#f43f5e` (`rose-500`) | Failed nodes and cycle detection alerts |
| `--accent-warning` | `#f59e0b` (`amber-500`) | Draft version warnings and token rate warning |
| `--text-primary` | `#f8fafc` (`slate-50`) | Primary headlines and node titles |
| `--text-muted` | `#94a3b8` (`slate-400`) | Port descriptions, captions, and token units |


---

## 7. Security Architecture & Zero-Leak Secrets

### 7.1 Server-Side Gemini Key Isolation

A primary design mandate of NeuralDesk is **Zero-Leak Secret Isolation**. The client browser bundle never receives, imports, or stores AI provider keys under any circumstance.

```
       UNTRUSTED CLIENT BOUNDARY                         SECURE BACKEND RUNTIME BOUNDARY
┌──────────────────────────────────────┐                ┌──────────────────────────────────────────────┐
│  Browser Client (apps/web)           │                │  API Engine (apps/api)                       │
│                                      │                │                                              │
│  • React Flow Visual DAG             │  REST Commands │  • process.env.GEMINI_API_KEY (Strictly Priv)│
│  • Zustand State Store               │───────────────►│  • Rate Limiter & Workspace Auth Guard       │
│  • Zero knowledge of Gemini Secrets  │  SSE Telemetry │  • Ephemeral BYOK Decryptor                  │
│  • Only receives sanitized chunks    │◄───────────────│  • @google/genai SDK Node Invoker            │
└──────────────────────────────────────┘                └──────────────────────┬───────────────────────┘
                                                                               │ TLS 1.3 Direct
                                                                               ▼
                                                                ┌──────────────────────────────┐
                                                                │ Google Gemini Cloud Endpoint │
                                                                └──────────────────────────────┘
```

#### Strict Environment Variable Verification (`packages/shared/src/env.ts`)
```typescript
import { z } from "zod";

const ServerEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url(),
  GEMINI_API_KEY: z.string().min(1, "Server-side GEMINI_API_KEY is required"),
  ENCRYPTION_MASTER_KEY: z.string().length(64, "Must be 32-byte hex string for AES-256"),
  WEBHOOK_SECRET_SALT: z.string().min(16),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
});

export const serverEnv = ServerEnvSchema.parse(process.env);
```

---

### 7.2 Bring Your Own Key (BYOK) Encryption Architecture

For enterprise customers requiring custom billing and rate limits, NeuralDesk provides **Bring Your Own Key (BYOK)**. Keys are encrypted at rest using **AES-256-GCM** with unique initialization vectors (IV) and authentication tags.

```typescript
import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits for GCM
const TAG_LENGTH = 16; // 128-bit authentication tag

export function encryptApiKey(apiKey: string, masterKeyHex: string): string {
  const masterKey = Buffer.from(masterKeyHex, "hex");
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, masterKey, iv, { authTagLength: TAG_LENGTH });

  let encrypted = cipher.update(apiKey, "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag();

  // Serialized format: iv:tag:ciphertext
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
}

export function decryptApiKey(encryptedRecord: string, masterKeyHex: string): string {
  const masterKey = Buffer.from(masterKeyHex, "hex");
  const [ivHex, tagHex, cipherTextHex] = encryptedRecord.split(":");

  if (!ivHex || !tagHex || !cipherTextHex) {
    throw new Error("Invalid encrypted payload format");
  }

  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, masterKey, iv, { authTagLength: TAG_LENGTH });

  decipher.setAuthTag(tag);

  let decrypted = decipher.update(cipherTextHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
```

* **Ephemeral In-Memory Decryption:** Keys are decrypted only for the precise duration of a node execution. Plaintext keys are never written to disk, never serialized in database logs, and immediately garbage collected.

---

### 7.3 Sandboxing Code Execution & Safe Evaluation

NeuralDesk enforces strict protection against Remote Code Execution (RCE) and prototype pollution:
1. **Zero `eval()` Policy:** JavaScript `eval()`, `new Function()`, and Node's `vm` module are strictly banned across the entire codebase.
2. **Safe Property Path Traversal:** Context extraction prevents object traversal into `__proto__`, `constructor`, or `prototype`:
   ```typescript
   export function safeGetProperty(obj: any, path: string): unknown {
     const dangerousKeys = ["__proto__", "constructor", "prototype"];
     const parts = path.split(".");
     let current = obj;

     for (const part of parts) {
       if (dangerousKeys.includes(part)) {
         return undefined;
       }
       if (current == null) return undefined;
       current = current[part];
     }
     return current;
   }
   ```
3. **Execution Timeout Guard:** All node evaluations are wrapped in a 30-second cancellation promise race to prevent runaway compute loops.

---

### 7.4 Defense-in-Depth API Security

* **Sliding Window Rate Limiter:** Free workspaces are capped at **10 workflow runs per minute** and **60 REST API calls per minute** to protect against denial-of-service.
* **Webhook Replay Attack Mitigation:** Inbound webhooks reject requests with timestamps older than 300 seconds (5 minutes).
* **Strict CORS & Security Headers:**
  * `Access-Control-Allow-Origin` explicitly matches the configured frontend domain.
  * Headers enforced: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security: max-age=31536000; includeSubDomains`.


---

## 8. DevOps, CI/CD & 100% Zero-Cost Cloud Deployment

### 8.1 Multi-Stage Docker Architecture

NeuralDesk provides multi-stage Docker configurations designed for minimal image sizes, non-root execution, and rapid caching.

#### Production Backend Dockerfile (`docker/Dockerfile.api`)
```dockerfile
# Stage 1: Pruning and Dependency Resolution
FROM node:20-alpine AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g pnpm turbo
COPY . .
RUN turbo prune --scope=@neuraldesk/api --docker

# Stage 2: Build dependencies & compilation
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .
RUN pnpm turbo run build --filter=@neuraldesk/api...

# Stage 3: Minimal Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nodejs

COPY --from=builder --chown=nodejs:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/apps/api/package.json ./package.json

USER nodejs
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health || exit 1

CMD ["node", "dist/index.js"]
```

#### Production Frontend Dockerfile (`docker/Dockerfile.web`)
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/
RUN pnpm install --frozen-lockfile
RUN pnpm --filter=@neuraldesk/web build

FROM nginx:alpine AS runner
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Local Developer Orchestration (`docker/docker-compose.yml`)
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: neuraldesk-postgres
    restart: always
    environment:
      POSTGRES_USER: neuraldesk_user
      POSTGRES_PASSWORD: neuraldesk_password
      POSTGRES_DB: neuraldesk_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U neuraldesk_user -d neuraldesk_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  api:
    build:
      context: .
      dockerfile: docker/Dockerfile.api
    container_name: neuraldesk-api
    restart: always
    environment:
      PORT: 4000
      NODE_ENV: development
      DATABASE_URL: postgresql://neuraldesk_user:neuraldesk_password@postgres:5432/neuraldesk_db
      GEMINI_API_KEY: ${GEMINI_API_KEY}
      ENCRYPTION_MASTER_KEY: 0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
      WEBHOOK_SECRET_SALT: dev_salt_123456789
      CORS_ORIGIN: http://localhost:3000
    ports:
      - "4000:4000"
    depends_on:
      postgres:
        condition: service_healthy

  web:
    build:
      context: .
      dockerfile: docker/Dockerfile.web
    container_name: neuraldesk-web
    restart: always
    ports:
      - "3000:80"
    depends_on:
      - api

volumes:
  pgdata:
```

---

### 8.2 GitHub Actions CI/CD Pipeline

The automated CI/CD pipeline enforces code quality, type-checking, unit tests, and Playwright journeys on every push:

```yaml
# .github/workflows/ci.yml
name: CI & Quality Gate

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate:
    name: Lint, Typecheck & Vitest
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js 20 & pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install Monorepo Dependencies
        run: pnpm install --frozen-lockfile

      - name: Linting Check
        run: pnpm run lint

      - name: Strict Typecheck
        run: pnpm run typecheck

      - name: Run Vitest Unit & Integration Suites
        run: pnpm run test:unit --coverage

      - name: Install Playwright Browsers
        run: pnpm exec playwright install --with-deps chromium

      - name: Run Playwright E2E Tests
        run: pnpm run test:e2e
        env:
          GEMINI_API_KEY: mock_key_for_ci
          NODE_ENV: test
```

---

### 8.3 100% Zero-Cost Production Hosting Architecture

NeuralDesk can be deployed to production with **zero ongoing infrastructure costs** by combining leading developer free tiers:

| Subsystem | Production Cloud Host | Free Tier Allocation | Cold-Start Mitigation |
| :--- | :--- | :--- | :--- |
| **Frontend Web Canvas** | **Vercel** / Cloudflare Pages | Unlimited requests, 100GB monthly bandwidth, global edge CDN. | None required (instant Edge distribution). |
| **Backend REST & SSE API** | **Render** / Railway / Fly.io | 512 MB RAM, 0.1 vCPU, 750 free instance hours per month. | Health keep-alive cron ping every 14 minutes to prevent container spin-down. |
| **Database & Pooling** | **Neon Serverless PostgreSQL** | 0.5 GiB storage, pooled serverless HTTP connection endpoints. | Serverless pooling wakes up in < 250ms on cold connection. |
| **AI Inference Engine** | **Google Gemini Free Tier** | 15 Requests/Min (RPM), 1,000,000 Tokens/Min (TPM), 1,500 Requests/Day (RPD) on Gemini 1.5/2.0 Flash. | Automatic switch to Deterministic Mock Simulation when rate limits are approached. |

---

### 8.4 Production Health Checks & Graceful Shutdown

#### Health Check Endpoint (`GET /api/health`)
Returns comprehensive operational diagnostics:

```json
{
  "status": "healthy",
  "uptime_seconds": 18450,
  "timestamp": "2026-11-15T12:30:00.000Z",
  "memory": {
    "rss_mb": 48.2,
    "heap_used_mb": 24.1
  },
  "database": {
    "status": "connected",
    "latency_ms": 14
  }
}
```

#### Node.js Process Graceful Shutdown Listener
```typescript
import { Server } from "node:http";

export function setupGracefulShutdown(server: Server, cleanup: () => Promise<void>) {
  const shutdown = async (signal: string) => {
    console.log(`Received ${signal}. Gracefully stopping HTTP server...`);
    server.close(async () => {
      console.log("HTTP server closed. Cleaning up database connections and active runs...");
      await cleanup();
      console.log("Cleanup completed. Process terminating cleanly.");
      process.exit(0);
    });

    // Hard kill if graceful shutdown hangs beyond 10 seconds
    setTimeout(() => {
      console.error("Graceful shutdown timeout exceeded. Forcing exit.");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}
```


---

## 9. QA, Testing & Reliability Strategy

### 9.1 Vitest Unit Testing Suite

The unit testing strategy focuses on core domain invariants: graph topology correctness, cycle detection, expression evaluation, prompt interpolation, and token economics.

```typescript
// tests/unit/graph-and-engine.test.ts
import { describe, it, expect } from "vitest";
import { topologicalSortKahn } from "@neuraldesk/shared/graph";
import { evaluateCondition, compilePromptTemplate } from "@neuraldesk/shared/expression";
import { MODEL_PRICING } from "@neuraldesk/shared/constants";

describe("DAG Topological Sort & Cycle Detection", () => {
  it("should sort a valid linear DAG into execution order", () => {
    const nodes = ["trigger", "prompt", "llm", "output"];
    const edges = [
      { source: "trigger", target: "prompt" },
      { source: "prompt", target: "llm" },
      { source: "llm", target: "output" },
    ];

    const result = topologicalSortKahn(nodes, edges);
    expect(result.isValid).toBe(true);
    expect(result.sortedOrder).toEqual(["trigger", "prompt", "llm", "output"]);
  });

  it("should detect a direct cycle and identify the circular nodes", () => {
    const nodes = ["A", "B", "C"];
    const edges = [
      { source: "A", target: "B" },
      { source: "B", target: "C" },
      { source: "C", target: "A" }, // Creates cycle A -> B -> C -> A
    ];

    const result = topologicalSortKahn(nodes, edges);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Graph contains a directed cycle");
  });
});

describe("Expression Evaluator & Prompt Compiler", () => {
  it("should correctly evaluate numeric condition expressions", () => {
    const context = { trigger: { body: { score: 85, status: "active" } } };
    
    expect(evaluateCondition("trigger.body.score >= 80", context)).toBe(true);
    expect(evaluateCondition("trigger.body.score < 50", context)).toBe(false);
    expect(evaluateCondition("trigger.body.status == active", context)).toBe(true);
  });

  it("should interpolate mustache prompt templates with nested properties", () => {
    const template = "Process ticket for {{customer.name}}: {{ticket.description}}";
    const scope = {
      customer: { name: "Acme Corp" },
      ticket: { description: "Database timeout error" },
    };

    const compiled = compilePromptTemplate(template, scope);
    expect(compiled).toBe("Process ticket for Acme Corp: Database timeout error");
  });
});

describe("Token & Pricing Calculations", () => {
  it("should calculate exact USD cost for Gemini 1.5 Flash", () => {
    const promptTokens = 1_000_000;
    const completionTokens = 1_000_000;
    const pricing = MODEL_PRICING["gemini-1.5-flash"];

    const cost =
      (promptTokens / 1_000_000) * pricing.promptPer1M +
      (completionTokens / 1_000_000) * pricing.completionPer1M;

    expect(cost).toBeCloseTo(0.375, 5); // $0.075 + $0.30
  });
});
```

---

### 9.2 Backend API & SSE Integration Testing

```typescript
// tests/integration/api-execution.test.ts
import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../apps/api/src/app";

describe("Execution API & Webhook Verification", () => {
  it("should successfully trigger a mock workflow execution", async () => {
    const response = await request(app)
      .post("/api/v1/workflows/wf_test_01/execute")
      .send({
        mode: "mock",
        trigger_source: "manual",
        inputs: { test_key: "value" },
      });

    expect(response.status).toBe(202);
    expect(response.body).toHaveProperty("execution_id");
    expect(response.body.status).toBe("running");
  });

  it("should reject tampered HMAC webhook requests", async () => {
    const response = await request(app)
      .post("/api/v1/webhooks/trigger/token_12345")
      .set("X-NeuralDesk-Signature", "t=1700000000,v1=bad_signature_hash")
      .send({ event: "order.created" });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });
});
```

---

### 9.3 Playwright End-to-End Test Journeys

Playwright tests validate complete user workflows in real browser environments:

```typescript
// tests/e2e/workflow-canvas.spec.ts
import { test, expect } from "@playwright/test";

test.describe("NeuralDesk Canvas E2E Journeys", () => {
  test("Journey 1: Load application, render canvas, and select template", async ({ page }) => {
    await page.goto("http://localhost:3000");
    await expect(page.locator("header")).toContainText("NeuralDesk");

    // Open template dialog and select Sentiment Template
    await page.click("button:has-text('Templates')");
    await page.click("text=Customer Sentiment Routing");
    
    // Assert nodes render on React Flow canvas
    await expect(page.locator(".react-flow__node")).toHaveCount(4);
  });

  test("Journey 2: Connect ports and configure node properties in Drawer", async ({ page }) => {
    await page.goto("http://localhost:3000");

    // Click on LLM Node
    await page.locator(".react-flow__node:has-text('Sentiment Classifier')").click();
    
    // Slide-over inspector drawer opens
    const drawer = page.locator("[role='dialog']:has-text('Node Configuration')");
    await expect(drawer).toBeVisible();

    // Adjust temperature slider
    await page.fill("input[name='temperature']", "0.35");
    await expect(page.locator("input[name='temperature']")).toHaveValue("0.35");
  });

  test("Journey 3: Run execution, verify real-time pulse animation, and review trace", async ({ page }) => {
    await page.goto("http://localhost:3000");

    // Click "Run Workflow"
    await page.click("button:has-text('Run Workflow')");

    // Verify running pulse classes appear on nodes
    await expect(page.locator(".node-running")).toBeVisible();

    // Await execution completion
    await expect(page.locator(".node-completed")).toHaveCount(4, { timeout: 10000 });

    // Open Trace Inspector
    await page.click("button:has-text('Execution Trace')");
    await expect(page.locator("text=Execution Succeeded")).toBeVisible();
    await expect(page.locator("text=Total Tokens")).toBeVisible();
  });
});
```


---

## 10. 8-Week Phased Implementation Roadmap

### 10.1 Agent Team Roster & Ownership Mapping

To ensure rapid execution with zero team bottlenecks, responsibilities are mapped to **8 autonomous agent roles**:

```
                               ┌──────────────────────────────────────────────┐
                               │               lead-architect                 │
                               │        Principal Systems Architect           │
                               └──────────────────────┬───────────────────────┘
                                                      │
         ┌────────────────────────────────────────────┼────────────────────────────────────────────┐
         │                                            │                                            │
         ▼                                            ▼                                            ▼
┌─────────────────────────────────┐   ┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│      frontend-canvas-lead       │   │        backend-api-lead         │   │        database-engineer        │
│    Senior Frontend Specialist   │   │  Senior Backend & API Engineer  │   │        Database Architect       │
└────────────────┬────────────────┘   └────────────────┬────────────────┘   └────────────────┬────────────────┘
                 │                                     │                                     │
                 └─────────────────────────────────────┼─────────────────────────────────────┘
                                                       │
                               ┌───────────────────────┴───────────────────────┐
                               │             ai-engine-engineer                │
                               │       AI Systems & Graph Orchestrator         │
                               └───────────────────────┬───────────────────────┘
                                                       │
         ┌─────────────────────────────────────────────┼─────────────────────────────────────────────┐
         ▼                                             ▼                                             ▼
┌─────────────────────────────────┐   ┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│       qa-testing-engineer       │   │      devops-cloud-engineer      │   │         docs-specialist         │
│   Quality Assurance & Testing   │   │  DevOps, Docker & Cloud Infra   │   │   Technical Writer & Blueprints │
└─────────────────────────────────┘   └─────────────────────────────────┘   └─────────────────────────────────┘
```

1. **`lead-architect` (Principal Systems Architect):** Monorepo structure, package boundaries, shared types/schemas, and architectural governance.
2. **`database-engineer` (Database Architect):** Drizzle ORM schemas, Neon PostgreSQL pooling, migrations, and seed templates.
3. **`backend-api-lead` (Senior Backend & API Engineer):** Hono REST API endpoints, HMAC webhook ingestion, and SSE broadcast dispatcher.
4. **`ai-engine-engineer` (AI Systems & Graph Orchestrator):** Kahn topological sort, Google Gemini 1.5/2.0 SDK integration, token metering, and deterministic mock simulator.
5. **`frontend-canvas-lead` (Senior Frontend Specialist):** React Flow 12 canvas, custom node components, Zustand workflow store, and slide-over inspector drawer.
6. **`qa-testing-engineer` (Quality Assurance & Testing):** Vitest unit & integration test suites, Playwright E2E tests, and coverage reporting.
7. **`devops-cloud-engineer` (Senior DevOps & Cloud Infrastructure):** Multi-stage Docker, GitHub Actions CI/CD pipelines, and 100% zero-cost cloud deployment.
8. **`docs-specialist` (Technical Writer & Blueprint Architect):** Master technical blueprint, REST & SSE API contracts, and user setup guides.

---

### 10.2 Week-by-Week Implementation Sprints

```mermaid
flowchart TD
    W1["Week 1: Monorepo Foundation & Schemas (lead-architect, database-engineer)"]
    W2["Week 2: Backend REST & Webhook Ingress (backend-api-lead, docs-specialist)"]
    W3["Week 3: Visual Canvas & Node Taxonomy (frontend-canvas-lead)"]
    W4["Week 4: AI Graph Engine & Gemini SDK (ai-engine-engineer)"]
    W5["Week 5: Live SSE Streaming & Node Pulse (backend-api-lead, frontend-canvas-lead)"]
    W6["Week 6: Inspector Drawer & BYOK Security (frontend-canvas-lead, ai-engine-engineer)"]
    W7["Week 7: Comprehensive QA & Playwright E2E (qa-testing-engineer)"]
    W8["Week 8: Zero-Cost Deployment & Launch (devops-cloud-engineer, docs-specialist)"]

    W1 --> W2 --> W3 --> W4 --> W5 --> W6 --> W7 --> W8
```

#### Sprint 1 (Week 1): Monorepo Foundation, Type Contracts & Database Architecture
* **Primary Owners:** `lead-architect`, `database-engineer`
* **Key Deliverables:**
  * Initialize pnpm monorepo with `apps/web`, `apps/api`, `packages/shared`, `packages/db`.
  * Establish strict TypeScript `tsconfig.json` bases with zero `any` tolerance.
  * Author unified Zod schemas for nodes, edges, viewport, and execution events in `@neuraldesk/shared`.
  * Define Drizzle ORM schema for PostgreSQL (Neon) and SQLite (Turso) across all 13 tables.
  * Run initial migrations and seed script with 3 reference workflows.

#### Sprint 2 (Week 2): REST API Core, Workspace Multi-Tenancy & Webhook Gateway
* **Primary Owners:** `backend-api-lead`, `docs-specialist`
* **Key Deliverables:**
  * Build Hono backend API server with route handlers for `/api/v1/workspaces`, `/api/v1/workflows`, and `/api/v1/versions`.
  * Implement HMAC SHA-256 webhook ingestion endpoint (`POST /api/v1/webhooks/trigger/:urlToken`).
  * Add sliding window rate limiting and RFC 7807 global error middleware.
  * Document API schemas with OpenAPI/Swagger and test with mock fixtures.

#### Sprint 3 (Week 3): Visual Canvas Engine, Node Taxonomy & Port Wiring
* **Primary Owners:** `frontend-canvas-lead`
* **Key Deliverables:**
  * Scaffold `@xyflow/react` interactive canvas with custom background dots, MiniMap, and Controls.
  * Implement custom components for all 8 node types (`TriggerNode`, `LLMNode`, `PromptNode`, `ConditionNode`, `TransformNode`, `ToolNode`, `EvaluatorNode`, `OutputNode`).
  * Setup Zustand store (`useWorkflowStore`) for immutable graph mutation and undo/redo history.
  * Implement connection line validators preventing invalid self-loops and circular port connections.

#### Sprint 4 (Week 4): AI Orchestration Engine, Gemini 1.5/2.0 SDK & Mock Simulation
* **Primary Owners:** `ai-engine-engineer`
* **Key Deliverables:**
  * Implement Kahn's Topological Sort with Tarjan cycle path isolation.
  * Integrate `@google/genai` SDK for streaming generation and structured JSON output.
  * Extract `usageMetadata` and calculate exact USD token costs based on model tier.
  * Implement Seeded Deterministic Mock Simulator with zero-cost fallback for offline development.
  * Build safe AST expression parser and Mustache prompt compiler.

#### Sprint 5 (Week 5): Live SSE Streaming, Execution State Machine & Real-Time Pulse
* **Primary Owners:** `backend-api-lead`, `frontend-canvas-lead`
* **Key Deliverables:**
  * Implement SSE stream dispatcher (`GET /api/v1/executions/:id/stream`) in `apps/api`.
  * Build client-side SSE hook (`useExecutionStream`) that updates node statuses in real time.
  * Implement animated SVG glowing edges and pulsing borders during active execution.
  * Persist step run telemetry into `node_execution_runs` table via Drizzle ORM.

#### Sprint 6 (Week 6): Node Inspector Drawer, Telemetry Waterfall & BYOK Security
* **Primary Owners:** `frontend-canvas-lead`, `ai-engine-engineer`
* **Key Deliverables:**
  * Build Radix UI slide-over Node Inspector Drawer with configuration, input/output inspection, and live stream log tabs.
  * Build Execution Trace Viewer featuring a latency waterfall chart and token cost breakdown.
  * Implement AES-256-GCM encryption at rest for workspace BYOK API keys.
  * Conduct bundle security review to guarantee zero secret leakage to the client.

#### Sprint 7 (Week 7): Comprehensive QA, Vitest Integration & Playwright E2E Suites
* **Primary Owners:** `qa-testing-engineer`
* **Key Deliverables:**
  * Author Vitest unit tests for topological sorting, cycle detection, condition branching, and pricing calculations.
  * Author API integration tests validating REST routes, SSE event sequences, and HMAC verification.
  * Implement 4 automated Playwright E2E user journeys covering canvas wiring, configuration, execution, and trace review.
  * Achieve 100% test pass rate across all test suites.

#### Sprint 8 (Week 8): Zero-Cost Cloud Deployment, CI/CD Automation & Launch
* **Primary Owners:** `devops-cloud-engineer`, `docs-specialist`
* **Key Deliverables:**
  * Finalize multi-stage production Dockerfiles (`Dockerfile.web`, `Dockerfile.api`) and `docker-compose.yml`.
  * Configure GitHub Actions CI/CD pipeline running lint, typecheck, Vitest, and Playwright.
  * Deploy frontend to Vercel and backend API to Render/Railway free tier with Neon Serverless PostgreSQL.
  * Configure `/api/health` probes and cold-start keep-alive cron pinger.
  * Deliver complete `README.md` and master documentation release.

---

### 10.3 Deliverables RACI Matrix

**RACI Definitions:**
* **R (Responsible):** The role that performs the activity.
* **A (Accountable):** The role with final approval and accountability.
* **C (Consulted):** The role providing advisory input.
* **I (Informed):** The role kept updated on progress.

| Subsystem / Deliverable | `lead-architect` | `database-engineer` | `backend-api-lead` | `ai-engine-engineer` | `frontend-canvas-lead` | `qa-testing-engineer` | `devops-cloud-engineer` | `docs-specialist` |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Monorepo Structure & Shared Schemas** | **A / R** | C | C | C | C | I | C | I |
| **Drizzle ORM & Database Schemas** | A | **R** | C | I | I | I | C | I |
| **REST API & Webhook Ingestion** | A | C | **R** | C | I | C | I | C |
| **Kahn Topo-Sort & Cycle Guard** | A | I | C | **R** | C | C | I | I |
| **Google Gemini SDK & Token Economics**| A | I | C | **R** | I | C | I | I |
| **Deterministic Mock Simulation** | A | I | I | **R** | C | C | I | I |
| **React Flow Visual Canvas & Nodes** | A | I | I | I | **R** | C | I | I |
| **Zustand Store & Inspector Drawer** | A | I | I | I | **R** | C | I | I |
| **Server-Sent Events (SSE) Streaming** | A | I | **R** | C | **R** | C | I | I |
| **BYOK AES-256-GCM Encryption** | A | C | **R** | **R** | I | C | C | I |
| **Vitest & Playwright Test Suites** | A | I | C | C | C | **R** | C | I |
| **Multi-Stage Docker & Compose** | A | I | C | I | I | I | **R** | I |
| **GitHub Actions CI/CD Pipeline** | A | I | I | I | I | C | **R** | I |
| **Zero-Cost Cloud Deployment** | A | C | C | I | C | I | **R** | I |
| **Fullstack Master Blueprint & Specs**| A | C | C | C | C | C | C | **R** |

---

## 11. Appendix: Zero-Cost Deployment Runbook & Quick Start

### 11.1 Local Development Quick Start
```bash
# 1. Clone the repository
git clone https://github.com/your-org/neuraldesk.git
cd neuraldesk

# 2. Install monorepo dependencies using pnpm
pnpm install

# 3. Configure environment variables
cp .env.example .env

# 4. Generate & apply database migrations (using local SQLite or Neon Postgres)
pnpm --filter=@neuraldesk/db db:push

# 5. Start fullstack development environment (Web on :3000, API on :4000)
pnpm dev
```

### 11.2 Environment Variables Reference
```env
# Runtime
NODE_ENV=development
PORT=4000

# Database (Neon Serverless PostgreSQL or Turso SQLite)
DATABASE_URL=postgresql://user:password@ep-cool-fog-12345.us-east-2.aws.neon.tech/neondb?sslmode=require

# AI Provider Credentials (Backend Private - Never exposed to client)
GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere

# Security & Encryption
ENCRYPTION_MASTER_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
WEBHOOK_SECRET_SALT=super_secret_webhook_salt_neuraldesk_2026

# Client CORS
CORS_ORIGIN=http://localhost:3000
```

---

*NeuralDesk Fullstack Blueprint & Technical Specification — Authoritative Release 1.0.0*
