/**
 * NeuralDesk AI Execution Engine Unit Test Suite
 * Comprehensive verification of DAG orchestration, condition branching,
 * variable resolution scope, deterministic mock streaming, and node handlers.
 */

import { describe, it, expect, vi } from "vitest";
import { MockProvider, murmurhash3, createMulberry32 } from "../../apps/api/src/providers/mock.provider.js";
import { getLLMProvider } from "../../apps/api/src/providers/index.js";
import { ExecutionScope } from "../../apps/api/src/engine/scope.js";
import {
  TriggerHandler,
  PromptHandler,
  LLMHandler,
  ConditionHandler,
  TransformHandler,
  ToolHandler,
  ApprovalHandler,
  OutputHandler,
} from "../../apps/api/src/engine/handlers/index.js";
import { ExecutionOrchestrator } from "../../apps/api/src/engine/orchestrator.js";
import { inMemoryExecutions, inMemoryNodeRuns, inMemoryApprovals } from "../../apps/api/src/engine/store.js";
import { sseManager } from "../../apps/api/src/services/sse-manager.js";

describe("1. Deterministic Mock LLM Provider & PRNG Streaming", () => {
  it("should generate deterministic MurmurHash3 32-bit hashes", () => {
    const input = "Why is the sky blue?";
    const hash1 = murmurhash3(input, 0);
    const hash2 = murmurhash3(input, 0);
    expect(hash1).toBe(hash2);
    expect(typeof hash1).toBe("number");
    expect(hash1).toBeGreaterThan(0);
  });

  it("should produce reproducible pseudo-random numbers via Mulberry32", () => {
    const rand1 = createMulberry32(123456789);
    const rand2 = createMulberry32(123456789);

    const seq1 = [rand1(), rand1(), rand1()];
    const seq2 = [rand2(), rand2(), rand2()];

    expect(seq1).toEqual(seq2);
    expect(seq1[0]).toBeGreaterThanOrEqual(0);
    expect(seq1[0]).toBeLessThan(1);
  });

  it("should stream mock tokens incrementally within 150ms-350ms synthetic latency window", async () => {
    const provider = new MockProvider();
    const chunks: string[] = [];

    const startTime = Date.now();
    const result = await provider.executeStream(
      {
        model: "gemini-1.5-flash",
        prompt: "Analyze the customer sentiment for this inquiry.",
        jsonMode: false,
      },
      (chunk) => {
        chunks.push(chunk);
      }
    );
    const duration = Date.now() - startTime;

    expect(chunks.length).toBeGreaterThan(1);
    expect(result.text).toBe(chunks.join(""));
    expect(result.promptTokens).toBeGreaterThan(0);
    expect(result.completionTokens).toBeGreaterThan(0);
    expect(result.totalTokens).toBe(result.promptTokens + result.completionTokens);
    expect(result.costUsd).toBeGreaterThan(0);
    expect(result.finishReason).toBe("STOP");
    expect(duration).toBeGreaterThanOrEqual(140);
    expect(duration).toBeLessThanOrEqual(500);
  });

  it("should generate schema-compliant JSON in jsonMode", async () => {
    const provider = new MockProvider();
    const result = await provider.executeStream({
      model: "gemini-1.5-flash",
      prompt: "Customer ticket urgency evaluation",
      jsonMode: true,
      responseSchema: {
        type: "object",
        properties: {
          sentiment: { type: "string", enum: ["POSITIVE", "NEUTRAL", "NEGATIVE"] },
          urgencyScore: { type: "number" },
          summary: { type: "string" },
        },
      },
    });

    const parsed = JSON.parse(result.text);
    expect(["POSITIVE", "NEUTRAL", "NEGATIVE"]).toContain(parsed.sentiment);
    expect(typeof parsed.urgencyScore).toBe("number");
    expect(typeof parsed.summary).toBe("string");
  });

  it("should route to MockProvider in simulation or mock mode via getLLMProvider", () => {
    const providerSim = getLLMProvider("gemini", "simulation");
    expect(providerSim.name).toBe("mock");

    const providerMock = getLLMProvider("gemini", "mock");
    expect(providerMock.name).toBe("mock");

    const providerOllama = getLLMProvider("ollama", "real");
    expect(providerOllama.name).toBe("ollama");
  });
});

