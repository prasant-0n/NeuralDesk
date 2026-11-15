import React from "react";
import { type NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { GitBranch, Check, X } from "lucide-react";
import { type NodePort } from "@neuraldesk/shared";
import { useWorkflowStore } from "../../../store/workflowStore";
import { cn } from "../../../lib/utils";

export const ConditionNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const nodeData = data as Record<string, unknown>;
  const config = (nodeData.config || {}) as Record<string, unknown>;
  const expression = (config.expression as string) || "input != null";

  const inputs = (nodeData.inputs as NodePort[]) || [{ id: "input", name: "Value", type: "any" }];
  const outputs = (nodeData.outputs as NodePort[]) || [
    { id: "true", name: "True", type: "any" },
    { id: "false", name: "False", type: "any" },
  ];

  const telemetry = useWorkflowStore((state) => state.nodeTelemetry[id]);
  const outputData = telemetry?.outputData as Record<string, unknown> | undefined;
  const isCompleted = telemetry?.status === "completed";
  const selectedBranch = outputData?.branch || outputData?.selectedBranch;

  return (
    <BaseNode
      id={id}
      selected={selected}
      kind="condition"
      title={(nodeData.label as string) || "Condition Router"}
      subtitle="Binary Logic Gate"
      badgeLabel={isCompleted ? (selectedBranch === "true" ? "True Path" : "False Path") : "Branch"}
      inputs={inputs}
      outputs={outputs}
    >
      <div className="space-y-2">
        <div className="p-2 rounded bg-slate-100 dark:bg-charcoal-950/70 border border-slate-200 dark:border-charcoal-800/80 text-[11px] font-mono text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-charcoal-400 text-[9px] uppercase font-bold tracking-wider mb-1">
            <GitBranch className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Expression</span>
          </div>
          <p className="truncate text-slate-800 dark:text-charcoal-200">{expression}</p>
        </div>

        <div className="flex items-center justify-between text-[10px] px-1 font-semibold">
          <span
            className={cn(
              "flex items-center gap-1 transition-all px-1.5 py-0.5 rounded",
              isCompleted && selectedBranch === "true"
                ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 ring-1 ring-emerald-500/40 font-bold"
                : isCompleted && selectedBranch === "false"
                ? "text-slate-400 dark:text-charcoal-500 opacity-60"
                : "text-emerald-600 dark:text-emerald-400"
            )}
          >
            <Check className="w-3 h-3" /> Output 1: True
          </span>
          <span
            className={cn(
              "flex items-center gap-1 transition-all px-1.5 py-0.5 rounded",
              isCompleted && selectedBranch === "false"
                ? "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 ring-1 ring-amber-500/40 font-bold"
                : isCompleted && selectedBranch === "true"
                ? "text-slate-400 dark:text-charcoal-500 opacity-60"
                : "text-amber-600 dark:text-amber-400"
            )}
          >
            <X className="w-3 h-3" /> Output 2: False
          </span>
        </div>
      </div>
    </BaseNode>
  );
};
