import React from "react";
import { type NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { UserCheck, Check, X } from "lucide-react";
import { type NodePort } from "@neuraldesk/shared";

export const ApprovalNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const nodeData = data as Record<string, unknown>;
  const config = (nodeData.config || {}) as Record<string, unknown>;
  const approverRole = (config.approverRole as string) || "Manager";
  const instructions = (config.instructions as string) || "Review output before routing.";

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
      subtitle="HITL Pause Point"
      badgeLabel="Sign-Off"
      inputs={inputs}
      outputs={outputs}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2 p-2 bg-charcoal-950/70 border border-charcoal-800/80 rounded-lg text-[11px] text-yellow-300">
          <UserCheck className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
          <span className="text-charcoal-400">Required Role:</span>
          <span className="font-semibold text-yellow-200">{approverRole}</span>
        </div>

        <p className="text-[11px] text-charcoal-400 italic line-clamp-2 px-1">
          {instructions}
        </p>

        <div className="flex items-center justify-between text-[10px] px-1 font-semibold pt-1">
          <span className="flex items-center gap-1 text-emerald-400">
            <Check className="w-3 h-3" /> Approve
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <X className="w-3 h-3" /> Reject
          </span>
        </div>
      </div>
    </BaseNode>
  );
};
