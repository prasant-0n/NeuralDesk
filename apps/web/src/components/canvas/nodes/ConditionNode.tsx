import React from "react";
import { type NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { GitBranch, Check, X } from "lucide-react";
import { type NodePort } from "@neuraldesk/shared";

export const ConditionNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const nodeData = data as Record<string, unknown>;
  const config = (nodeData.config || {}) as Record<string, unknown>;
  const expression = (config.expression as string) || "input != null";

  const inputs = (nodeData.inputs as NodePort[]) || [{ id: "input", name: "Value", type: "any" }];
  const outputs = (nodeData.outputs as NodePort[]) || [
    { id: "true", name: "True", type: "any" },
    { id: "false", name: "False", type: "any" },
  ];

  return (
    <BaseNode
      id={id}
      selected={selected}
      kind="condition"
      title={(nodeData.label as string) || "Condition Router"}
      subtitle="Binary Logic Gate"
      badgeLabel="Branch"
      inputs={inputs}
      outputs={outputs}
    >
      <div className="space-y-2">
        <div className="p-2 rounded bg-charcoal-950/70 border border-charcoal-800/80 text-[11px] font-mono text-emerald-300">
          <div className="flex items-center gap-1.5 text-charcoal-400 text-[9px] uppercase font-bold tracking-wider mb-1">
            <GitBranch className="w-3 h-3 text-emerald-400" />
            <span>Expression</span>
          </div>
          <p className="truncate text-charcoal-200">{expression}</p>
        </div>

        <div className="flex items-center justify-between text-[10px] px-1 font-semibold">
          <span className="flex items-center gap-1 text-emerald-400">
            <Check className="w-3 h-3" /> Output 1: True
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <X className="w-3 h-3" /> Output 2: False
          </span>
        </div>
      </div>
    </BaseNode>
  );
};
