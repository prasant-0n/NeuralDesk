import React from "react";
import { type NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { ArrowRight, Braces } from "lucide-react";
import { type NodePort } from "@neuraldesk/shared";

interface TransformRule {
  targetKey: string;
  sourceExpression: string;
}

export const TransformNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const nodeData = data as Record<string, unknown>;
  const config = (nodeData.config || {}) as Record<string, unknown>;
  const transformType = (config.transformType as string) || "json_pick";
  const rules = (config.rules as TransformRule[]) || [
    { targetKey: "summary", sourceExpression: "response.summary" },
  ];

  const inputs = (nodeData.inputs as NodePort[]) || [{ id: "input", name: "Raw Data", type: "any" }];
  const outputs = (nodeData.outputs as NodePort[]) || [{ id: "output", name: "Transformed", type: "object" }];

  return (
    <BaseNode
      id={id}
      selected={selected}
      kind="transform"
      title={(nodeData.label as string) || "JSON Transform"}
      subtitle="Schema Reshaping"
      badgeLabel={transformType}
      inputs={inputs}
      outputs={outputs}
    >
      <div className="space-y-1.5 bg-charcoal-950/70 border border-charcoal-800/80 rounded-lg p-2 font-mono text-[11px]">
        <div className="flex items-center gap-1.5 text-orange-400 text-[9px] uppercase font-bold tracking-wider mb-1">
          <Braces className="w-3 h-3" />
          <span>Mappings ({rules.length})</span>
        </div>
        {rules.slice(0, 3).map((r, idx) => (
          <div key={idx} className="flex items-center justify-between text-charcoal-300 truncate">
            <span className="text-charcoal-400 truncate">{r.sourceExpression}</span>
            <ArrowRight className="w-3 h-3 text-orange-400 shrink-0 mx-1" />
            <span className="text-orange-300 font-semibold truncate">{r.targetKey}</span>
          </div>
        ))}
      </div>
    </BaseNode>
  );
};
