# 01. Architecture — Overview, Vision & Core Tenets

[← Back to Documentation Portal](../README.md)

---

## 1.1 Executive Summary & Mission
**NeuralDesk** is an enterprise-grade visual AI workflow intelligence and orchestration platform. Designed for modern engineering, product, and operations teams, NeuralDesk transforms complex multi-model AI agent interactions and API pipelines into intuitive, visually inspectable, and deterministic Directed Acyclic Graphs (DAGs).

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

## 1.2 The AI Workflow Problem Space

| Critical Industry Pain Point | How Traditional Tools Fail | The NeuralDesk Enterprise Solution |
| :--- | :--- | :--- |
| **Black-Box Execution Opacity** | Tools hide prompts, raw tokens, and middle-layer transformations behind high-level abstractions. Debugging a failed 7-step chain requires digging through server logs. | **Full Execution Telemetry:** Every node execution emits granular logs, exact compiled prompts, raw Gemini completions, and state transitions visible in the Slide-Over Inspector. |
| **Runaway AI Costs & Surprises** | Developers run loops without visibility into prompt amplification or completion token bloat, leading to surprise monthly bills. | **Live Token & USD Metering:** Real-time cost computation per node using official Gemini token pricing ($0.075/1M Flash prompt, $0.30/1M Flash completion) with workspace budget hard-caps. |
| **Fragile Testing & Expensive CI/CD** | Testing workflows requires burning paid API keys on every Git commit or pull request, resulting in flakiness and high test costs. | **Deterministic Simulation Engine:** Built-in zero-cost, seeded mock runner that simulates realistic model responses, latencies, and token telemetry without hitting external APIs. |
| **API Secret Leakage in the Client** | Many client-heavy tools require entering API keys into the browser, leaving credentials vulnerable in `localStorage` or network inspector tabs. | **Zero-Leak Security Architecture:** Strict server-side key isolation in `apps/api`. The browser never touches the `GEMINI_API_KEY`. Multi-tenant BYOK is encrypted via AES-256-GCM. |
| **Astronomical Infrastructure Costs** | Enterprise workflow platforms demand Kubernetes clusters, heavy worker nodes, and paid message queues just to get started. | **100% Zero-Cost Cloud Deployment:** Ultra-lean monorepo engineered to run within the free tiers of Vercel (Edge UI), Render/Railway (API), and Neon Serverless PostgreSQL. |

---

## 1.3 Core Architectural Tenets

1. **Engineering Depth Over Feature Bloat:**  
   Rather than offering dozens of half-baked third-party connectors, NeuralDesk focuses on perfecting the core primitives: robust DAG topology resolution, bulletproof condition branching, millisecond execution telemetry, and rock-solid state persistence.
2. **Predictable & Deterministic Observability:**  
   Every asynchronous operation emits explicit state events (`pending` -> `running` -> `completed` | `failed` | `skipped`). A workflow run is an immutable historical record that can be replayed, inspected, and audited at any time.
3. **Strict Separation of Concerns & Type Uniformity:**  
   The monorepo enforces shared schemas (`@neuraldesk/shared`) using Zod and TypeScript. Frontend canvas components, backend controllers, and database models share the exact same source of truth for node types, edge configurations, and execution events.
4. **Zero-Leak Credential Security:**  
   AI provider keys never reach the browser under any circumstance. All AI invocations, external tool requests, and webhook authentications are strictly executed within the backend runtime (`apps/api`).
5. **Radical Cost-Efficiency & Lean Footprint:**  
   The system achieves high throughput with minimal overhead. Utilizing lightweight Node.js/Hono backends, serverless PostgreSQL connections with pooling, and zero-dependency graph sorting algorithms, the platform runs at zero cost on modern cloud free tiers.

---

## 1.4 Enterprise Workflow Lifecycle: Draft vs. Published

In enterprise production environments, editing a visual workflow must never destabilize active production triggers. NeuralDesk enforces an immutable release boundary:

* **Draft State (Canvas Workspace):** Auto-saved in real time to the database as users drag nodes, modify prompt parameters, or rewire edges. Drafts allow rapid experimentation and testing in simulated mode.
* **Published State (Production Ingress):** An immutable, versioned snapshot (e.g., `v1.0.0`, `v1.1.0`). External webhooks and scheduled cron jobs **only execute the published snapshot**.
* **Zero-Downtime Rollbacks:** Users can inspect past versions, compare side-by-side visual graph diffs, and restore any previous version with 1 click.

---

## 1.5 Human-in-the-Loop (HITL) AI Governance

To prevent generative AI hallucinations from corrupting downstream production systems (e.g. sending unreviewed customer emails, executing database mutations, or calling external APIs), NeuralDesk provides native **Approval Nodes**:

* Execution pauses deterministically in a `WAITING_FOR_APPROVAL` state.
* An interactive approval card is rendered in the UI with the full upstream LLM completion.
* An authorized reviewer can **Approve**, **Reject**, or **Edit** the payload before resuming downstream execution.

---

[Next: C4 Architectural Models →](./c4-models.md)
