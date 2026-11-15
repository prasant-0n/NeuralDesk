import { describe, it, expect } from "vitest";
import {
  WorkflowDefinitionSchema,
  WorkflowNodeSchema,
  calculateTokenCost,
  topologicalSortKahn,
  evaluateCondition,
  compilePromptTemplate,
  MODEL_PRICING,
  SUPPORTED_GEMINI_MODELS,
} from "../../packages/shared/src/index.js";

describe("Shared Contracts & Schemas", () => {
  it("should validate a complete valid workflow definition schema", () => {
    const validWorkflow = {
      nodes: [
        {
          id: "trigger_1",
          type: "trigger",
          position: { x: 100, y: 150 },
          data: {
            label: "Webhook Ingress",
            description: "Receives customer ticket payloads",
            inputs: [],
            outputs: [{ id: "out", name: "output", type: "object" }],
            config: {
              triggerType: "webhook",
              webhookPath: "/api/v1/webhooks/tickets",
            },
          },
        },
        {
          id: "llm_1",
          type: "llm",
          position: { x: 400, y: 150 },
          data: {
            label: "Sentiment Classifier",
            inputs: [{ id: "in", name: "input", type: "object" }],
            outputs: [{ id: "out", name: "output", type: "string" }],
            config: {
              provider: "gemini",
              model: "gemini-1.5-flash",
              systemPrompt: "Classify the ticket sentiment into POSITIVE, NEUTRAL, or NEGATIVE.",
              temperature: 0.2,
              topP: 0.95,
              maxTokens: 512,
              jsonMode: false,
            },
          },
        },
        {
          id: "output_1",
          type: "output",
          position: { x: 700, y: 150 },
          data: {
            label: "Result Output",
            inputs: [{ id: "in", name: "input", type: "string" }],
            outputs: [],
            config: {
              outputFormat: "json",
            },
          },
        },
      ],
      edges: [
        {
          id: "e1",
          source: "trigger_1",
          sourceHandle: "out",
          target: "llm_1",
          targetHandle: "in",
        },
        {
          id: "e2",
          source: "llm_1",
          sourceHandle: "out",
          target: "output_1",
          targetHandle: "in",
        },
      ],
      viewport: { x: 0, y: 0, zoom: 1 },
    };

    const parsed = WorkflowDefinitionSchema.parse(validWorkflow);
    expect(parsed.nodes).toHaveLength(3);
    expect(parsed.edges).toHaveLength(2);
  });

  it("should fail validation if LLM temperature exceeds valid range", () => {
    const invalidLLMNode = {
      id: "llm_bad",
      type: "llm",
      position: { x: 0, y: 0 },
      data: {
        label: "Bad Temperature LLM",
        inputs: [],
        outputs: [],
        config: {
          provider: "gemini",
          model: "gemini-1.5-flash",
          temperature: 3.5, // exceeds 2.0 max
        },
      },
    };

    expect(() => WorkflowNodeSchema.parse(invalidLLMNode)).toThrow();
  });
});

describe("Token Economics & Pricing Calculations", () => {
  it("should calculate exact USD cost for Gemini 1.5 Flash", () => {
    // Gemini 1.5 Flash: $0.075 / 1M prompt, $0.30 / 1M completion
    const cost = calculateTokenCost("gemini-1.5-flash", 1_000_000, 1_000_000);
    expect(cost.promptCostUsd).toBe(0.075);
    expect(cost.completionCostUsd).toBe(0.3);
    expect(cost.totalCostUsd).toBe(0.375);
  });

  it("should calculate exact USD cost for small batches", () => {
    const cost = calculateTokenCost("gemini-1.5-pro", 1000, 500);
    // 1000 prompt tokens @ $1.25/1M = $0.00125
    // 500 completion tokens @ $5.00/1M = $0.0025
    expect(cost.promptCostUsd).toBe(0.00125);
    expect(cost.completionCostUsd).toBe(0.0025);
    expect(cost.totalCostUsd).toBe(0.00375);
  });

  it("should list all supported Gemini models", () => {
    expect(SUPPORTED_GEMINI_MODELS).toContain("gemini-1.5-flash");
    expect(SUPPORTED_GEMINI_MODELS).toContain("gemini-1.5-pro");
    expect(SUPPORTED_GEMINI_MODELS).toContain("gemini-2.0-flash");
  });
});

