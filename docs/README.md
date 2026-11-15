# NeuralDesk — Master Technical Documentation Portal

Welcome to the **NeuralDesk** comprehensive engineering and architecture documentation suite.

NeuralDesk is an enterprise-grade fullstack visual AI workflow intelligence and orchestration platform. It is engineered with a strict monorepo architecture (`apps/web`, `apps/api`, `packages/shared`, `packages/db`), powered by Google Gemini 1.5/2.0 AI SDKs with deterministic mock simulation fallbacks, real-time Server-Sent Events (SSE) telemetry, and 100% zero-cost cloud deployment.

> **Product Vision & Promise:**  
> *"Build intelligent workflows. Understand every execution."*

---

## 📚 Documentation Directory Structure

```
docs/
├── README.md                          # Master Documentation Portal (This Document)
├── 01-architecture/
│   ├── overview.md                    # Vision, Mission, Problem Space & Core Tenets
│   ├── c4-models.md                   # C4 Context, Container & Component Diagrams (Mermaid)
│   ├── monorepo-structure.md          # Workspace topography, package boundaries & dependency graph
│   └── sequence-diagrams.md           # End-to-end execution & streaming data flows (Mermaid)
├── 02-database/
│   ├── er-diagram.md                  # Entity-Relationship diagram (Mermaid) & Cardinality
│   ├── schema-models.md               # Complete Drizzle ORM schema across all 13 entities
│   └── migrations-and-seed.md         # Neon / Turso setup, migration commands, seed data
├── 03-api/
│   ├── rest-specification.md          # Complete REST API endpoints, schemas & error envelopes
│   ├── sse-streaming.md               # Real-time Server-Sent Events protocol & event schemas
│   └── webhook-ingress.md             # HMAC SHA-256 webhook gateway & replay attack defense
├── 04-ai-engine/
│   ├── graph-orchestration.md         # Kahn's topological sort, cycle detection, FSM state machine
│   ├── gemini-integration.md          # @google/genai SDK, prompt compiler, token economics
│   └── deterministic-simulation.md    # Seeded PRNG mock runner, synthetic latencies & offline mode
├── 05-frontend/
│   ├── canvas-architecture.md         # @xyflow/react canvas, custom node taxonomy, handles, ports
│   ├── state-management.md            # Zustand canvas store, 50-step undo/redo, TanStack Query
│   └── design-system.md               # Tailwind CSS, Radix UI primitives, shadcn/ui design tokens
├── 06-security/
│   ├── zero-leak-secrets.md           # Server-side key isolation, BYOK AES-256-GCM encryption
│   └── sandboxing-and-safety.md       # Safe AST expression evaluation (zero eval), rate limiting
├── 07-devops/
│   ├── docker.md                      # Multi-stage Dockerfiles (web & api) & docker-compose.yml
│   ├── ci-cd-pipeline.md              # GitHub Actions CI/CD workflows (.github/workflows/ci.yml)
│   └── zero-cost-deployment.md        # Vercel, Render/Railway, Neon free-tier configuration
├── 08-testing/
│   ├── strategy.md                    # QA methodology, test pyramid, coverage requirements
│   ├── unit-and-integration.md        # Vitest test matrix & API integration tests
│   └── e2e-playwright.md              # Playwright browser journeys & critical paths
└── 09-roadmap/
    ├── implementation-sprints.md      # 8-week phased implementation plan
    └── raci-matrix.md                 # 8-Agent RACI responsibility matrix
```

---

## 🧭 Navigation & Section Index

### [01. Architecture](./01-architecture/overview.md)
* [System Overview & Vision](./01-architecture/overview.md): Strategic problem space, business value, 5 foundational tenets, Draft vs. Published workflow lifecycle, and Human-in-the-Loop (HITL) governance.
* [C4 Architectural Models](./01-architecture/c4-models.md): Level 1 Context, Level 2 Container, and Level 3 Component diagrams.
* [Monorepo Structure & Boundaries](./01-architecture/monorepo-structure.md): Package directory topography, import constraints, and workspace setup.
* [Execution Sequence Diagrams](./01-architecture/sequence-diagrams.md): Interactive end-to-end execution sequence from trigger to streaming output.

### [02. Database & Data Architecture](./02-database/er-diagram.md)
* [Entity-Relationship Diagram](./02-database/er-diagram.md): Mermaid ER model mapping all 15 tables, keys, and foreign constraints.
* [Schema Models Specification](./02-database/schema-models.md): Complete Drizzle ORM TypeScript code for Neon PostgreSQL / Turso SQLite, including Idempotency Keys, Approvals, and the 30-Day Automated Log Pruning Strategy.
* [Migrations & Seed Data](./02-database/migrations-and-seed.md): Connection pooling setup, migration runbooks, and reference workflows.

### [03. API Specifications](./03-api/rest-specification.md)
* [REST API Specification](./03-api/rest-specification.md): RFC 7807 error envelopes, endpoints, and request/response JSON schemas.
* [Server-Sent Events (SSE) Streaming](./03-api/sse-streaming.md): Real-time `text/event-stream` contract, event frame types, wire samples, and `Last-Event-ID` reconnection recovery buffer.
* [Webhook Ingress Gateway](./03-api/webhook-ingress.md): HMAC SHA-256 signature verification, timing attack defense, replay attack mitigation, and Webhook Idempotency/Deduplication engine.

