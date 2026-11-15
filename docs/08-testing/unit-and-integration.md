# 08. Testing — Vitest Unit & API Integration Tests

[← Back to Documentation Portal](../README.md) | [← Testing Strategy](./strategy.md) | [Next: Playwright E2E →](./e2e-playwright.md)

---

## 2.1 Vitest Unit Test Suites (`tests/unit/graph-and-engine.test.ts`)

```typescript
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
      { source: "C", target: "A" },
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
```

---

## 2.2 API Integration Testing (`tests/integration/api-execution.test.ts`)

```typescript
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

[← Previous: Testing Strategy](./strategy.md) | [Next: Playwright E2E →](./e2e-playwright.md)
