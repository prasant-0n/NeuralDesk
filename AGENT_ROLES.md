# NeuralDesk — Agent Roles & Responsibility Matrix

**Project:** NeuralDesk (Fullstack AI Workflow Intelligence Platform)  
**Architecture:** Monorepo (`apps/web`, `apps/api`, `packages/shared`, `packages/db`)  
**AI Integration:** Google Gemini 1.5/2.0 + Deterministic Simulation Engine  
**Status:** Agent Roster Formally Defined  

---

## 1. Overview of the Agent Team

To build NeuralDesk with enterprise-grade quality, the workload is distributed across **8 specialized autonomous agent roles**. Each role owns a specific layer of the system architecture, with explicit input/output contracts, deliverables, and acceptance criteria.

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

---

## 2. Detailed Agent Specifications

### 1. `lead-architect` (Principal Systems Architect)
* **Subagent Name:** `lead-architect`
* **Focus Area:** Monorepo architecture, type sharing, security boundaries, and technical standards.
* **Core Responsibilities:**
  * Configure the monorepo workspace structure (`apps/web`, `apps/api`, `packages/shared`, `packages/db`).
  * Author shared TypeScript types, domain interfaces, and Zod validation schemas in `@neuraldesk/shared`.
  * Enforce zero-leak security boundaries: ensure secrets (like Google Gemini API keys) are strictly contained in backend environment variables and never exposed to the client bundle.
  * Audit code quality, dependency alignment, and ensure build scripts run cleanly.
* **Deliverables:**
  * Root `package.json`, `pnpm-workspace.yaml`, and `tsconfig.base.json`.
  * `packages/shared/` containing workflow schemas, node validation schemas, execution enums, and API DTOs.
  * Architecture Decision Records (ADRs).

---

### 2. `database-engineer` (Database Architect)
* **Subagent Name:** `database-engineer`
* **Focus Area:** Relational data modeling, Drizzle ORM, database migrations, and queries.
* **Core Responsibilities:**
  * Design and implement relational schemas in `packages/db` using **Drizzle ORM**.
  * Model all core entities:
    * `users` (id, email, name, role, created_at)
    * `workflows` (id, name, description, status, version, created_at, updated_at)
    * `workflow_versions` (id, workflow_id, version, graph_json, created_at)
    * `executions` (id, workflow_id, status, trigger_payload, started_at, completed_at, duration_ms)
    * `node_execution_runs` (id, execution_id, node_id, status, input_payload, output_payload, error, duration_ms, tokens_used)
    * `agents` & `prompt_templates` (id, name, system_prompt, model_config, version)
  * Write migration scripts and database seed data for pre-built workflow templates.
  * Ensure compatibility with zero-cost serverless databases (**Neon PostgreSQL** or **Turso SQLite**).
* **Deliverables:**
  * `packages/db/schema.ts`, `drizzle.config.ts`, and migration files.
  * Database seed script (`seed.ts`) populating demo workflows and agent personas.

---

### 3. `backend-api-lead` (Senior Backend & API Engineer)
* **Subagent Name:** `backend-api-lead`
* **Focus Area:** REST API, Server-Sent Events (SSE), webhooks, and backend routing.
* **Core Responsibilities:**
  * Implement the backend server in `apps/api` using **Hono** (or Express) on Node.js.
  * Build RESTful endpoints for CRUD on workflows, templates, agents, and execution history.
  * Implement **Server-Sent Events (SSE)** endpoint (`GET /api/executions/:id/stream`) to stream real-time node execution progress and token generation to the frontend.
  * Build incoming webhook triggers (`POST /api/webhooks/:workflowId`) allowing third-party services to trigger workflows asynchronously.
  * Apply Zod validation middleware for all request payloads.
* **Deliverables:**
  * `apps/api/src/routes/` (workflows, executions, agents, webhooks, health).
  * SSE streaming controller and error handling middleware.

---

### 4. `ai-engine-engineer` (AI Systems & Graph Orchestrator)
* **Subagent Name:** `ai-engine-engineer`
* **Focus Area:** Graph traversal algorithms, Google Gemini SDK, token metering, and deterministic simulation.
* **Core Responsibilities:**
  * Implement graph validation: cycle detection (Kahn’s algorithm / topological sort), missing handle detection, and disconnected node warnings.
  * Build the node handler registry:
    * **Trigger Handler:** Parses incoming webhook or manual JSON.
    * **AI Prompt Handler:** Invokes the official Google Gemini SDK (`@google/genai`) with system instructions, temperature, and topP.
    * **Condition Handler:** Evaluates boolean expressions and routes execution to `True` or `False` output ports.
    * **Transform Handler:** Pure-function data extraction, regex, and JSON templating (strictly avoiding `eval`).
    * **HTTP Handler:** Performs external REST calls or mock responses.
    * **Output Handler:** Aggregates final workflow payload.
  * Support **Dual Execution Modes**:
    1. *Live Gemini Mode:* Real model reasoning, streaming tokens, and actual `usageMetadata` extraction.
    2. *Simulated Mode:* Deterministic mock responses for testing and zero-cost guest demos.
* **Deliverables:**
  * `apps/api/src/engine/` (topologicalSort, cycleDetector, runner, nodeHandlers).
  * `apps/api/src/services/geminiService.ts` wrapping `@google/genai`.

---

