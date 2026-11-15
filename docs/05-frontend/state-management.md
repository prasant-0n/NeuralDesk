# 05. Frontend — State Management & Data Layer

[← Back to Documentation Portal](../README.md) | [← Canvas Architecture](./canvas-architecture.md) | [Next: Design System →](./design-system.md)

---

## 2.1 Zustand Canvas Store (`apps/web/src/stores/workflow-store.ts`)

```typescript
import { create } from "zustand";
import {
  Node,
  Edge,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  Connection,
  addEdge,
} from "@xyflow/react";

export type NodeExecutionState = "idle" | "running" | "completed" | "failed" | "skipped";

export interface NodeTelemetry {
  status: NodeExecutionState;
  durationMs?: number;
  promptTokens?: number;
  completionTokens?: number;
  costUsd?: number;
  streamText?: string;
  outputData?: unknown;
  error?: string;
}

export interface WorkflowState {
  workflowId: string | null;
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  isDirty: boolean;
  executionStatus: "idle" | "running" | "completed" | "failed";
  nodeTelemetry: Record<string, NodeTelemetry>;
  history: Array<{ nodes: Node[]; edges: Edge[] }>;
  historyIndex: number;

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  selectNode: (nodeId: string | null) => void;
  updateNodeConfig: (nodeId: string, config: Record<string, unknown>) => void;
  setExecutionStatus: (status: "idle" | "running" | "completed" | "failed") => void;
  updateNodeTelemetry: (nodeKey: string, telemetry: Partial<NodeTelemetry>) => void;
  appendStreamChunk: (nodeKey: string, chunk: string) => void;
  resetTelemetry: () => void;
  undo: () => void;
  redo: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  workflowId: null,
  nodes: [],
  edges: [],
  selectedNodeId: null,
  isDirty: false,
  executionStatus: "idle",
  nodeTelemetry: {},
  history: [],
  historyIndex: -1,

  onNodesChange: (changes) =>
    set({ nodes: applyNodeChanges(changes, get().nodes), isDirty: true }),

  onEdgesChange: (changes) =>
    set({ edges: applyEdgeChanges(changes, get().edges), isDirty: true }),

  onConnect: (connection) =>
    set({ edges: addEdge({ ...connection, animated: false }, get().edges), isDirty: true }),

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  updateNodeConfig: (nodeId, config) =>
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, config: { ...n.data.config, ...config } } } : n
      ),
      isDirty: true,
    }),

  setExecutionStatus: (status) => set({ executionStatus: status }),

  updateNodeTelemetry: (nodeKey, telemetry) =>
    set({
      nodeTelemetry: { ...get().nodeTelemetry, [nodeKey]: { ...get().nodeTelemetry[nodeKey], ...telemetry } },
    }),

  appendStreamChunk: (nodeKey, chunk) => {
    const current = get().nodeTelemetry[nodeKey]?.streamText ?? "";
    set({
      nodeTelemetry: {
        ...get().nodeTelemetry,
        [nodeKey]: { ...get().nodeTelemetry[nodeKey], status: "running", streamText: current + chunk },
      },
    });
  },

  resetTelemetry: () => set({ nodeTelemetry: {}, executionStatus: "idle" }),

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      set({ nodes: prev.nodes, edges: prev.edges, historyIndex: historyIndex - 1 });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      set({ nodes: next.nodes, edges: next.edges, historyIndex: historyIndex + 1 });
    }
  },
}));
```

---

## 2.2 TanStack Query Integration

* **Autosave Mutations:** Debounced canvas state mutations sync back to `PUT /api/v1/workflows/:id`.
* **Cache Keys:** `['workflows', workspaceId]`, `['workflow', id]`, `['execution', id, 'runs']`.

---

[← Previous: Canvas Architecture](./canvas-architecture.md) | [Next: Design System →](./design-system.md)
