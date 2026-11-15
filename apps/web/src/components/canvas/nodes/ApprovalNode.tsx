import React from "react";
import { type NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { UserCheck, Check, X, CheckCircle2 } from "lucide-react";
import { type NodePort } from "@neuraldesk/shared";
import { useWorkflowStore } from "../../../store/workflowStore";
import { cn } from "../../../lib/utils";

export const ApprovalNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const nodeData = data as Record<string, unknown>;
  const config = (nodeData.config || {}) as Record<string, unknown>;
  const approverRole = (config.approverRole as string) || "Manager";
  const instructions = (config.instructions as string) || "Review output before routing.";
  const telemetry = useWorkflowStore((state) => state.nodeTelemetry[id]);

  const outputData = telemetry?.outputData as Record<string, unknown> | undefined;
  const isApproved = telemetry?.status === "completed" && outputData?.approved !== false;
  const isPending = telemetry?.status === "running" || outputData?.status === "pending";

  const inputs = (nodeData.inputs as NodePort[]) || [{ id: "input", name: "Candidate", type: "any" }];
  const outputs = (nodeData.outputs as NodePort[]) || [
    { id: "approved", name: "Approved", type: "any" },
    { id: "rejected", name: "Rejected", type: "any" },
  ];

  return (
    <BaseNode
      id={id}
      selected={selected}
      kind="approval"
      title={(nodeData.label as string) || "Human Approval Gate"}
      subtitle="HITL Governance"
      badgeLabel={isApproved ? "Approved" : isPending ? "Review Pending" : "Sign-Off"}
      inputs={inputs}
      outputs={outputs}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-charcoal-950/70 border border-yellow-200 dark:border-charcoal-800/80 rounded-lg text-[11px] text-yellow-900 dark:text-yellow-300">
          <UserCheck className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400 shrink-0" />
          <span className="text-slate-600 dark:text-charcoal-400">Required Role:</span>
          <span className="font-semibold text-yellow-900 dark:text-yellow-200">{approverRole}</span>
        </div>

        {isApproved ? (
          <div className="flex items-center gap-1.5 p-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-lg text-[10px] text-emerald-800 dark:text-emerald-300 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Signed Off & Approved by {approverRole}</span>
          </div>
        ) : (
          <p className="text-[11px] text-slate-600 dark:text-charcoal-400 italic line-clamp-2 px-1">
            {instructions}
          </p>
        )}

        <div className="flex items-center justify-between text-[10px] px-1 font-semibold pt-1">
          <span className={cn("flex items-center gap-1", isApproved ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-emerald-600/70 dark:text-emerald-400/70")}>
            <Check className="w-3 h-3" /> Approved Route
          </span>
          <span className="flex items-center gap-1 text-slate-400 dark:text-charcoal-500">
            <X className="w-3 h-3" /> Rejection Route
          </span>
        </div>
      </div>
    </BaseNode>
  );
};
