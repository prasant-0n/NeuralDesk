import React from "react";
import { Handle, Position } from "@xyflow/react";
import {
  Zap,
  Sparkles,
  FileText,
  GitBranch,
  ArrowRightLeft,
  Wrench,
  ShieldCheck,
  Share2,
  Trash2,
  Copy,
  Clock,
  Coins,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FastForward,
} from "lucide-react";
import { type NodeKind, type NodePort } from "@neuraldesk/shared";
import { useWorkflowStore } from "../../../store/workflowStore";
import { cn, formatDuration, formatCost } from "../../../lib/utils";

export interface BaseNodeProps {
  id: string;
  selected?: boolean;
  kind: NodeKind;
  title: string;
  subtitle?: string;
  badgeLabel?: string;
  inputs?: NodePort[];
  outputs?: NodePort[];
  children?: React.ReactNode;
}

const KIND_METADATA: Record<
  NodeKind,
  {
    icon: React.FC<{ className?: string }>;
    badge: string;
  }
> = {
  trigger: {
    icon: Zap,
    badge: "Trigger",
  },
  llm: {
    icon: Sparkles,
    badge: "LLM",
  },
  prompt: {
    icon: FileText,
    badge: "Prompt",
  },
  condition: {
    icon: GitBranch,
    badge: "Condition",
  },
  transform: {
    icon: ArrowRightLeft,
    badge: "Transform",
  },
  tool: {
    icon: Wrench,
    badge: "Tool",
  },
  approval: {
    icon: ShieldCheck,
    badge: "Approval",
  },
  evaluator: {
    icon: CheckCircle2,
    badge: "Evaluator",
  },
  output: {
    icon: Share2,
    badge: "Output",
  },
};