### 5. `frontend-canvas-lead` (Senior Frontend Specialist)
* **Subagent Name:** `frontend-canvas-lead`
* **Focus Area:** User interface, `@xyflow/react` canvas, node configurations, and responsive design.
* **Core Responsibilities:**
  * Scaffold `apps/web` with Vite, React 19, TypeScript, Tailwind CSS, and shadcn/ui.
  * Implement the infinite workflow canvas using `@xyflow/react` with custom styled nodes:
    * Node header with icon and color-coded kind badge.
    * Multiple custom source/target handles.
    * Live execution status badges (Idle, Running, Success, Failed).
    * Active execution visual effects (pulsing glowing borders).
  * Build the slide-out **Node Configuration Drawer** (Zod-validated forms with React Hook Form).
  * Implement canvas productivity features: zoom, pan, minimap, undo/redo stack, and keyboard shortcuts.
  * Build the supporting views:
    * **Workspace Dashboard** with KPI cards and Recharts.
    * **AI Agent Studio** with test playground.
    * **Prompt Playground** with diff viewer.
    * **Execution Monitor** with step-by-step trace inspector.
* **Deliverables:**
  * `apps/web/src/features/workflows/canvas/` (React Flow canvas, custom nodes, edges).
  * `apps/web/src/features/` (dashboard, agents, prompts, executions, settings).

---

### 6. `qa-testing-engineer` (Quality Assurance & CI Lead)
* **Subagent Name:** `qa-testing-engineer`
* **Focus Area:** Automated testing, graph verification edge cases, Playwright E2E, and CI/CD.
* **Core Responsibilities:**
  * Write Vitest unit tests for:
    * Cycle detection and topological sort ordering.
    * Condition node branching logic (`true` vs `false` paths).
    * Prompt variable interpolation (`{{var}}`).
    * Token and cost calculations.
  * Write API route integration tests.
  * Implement Playwright end-to-end tests for critical user journeys:
    1. Load app -> Select template -> Canvas renders correctly.
    2. Add new node -> Connect ports -> Configure node properties.
    3. Click "Run" -> Observe real-time execution animation.
    4. Click executed node -> Verify inputs, outputs, and latency in inspector drawer.
  * Configure GitHub Actions CI workflow to run lint, type-check, tests, and build on every push.
* **Deliverables:**
  * `tests/unit/`, `tests/integration/`, and `tests/e2e/` (Playwright).
  * `.github/workflows/ci.yml`.

---

### 7. `docs-specialist` (Technical Writer & Architect Docs)
* **Subagent Name:** `docs-specialist`
* **Focus Area:** Architecture documentation, API specifications, database diagrams, and guides.
* **Core Responsibilities:**
  * Author the master `NeuralDesk_Fullstack_Blueprint.md` containing end-to-end technical specifications.
  * Document all REST and SSE API endpoints with request/response schemas.
  * Maintain the root `README.md` with product screenshots, setup guides, zero-cost deployment instructions, and demo links.
* **Deliverables:**
  * `NeuralDesk_Fullstack_Blueprint.md`.
  * `README.md`, `docs/api.md`, `docs/database.md`.

---

### 8. `devops-cloud-engineer` (Senior DevOps & Cloud Infrastructure)
* **Subagent Name:** `devops-cloud-engineer`
* **Focus Area:** Multi-stage Docker, GitHub Actions CI/CD, zero-cost cloud deployment, and production monitoring.
* **Core Responsibilities:**
  * Design production-grade, multi-stage Dockerfiles for `apps/web` and `apps/api`, plus a local `docker-compose.yml`.
  * Build automated GitHub Actions CI/CD pipelines (lint, typecheck, unit tests, E2E tests, preview releases).
  * Configure 100% zero-cost cloud hosting:
    * **Frontend:** Vercel / Cloudflare Pages static edge CDN.
    * **Backend API:** Render / Railway / Fly.io / Vercel Serverless.
    * **Database:** Neon Serverless PostgreSQL / Turso SQLite connection pooling.
  * Implement environment variable validation (using Zod) to guarantee no secrets leak into client bundles.
  * Configure health check endpoints (`GET /api/health`), graceful server shutdown, and uptime monitoring.
* **Deliverables:**
  * `Dockerfile.web`, `Dockerfile.api`, and `docker-compose.yml`.
  * `.github/workflows/ci.yml` and `.github/workflows/deploy.yml`.
  * Production deployment runbooks and environment configs.

---

## 3. Collaboration & Handoff Workflow

```
[lead-architect]
  │  Creates monorepo structure, shared schemas & types (@neuraldesk/shared)
  ├───────────────────────────────┬───────────────────────────────┐
  ▼                               ▼                               ▼
[database-engineer]      [backend-api-lead]           [frontend-canvas-lead]
  │  Builds DB schemas     │  Implements REST & SSE     │  Builds React Flow canvas,
  │  & seed templates      │  endpoints using schemas   │  nodes, and UI dashboard
  └───────────────┬───────┴───────────────┬────────────┘
                  ▼                       ▼
          [ai-engine-engineer] ◄──────────┘
             Implements graph runner,
             Gemini SDK & live SSE streaming
                  │
                  ▼
          [qa-testing-engineer]
             Runs unit, integration, and
             Playwright end-to-end test suites
                  │
                  ├───────────────────────────────┐
                  ▼                               ▼
          [devops-cloud-engineer]         [docs-specialist]
             Docker, CI/CD pipelines,        Blueprints, API contracts,
             Zero-cost cloud deployment      and setup documentation
```

---

## 4. Definition of Done (DoD) per Agent

An agent's task is only considered complete when:
1. **TypeScript Strict Mode:** No compilation errors, zero `any` types.
2. **Contract Alignment:** All models adhere to `@neuraldesk/shared` Zod schemas.
3. **Automated Tests:** Unit or integration tests pass with 100% green status.
4. **Zero-Leak Security:** Secrets (e.g. Gemini API key) are verified to never leak to frontend bundles.
5. **Cost Compliance:** All components run within 100% free-tier cloud limits.