### [04. AI Orchestration Engine](./04-ai-engine/graph-orchestration.md)
* [Graph Orchestration & Topology](./04-ai-engine/graph-orchestration.md): Kahn's topological sorting, cycle detection algorithm, FSM lifecycle, Concurrency Queuing (free-tier throttling), Retry Policies with exponential backoff, and Variable Resolution Engine.
* [Google Gemini SDK Integration](./04-ai-engine/gemini-integration.md): `@google/genai` runner, safety filter/block handling (`finishReason`), node execution timeouts (`AbortSignal`), token economics, and local offline models via Ollama.
* [Deterministic Simulation Engine](./04-ai-engine/deterministic-simulation.md): Seeded PRNG mock runner, synthetic latencies, and offline CI testing.

### [05. Frontend & Visual Canvas](./05-frontend/canvas-architecture.md)
* [Canvas Architecture](./05-frontend/canvas-architecture.md): `@xyflow/react` (React Flow 12) setup, custom node taxonomy (including `ApprovalNode`), `on_failure` error ports, and JSON/YAML export/import.
* [State Management & Data Layer](./05-frontend/state-management.md): Zustand store (`useWorkflowStore`), 50-step undo/redo, and TanStack Query cache.
* [Design System & Theming](./05-frontend/design-system.md): Tailwind CSS, Radix UI primitives, dark mode tokens, and execution pulse animations.

### [06. Security Architecture](./06-security/zero-leak-secrets.md)
* [Zero-Leak Secrets Isolation](./06-security/zero-leak-secrets.md): Server-side key isolation, environment guards, BYOK AES-256-GCM encryption, and `HttpOnly` Cookie session management.
* [Sandboxing & Safety Architecture](./06-security/sandboxing-and-safety.md): Safe AST expression parser (zero `eval`), prototype pollution defense, and rate limits.

### [07. DevOps & Cloud Infrastructure](./07-devops/docker.md)
* [Docker Containerization](./07-devops/docker.md): Multi-stage Dockerfiles (`Dockerfile.api`, `Dockerfile.web`) and local `docker-compose.yml`.
* [CI/CD Pipeline](./07-devops/ci-cd-pipeline.md): Automated GitHub Actions workflow (`ci.yml`) enforcing lint, typecheck, Vitest, and Playwright.
* [100% Zero-Cost Cloud Deployment](./07-devops/zero-cost-deployment.md): Deployment runbook for Vercel, Render/Railway, and Neon Serverless.

### [08. QA, Testing & Reliability](./08-testing/strategy.md)
* [Testing Strategy & Test Pyramid](./08-testing/strategy.md): QA philosophy, coverage metrics, and reliability benchmarks.
* [Unit & Integration Testing](./08-testing/unit-and-integration.md): Concrete Vitest suites for DAG sorting, expressions, compiler, and API routes.
* [Playwright End-to-End Journeys](./08-testing/e2e-playwright.md): Automated browser journeys for canvas loading, port wiring, execution, and trace inspection.

### [09. Roadmap & Agent Responsibilities](./09-roadmap/implementation-sprints.md)
* [8-Week Implementation Roadmap](./09-roadmap/implementation-sprints.md): Phased weekly sprint schedule from Sprint 1 to launch.
* [RACI Responsibility Matrix](./09-roadmap/raci-matrix.md): Clear ownership mapping across all 8 specialized autonomous agent roles.

---

## 👥 Autonomous Agent Roster & Ownership

The development and maintenance of NeuralDesk is coordinated across **8 specialized agent roles**:

1. **`lead-architect` (Principal Systems Architect):** System boundaries, monorepo setup, shared types, and architectural governance.
2. **`database-engineer` (Database Architect):** Drizzle ORM schema, Neon connection pooling, migrations, and seed scripts.
3. **`backend-api-lead` (Senior Backend & API Engineer):** REST API endpoints, HMAC webhook ingestion, and SSE broadcast streamer.
4. **`ai-engine-engineer` (AI Systems & Graph Orchestrator):** Kahn topological sort, Google Gemini SDK, token economics, and mock simulation.
5. **`frontend-canvas-lead` (Senior Frontend Specialist):** React Flow 12 visual canvas, custom nodes, Zustand store, and inspector drawer.
6. **`qa-testing-engineer` (Quality Assurance & Testing):** Vitest unit & integration test suites, Playwright E2E journeys, and CI test gates.
7. **`devops-cloud-engineer` (Senior DevOps & Cloud Infrastructure):** Multi-stage Docker, GitHub Actions pipelines, and zero-cost cloud hosting.
8. **`docs-specialist` (Technical Writer & Documentation Engineer):** Modular documentation suite, API specifications, and architecture guides.

---

*Master Architecture Reference Document also available in root:* [`NeuralDesk_Fullstack_Blueprint.md`](../NeuralDesk_Fullstack_Blueprint.md)