describe("2. Execution Scope & Variable Resolution", () => {
  it("should resolve {{nodes.*}}, {{steps.*}}, {{trigger.*}}, {{env.*}}, and {{$execution.*}}", () => {
    const scope = new ExecutionScope("exec_123", "wf_456", "simulation", {
      ticketId: "TICKET-9921",
      customerEmail: "alice@example.com",
    });

    scope.setNodeOutput("sentiment_node", {
      sentiment: "NEGATIVE",
      score: 95,
      details: {
        reason: "SLA breach warning",
      },
    });

    const context = scope.toContext();

    expect(context.trigger).toEqual({ ticketId: "TICKET-9921", customerEmail: "alice@example.com" });
    expect((context as any).ticketId).toBe("TICKET-9921");
    expect((context.nodes as any).sentiment_node.score).toBe(95);
    expect((context.steps as any).sentiment_node.output.details.reason).toBe("SLA breach warning");
    expect((context.$execution as any).id).toBe("exec_123");
    expect((context.$execution as any).workflowId).toBe("wf_456");
    expect((context.env as any).NODE_ENV).toBeDefined();
  });
});

describe("3. Node Handlers Unit Tests", () => {
  it("TriggerHandler should merge sample payload defaults and input data", async () => {
    const handler = new TriggerHandler();
    const scope = new ExecutionScope("e1", "w1", "mock");

    const result = await handler.execute({
      executionId: "e1",
      workflowId: "w1",
      nodeKey: "trigger_1",
      nodeType: "trigger",
      nodeConfig: {
        samplePayload: { defaultChannel: "#general", priority: "normal" },
      },
      inputs: { priority: "high", message: "Outage detected" },
      scope,
      mode: "mock",
    });

    expect(result.status).toBe("completed");
    expect(result.outputs.defaultChannel).toBe("#general");
    expect(result.outputs.priority).toBe("high");
    expect(result.outputs.customer_message).toBe("Outage detected");
  });

  it("PromptHandler should compile Mustache prompt templates with scope values", async () => {
    const handler = new PromptHandler();
    const scope = new ExecutionScope("e1", "w1", "mock", { customerName: "Acme Inc" });
    scope.setNodeOutput("classifier", { category: "Billing" });

    const result = await handler.execute({
      executionId: "e1",
      workflowId: "w1",
      nodeKey: "prompt_1",
      nodeType: "prompt",
      nodeConfig: {
        template: "Review inquiry for {{trigger.customerName}} regarding {{nodes.classifier.category}} issue.",
      },
      inputs: {},
      scope,
      mode: "mock",
    });

    expect(result.status).toBe("completed");
    expect(result.outputs.prompt).toBe("Review inquiry for Acme Inc regarding Billing issue.");
  });

  it("ConditionHandler should safely evaluate boolean conditions without eval()", async () => {
    const handler = new ConditionHandler();
    const scope = new ExecutionScope("e1", "w1", "mock");
    scope.setNodeOutput("sentiment_analyzer", { urgencyScore: 85, sentiment: "NEGATIVE" });

    // Expression evaluation
    const resultExpr = await handler.execute({
      executionId: "e1",
      workflowId: "w1",
      nodeKey: "cond_1",
      nodeType: "condition",
      nodeConfig: {
        expression: "steps.sentiment_analyzer.output.urgencyScore >= 80",
      },
      inputs: {},
      scope,
      mode: "mock",
    });

    expect(resultExpr.branch).toBe("true");
    expect(resultExpr.outputs.result).toBe(true);

    // Rule-based evaluation with OR logical operator
    const resultRules = await handler.execute({
      executionId: "e1",
      workflowId: "w1",
      nodeKey: "cond_2",
      nodeType: "condition",
      nodeConfig: {
        logicalOperator: "OR",
        rules: [
          { leftPath: "sentiment_analyzer.urgencyScore", operator: "<", rightValue: 50 },
          { leftPath: "sentiment_analyzer.sentiment", operator: "==", rightValue: "NEGATIVE" },
        ],
      },
      inputs: {},
      scope,
      mode: "mock",
    });

    expect(resultRules.branch).toBe("true");
    expect(resultRules.outputs.result).toBe(true);
  });

  it("TransformHandler should execute json_pick, string_template, and math_op safely", async () => {
    const handler = new TransformHandler();
    const scope = new ExecutionScope("e1", "w1", "mock");
    scope.setNodeOutput("source_node", { items: ["a", "b", "c"], val1: 40, val2: 60 });

    const result = await handler.execute({
      executionId: "e1",
      workflowId: "w1",
      nodeKey: "transform_1",
      nodeType: "transform",
      nodeConfig: {
        rules: [
          { targetKey: "pickedItems", sourceExpression: "source_node.items", operation: "json_pick" },
          { targetKey: "sumValue", sourceExpression: "source_node.val1, source_node.val2", operation: "math_op", mathOperation: "add" },
          { targetKey: "interpolated", sourceExpression: "Total is {{nodes.source_node.val1}}", operation: "string_template" },
        ],
      },
      inputs: {},
      scope,
      mode: "mock",
    });

    expect(result.status).toBe("completed");
    expect(result.outputs.pickedItems).toEqual(["a", "b", "c"]);
    expect(result.outputs.sumValue).toBe(100);
    expect(result.outputs.interpolated).toBe("Total is 40");
  });

  it("ApprovalHandler should create approval record and transition to waiting_for_approval", async () => {
    const handler = new ApprovalHandler();
    const scope = new ExecutionScope("e_appr", "w1", "mock");
    scope.setNodeOutput("draft_llm", { content: "Proposed refund: $500" });

    const result = await handler.execute({
      executionId: "e_appr",
      workflowId: "w1",
      nodeKey: "approval_node",
      nodeType: "approval",
      nodeConfig: {
        approverRole: "finance_lead",
        instructions: "Verify refund amount exceeds $100 policy",
      },
      inputs: {},
      scope,
      mode: "mock",
    });

    expect(result.status).toBe("waiting_for_approval");
    expect(result.approvalId).toBeDefined();
    expect(result.outputs.approverRole).toBe("finance_lead");

    const stored = inMemoryApprovals.get(result.approvalId!);
    expect(stored).toBeDefined();
    expect(stored.status).toBe("pending");
  });

  it("OutputHandler should format json, text, and primary key outputs", async () => {
    const handler = new OutputHandler();
    const scope = new ExecutionScope("e1", "w1", "mock");
    scope.setNodeOutput("last_step", { responseText: "Ticket escalated to Tier 3" });

    const result = await handler.execute({
      executionId: "e1",
      workflowId: "w1",
      nodeKey: "output_node",
      nodeType: "output",
      nodeConfig: {
        outputFormat: "json",
        primaryOutputKey: "responseText",
      },
      inputs: {},
      scope,
      mode: "mock",
    });

    expect(result.status).toBe("completed");
    expect(result.outputs.responseText).toBe("Ticket escalated to Tier 3");
  });
});

