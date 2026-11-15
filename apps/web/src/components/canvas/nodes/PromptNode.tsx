import React from "react";
import { type NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { Variable } from "lucide-react";
import { type NodePort } from "@neuraldesk/shared";

export const PromptNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const nodeData = data as Record<string, unknown>;
  const config = (nodeData.config || {}) as Record<string, unknown>;
  const template = (config.template as string) || "{{input}}";

  const inputs = (nodeData.inputs as NodePort[]) || [{ id: "input", name: "input", type: "string" }];
  const outputs = (nodeData.outputs as NodePort[]) || [{ id: "prompt", name: "Rendered Prompt", type: "string" }];

  // Extract variables like {{var}} for highlighting
  const variableMatches = template.match(/\{\{([^}]+)\}\}/g) || [];
  const uniqueVars = Array.from(new Set(variableMatches.map((m) => m.replace(/[{}]/g, "").trim())));

  return (
    <BaseNode
      id={id}
      selected={selected}
      kind="prompt"
      title={(nodeData.label as string) || "Prompt Template"}
      subtitle="Mustache Variable Compiler"
      badgeLabel="Prompt"
      inputs={inputs}
      outputs={outputs}
    >
      <div className="space-y-2">
        <div className="p-2 rounded bg-slate-100 dark:bg-charcoal-950/70 border border-slate-200 dark:border-charcoal-800/80 text-[11px] font-mono text-slate-800 dark:text-charcoal-300 max-h-24 overflow-y-auto leading-relaxed whitespace-pre-wrap">
          {template}
        </div>

        {uniqueVars.length > 0 && (
          <div className="flex flex-wrap gap-1 items-center pt-0.5">
            <Variable className="w-3 h-3 text-sky-500 dark:text-sky-400 shrink-0" />
            {uniqueVars.map((v) => (
              <span
                key={v}
                className="px-1.5 py-0.5 rounded bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 text-sky-700 dark:text-sky-300 font-mono text-[10px]"
              >
                {`{{${v}}}`}
              </span>
            ))}
          </div>
        )}
      </div>
    </BaseNode>
  );
};
