import React from "react";
import { type NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { Webhook, Calendar, Play } from "lucide-react";
import { type NodePort } from "@neuraldesk/shared";

export const TriggerNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const nodeData = data as Record<string, unknown>;
  const config = (nodeData.config || {}) as Record<string, unknown>;
  const triggerType = (config.triggerType as string) || "webhook";
  const outputs = (nodeData.outputs as NodePort[]) || [{ id: "output", name: "Payload", type: "object" }];

  return (
    <BaseNode
      id={id}
      selected={selected}
      kind="trigger"
      title={(nodeData.label as string) || "Trigger"}
      subtitle="Workflow Ingress Event"
      badgeLabel={triggerType}
      inputs={[]}
      outputs={outputs}
    >
      <div className="bg-slate-100 dark:bg-charcoal-950/70 border border-slate-200 dark:border-charcoal-800/80 rounded-lg p-2.5 space-y-1.5 font-mono text-[11px]">
        {triggerType === "webhook" && (
          <div className="flex items-center gap-2 text-slate-700 dark:text-charcoal-300">
            <Webhook className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20 font-bold text-[9px]">
              {(config.webhookMethod as string) || "POST"}
            </span>
            <span className="truncate text-slate-600 dark:text-charcoal-400">
              {(config.webhookPath as string) || "/api/v1/ingress/webhook"}
            </span>
          </div>
        )}

        {triggerType === "schedule" && (
          <div className="flex items-center gap-2 text-slate-700 dark:text-charcoal-300">
            <Calendar className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
            <span className="text-slate-500 dark:text-charcoal-400">Cron:</span>
            <span className="text-amber-700 dark:text-amber-300 font-bold">{(config.cronExpression as string) || "0 * * * *"}</span>
          </div>
        )}

        {triggerType === "manual" && (
          <div className="flex items-center gap-2 text-slate-700 dark:text-charcoal-300">
            <Play className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
            <span className="text-slate-600 dark:text-charcoal-400">Interactive Run on Demand</span>
          </div>
        )}
      </div>
    </BaseNode>
  );
};
