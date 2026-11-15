import React from "react";
import { type NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { Sparkles, Thermometer, Braces } from "lucide-react";
import { useWorkflowStore } from "../../../store/workflowStore";
import { type NodePort } from "@neuraldesk/shared";

export const LLMNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const nodeData = data as Record<string, unknown>;
  const config = (nodeData.config || {}) as Record<string, unknown>;
  const telemetry = useWorkflowStore((state) => state.nodeTelemetry[id]);

  const model = (config.model as string) || "gemini-1.5-flash";
  const temperature = (config.temperature as number) ?? 0.3;
  const jsonMode = Boolean(config.jsonMode);

  const inputs = (nodeData.inputs as NodePort[]) || [
    { id: "input", name: "Prompt", type: "string" },
    { id: "context", name: "Context", type: "any" },
  ];
  const outputs = (nodeData.outputs as NodePort[]) || [
    { id: "output", name: "Response", type: "string" },
    { id: "raw", name: "Raw", type: "object" },
  ];

  const streamText = telemetry?.streamText;
  const isRunning = telemetry?.status === "running";

  return (
    <BaseNode
      id={id}
      selected={selected}
      kind="llm"
      title={(nodeData.label as string) || "Gemini Inference"}
      subtitle={model}
      badgeLabel={config.provider as string || "gemini"}
      inputs={inputs}
      outputs={outputs}
    >
      <div className="space-y-2">
        {/* Model Meta Tags */}
        <div className="flex items-center justify-between text-[11px] bg-charcoal-950/70 border border-charcoal-800/80 rounded-lg px-2.5 py-1.5">
          <div className="flex items-center gap-1.5 text-indigo-300 font-medium truncate">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">{model}</span>
          </div>
          <div className="flex items-center gap-2 text-charcoal-400 shrink-0">
            <span className="flex items-center gap-1 font-mono text-[10px]">
              <Thermometer className="w-3 h-3 text-charcoal-500" />
              {temperature}
            </span>
            {jsonMode && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-semibold">
                <Braces className="w-2.5 h-2.5" /> JSON
              </span>
            )}
          </div>
        </div>

        {/* Live Streaming Text or Prompt Preview */}
        {(streamText || isRunning) ? (
          <div className="p-2 rounded bg-charcoal-950 border border-indigo-500/30 text-[11px] font-mono text-indigo-200 max-h-24 overflow-y-auto leading-relaxed">
            <div className="text-[9px] uppercase tracking-wider text-indigo-400 font-bold mb-1 flex items-center justify-between">
              <span>Streaming Response</span>
              {isRunning && <span className="animate-pulse">● Live</span>}
            </div>
            {streamText || "Awaiting tokens..."}
          </div>
        ) : (
          <p className="text-[11px] text-charcoal-400 line-clamp-2 italic px-0.5">
            {(config.systemPrompt as string) || "System prompt ready for inference."}
          </p>
        )}
      </div>
    </BaseNode>
  );
};