export const BaseNode: React.FC<BaseNodeProps> = ({
  id,
  selected = false,
  kind,
  title,
  subtitle,
  badgeLabel,
  inputs = [],
  outputs = [],
  children,
}) => {
  const telemetry = useWorkflowStore((state) => state.nodeTelemetry[id]);
  const removeNode = useWorkflowStore((state) => state.removeNode);
  const duplicateNode = useWorkflowStore((state) => state.duplicateNode);

  const meta = KIND_METADATA[kind] || KIND_METADATA.prompt;
  const Icon = meta.icon;

  const status = telemetry?.status ?? "idle";
  const isRunning = status === "running";
  const isCompleted = status === "completed";
  const isFailed = status === "failed";
  const isSkipped = status === "skipped";

  const glowClass = isRunning
    ? "node-running"
    : isCompleted
    ? "node-completed"
    : isFailed
    ? "node-failed"
    : isSkipped
    ? "node-skipped"
    : "";

  return (
    <div
      className={cn(
        "relative group w-[320px] rounded-lg bg-white dark:bg-[#11141c] border text-slate-800 dark:text-[#eef0f5] shadow-xs transition-colors select-none",
        selected
          ? "border-slate-900 dark:border-[#eef0f5] ring-1 ring-slate-900 dark:ring-[#eef0f5]"
          : "border-slate-200 dark:border-[rgba(238,240,245,0.08)] hover:border-slate-300 dark:hover:border-[rgba(238,240,245,0.16)]",
        glowClass
      )}
    >
      {/* Input Handles */}
      {inputs.map((port, idx) => {
        const topPercent = inputs.length === 1 ? 50 : ((idx + 1) / (inputs.length + 1)) * 100;
        return (
          <div
            key={port.id}
            style={{ top: `${topPercent}%` }}
            className="absolute -left-3 transform -translate-y-1/2 flex items-center group/port"
          >
            <Handle
              type="target"
              position={Position.Left}
              id={port.id}
              className="target-handle !w-2.5 !h-2.5"
            />
            <span className="opacity-0 group-hover/port:opacity-100 transition-opacity absolute left-4 text-[10px] bg-slate-900 border border-slate-800 text-white dark:bg-[#07080d] dark:border-[rgba(238,240,245,0.08)] dark:text-[#eef0f5] px-1.5 py-0.5 rounded whitespace-nowrap shadow pointer-events-none z-30 font-mono">
              {port.name} ({port.type})
            </span>
          </div>
        );
      })}

      {/* Header */}
      <div className="flex items-center justify-between p-2.5 border-b border-slate-200 dark:border-[rgba(238,240,245,0.08)] bg-slate-50/70 dark:bg-[#07080d]/60 rounded-t-lg gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="p-1 rounded bg-slate-100 dark:bg-[#1a1e28] text-slate-600 dark:text-[#a3a9b8] shrink-0">
            <Icon className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-medium text-slate-900 dark:text-[#eef0f5] truncate tracking-tight" title={title}>
              {title}
            </h4>
            {subtitle && <p className="text-[10px] text-slate-500 dark:text-[#7a8296] truncate">{subtitle}</p>}
          </div>
        </div>

        {/* Action Shortcuts & Status Badge */}
        <div className="flex items-center gap-1.5 ml-1 shrink-0">
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-100 dark:bg-[#1a1e28] text-slate-600 dark:text-[#a3a9b8] shrink-0 whitespace-nowrap">
            {badgeLabel || meta.badge}
          </span>

          {/* Execution Status Icon */}
          {isRunning && <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin shrink-0" />}
          {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-[#4cc38a] shrink-0" />}
          {isFailed && <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-[#e5484d] shrink-0" />}
          {isSkipped && (
            <span title="Branch Bypassed" className="shrink-0 flex items-center">
              <FastForward className="w-3.5 h-3.5 text-slate-400 dark:text-[#7a8296]" />
            </span>
          )}

          {/* Quick Context Actions on hover */}
          <div className="hidden group-hover:flex items-center gap-1 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                duplicateNode(id);
              }}
              title="Duplicate (Ctrl+D)"
              className="p-1 hover:bg-slate-200 dark:hover:bg-[#1a1e28] rounded text-slate-400 hover:text-slate-700 dark:hover:text-[#eef0f5]"
            >
              <Copy className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeNode(id);
              }}
              title="Delete node"
              className="p-1 hover:bg-rose-100 dark:hover:bg-rose-950/40 rounded text-slate-400 hover:text-rose-600"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Node Body / Custom Content */}
      <div className="p-3 text-xs space-y-2">{children}</div>

      {/* Execution Telemetry Footer (if executed) */}
      {(telemetry?.durationMs !== undefined || telemetry?.costUsd !== undefined) && (
        <div className="px-3 py-1 bg-slate-50 dark:bg-[#07080d] border-t border-slate-200 dark:border-[rgba(238,240,245,0.06)] rounded-b-lg flex items-center justify-between text-[10px] text-slate-500 dark:text-[#7a8296] font-mono">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400 dark:text-[#7a8296]" />
            <span>{formatDuration(telemetry.durationMs)}</span>
          </div>
          {telemetry.costUsd !== undefined && (
            <div className="flex items-center gap-1">
              <Coins className="w-3 h-3 text-slate-400 dark:text-[#7a8296]" />
              <span>{formatCost(telemetry.costUsd)}</span>
            </div>
          )}
        </div>
      )}

      {/* Output Handles */}
      {outputs.map((port, idx) => {
        const topPercent = outputs.length === 1 ? 50 : ((idx + 1) / (outputs.length + 1)) * 100;
        return (
          <div
            key={port.id}
            style={{ top: `${topPercent}%` }}
            className="absolute -right-3 transform -translate-y-1/2 flex items-center group/port"
          >
            <Handle
              type="source"
              position={Position.Right}
              id={port.id}
              className="source-handle !w-2.5 !h-2.5"
            />
            <span className="opacity-0 group-hover/port:opacity-100 transition-opacity absolute right-4 text-[10px] bg-slate-900 border border-slate-800 text-white dark:bg-[#07080d] dark:border-[rgba(238,240,245,0.08)] dark:text-[#eef0f5] px-1.5 py-0.5 rounded whitespace-nowrap shadow pointer-events-none z-30 font-mono">
              {port.name}
            </span>
          </div>
        );
      })}
    </div>
  );
};
