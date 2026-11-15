import { describe, it, expect, beforeEach } from "vitest";
import { useWorkflowStore } from "../../apps/web/src/store/workflowStore.js";
import { topologicalSortKahn } from "../../packages/shared/src/index.js";

describe("Frontend Canvas & Zustand Store Test Suite", () => {
  beforeEach(() => {
    // Reset store to known baseline before each test
    useWorkflowStore.getState().loadTemplate("support_triage");
  });

  describe("1. Store Initialization & Baseline Invariants", () => {
    it("should initialize with default support triage nodes, edges, and valid DAG topology", () => {
      const state = useWorkflowStore.getState();

      expect(state.nodes.length).toBeGreaterThanOrEqual(5);
      expect(state.edges.length).toBeGreaterThanOrEqual(4);
      expect(state.workflowTitle).toBe("Customer Support Triage & Auto-Escalation");
      expect(state.selectedNodeId).toBeNull();
      expect(state.executionStatus).toBe("idle");

      // Verify default graph is a valid DAG without cycles
      const validation = topologicalSortKahn(
        state.nodes.map((n) => n.id),
        state.edges.map((e) => ({ source: e.source, target: e.target }))
      );
      expect(validation.isValid).toBe(true);
      expect(validation.sortedOrder).toBeDefined();
    });

    it("should track node selection accurately", () => {
      const { selectNode } = useWorkflowStore.getState();

      selectNode("llm_1");
      expect(useWorkflowStore.getState().selectedNodeId).toBe("llm_1");

      selectNode(null);
      expect(useWorkflowStore.getState().selectedNodeId).toBeNull();
    });
  });

  describe("2. Node CRUD Operations", () => {
    it("should add a new node with typed configuration and default ports", () => {
      const initialCount = useWorkflowStore.getState().nodes.length;
      useWorkflowStore.getState().addNode("transform", { x: 500, y: 500 });

      const state = useWorkflowStore.getState();
      expect(state.nodes.length).toBe(initialCount + 1);

      const added = state.nodes[state.nodes.length - 1];
      expect(added.type).toBe("transform");
      expect(added.position).toEqual({ x: 500, y: 500 });
      expect(added.data.kind).toBe("transform");
      expect(added.data.label).toBe("JSON Transform");
      expect(state.selectedNodeId).toBe(added.id);
    });

    it("should duplicate an existing node with offset position and distinct ID", () => {
      const initialCount = useWorkflowStore.getState().nodes.length;
      useWorkflowStore.getState().duplicateNode("llm_1");

      const state = useWorkflowStore.getState();
      expect(state.nodes.length).toBe(initialCount + 1);

      const duplicated = state.nodes[state.nodes.length - 1];
      expect(duplicated.id).not.toBe("llm_1");
      expect(duplicated.type).toBe("llm");
      expect(duplicated.position.x).toBe(720 + 40);
      expect(duplicated.position.y).toBe(150 + 40);
    });

    it("should remove a node and cascade-delete connected edges", () => {
      const initialNodes = useWorkflowStore.getState().nodes.length;
      const initialEdges = useWorkflowStore.getState().edges.length;

      // Ensure cond_1 has connected edges
      const connectedEdges = useWorkflowStore
        .getState()
        .edges.filter((e) => e.source === "cond_1" || e.target === "cond_1");
      expect(connectedEdges.length).toBeGreaterThan(0);

      useWorkflowStore.getState().removeNode("cond_1");

      const state = useWorkflowStore.getState();
      expect(state.nodes.length).toBe(initialNodes - 1);
      expect(state.nodes.find((n) => n.id === "cond_1")).toBeUndefined();

      // Edges referencing cond_1 should be cleanly removed
      const remainingConnectedEdges = state.edges.filter(
        (e) => e.source === "cond_1" || e.target === "cond_1"
      );
      expect(remainingConnectedEdges.length).toBe(0);
      expect(state.edges.length).toBe(initialEdges - connectedEdges.length);
    });

    it("should update node configuration reactively", () => {
      useWorkflowStore.getState().updateNodeConfig("llm_1", {
        temperature: 0.85,
        model: "gemini-1.5-pro",
        jsonMode: true,
      });

      const node = useWorkflowStore.getState().nodes.find((n) => n.id === "llm_1");
      expect(node).toBeDefined();
      const config = (node?.data as any).config;
      expect(config.temperature).toBe(0.85);
      expect(config.model).toBe("gemini-1.5-pro");
      expect(config.jsonMode).toBe(true);
    });
  });

  describe("3. Edge Connection Validation & Cycle Invariants", () => {
    it("should reject self-connecting edges", () => {
      const edgesBefore = useWorkflowStore.getState().edges.length;

      useWorkflowStore.getState().onConnect({
        source: "llm_1",
        sourceHandle: "output",
        target: "llm_1",
        targetHandle: "input",
      });

      expect(useWorkflowStore.getState().edges.length).toBe(edgesBefore);
    });

    it("should prevent cycle creation in DAG (reject backward edge creating loop)", () => {
      // In support triage, path is: trigger_1 -> prompt_1 -> llm_1 -> cond_1 -> tool_1
      const edgesBefore = useWorkflowStore.getState().edges.length;

      // Attempt to connect downstream tool_1 back to upstream trigger_1
      useWorkflowStore.getState().onConnect({
        source: "tool_1",
        sourceHandle: "response",
        target: "trigger_1",
        targetHandle: "input",
      });

      // Connection should be rejected by Kahn's cycle detector
      expect(useWorkflowStore.getState().edges.length).toBe(edgesBefore);
    });

    it("should allow valid non-cyclic forward connections", () => {
      // Add new output node
      useWorkflowStore.getState().addNode("output", { x: 1800, y: 150 });
      const newOutputId = useWorkflowStore.getState().selectedNodeId!;
      const edgesBefore = useWorkflowStore.getState().edges.length;

      useWorkflowStore.getState().onConnect({
        source: "tool_1",
        sourceHandle: "response",
        target: newOutputId,
        targetHandle: "input",
      });

      expect(useWorkflowStore.getState().edges.length).toBe(edgesBefore + 1);
    });
  });

  describe("4. Undo / Redo History Stack Invariants", () => {
    it("should maintain snapshots and enable undo/redo navigation", () => {
      const store = useWorkflowStore.getState();
      const baselineCount = store.nodes.length;

      // Action 1: Add a node
      store.addNode("prompt", { x: 100, y: 100 });
      expect(useWorkflowStore.getState().nodes.length).toBe(baselineCount + 1);
      expect(useWorkflowStore.getState().canUndo).toBe(true);
      expect(useWorkflowStore.getState().canRedo).toBe(false);

      // Action 2: Add another node
      useWorkflowStore.getState().addNode("tool", { x: 200, y: 200 });
      expect(useWorkflowStore.getState().nodes.length).toBe(baselineCount + 2);

      // Undo Action 2
      useWorkflowStore.getState().undo();
      expect(useWorkflowStore.getState().nodes.length).toBe(baselineCount + 1);
      expect(useWorkflowStore.getState().canRedo).toBe(true);

      // Undo Action 1
      useWorkflowStore.getState().undo();
      expect(useWorkflowStore.getState().nodes.length).toBe(baselineCount);

      // Redo Action 1
      useWorkflowStore.getState().redo();
      expect(useWorkflowStore.getState().nodes.length).toBe(baselineCount + 1);

      // Redo Action 2
      useWorkflowStore.getState().redo();
      expect(useWorkflowStore.getState().nodes.length).toBe(baselineCount + 2);
    });

    it("should truncate future redo states if a new action is performed after undo", () => {
      const store = useWorkflowStore.getState();
      const baselineCount = store.nodes.length;

      store.addNode("prompt", { x: 100, y: 100 });
      store.addNode("tool", { x: 200, y: 200 });
      expect(useWorkflowStore.getState().nodes.length).toBe(baselineCount + 2);

      // Undo back 1 step
      useWorkflowStore.getState().undo();
      expect(useWorkflowStore.getState().canRedo).toBe(true);

      // Perform a new divergent action
      useWorkflowStore.getState().addNode("approval", { x: 300, y: 300 });

      // Redo should now be invalidated
      expect(useWorkflowStore.getState().canRedo).toBe(false);
      expect(useWorkflowStore.getState().nodes.length).toBe(baselineCount + 2);
    });
  });

  describe("5. Workflow JSON Export & Import", () => {
    it("should export full workflow definition into valid JSON string", () => {
      const json = useWorkflowStore.getState().exportWorkflowJson();
      expect(typeof json).toBe("string");

      const parsed = JSON.parse(json);
      expect(parsed.version).toBe("1.0.0");
      expect(parsed.metadata.title).toBe("Customer Support Triage & Auto-Escalation");
      expect(Array.isArray(parsed.nodes)).toBe(true);
      expect(Array.isArray(parsed.edges)).toBe(true);
      expect(parsed.nodes.length).toBe(useWorkflowStore.getState().nodes.length);
    });

    it("should import a serialized workflow and restore nodes, edges, and title", () => {
      const testWorkflow = {
        version: "1.0.0",
        metadata: {
          title: "Imported Forensic DAG",
          description: "High-priority security triage",
        },
        nodes: [
          {
            id: "ingress_webhook",
            type: "trigger",
            position: { x: 0, y: 0 },
            data: { kind: "trigger", label: "Ingress", inputs: [], outputs: [] },
          },
          {
            id: "egress_sink",
            type: "output",
            position: { x: 400, y: 0 },
            data: { kind: "output", label: "Egress", inputs: [], outputs: [] },
          },
        ],
        edges: [
          {
            id: "e_ing_egr",
            source: "ingress_webhook",
            sourceHandle: "output",
            target: "egress_sink",
            targetHandle: "input",
          },
        ],
      };

      const success = useWorkflowStore.getState().importWorkflowJson(JSON.stringify(testWorkflow));
      expect(success).toBe(true);

      const state = useWorkflowStore.getState();
      expect(state.workflowTitle).toBe("Imported Forensic DAG");
      expect(state.nodes.length).toBe(2);
      expect(state.edges.length).toBe(1);
    });
  });

  describe("6. Workflow Templates", () => {
    it("should load the Document Summarizer template with correct structure", () => {
      useWorkflowStore.getState().loadTemplate("doc_summarizer");
      const state = useWorkflowStore.getState();

      expect(state.workflowId).toBe("wf_doc_summarizer");
      expect(state.workflowTitle).toBe("Document Summarizer & Executive Briefing");
      expect(state.nodes.some((n) => n.id === "trig_doc")).toBe(true);
      expect(state.nodes.some((n) => n.id === "llm_doc")).toBe(true);
      expect(state.nodes.some((n) => n.id === "out_doc")).toBe(true);
    });

    it("should load the Lead Extractor template with human approval gate", () => {
      useWorkflowStore.getState().loadTemplate("lead_extractor");
      const state = useWorkflowStore.getState();

      expect(state.workflowId).toBe("wf_lead_extractor");
      expect(state.nodes.some((n) => n.id === "approval_vip")).toBe(true);
      expect(state.nodes.some((n) => n.id === "cond_lead")).toBe(true);
    });
  });

  describe("7. Execution Runner & Telemetry Tracking", () => {
    it("should execute DAG simulation, stream chunks, and compute metrics", async () => {
      const store = useWorkflowStore.getState();

      // Clear previous telemetry
      store.resetTelemetry();
      expect(useWorkflowStore.getState().executionStatus).toBe("idle");

      // Run execution
      await store.runExecution("mock");

      const state = useWorkflowStore.getState();
      expect(state.executionStatus).toBe("completed");
      expect(state.activeExecutionId).toBeDefined();

      // Check node telemetry
      const llmTelemetry = state.nodeTelemetry["llm_1"];
      expect(llmTelemetry).toBeDefined();
      expect(llmTelemetry.status).toBe("completed");
      expect(llmTelemetry.promptTokens).toBeGreaterThan(0);
      expect(llmTelemetry.costUsd).toBeGreaterThan(0);
      expect(llmTelemetry.streamText).toContain("Sentiment");

      // Verify execution history recorded the run
      expect(state.executionHistory.length).toBeGreaterThan(2);
      const latestRun = state.executionHistory[0];
      expect(latestRun.status).toBe("completed");
      expect(latestRun.totalTokens).toBeGreaterThan(0);
    });
  });
});
