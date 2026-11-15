# 01. Architecture — Monorepo Topography & Boundaries

[← Back to Documentation Portal](../README.md) | [← C4 Models](./c4-models.md) | [Next: Sequence Diagrams →](./sequence-diagrams.md)

---

## 3.1 Workspace Topography

NeuralDesk is organized as a high-performance monorepo managed via `pnpm` workspaces:

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

---

## 3.2 Package Boundaries & Dependency Hierarchy

The monorepo enforces a strict unidirectional dependency graph. Lower-level packages never import from applications:

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

### Import Rules & Guardrails
1. `@neuraldesk/shared` is a pure dependency with zero runtime overhead beyond Zod. It can be imported in Node.js, Web workers, and Browser DOM contexts.
2. `@neuraldesk/db` encapsulates database drivers (`@neondatabase/serverless` and `@libsql/client`). It is strictly forbidden from being imported by `apps/web`.
3. `apps/api` holds private environment variables (`GEMINI_API_KEY`, master encryption keys).

---

[← Previous: C4 Models](./c4-models.md) | [Next: Sequence Diagrams →](./sequence-diagrams.md)
