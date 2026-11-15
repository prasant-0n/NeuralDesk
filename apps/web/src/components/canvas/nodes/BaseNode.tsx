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
    color: string;
    bgBadge: string;
    textBadge: string;
    border: string;
  }
> = {
  trigger: {
    icon: Zap,
    color: "text-amber-500 dark:text-amber-400",
    bgBadge: "bg-amber-50 dark:bg-amber-500/10",
    textBadge: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-500/30",
  },
  llm: {
    icon: Sparkles,
    color: "text-indigo-600 dark:text-indigo-400",
    bgBadge: "bg-indigo-50 dark:bg-indigo-500/10",
    textBadge: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-200 dark:border-indigo-500/30",
  },
  prompt: {
    icon: FileText,
    color: "text-sky-600 dark:text-sky-400",
    bgBadge: "bg-sky-50 dark:bg-sky-500/10",
    textBadge: "text-sky-700 dark:text-sky-300",
    border: "border-sky-200 dark:border-sky-500/30",
  },
  condition: {
    icon: GitBranch,
    color: "text-emerald-600 dark:text-emerald-400",
    bgBadge: "bg-emerald-50 dark:bg-emerald-500/10",
    textBadge: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-500/30",
  },
  transform: {
    icon: ArrowRightLeft,
    color: "text-orange-600 dark:text-orange-400",
    bgBadge: "bg-orange-50 dark:bg-orange-500/10",
    textBadge: "text-orange-700 dark:text-orange-300",
    border: "border-orange-200 dark:border-orange-500/30",
  },
  tool: {
    icon: Wrench,
    color: "text-purple-600 dark:text-purple-400",
    bgBadge: "bg-purple-50 dark:bg-purple-500/10",
    textBadge: "text-purple-700 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-500/30",
  },
  approval: {
    icon: ShieldCheck,
    color: "text-yellow-600 dark:text-yellow-400",
    bgBadge: "bg-yellow-50 dark:bg-yellow-500/10",
    textBadge: "text-yellow-800 dark:text-yellow-300",
    border: "border-yellow-200 dark:border-yellow-500/30",
  },
  evaluator: {
    icon: CheckCircle2,
    color: "text-teal-600 dark:text-teal-400",
    bgBadge: "bg-teal-50 dark:bg-teal-500/10",
    textBadge: "text-teal-700 dark:text-teal-300",
    border: "border-teal-200 dark:border-teal-500/30",
  },
  output: {
    icon: Share2,
    color: "text-emerald-600 dark:text-emerald-400",
    bgBadge: "bg-emerald-50 dark:bg-emerald-500/10",
    textBadge: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-500/30",
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
        "relative group w-[340px] min-w-[320px] max-w-[380px] rounded-xl bg-white dark:bg-charcoal-900/95 border text-slate-800 dark:text-charcoal-100 shadow-md dark:shadow-xl backdrop-blur-md transition-all duration-200 select-none",
        selected
          ? "border-indigo-600 dark:border-indigo-500 shadow-indigo-500/25 ring-2 ring-indigo-500/80 dark:ring-indigo-400/80"
          : "border-slate-200 hover:border-slate-300 dark:border-charcoal-800 dark:hover:border-charcoal-700",
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
              className="target-handle !w-3 !h-3"
            />
            <span className="opacity-0 group-hover/port:opacity-100 transition-opacity absolute left-4 text-[10px] bg-slate-900 border border-slate-800 text-white dark:bg-charcoal-950/90 dark:border-charcoal-800 dark:text-charcoal-300 px-1.5 py-0.5 rounded whitespace-nowrap shadow pointer-events-none z-30">
              {port.name} ({port.type})
            </span>
          </div>
        );
      })}

      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-charcoal-800/80 bg-slate-50/80 dark:bg-charcoal-950/40 rounded-t-xl gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className={cn("p-1.5 rounded-lg border shrink-0", meta.bgBadge, meta.border)}>
            <Icon className={cn("w-4 h-4", meta.color)} />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-charcoal-100 truncate tracking-tight" title={title}>
              {title}
            </h4>
            {subtitle && <p className="text-[10px] text-slate-500 dark:text-charcoal-400 truncate">{subtitle}</p>}
          </div>
        </div>

        {/* Action Shortcuts & Status Badge */}
        <div className="flex items-center gap-1.5 ml-1 shrink-0">
          {badgeLabel && (
            <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-semibold border uppercase tracking-wider shrink-0 whitespace-nowrap", meta.bgBadge, meta.border, meta.textBadge)}>
              {badgeLabel}
            </span>
          )}

          {/* Execution Status Icon */}
          {isRunning && <Loader2 className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 animate-spin shrink-0" />}
          {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />}
          {isFailed && <AlertCircle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0" />}
          {isSkipped && (
            <span title="Branch Bypassed" className="shrink-0 flex items-center">
              <FastForward className="w-3.5 h-3.5 text-slate-400 dark:text-charcoal-400" />
            </span>
          )}

          {/* Quick Context Actions on hover */}
          <div className="hidden group-hover:flex items-center gap-1 transition-opacity shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                duplicateNode(id);
              }}
              title="Duplicate (Ctrl+D)"
              className="p-1 hover:bg-slate-200 dark:hover:bg-charcoal-800 rounded text-slate-400 hover:text-slate-700 dark:text-charcoal-400 dark:hover:text-charcoal-200"
            >
              <Copy className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeNode(id);
              }}
              title="Delete node"
              className="p-1 hover:bg-rose-100 dark:hover:bg-rose-950/50 rounded text-slate-400 hover:text-rose-600 dark:text-charcoal-400 dark:hover:text-rose-400"
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
        <div className="px-3 py-1.5 bg-slate-50 dark:bg-charcoal-950/60 border-t border-slate-200 dark:border-charcoal-800/60 rounded-b-xl flex items-center justify-between text-[10px] text-slate-500 dark:text-charcoal-400 font-mono">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400 dark:text-charcoal-500" />
            <span>{formatDuration(telemetry.durationMs)}</span>
          </div>
          {telemetry.costUsd !== undefined && (
            <div className="flex items-center gap-1">
              <Coins className="w-3 h-3 text-slate-400 dark:text-charcoal-500" />
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
              className="source-handle !w-3 !h-3"
            />
            <span className="opacity-0 group-hover/port:opacity-100 transition-opacity absolute right-4 text-[10px] bg-slate-900 border border-slate-800 text-white dark:bg-charcoal-950/90 dark:border-charcoal-800 dark:text-charcoal-300 px-1.5 py-0.5 rounded whitespace-nowrap shadow pointer-events-none z-30">
              {port.name}
            </span>
          </div>
        );
      })}
    </div>
  );
};
