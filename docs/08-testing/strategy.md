# 08. Testing — QA Strategy & Reliability Architecture

[← Back to Documentation Portal](../README.md) | [Next: Unit & Integration →](./unit-and-integration.md)

---

## 1.1 The Testing Pyramid

NeuralDesk enforces a strict 3-tier testing strategy:

```
                  ┌───────────────────────┐
                  │    Playwright E2E     │  ~10% of tests
                  │ (Full User Journeys)  │  (Browser Canvas, Wires, Execution)
                  ├───────────────────────┤
                  │    Integration Tests  │  ~25% of tests
                  │ (Supertest & SSE API) │  (Route contracts, SSE order, HMAC)
                  ├───────────────────────┤
                  │     Vitest Unit Tests │  ~65% of tests
                  │ (Pure Domain Logic)   │  (DAG Topo-sort, Cycle check, AST)
                  └───────────────────────┘
```

---

## 1.2 Quality Gates & Coverage Thresholds

* **Unit Code Coverage:** Minimum 85% branch coverage on `@neuraldesk/shared` (graph algorithms, expressions, template interpolation).
* **Deterministic Simulation:** Zero flaky network calls in CI. LLM calls default to the deterministic mock engine.
* **Strict TypeScript Typechecking:** Zero `any` types permitted (`--noImplicitAny`, `--strict`).

---

[Next: Unit & Integration →](./unit-and-integration.md)
