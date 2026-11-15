import React from "react";
import { type NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { Globe, Clock, RefreshCw, AlertTriangle } from "lucide-react";
import { type NodePort } from "@neuraldesk/shared";

export const ToolNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const nodeData = data as Record<string, unknown>;
  const config = (nodeData.config || {}) as Record<string, unknown>;
  const httpMethod = (config.httpMethod as string) || "POST";
  const url = (config.url as string) || "https://api.internal/endpoint";
  const timeoutMs = (config.timeoutMs as number) || 5000;
  const retryCount = (config.retryCount as number) || 2;

  const inputs = (nodeData.inputs as NodePort[]) || [
    { id: "trigger", name: "Trigger", type: "any" },
    { id: "params", name: "Params", type: "object" },
  ];
  const outputs = (nodeData.outputs as NodePort[]) || [
    { id: "response", name: "Response", type: "object" },
    { id: "on_failure", name: "On Failure", type: "object" },
  ];

  return (
    <BaseNode
      id={id}
      selected={selected}
      kind="tool"
      title={(nodeData.label as string) || "HTTP REST Tool"}
      subtitle="External API Invocation"
      badgeLabel={httpMethod}
      inputs={inputs}
      outputs={outputs}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2 p-2 bg-charcoal-950/70 border border-charcoal-800/80 rounded-lg text-[11px] font-mono text-purple-200">
          <Globe className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="truncate text-charcoal-300">{url}</span>
        </div>

        <div className="flex items-center justify-between text-[10px] text-charcoal-400 px-1 font-mono">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-charcoal-500" />
            <span>{timeoutMs}ms</span>
          </div>
          <div className="flex items-center gap-1">
            <RefreshCw className="w-3 h-3 text-charcoal-500" />
            <span>{retryCount} retries</span>
          </div>
          <div className="flex items-center gap-1 text-rose-400" title="Error recovery port enabled">
            <AlertTriangle className="w-3 h-3" />
            <span>on_fail</span>
          </div>
        </div>
      </div>
    </BaseNode>
  );
};