describe("4. Orchestrator DAG Execution, Branching & Retries", () => {
  it("should execute a multi-step linear DAG in topological order", async () => {
    const orchestrator = new ExecutionOrchestrator();
    const executionId = `exec_test_${Date.now()}`;
    const workflowId = "test_linear_dag";

    inMemoryExecutions.set(executionId, {
      id: executionId,
      workflowId,
      versionNumber: 1,
      status: "running",
      triggerType: "manual",
      triggerPayload: { customerEmail: "bob@test.com" },
      startedAt: new Date().toISOString(),
      durationMs: 0,
      totalTokens: 0,
      promptTokens: 0,
      completionTokens: 0,
      totalCostUsd: 0,
      executionMode: "mock",
    });

    const workflowDefinition: any = {
      nodes: [
        {
          id: "trig",
          type: "trigger",
          data: { config: { triggerType: "manual" } },
        },
        {
          id: "gen_prompt",
          type: "prompt",
          data: { config: { template: "Ticket for: {{trigger.customerEmail}}" } },
        },
        {
          id: "llm_exec",
          type: "llm",
          data: {
            config: {
              provider: "mock",
              model: "gemini-1.5-flash",
              jsonMode: true,
              userPromptTemplate: "{{nodes.gen_prompt.prompt}}",
            },
          },
        },
        {
          id: "out",
          type: "output",
          data: { config: { outputFormat: "json" } },
        },
      ],
      edges: [
        { id: "e1", source: "trig", target: "gen_prompt" },
        { id: "e2", source: "gen_prompt", target: "llm_exec" },
        { id: "e3", source: "llm_exec", target: "out" },
      ],
    };

    await orchestrator.runDAG({
      executionId,
      workflowId,
      workflowDefinition,
      inputs: { customerEmail: "bob@test.com" },
      mode: "mock",
    });

    const exec = inMemoryExecutions.get(executionId);
    expect(exec?.status).toBe("completed");
    expect(exec?.totalTokens).toBeGreaterThan(0);
    expect(exec?.totalCostUsd).toBeGreaterThan(0);

    const runs = inMemoryNodeRuns.get(executionId) || [];
    expect(runs).toHaveLength(4);
    expect(runs.map((r) => r.nodeKey)).toEqual(["trig", "gen_prompt", "llm_exec", "out"]);
    expect(runs.every((r) => r.status === "completed")).toBe(true);
  });

  it("should prune unselected conditional branches and mark unreached nodes as skipped", async () => {
    const orchestrator = new ExecutionOrchestrator();
    const executionId = `exec_branch_${Date.now()}`;
    const workflowId = "test_branching_dag";

    inMemoryExecutions.set(executionId, {
      id: executionId,
      workflowId,
      versionNumber: 1,
      status: "running",
      triggerType: "manual",
      triggerPayload: {},
      startedAt: new Date().toISOString(),
      durationMs: 0,
      totalTokens: 0,
      promptTokens: 0,
      completionTokens: 0,
      totalCostUsd: 0,
      executionMode: "mock",
    });

    // Workflow with Condition:
    // trig -> cond -> (true) -> urgent_alert
    //              -> (false) -> standard_reply
    const workflowDefinition: any = {
      nodes: [
        {
          id: "trig",
          type: "trigger",
          data: { config: {} },
        },
        {
          id: "cond",
          type: "condition",
          data: {
            config: {
              expression: "trigger.priority == 'critical'",
            },
          },
        },
        {
          id: "urgent_alert",
          type: "tool",
          data: {
            config: {
              url: "https://hooks.slack.internal/services/mock-channel-notifications",
            },
          },
        },
        {
          id: "standard_reply",
          type: "output",
          data: {
            config: { outputFormat: "text" },
          },
        },
      ],
      edges: [
        { id: "e1", source: "trig", target: "cond" },
        { id: "e_true", source: "cond", target: "urgent_alert", branch: "true" },
        { id: "e_false", source: "cond", target: "standard_reply", branch: "false" },
      ],
    };

    // When priority is 'critical', 'true' branch is taken:
    // urgent_alert runs, standard_reply is SKIPPED
    await orchestrator.runDAG({
      executionId,
      workflowId,
      workflowDefinition,
      inputs: { priority: "critical" },
      mode: "mock",
    });

    const runs = inMemoryNodeRuns.get(executionId) || [];
    const urgentRun = runs.find((r) => r.nodeKey === "urgent_alert");
    const standardRun = runs.find((r) => r.nodeKey === "standard_reply");

    expect(urgentRun?.status).toBe("completed");
    expect(standardRun?.status).toBe("skipped");
  });

  it("should route through on_failure port if an error occurs and port is wired", async () => {
    const orchestrator = new ExecutionOrchestrator();
    const executionId = `exec_on_fail_${Date.now()}`;
    const workflowId = "test_on_failure_dag";

    inMemoryExecutions.set(executionId, {
      id: executionId,
      workflowId,
      versionNumber: 1,
      status: "running",
      triggerType: "manual",
      triggerPayload: {},
      startedAt: new Date().toISOString(),
      durationMs: 0,
      totalTokens: 0,
      promptTokens: 0,
      completionTokens: 0,
      totalCostUsd: 0,
      executionMode: "mock",
    });

    // Workflow with on_failure port edge:
    // trig -> flaky_tool -> (on_failure) -> error_handler
    const workflowDefinition: any = {
      nodes: [
        {
          id: "trig",
          type: "trigger",
          data: { config: {} },
        },
        {
          id: "flaky_tool",
          type: "tool",
          data: {
            config: {
              // Non-mock URL that intentionally times out or fails
              url: "http://127.0.0.1:59999/unreachable-endpoint",
              timeoutMs: 10,
            },
          },
        },
        {
          id: "error_handler",
          type: "output",
          data: {
            config: { outputFormat: "json" },
          },
        },
      ],
      edges: [
        { id: "e1", source: "trig", target: "flaky_tool" },
        { id: "e_fail", source: "flaky_tool", target: "error_handler", branch: "on_failure" },
      ],
    };

    // Should complete gracefully without crashing the whole workflow!
    await orchestrator.runDAG({
      executionId,
      workflowId,
      workflowDefinition,
      inputs: {},
      mode: "real",
    });

    const exec = inMemoryExecutions.get(executionId);
    expect(exec?.status).toBe("completed");

    const runs = inMemoryNodeRuns.get(executionId) || [];
    const toolRun = runs.find((r) => r.nodeKey === "flaky_tool");
    const errorHandlerRun = runs.find((r) => r.nodeKey === "error_handler");

    expect(toolRun?.status).toBe("failed");
    expect(errorHandlerRun?.status).toBe("completed");
  });

  it("should fail execution immediately if directed cycle is detected in DAG", async () => {
    const orchestrator = new ExecutionOrchestrator();
    const executionId = `exec_cycle_${Date.now()}`;
    const workflowId = "test_cyclic_dag";

    inMemoryExecutions.set(executionId, {
      id: executionId,
      workflowId,
      versionNumber: 1,
      status: "running",
      triggerType: "manual",
      triggerPayload: {},
      startedAt: new Date().toISOString(),
      durationMs: 0,
      totalTokens: 0,
      promptTokens: 0,
      completionTokens: 0,
      totalCostUsd: 0,
      executionMode: "mock",
    });

    const cyclicWorkflow: any = {
      nodes: [
        { id: "node_A", type: "trigger", data: { config: {} } },
        { id: "node_B", type: "transform", data: { config: {} } },
        { id: "node_C", type: "output", data: { config: {} } },
      ],
      edges: [
        { id: "e1", source: "node_A", target: "node_B" },
        { id: "e2", source: "node_B", target: "node_C" },
        { id: "e3", source: "node_C", target: "node_A" }, // Creates cycle!
      ],
    };

    await expect(
      orchestrator.runDAG({
        executionId,
        workflowId,
        workflowDefinition: cyclicWorkflow,
        inputs: {},
        mode: "mock",
      })
    ).rejects.toThrow(/directed cycle/i);

    const exec = inMemoryExecutions.get(executionId);
    expect(exec?.status).toBe("failed");
    expect(exec?.errorMessage).toContain("cycle");
  });
});
