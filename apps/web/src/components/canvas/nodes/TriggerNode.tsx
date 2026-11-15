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
      <div className="bg-charcoal-950/70 border border-charcoal-800/80 rounded-lg p-2.5 space-y-1.5 font-mono text-[11px]">
        {triggerType === "webhook" && (
          <div className="flex items-center gap-2 text-charcoal-300">
            <Webhook className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold text-[9px] border border-amber-500/20">
              {(config.webhookMethod as string) || "POST"}
            </span>
            <span className="truncate text-charcoal-400">
              {(config.webhookPath as string) || "/api/v1/ingress/webhook"}
            </span>
          </div>
        )}

        {triggerType === "schedule" && (
          <div className="flex items-center gap-2 text-charcoal-300">
            <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-charcoal-400">Cron:</span>
            <span className="text-amber-300 font-bold">{(config.cronExpression as string) || "0 * * * *"}</span>
          </div>
        )}

        {triggerType === "manual" && (
          <div className="flex items-center gap-2 text-charcoal-300">
            <Play className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-charcoal-400">Interactive Run on Demand</span>
          </div>
        )}
      </div>
    </BaseNode>
  );
};