describe("Graph Topological Sort & Cycle Invariants", () => {
  it("should correctly sort a valid linear DAG into topological order", () => {
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

  it("should detect a directed cycle and identify the circular nodes", () => {
    const nodes = ["A", "B", "C"];
    const edges = [
      { source: "A", target: "B" },
      { source: "B", target: "C" },
      { source: "C", target: "A" },
    ];

    const result = topologicalSortKahn(nodes, edges);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Graph contains a directed cycle");
    expect(result.cyclePath).toEqual(["A", "B", "C"]);
  });
});

describe("Safe Expression Evaluator & Template Compiler", () => {
  it("should safely evaluate binary condition expressions without eval", () => {
    const context = {
      trigger: {
        score: 85,
        priority: "high",
        isActive: true,
      },
    };

    expect(evaluateCondition("{{trigger.score}} >= 80", context)).toBe(true);
    expect(evaluateCondition("{{trigger.score}} < 50", context)).toBe(false);
    expect(evaluateCondition('trigger.priority == "high"', context)).toBe(true);
    expect(evaluateCondition("trigger.priority != 'low'", context)).toBe(true);
  });

  it("should compile Mustache templates with resolved node scope", () => {
    const template = "Analyze customer ticket for {{customer.company}}: {{ticket.issue}}";
    const scope = {
      customer: { company: "Acme Corp" },
      ticket: { issue: "Connection pool exhausted" },
    };

    const compiled = compilePromptTemplate(template, scope);
    expect(compiled).toBe("Analyze customer ticket for Acme Corp: Connection pool exhausted");
  });
});

describe("Environment Variables & Zod Configuration Contracts", () => {
  it("should validate and apply default server environment schema", async () => {
    const { ServerEnvSchema, validateServerEnv } = await import(
      "../../packages/shared/src/index.js"
    );

    const parsed = validateServerEnv({});
    expect(parsed.PORT).toBe(3001);
    expect(parsed.HOST).toBe("0.0.0.0");
    expect(parsed.NODE_ENV).toBe("development");
    expect(parsed.DATABASE_POOL_SIZE).toBe(10);
    expect(parsed.DATABASE_URL).toContain("postgres");
    expect(parsed.ENABLE_SIMULATION_MODE).toBe(true);
  });

  it("should validate and coerce custom environment variables", async () => {
    const { ServerEnvSchema } = await import("../../packages/shared/src/index.js");

    const customEnv = {
      NODE_ENV: "production",
      PORT: "8080",
      DATABASE_URL: "postgresql://user:pass@neon.tech:5432/db?sslmode=require",
      DATABASE_POOL_SIZE: "25",
      GEMINI_API_KEY: "test_key",
      CORS_ORIGIN: "https://neuraldesk.app",
    };

    const parsed = ServerEnvSchema.parse(customEnv);
    expect(parsed.PORT).toBe(8080);
    expect(parsed.NODE_ENV).toBe("production");
    expect(parsed.DATABASE_POOL_SIZE).toBe(25);
    expect(parsed.GEMINI_API_KEY).toBe("test_key");
    expect(parsed.CORS_ORIGIN).toBe("https://neuraldesk.app");
  });

  it("should validate client environment schema", async () => {
    const { ClientEnvSchema, validateClientEnv } = await import(
      "../../packages/shared/src/index.js"
    );

    const defaultClient = validateClientEnv({});
    expect(defaultClient.VITE_API_URL).toBe("http://localhost:3001/api/v1");
    expect(defaultClient.VITE_APP_NAME).toBe("NeuralDesk");
    expect(defaultClient.VITE_DEFAULT_THEME).toBe("dark");
  });
});
