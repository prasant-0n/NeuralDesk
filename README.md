# NeuralDesk — Fullstack AI Workflow Intelligence Platform

<div align="center">

**Build intelligent workflows. Understand every execution.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript: Strict](https://img.shields.io/badge/TypeScript-Strict%20Mode-blue)](https://www.typescriptlang.org/)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini%201.5%2F2.0-orange)](https://ai.google.dev/)
[![React Flow](https://img.shields.io/badge/Canvas-@xyflow/react%20v12-purple)](https://reactflow.dev/)
[![Drizzle ORM](https://img.shields.io/badge/ORM-Drizzle%20ORM-green)](https://orm.drizzle.team/)
[![Zero-Cost Cloud](https://img.shields.io/badge/Deployment-100%25%20Zero--Cost-brightgreen)](docs/07-devops/zero-cost-deployment.md)

</div>

---

## 🌟 Overview

**NeuralDesk** is an enterprise-grade fullstack visual AI workflow intelligence and orchestration platform. Designed for engineers, operations teams, and product managers, NeuralDesk transforms complex multi-model AI agent pipelines into visually inspectable, deterministic Directed Acyclic Graphs (DAGs).

Every node run is monitored with microsecond timestamps, prompt token counts, candidate completion tokens, USD cost estimation, and execution logs streamed in real time to the browser via **Server-Sent Events (SSE)**.

```
       Visual DAG Studio                   Dual-Mode Execution                Full Observability
 ┌───────────────────────────┐         ┌───────────────────────────┐      ┌─────────────────────────┐
 │ • Custom React Flow Nodes │         │ • Google Gemini 1.5/2.0   │      │ • Token & USD Cost Meter│
 │ • Real-Time Cycle Guard   │ ──────► │ • Deterministic Simulator │ ───► │ • Step Latency Waterfall│
 │ • Interactive Port Wiring │         │ • Safe AST Logic Sandbox  │      │ • SSE Live Event Stream │
 └───────────────────────────┘         └───────────────────────────┘      └─────────────────────────┘
```

---

## 🚀 Key Features

* **Visual DAG Canvas Engine:** Built with `@xyflow/react` (React Flow 12) featuring custom nodes (`Trigger`, `LLM`, `Prompt`, `Condition`, `Transform`, `Tool`, `Evaluator`, `Output`), interactive port wiring, and live execution glows.
* **Dual-Mode AI Engine:**
  * **Real-World AI Mode:** Server-side Google Gemini 1.5 Flash/Pro and Gemini 2.0 streaming inference via `@google/genai` SDK.
  * **Deterministic Simulation Mode:** Seeded PRNG mock runner (MurmurHash3) providing realistic token outputs and latencies for offline development and zero-cost CI testing.
* **Granular Observability:** Micro-cent token economics computation ($0.075/1M Flash prompt, $0.30/1M Flash completion), step latency waterfall, and raw JSON I/O inspection in the slide-over drawer.
* **Zero-Leak Security Architecture:** AI provider credentials (`GEMINI_API_KEY`) strictly isolated on the backend. Multi-tenant BYOK encrypted at rest using **AES-256-GCM** with ephemeral in-memory decryption. Safe AST expression evaluation with zero `eval()`.
* **100% Zero-Cost Cloud Deployment:** Optimized to run within the free tiers of Vercel (Edge UI), Render/Railway (API container), and Neon Serverless PostgreSQL.

---

## 📂 Monorepo Architecture

```
NeuralDesk/
├── apps/
│   ├── web/                    # Next.js 14 / Vite React 18 Canvas & Dashboard
│   └── api/                    # Node.js / Hono REST & SSE Execution Engine
├── packages/
│   ├── shared/                 # Universal Zod schemas, TypeScript contracts, Kahn DAG sort
│   └── db/                     # Drizzle ORM schema (Neon Postgres / Turso SQLite)
├── docs/                       # Complete Modular Enterprise Documentation Suite
├── tests/                      # Vitest unit/integration suites & Playwright E2E journeys
├── docker/                     # Multi-stage Dockerfiles & docker-compose.yml
├── .github/workflows/          # CI/CD pipelines (Lint, Typecheck, Test, Deploy)
├── NeuralDesk_Fullstack_Blueprint.md # Master Technical Blueprint
└── README.md
```

---

## 📖 Documentation Suite

The complete engineering specification is documented in the [`docs/`](docs/README.md) directory:

| Section | Key Documents |
| :--- | :--- |
| **01. Architecture** | [Overview](docs/01-architecture/overview.md) • [C4 Models](docs/01-architecture/c4-models.md) • [Monorepo Structure](docs/01-architecture/monorepo-structure.md) • [Sequence Diagrams](docs/01-architecture/sequence-diagrams.md) |
| **02. Database** | [ER Diagram](docs/02-database/er-diagram.md) • [Schema Models](docs/02-database/schema-models.md) • [Migrations & Seed](docs/02-database/migrations-and-seed.md) |
| **03. API Contracts** | [REST API](docs/03-api/rest-specification.md) • [SSE Streaming](docs/03-api/sse-streaming.md) • [Webhook Gateway](docs/03-api/webhook-ingress.md) |
| **04. AI Engine** | [Graph Orchestration](docs/04-ai-engine/graph-orchestration.md) • [Gemini Integration](docs/04-ai-engine/gemini-integration.md) • [Deterministic Mock](docs/04-ai-engine/deterministic-simulation.md) |
| **05. Frontend** | [Canvas Architecture](docs/05-frontend/canvas-architecture.md) • [State Management](docs/05-frontend/state-management.md) • [Design System](docs/05-frontend/design-system.md) |
| **06. Security** | [Zero-Leak Secrets](docs/06-security/zero-leak-secrets.md) • [Sandboxing & Safety](docs/06-security/sandboxing-and-safety.md) |
| **07. DevOps** | [Docker](docs/07-devops/docker.md) • [CI/CD Pipeline](docs/07-devops/ci-cd-pipeline.md) • [Zero-Cost Cloud Deployment](docs/07-devops/zero-cost-deployment.md) |
| **08. Testing** | [QA Strategy](docs/08-testing/strategy.md) • [Unit & Integration](docs/08-testing/unit-and-integration.md) • [Playwright E2E](docs/08-testing/e2e-playwright.md) |
| **09. Roadmap** | [8-Week Implementation Plan](docs/09-roadmap/implementation-sprints.md) • [8-Agent RACI Matrix](docs/09-roadmap/raci-matrix.md) |

*Full monolithic specification also available in [`NeuralDesk_Fullstack_Blueprint.md`](NeuralDesk_Fullstack_Blueprint.md).*

---

## ⚡ Quick Start (Local Development)

### 1. Prerequisites
* Node.js $\ge$ 20.x
* `pnpm` $\ge$ 9.x (`npm install -g pnpm`)
* Docker & Docker Compose (Optional for local PostgreSQL)

### 2. Installation
```bash
# Clone repository
git clone https://github.com/your-org/neuraldesk.git
cd neuraldesk

# Install dependencies across all monorepo packages
pnpm install

# Copy environment template
cp .env.example .env
```

### 3. Database Setup
```bash
# Push schema migrations to database (Neon Serverless or local SQLite)
pnpm --filter=@neuraldesk/db db:push

# (Optional) Seed reference workflows
pnpm --filter=@neuraldesk/db db:seed
```

### 4. Run Development Server
```bash
# Starts apps/web on http://localhost:3000 and apps/api on http://localhost:4000
pnpm dev
```

---

## 🧪 Testing

```bash
# Run Vitest unit & integration test suites
pnpm test

# Run Playwright end-to-end browser tests
pnpm test:e2e
```

---

## 👥 Autonomous Agent Team

NeuralDesk is engineered and maintained across 8 specialized autonomous agent roles:
1. `lead-architect`: Principal Systems Architect
2. `database-engineer`: Database Architect
3. `backend-api-lead`: Senior Backend & API Engineer
4. `ai-engine-engineer`: AI Systems & Graph Orchestrator
5. `frontend-canvas-lead`: Senior Frontend Specialist
6. `qa-testing-engineer`: Quality Assurance & Testing
7. `devops-cloud-engineer`: DevOps, Docker & Cloud Infrastructure
8. `docs-specialist`: Technical Writer & Documentation Engineer

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
