# 09. Roadmap — 8-Agent RACI Responsibility Matrix

[← Back to Documentation Portal](../README.md) | [← Implementation Sprints](./implementation-sprints.md)

---

## 2.1 RACI Matrix Definitions

* **R (Responsible):** The role that performs the implementation.
* **A (Accountable):** The role with final sign-off authority.
* **C (Consulted):** The role offering domain input.
* **I (Informed):** The role notified of updates.

---

## 2.2 Subsystem Responsibility Distribution

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

[← Previous: Implementation Sprints](./implementation-sprints.md) | [Back to Documentation Portal](../README.md)
