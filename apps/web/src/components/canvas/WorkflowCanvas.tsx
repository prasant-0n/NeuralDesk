import React, { useCallback, useRef, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type ReactFlowInstance,
} from "@xyflow/react";
import { useWorkflowStore } from "../../store/workflowStore";
import { CustomEdge } from "./CustomEdge";
import { TriggerNode } from "./nodes/TriggerNode";
import { LLMNode } from "./nodes/LLMNode";
import { PromptNode } from "./nodes/PromptNode";
import { ConditionNode } from "./nodes/ConditionNode";
import { TransformNode } from "./nodes/TransformNode";
import { ToolNode } from "./nodes/ToolNode";
import { ApprovalNode } from "./nodes/ApprovalNode";
import { OutputNode } from "./nodes/OutputNode";
import { type NodeKind } from "@neuraldesk/shared";

const NODE_TYPES = {
  trigger: TriggerNode,
  llm: LLMNode,
  prompt: PromptNode,
  condition: ConditionNode,
  transform: TransformNode,
  tool: ToolNode,
  approval: ApprovalNode,
  output: OutputNode,
};

const EDGE_TYPES = {
  custom: CustomEdge,
};

export const WorkflowCanvas: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);
  const onNodesChange = useWorkflowStore((state) => state.onNodesChange);
  const onEdgesChange = useWorkflowStore((state) => state.onEdgesChange);
  const onConnect = useWorkflowStore((state) => state.onConnect);
  const selectNode = useWorkflowStore((state) => state.selectNode);
  const addNode = useWorkflowStore((state) => state.addNode);
  const removeNode = useWorkflowStore((state) => state.removeNode);
  const duplicateNode = useWorkflowStore((state) => state.duplicateNode);
  const undo = useWorkflowStore((state) => state.undo);
  const redo = useWorkflowStore((state) => state.redo);
  const selectedNodeId = useWorkflowStore((state) => state.selectedNodeId);

  // Drag and Drop from NodePalette
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const kind = event.dataTransfer.getData("application/reactflow") as NodeKind;
      if (!kind || !reactFlowInstance.current) return;

      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(kind, position);
    },
    [addNode]
  );

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept typing in inputs / textareas
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (
        (cmdOrCtrl && e.key.toLowerCase() === "y") ||
        (cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === "z")
      ) {
        e.preventDefault();
        redo();
      } else if (cmdOrCtrl && e.key.toLowerCase() === "d" && selectedNodeId) {
        e.preventDefault();
        duplicateNode(selectedNodeId);
      } else if ((e.key === "Delete" || e.key === "Backspace") && selectedNodeId) {
        e.preventDefault();
        removeNode(selectedNodeId);
      } else if (e.key === "Escape") {
        selectNode(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, selectedNodeId, duplicateNode, removeNode, selectNode]);

  return (
    <div ref={reactFlowWrapper} className="w-full h-full relative flex-1 bg-charcoal-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        onInit={(instance) => {
          reactFlowInstance.current = instance;
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={(_, node) => selectNode(node.id)}
        onPaneClick={() => selectNode(null)}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2.0}
        defaultEdgeOptions={{ type: "custom" }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1.2} color="#1e293b" />
        <Controls showInteractive={false} className="!left-4 !bottom-4" />
        <MiniMap
          nodeColor={(n) => {
            if (n.type === "trigger") return "#f59e0b";
            if (n.type === "llm") return "#6366f1";
            if (n.type === "prompt") return "#38bdf8";
            if (n.type === "condition") return "#10b981";
            if (n.type === "tool") return "#a855f7";
            return "#64748b";
          }}
          nodeStrokeWidth={3}
          maskColor="rgba(2, 6, 23, 0.75)"
          className="!right-4 !bottom-4"
        />
      </ReactFlow>
    </div>
  );
};
