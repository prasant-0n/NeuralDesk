import { create } from "zustand";
import {
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react";
import {
  type NodeKind,
  type NodeExecutionStatus,
  topologicalSortKahn,
} from "@neuraldesk/shared";

export interface NodeTelemetry {
  status: NodeExecutionStatus;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  promptTokens?: number;
  completionTokens?: number;
  costUsd?: number;
  streamText?: string;
  inputData?: unknown;
  outputData?: unknown;
  error?: string;
}

export interface ExecutionRecord {
  id: string;
  workflowId: string;
  status: "completed" | "failed" | "running";
  triggerSource: "manual" | "webhook" | "schedule";
  startedAt: string;
  durationMs: number;
  totalTokens: number;
  costUsd: number;
  nodeStatuses: Record<string, NodeExecutionStatus>;
  nodeOutputs: Record<string, unknown>;
}

export interface WorkflowSnapshot {
  nodes: Node[];
  edges: Edge[];
}

export interface WorkflowStoreState {
  workflowId: string;
  workflowTitle: string;
  workflowDescription: string;
  isDirty: boolean;
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;

  // Execution state
  activeExecutionId: string | null;
  executionStatus: "idle" | "running" | "completed" | "failed";
  nodeTelemetry: Record<string, NodeTelemetry>;
  executionHistory: ExecutionRecord[];

  // Undo / Redo (max 50 steps)
  history: WorkflowSnapshot[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;

  // Canvas Actions
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  selectNode: (nodeId: string | null) => void;
  addNode: (kind: NodeKind, position?: { x: number; y: number }, initialData?: Record<string, unknown>) => void;
  removeNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  updateNodeData: (nodeId: string, dataUpdate: Record<string, unknown>) => void;
  updateNodeConfig: (nodeId: string, configUpdate: Record<string, unknown>) => void;
  setWorkflowTitle: (title: string) => void;
  clearCanvas: () => void;

  // History Actions
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  // Execution Actions
  isSaving: boolean;
  isStreaming: boolean;
  setExecutionStatus: (status: "idle" | "running" | "completed" | "failed") => void;
  updateNodeTelemetry: (nodeId: string, telemetry: Partial<NodeTelemetry>) => void;
  appendStreamChunk: (nodeId: string, chunk: string) => void;
  resetTelemetry: () => void;
  runExecution: (mode?: "live" | "mock" | "client_mock", apiKey?: string) => Promise<void>;
  executeWorkflowViaApi: (mode?: "live" | "mock", apiKey?: string) => Promise<void>;
  runClientSimulation: () => Promise<void>;
  saveWorkflowToApi: () => Promise<boolean>;
  fetchExecutionsFromApi: () => Promise<void>;
  cancelExecution: () => void;

  // Import / Export & Templates
  exportWorkflowJson: () => string;
  importWorkflowJson: (jsonString: string) => boolean;
  loadTemplate: (templateId: "support_triage" | "doc_summarizer" | "lead_extractor") => void;
}

const MAX_HISTORY = 50;

function createDefaultNodeData(kind: NodeKind, label?: string): Record<string, unknown> {
  switch (kind) {
    case "trigger":
      return {
        kind: "trigger",
        label: label ?? "Webhook Trigger",
        description: "Receives ingress payloads or manual events",
        inputs: [],
        outputs: [{ id: "output", name: "Payload", type: "object" }],
        config: {
          triggerType: "webhook",
          webhookPath: "/api/v1/ingress/webhook-1",
          webhookMethod: "POST",
          samplePayload: { text: "Critical: Payment processing gateway timeout on charge #9382." },
        },
      };
    case "llm":
      return {
        kind: "llm",
        label: label ?? "Gemini 1.5 Flash",
        description: "High-throughput cognitive inference & reasoning",
        inputs: [
          { id: "input", name: "Prompt", type: "string" },
          { id: "context", name: "Context", type: "any" },
        ],
        outputs: [
          { id: "output", name: "Response", type: "string" },
          { id: "raw", name: "Metadata", type: "object" },
        ],
        config: {
          provider: "gemini",
          model: "gemini-1.5-flash",
          temperature: 0.3,
          topP: 0.95,
          maxTokens: 2048,
          jsonMode: false,
          systemPrompt: "You are an enterprise AI workflow assistant providing crisp, accurate analyses.",
          userPromptTemplate: "{{input}}",
        },
      };
    case "prompt":
      return {
        kind: "prompt",
        label: label ?? "Prompt Template",
        description: "Mustache interpolation template with ports",
        inputs: [{ id: "customer_message", name: "customer_message", type: "string" }],
        outputs: [{ id: "prompt", name: "Rendered Prompt", type: "string" }],
        config: {
          template: "Analyze the following customer ticket:\n\n{{customer_message}}\n\nIdentify intent, sentiment (POSITIVE/NEUTRAL/NEGATIVE), and priority (1-5).",
          variables: [{ name: "customer_message", type: "string", required: true }],
        },
      };
    case "condition":
      return {
        kind: "condition",
        label: label ?? "Branch Router",
        description: "Conditional routing for downstream branching",
        inputs: [{ id: "input", name: "Input", type: "any" }],
        outputs: [
          { id: "true", name: "True", type: "any" },
          { id: "false", name: "False", type: "any" },
        ],
        config: {
          expression: "{{sentiment}} == 'NEGATIVE' || {{priority}} >= 4",
          logicalOperator: "OR",
          fallbackBranch: "false",
          rules: [{ leftPath: "sentiment", operator: "==", rightValue: "NEGATIVE" }],
        },
      };
    case "transform":
      return {
        kind: "transform",
        label: label ?? "JSON Transform",
        description: "Extract, map, and reshape structured payloads",
        inputs: [{ id: "input", name: "Raw Data", type: "any" }],
        outputs: [{ id: "output", name: "Reshaped", type: "object" }],
        config: {
          transformType: "json_pick",
          rules: [
            { targetKey: "summary", sourceExpression: "response.summary" },
            { targetKey: "urgency", sourceExpression: "response.priority" },
          ],
        },
      };
    case "tool":
      return {
        kind: "tool",
        label: label ?? "HTTP Webhook / API",
        description: "Invokes third-party endpoints with timeout & retry",
        inputs: [
          { id: "trigger", name: "Trigger", type: "any" },
          { id: "params", name: "Params", type: "object" },
        ],
        outputs: [
          { id: "response", name: "Response", type: "object" },
          { id: "on_failure", name: "On Failure", type: "object" },
        ],
        config: {
          toolType: "http_request",
          httpMethod: "POST",
          url: "https://api.internal.service/triage-alert",
          timeoutMs: 5000,
          retryCount: 2,
          authType: "none",
        },
      };
    case "approval":
      return {
        kind: "approval",
        label: label ?? "Human-in-the-Loop Gate",
        description: "Pauses execution for reviewer sign-off",
        inputs: [{ id: "input", name: "Candidate", type: "any" }],
        outputs: [
          { id: "approved", name: "Approved", type: "any" },
          { id: "rejected", name: "Rejected", type: "any" },
        ],
        config: {
          approverRole: "Engineering Lead",
          timeoutMinutes: 60,
          autoActionOnTimeout: "reject",
          instructions: "Review model findings before dispatching alert to customer support.",
        },
      };
    case "output":
      return {
        kind: "output",
        label: label ?? "Final Output",
        description: "Terminal egress viewer with JSON & Markdown export",
        inputs: [{ id: "input", name: "Payload", type: "any" }],
        outputs: [],
        config: {
          outputFormat: "json",
          enableDownload: true,
          primaryOutputKey: "result",
        },
      };
    default:
      return {
        kind,
        label: "Custom Node",
        inputs: [{ id: "input", name: "Input", type: "any" }],
        outputs: [{ id: "output", name: "Output", type: "any" }],
        config: {},
      };
  }
}

// Initial Support Triage Template
const DEFAULT_NODES: Node[] = [
  {
    id: "trigger_1",
    type: "trigger",
    position: { x: 50, y: 150 },
    data: createDefaultNodeData("trigger", "Customer Inbound"),
  },
  {
    id: "prompt_1",
    type: "prompt",
    position: { x: 380, y: 150 },
    data: createDefaultNodeData("prompt", "Triage Classifier"),
  },
  {
    id: "llm_1",
    type: "llm",
    position: { x: 720, y: 150 },
    data: {
      ...createDefaultNodeData("llm", "Gemini 1.5 Flash"),
      config: {
        provider: "gemini",
        model: "gemini-1.5-flash",
        temperature: 0.2,
        topP: 0.9,
        maxTokens: 1024,
        jsonMode: true,
        systemPrompt: "You are an automated support classifier. Output JSON with { 'sentiment': 'NEGATIVE' | 'NEUTRAL' | 'POSITIVE', 'urgency': 1-5, 'summary': string }.",
        userPromptTemplate: "{{input}}",
      },
    },
  },
  {
    id: "cond_1",
    type: "condition",
    position: { x: 1080, y: 150 },
    data: createDefaultNodeData("condition", "Urgency Gate"),
  },
  {
    id: "tool_1",
    type: "tool",
    position: { x: 1420, y: 60 },
    data: createDefaultNodeData("tool", "Slack Pager Alert"),
  },
  {
    id: "out_1",
    type: "output",
    position: { x: 1420, y: 280 },
    data: createDefaultNodeData("output", "Standard Triage Result"),
  },
];

const DEFAULT_EDGES: Edge[] = [
  { id: "e1", source: "trigger_1", sourceHandle: "output", target: "prompt_1", targetHandle: "customer_message", type: "custom" },
  { id: "e2", source: "prompt_1", sourceHandle: "prompt", target: "llm_1", targetHandle: "input", type: "custom" },
  { id: "e3", source: "llm_1", sourceHandle: "output", target: "cond_1", targetHandle: "input", type: "custom" },
  { id: "e4", source: "cond_1", sourceHandle: "true", target: "tool_1", targetHandle: "params", type: "custom", data: { branch: "true" } },
  { id: "e5", source: "cond_1", sourceHandle: "false", target: "out_1", targetHandle: "input", type: "custom", data: { branch: "false" } },
];

let executionAbortController: AbortController | null = null;
let activeEventSource: EventSource | null = null;

export const useWorkflowStore = create<WorkflowStoreState>((set, get) => ({
  workflowId: "wf_prod_support_triage",
  workflowTitle: "Customer Support Triage & Auto-Escalation",
  workflowDescription: "Classifies incoming customer complaints, isolates negative sentiment, and pages on-call engineer.",
  isDirty: false,
  isSaving: false,
  isStreaming: false,
  nodes: DEFAULT_NODES,
  edges: DEFAULT_EDGES,
  selectedNodeId: null,

  activeExecutionId: null,
  executionStatus: "idle",
  nodeTelemetry: {},
  executionHistory: [
    {
      id: "exec_hist_1",
      workflowId: "wf_prod_support_triage",
      status: "completed",
      triggerSource: "webhook",
      startedAt: new Date(Date.now() - 3600000).toISOString(),
      durationMs: 742,
      totalTokens: 418,
      costUsd: 0.000185,
      nodeStatuses: {
        trigger_1: "completed",
        prompt_1: "completed",
        llm_1: "completed",
        cond_1: "completed",
        tool_1: "completed",
        out_1: "skipped",
      },
      nodeOutputs: {
        llm_1: { sentiment: "NEGATIVE", urgency: 5, summary: "Payment gateway timeout reported" },
      },
    },
    {
      id: "exec_hist_2",
      workflowId: "wf_prod_support_triage",
      status: "completed",
      triggerSource: "manual",
      startedAt: new Date(Date.now() - 7200000).toISOString(),
      durationMs: 620,
      totalTokens: 380,
      costUsd: 0.000155,
      nodeStatuses: {
        trigger_1: "completed",
        prompt_1: "completed",
        llm_1: "completed",
        cond_1: "completed",
        tool_1: "skipped",
        out_1: "completed",
      },
      nodeOutputs: {
        llm_1: { sentiment: "POSITIVE", urgency: 1, summary: "Thank you note from customer" },
      },
    },
  ],

  history: [{ nodes: DEFAULT_NODES, edges: DEFAULT_EDGES }],
  historyIndex: 0,
  canUndo: false,
  canRedo: false,

  pushHistory: () => {
    const { history, historyIndex, nodes, edges } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    if (newHistory.length >= MAX_HISTORY) {
      newHistory.shift();
    }
    newHistory.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    });
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
      canUndo: newHistory.length > 1,
      canRedo: false,
      isDirty: true,
    });
  },

  onNodesChange: (changes: NodeChange[]) => {
    const nextNodes = applyNodeChanges(changes, get().nodes);
    set({ nodes: nextNodes });
    const hasStructureOrPositionChange = changes.some(
      (c) => c.type === "remove" || c.type === "add" || (c.type === "position" && !c.dragging)
    );
    if (hasStructureOrPositionChange) {
      get().pushHistory();
    }
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    const nextEdges = applyEdgeChanges(changes, get().edges);
    set({ edges: nextEdges });
    const hasRemoval = changes.some((c) => c.type === "remove");
    if (hasRemoval) {
      get().pushHistory();
    }
  },

  onConnect: (connection: Connection) => {
    const { nodes, edges } = get();
    // Prevent self-connections
    if (connection.source === connection.target) return;

    // Cycle detection check
    const testEdges = [...edges, { ...connection, id: "temp_test" }].map((e) => ({
      source: e.source,
      target: e.target,
    }));
    const validation = topologicalSortKahn(
      nodes.map((n) => n.id),
      testEdges
    );

    if (!validation.isValid) {
      console.warn("Connection rejected: Directed cycle detected in workflow DAG.");
      return;
    }

    const newEdge: Edge = {
      ...connection,
      id: `e_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: "custom",
      animated: false,
      data: {
        branch: connection.sourceHandle?.includes("true")
          ? "true"
          : connection.sourceHandle?.includes("false")
          ? "false"
          : connection.sourceHandle?.includes("fail")
          ? "on_failure"
          : undefined,
      },
    };

    set({ edges: addEdge(newEdge, edges) });
    get().pushHistory();
  },

  selectNode: (nodeId: string | null) => set({ selectedNodeId: nodeId }),

  addNode: (kind: NodeKind, position, initialData) => {
    const { nodes } = get();
    const id = `${kind}_${Date.now().toString(36).slice(-4)}`;
    const pos = position ?? {
      x: 200 + (nodes.length % 5) * 60,
      y: 150 + (nodes.length % 5) * 60,
    };
    const nodeData = initialData ?? createDefaultNodeData(kind);

    const newNode: Node = {
      id,
      type: kind,
      position: pos,
      data: nodeData,
    };

    set({ nodes: [...nodes, newNode], selectedNodeId: id });
    get().pushHistory();
  },

  removeNode: (nodeId: string) => {
    const { nodes, edges, selectedNodeId } = get();
    const nextNodes = nodes.filter((n) => n.id !== nodeId);
    const nextEdges = edges.filter((e) => e.source !== nodeId && e.target !== nodeId);
    set({
      nodes: nextNodes,
      edges: nextEdges,
      selectedNodeId: selectedNodeId === nodeId ? null : selectedNodeId,
    });
    get().pushHistory();
  },

  duplicateNode: (nodeId: string) => {
    const { nodes } = get();
    const target = nodes.find((n) => n.id === nodeId);
    if (!target) return;

    const newId = `${target.type}_${Date.now().toString(36).slice(-4)}`;
    const clonedNode: Node = {
      ...target,
      id: newId,
      position: { x: target.position.x + 40, y: target.position.y + 40 },
      data: JSON.parse(JSON.stringify(target.data)),
      selected: true,
    };

    set({
      nodes: [...nodes.map((n) => ({ ...n, selected: false })), clonedNode],
      selectedNodeId: newId,
    });
    get().pushHistory();
  },

  updateNodeData: (nodeId: string, dataUpdate: Record<string, unknown>) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                ...dataUpdate,
              },
            }
          : node
      ),
      isDirty: true,
    });
  },

  updateNodeConfig: (nodeId: string, configUpdate: Record<string, unknown>) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id !== nodeId) return node;
        const currentData = (node.data || {}) as Record<string, unknown>;
        const currentConfig = (currentData.config || {}) as Record<string, unknown>;
        return {
          ...node,
          data: {
            ...currentData,
            config: {
              ...currentConfig,
              ...configUpdate,
            },
          },
        };
      }),
      isDirty: true,
    });
  },

  setWorkflowTitle: (title: string) => set({ workflowTitle: title, isDirty: true }),

  clearCanvas: () => {
    set({ nodes: [], edges: [], selectedNodeId: null, isDirty: true });
    get().pushHistory();
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      set({
        nodes: JSON.parse(JSON.stringify(prev.nodes)),
        edges: JSON.parse(JSON.stringify(prev.edges)),
        historyIndex: historyIndex - 1,
        canUndo: historyIndex - 1 > 0,
        canRedo: true,
        selectedNodeId: null,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      set({
        nodes: JSON.parse(JSON.stringify(next.nodes)),
        edges: JSON.parse(JSON.stringify(next.edges)),
        historyIndex: historyIndex + 1,
        canUndo: true,
        canRedo: historyIndex + 1 < history.length - 1,
        selectedNodeId: null,
      });
    }
  },

  setExecutionStatus: (status) => set({ executionStatus: status }),

  updateNodeTelemetry: (nodeId: string, telemetry: Partial<NodeTelemetry>) => {
    const current = get().nodeTelemetry[nodeId] || { status: "idle" };
    set({
      nodeTelemetry: {
        ...get().nodeTelemetry,
        [nodeId]: { ...current, ...telemetry },
      },
    });
  },

  appendStreamChunk: (nodeId: string, chunk: string) => {
    const current = get().nodeTelemetry[nodeId] || { status: "running" };
    set({
      nodeTelemetry: {
        ...get().nodeTelemetry,
        [nodeId]: {
          ...current,
          status: "running",
          streamText: (current.streamText || "") + chunk,
        },
      },
    });
  },

  resetTelemetry: () => set({ nodeTelemetry: {}, executionStatus: "idle", activeExecutionId: null }),

  cancelExecution: () => {
    if (executionAbortController) {
      executionAbortController.abort();
      executionAbortController = null;
    }
    if (activeEventSource) {
      activeEventSource.close();
      activeEventSource = null;
    }
    set({ executionStatus: "idle", isStreaming: false });
  },

  executeWorkflowViaApi: async (mode = "mock", apiKey = "") => {
    const { nodes, edges, workflowId } = get();
    if (nodes.length === 0) return;

    if (executionAbortController) {
      executionAbortController.abort();
    }
    if (activeEventSource) {
      activeEventSource.close();
      activeEventSource = null;
    }
    executionAbortController = new AbortController();

    // 1. Validate DAG locally with Kahn's algorithm
    const validation = topologicalSortKahn(
      nodes.map((n) => n.id),
      edges.map((e) => ({ source: e.source, target: e.target }))
    );

    if (!validation.isValid || !validation.sortedOrder) {
      set({ executionStatus: "failed" });
      alert(`DAG Validation Error: ${validation.error || "Cycle detected in workflow DAG"}`);
      return;
    }

    set({
      executionStatus: "running",
      isStreaming: true,
      nodeTelemetry: {},
    });

    const executionStart = Date.now();
    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;
    let totalCostUsd = 0;
    const nodeOutputsMap: Record<string, unknown> = {};

    try {
      const response = await fetch(`/api/v1/workflows/${workflowId}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: mode === "live" ? "real" : "simulation",
          workflowDefinition: { nodes, edges },
          apiKey: apiKey || undefined,
          inputs: {},
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.title || `API execution rejected (${response.status})`);
      }

      const { execution_id, stream_url } = await response.json();
      set({ activeExecutionId: execution_id });

      const sseUrl = stream_url || `/api/v1/executions/${execution_id}/stream`;
      const eventSource = new EventSource(sseUrl);
      activeEventSource = eventSource;

      eventSource.addEventListener("execution:start", () => {
        set({ executionStatus: "running" });
      });

      eventSource.addEventListener("node:start", (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          get().updateNodeTelemetry(data.node_key, {
            status: "running",
            startedAt: data.started_at || new Date().toISOString(),
            streamText: "",
          });
        } catch {}
      });

      eventSource.addEventListener("node:stream:chunk", (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data.chunk) {
            get().appendStreamChunk(data.node_key, data.chunk);
          }
        } catch {}
      });

      eventSource.addEventListener("node:complete", (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          const promptTokens = data.prompt_tokens || 0;
          const completionTokens = data.completion_tokens || 0;
          const cost = data.cost_usd || 0;
          totalPromptTokens += promptTokens;
          totalCompletionTokens += completionTokens;
          totalCostUsd += cost;

          if (data.outputs) {
            nodeOutputsMap[data.node_key] = data.outputs;
          }

          get().updateNodeTelemetry(data.node_key, {
            status: "completed",
            finishedAt: new Date().toISOString(),
            durationMs: data.duration_ms,
            promptTokens,
            completionTokens,
            costUsd: cost,
            outputData: data.outputs,
          });
        } catch {}
      });

      eventSource.addEventListener("node:skip", (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          get().updateNodeTelemetry(data.node_key, {
            status: "skipped",
          });
        } catch {}
      });

      eventSource.addEventListener("node:error", (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          get().updateNodeTelemetry(data.node_key, {
            status: "failed",
            error: data.error_message || "Node execution failed",
          });
        } catch {}
      });

      eventSource.addEventListener("execution:complete", (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          const totalDurationMs = data.duration_ms || (Date.now() - executionStart);
          const finalCost = data.total_cost_usd !== undefined ? data.total_cost_usd : totalCostUsd;
          const finalTokens = data.total_tokens !== undefined ? data.total_tokens : (totalPromptTokens + totalCompletionTokens);

          set({ executionStatus: "completed", isStreaming: false });

          const newRecord: ExecutionRecord = {
            id: execution_id,
            workflowId: get().workflowId,
            status: "completed",
            triggerSource: "manual",
            startedAt: new Date(executionStart).toISOString(),
            durationMs: totalDurationMs,
            totalTokens: finalTokens,
            costUsd: finalCost,
            nodeStatuses: Object.fromEntries(
              Object.entries(get().nodeTelemetry).map(([k, v]) => [k, v.status])
            ),
            nodeOutputs: data.final_outputs || nodeOutputsMap,
          };

          set({
            executionHistory: [newRecord, ...get().executionHistory],
          });
        } finally {
          eventSource.close();
          activeEventSource = null;
        }
      });

      eventSource.addEventListener("execution:error", (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          set({ executionStatus: "failed", isStreaming: false });
          alert(`Execution Failed: ${data.error_message || "Internal DAG error"}`);
        } finally {
          eventSource.close();
          activeEventSource = null;
        }
      });

      eventSource.onerror = () => {
        if (get().executionStatus !== "running") {
          eventSource.close();
          activeEventSource = null;
        }
      };
    } catch (err: any) {
      console.error("Execute via API error:", err);
      set({ executionStatus: "failed", isStreaming: false });
      alert(`API Execution Error: ${err.message || "Failed to contact backend API"}`);
    }
  },

  runClientSimulation: async () => {
    const { nodes, edges } = get();
    if (nodes.length === 0) return;

    if (executionAbortController) {
      executionAbortController.abort();
    }
    executionAbortController = new AbortController();
    const signal = executionAbortController.signal;

    // Validate DAG
    const validation = topologicalSortKahn(
      nodes.map((n) => n.id),
      edges.map((e) => ({ source: e.source, target: e.target }))
    );

    if (!validation.isValid || !validation.sortedOrder) {
      set({ executionStatus: "failed" });
      alert(`Execution Error: Workflow has cycles or invalid connections: ${validation.error || "Cycle detected"}`);
      return;
    }

    const execId = `exec_${Date.now().toString(36)}`;
    set({
      executionStatus: "running",
      activeExecutionId: execId,
      nodeTelemetry: {},
    });

    const executionStart = Date.now();
    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;
    let totalCostUsd = 0;

    const nodeOutputsMap: Record<string, unknown> = {};
    const skippedNodeIds = new Set<string>();

    try {
      for (const nodeId of validation.sortedOrder) {
        if (signal.aborted) break;

        const node = nodes.find((n) => n.id === nodeId);
        if (!node) continue;

        // If upstream condition routed away, skip this node
        if (skippedNodeIds.has(nodeId)) {
          get().updateNodeTelemetry(nodeId, {
            status: "skipped",
          });
          continue;
        }

        const nodeStartTime = Date.now();
        get().updateNodeTelemetry(nodeId, {
          status: "running",
          startedAt: new Date().toISOString(),
          streamText: "",
        });

        // Simulate or execute node logic
        const nodeData = (node.data || {}) as Record<string, unknown>;
        const nodeKind = (node.type || nodeData.kind || "prompt") as NodeKind;
        const config = (nodeData.config || {}) as Record<string, unknown>;

        // Simulate token streaming and latency
        if (nodeKind === "llm") {
          const sampleWords = [
            "Analyzing", " ticket", " context...", " Sentiment", " confirmed", " as", " NEGATIVE.",
            " Urgency", " rating", " 5/5.", " Issue", " escalated", " to", " Tier-3", " Engineering.",
          ];

          for (const word of sampleWords) {
            if (signal.aborted) break;
            await new Promise((r) => setTimeout(r, 60));
            get().appendStreamChunk(nodeId, word);
          }

          const promptTokens = 124;
          const completionTokens = 48;
          const cost = (promptTokens * 0.075 + completionTokens * 0.3) / 1_000_000;

          totalPromptTokens += promptTokens;
          totalCompletionTokens += completionTokens;
          totalCostUsd += cost;

          const outputResult = {
            sentiment: "NEGATIVE",
            urgency: 5,
            summary: "Critical payment processing timeout on charge #9382",
            requiresEscalation: true,
          };
          nodeOutputsMap[nodeId] = outputResult;

          get().updateNodeTelemetry(nodeId, {
            status: "completed",
            finishedAt: new Date().toISOString(),
            durationMs: Date.now() - nodeStartTime,
            promptTokens,
            completionTokens,
            costUsd: cost,
            outputData: outputResult,
          });
        } else if (nodeKind === "condition") {
          await new Promise((r) => setTimeout(r, 120));
          const evaluatedBranch: "true" | "false" = "true"; // Simulation triggers true branch
          nodeOutputsMap[nodeId] = { branch: evaluatedBranch };

          // Mark unselected branch downstream nodes as skipped
          edges
            .filter((e) => e.source === nodeId && e.data?.branch !== evaluatedBranch)
            .forEach((unselectedEdge) => {
              skippedNodeIds.add(unselectedEdge.target);
            });

          get().updateNodeTelemetry(nodeId, {
            status: "completed",
            finishedAt: new Date().toISOString(),
            durationMs: Date.now() - nodeStartTime,
            outputData: { selectedBranch: evaluatedBranch },
          });
        } else if (nodeKind === "trigger") {
          await new Promise((r) => setTimeout(r, 50));
          const triggerOutput = config.samplePayload || { event: "manual_trigger", timestamp: new Date().toISOString() };
          nodeOutputsMap[nodeId] = triggerOutput;

          get().updateNodeTelemetry(nodeId, {
            status: "completed",
            finishedAt: new Date().toISOString(),
            durationMs: Date.now() - nodeStartTime,
            outputData: triggerOutput,
          });
        } else if (nodeKind === "tool") {
          await new Promise((r) => setTimeout(r, 180));
          const toolResult = {
            status: 200,
            channel: "#incident-escalations",
            messageId: "msg_slack_9832",
            delivered: true,
          };
          nodeOutputsMap[nodeId] = toolResult;

          get().updateNodeTelemetry(nodeId, {
            status: "completed",
            finishedAt: new Date().toISOString(),
            durationMs: Date.now() - nodeStartTime,
            outputData: toolResult,
          });
        } else if (nodeKind === "prompt") {
          await new Promise((r) => setTimeout(r, 80));
          const rendered = "Rendered prompt: Analyze customer ticket and classify urgency.";
          nodeOutputsMap[nodeId] = rendered;

          get().updateNodeTelemetry(nodeId, {
            status: "completed",
            finishedAt: new Date().toISOString(),
            durationMs: Date.now() - nodeStartTime,
            outputData: rendered,
          });
        } else {
          // General nodes (output, transform, approval)
          await new Promise((r) => setTimeout(r, 100));
          const genericOutput = { status: "processed", nodeKind, timestamp: new Date().toISOString() };
          nodeOutputsMap[nodeId] = genericOutput;

          get().updateNodeTelemetry(nodeId, {
            status: "completed",
            finishedAt: new Date().toISOString(),
            durationMs: Date.now() - nodeStartTime,
            outputData: genericOutput,
          });
        }
      }

      if (!signal.aborted) {
        const totalDurationMs = Date.now() - executionStart;
        set({ executionStatus: "completed" });

        const newRecord: ExecutionRecord = {
          id: execId,
          workflowId: get().workflowId,
          status: "completed",
          triggerSource: "manual",
          startedAt: new Date(executionStart).toISOString(),
          durationMs: totalDurationMs,
          totalTokens: totalPromptTokens + totalCompletionTokens,
          costUsd: totalCostUsd,
          nodeStatuses: Object.fromEntries(
            Object.entries(get().nodeTelemetry).map(([k, v]) => [k, v.status])
          ),
          nodeOutputs: nodeOutputsMap,
        };

        set({
          executionHistory: [newRecord, ...get().executionHistory],
        });
      }
    } catch (err: unknown) {
      console.error("Execution failed:", err);
      set({ executionStatus: "failed" });
    }
  },

  runExecution: async (mode = "mock", apiKey = "") => {
    // Check if in browser environment with native EventSource support
    const hasEventSource = typeof window !== "undefined" && typeof (window as any).EventSource !== "undefined";
    if (hasEventSource && mode !== "client_mock") {
      try {
        await get().executeWorkflowViaApi(mode, apiKey);
        return;
      } catch (err) {
        console.warn("Backend execution encountered error, falling back to local simulation:", err);
      }
    }
    await get().runClientSimulation();
  },

  saveWorkflowToApi: async () => {
    const { workflowTitle, workflowDescription, nodes, edges } = get();
    set({ isSaving: true });
    try {
      const res = await fetch(`/api/v1/workflows`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workflowTitle,
          description: workflowDescription || undefined,
          category: "general",
          initialDefinition: { nodes, edges, viewport: { x: 0, y: 0, zoom: 1 } },
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to persist workflow to API");
      }
      set({ isDirty: false, isSaving: false });
      return true;
    } catch (err) {
      console.error("Save workflow error:", err);
      set({ isSaving: false });
      return false;
    }
  },

  fetchExecutionsFromApi: async () => {
    try {
      const res = await fetch("/api/v1/executions?limit=50");
      if (!res.ok) return;
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        const records: ExecutionRecord[] = json.data.map((item: any) => ({
          id: item.id,
          workflowId: item.workflowId,
          status: item.status === "completed" ? "completed" : item.status === "failed" ? "failed" : "running",
          triggerSource: item.triggerType || "manual",
          startedAt: item.startedAt,
          durationMs: item.durationMs || 0,
          totalTokens: item.totalTokens || 0,
          costUsd: item.totalCostUsd || 0,
          nodeStatuses: {},
          nodeOutputs: item.finalOutputs || {},
        }));
        // Merge with existing
        const existingIds = new Set(records.map((r) => r.id));
        const unmerged = get().executionHistory.filter((h) => !existingIds.has(h.id));
        set({ executionHistory: [...records, ...unmerged] });
      }
    } catch (err) {
      console.warn("Could not fetch server execution history:", err);
    }
  },

  exportWorkflowJson: () => {
    const { workflowId, workflowTitle, workflowDescription, nodes, edges } = get();
    const payload = {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      metadata: {
        id: workflowId,
        title: workflowTitle,
        description: workflowDescription,
      },
      nodes,
      edges,
    };
    return JSON.stringify(payload, null, 2);
  },

  importWorkflowJson: (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.nodes || !Array.isArray(parsed.nodes) || !parsed.edges || !Array.isArray(parsed.edges)) {
        throw new Error("Invalid workflow schema: Missing nodes or edges arrays.");
      }

      set({
        nodes: parsed.nodes,
        edges: parsed.edges,
        workflowTitle: parsed.metadata?.title || "Imported Workflow",
        workflowDescription: parsed.metadata?.description || "",
        selectedNodeId: null,
        isDirty: true,
      });

      get().pushHistory();
      return true;
    } catch (e) {
      console.error("Workflow import failed:", e);
      return false;
    }
  },

  loadTemplate: (templateId) => {
    if (templateId === "support_triage") {
      set({
        workflowId: "wf_support_triage",
        workflowTitle: "Customer Support Triage & Auto-Escalation",
        workflowDescription: "Classifies incoming customer complaints, isolates negative sentiment, and pages on-call engineer.",
        nodes: DEFAULT_NODES,
        edges: DEFAULT_EDGES,
        selectedNodeId: null,
      });
    } else if (templateId === "doc_summarizer") {
      const docNodes: Node[] = [
        {
          id: "trig_doc",
          type: "trigger",
          position: { x: 60, y: 180 },
          data: {
            ...createDefaultNodeData("trigger", "Manual Document Input"),
            config: {
              triggerType: "manual",
              samplePayload: { docText: "NeuralDesk is an enterprise AI workflow orchestration engine..." },
            },
          },
        },
        {
          id: "prompt_doc",
          type: "prompt",
          position: { x: 380, y: 180 },
          data: {
            ...createDefaultNodeData("prompt", "Summarization Prompt"),
            config: {
              template: "Summarize this technical document into 3 key takeaways and executive bullets:\n\n{{docText}}",
              variables: [{ name: "docText", type: "string", required: true }],
            },
          },
        },
        {
          id: "llm_doc",
          type: "llm",
          position: { x: 720, y: 180 },
          data: {
            ...createDefaultNodeData("llm", "Gemini 1.5 Pro"),
            config: {
              provider: "gemini",
              model: "gemini-1.5-pro",
              temperature: 0.1,
              topP: 0.95,
              maxTokens: 4096,
              jsonMode: false,
              systemPrompt: "You are an executive research analyst specializing in deep technical synthesis.",
            },
          },
        },
        {
          id: "transform_doc",
          type: "transform",
          position: { x: 1060, y: 180 },
          data: createDefaultNodeData("transform", "Markdown Formatting"),
        },
        {
          id: "out_doc",
          type: "output",
          position: { x: 1380, y: 180 },
          data: {
            ...createDefaultNodeData("output", "Executive Brief"),
            config: { outputFormat: "markdown", enableDownload: true },
          },
        },
      ];

      const docEdges: Edge[] = [
        { id: "de1", source: "trig_doc", sourceHandle: "output", target: "prompt_doc", targetHandle: "customer_message", type: "custom" },
        { id: "de2", source: "prompt_doc", sourceHandle: "prompt", target: "llm_doc", targetHandle: "input", type: "custom" },
        { id: "de3", source: "llm_doc", sourceHandle: "output", target: "transform_doc", targetHandle: "input", type: "custom" },
        { id: "de4", source: "transform_doc", sourceHandle: "output", target: "out_doc", targetHandle: "input", type: "custom" },
      ];

      set({
        workflowId: "wf_doc_summarizer",
        workflowTitle: "Document Summarizer & Executive Briefing",
        workflowDescription: "Synthesizes multi-page engineering documents into executive bullet points.",
        nodes: docNodes,
        edges: docEdges,
        selectedNodeId: null,
      });
    } else if (templateId === "lead_extractor") {
      const leadNodes: Node[] = [
        {
          id: "trig_lead",
          type: "trigger",
          position: { x: 60, y: 180 },
          data: {
            ...createDefaultNodeData("trigger", "Hourly Schedule"),
            config: { triggerType: "schedule", cronExpression: "0 * * * *" },
          },
        },
        {
          id: "tool_crm",
          type: "tool",
          position: { x: 380, y: 180 },
          data: {
            ...createDefaultNodeData("tool", "Fetch Unscored Leads"),
            config: {
              toolType: "http_request",
              httpMethod: "GET",
              url: "https://api.crm.internal/v1/leads?status=new",
            },
          },
        },
        {
          id: "llm_score",
          type: "llm",
          position: { x: 720, y: 180 },
          data: {
            ...createDefaultNodeData("llm", "Lead Scoring LLM"),
            config: {
              provider: "gemini",
              model: "gemini-1.5-flash",
              temperature: 0.2,
              jsonMode: true,
              systemPrompt: "Score lead intent from 0 to 100 and classify into VIP vs Standard.",
            },
          },
        },
        {
          id: "cond_lead",
          type: "condition",
          position: { x: 1060, y: 180 },
          data: {
            ...createDefaultNodeData("condition", "High Intent Filter (Score >= 80)"),
            config: {
              expression: "{{score}} >= 80",
              fallbackBranch: "false",
            },
          },
        },
        {
          id: "approval_vip",
          type: "approval",
          position: { x: 1400, y: 80 },
          data: {
            ...createDefaultNodeData("approval", "VP Sales Sign-Off"),
            config: { approverRole: "VP Sales", timeoutMinutes: 120 },
          },
        },
        {
          id: "out_vip",
          type: "output",
          position: { x: 1720, y: 80 },
          data: createDefaultNodeData("output", "VIP Sales Pipeline"),
        },
        {
          id: "out_standard",
          type: "output",
          position: { x: 1400, y: 300 },
          data: createDefaultNodeData("output", "Email Nurture Campaign"),
        },
      ];

      const leadEdges: Edge[] = [
        { id: "le1", source: "trig_lead", sourceHandle: "output", target: "tool_crm", targetHandle: "trigger", type: "custom" },
        { id: "le2", source: "tool_crm", sourceHandle: "response", target: "llm_score", targetHandle: "input", type: "custom" },
        { id: "le3", source: "llm_score", sourceHandle: "output", target: "cond_lead", targetHandle: "input", type: "custom" },
        { id: "le4", source: "cond_lead", sourceHandle: "true", target: "approval_vip", targetHandle: "input", type: "custom", data: { branch: "true" } },
        { id: "le5", source: "approval_vip", sourceHandle: "approved", target: "out_vip", targetHandle: "input", type: "custom" },
        { id: "le6", source: "cond_lead", sourceHandle: "false", target: "out_standard", targetHandle: "input", type: "custom", data: { branch: "false" } },
      ];

      set({
        workflowId: "wf_lead_extractor",
        workflowTitle: "Automated Lead Scoring & Enterprise CRM Routing",
        workflowDescription: "Fetches new inbound leads, computes conversion propensity, and notifies VIP SDRs.",
        nodes: leadNodes,
        edges: leadEdges,
        selectedNodeId: null,
      });
    }

    get().pushHistory();
  },
}));

if (typeof window !== "undefined") {
  (window as any).__WORKFLOW_STORE__ = useWorkflowStore;
}

