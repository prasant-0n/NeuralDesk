import React, { useState } from "react";
import { type NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { Copy, Download, Check, FileJson, FileText, FastForward, Clock } from "lucide-react";
import { useWorkflowStore } from "../../../store/workflowStore";
import { type NodePort } from "@neuraldesk/shared";
import { cn } from "../../../lib/utils";

export const OutputNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const nodeData = data as Record<string, unknown>;
  const config = (nodeData.config || {}) as Record<string, unknown>;
  const outputFormat = (config.outputFormat as string) || "json";
  const telemetry = useWorkflowStore((state) => state.nodeTelemetry[id]);

  const [copied, setCopied] = useState(false);
  const inputs = (nodeData.inputs as NodePort[]) || [{ id: "input", name: "Payload", type: "any" }];

  const outputData = telemetry?.outputData as Record<string, unknown> | undefined;
  const status = telemetry?.status ?? "idle";
  const isCompleted = status === "completed";
  const isSkipped = status === "skipped";
  const isRunning = status === "running";

  // Check if output payload represents a condition false branch
  const isFalseBranch = Boolean(
    outputData &&
    (outputData.result === false || outputData.branch === "false" || outputData.conditionMet === false)
  );

  const formattedOutput = outputData
    ? typeof outputData === "string"
      ? outputData
      : JSON.stringify(outputData, null, 2)
    : null;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!formattedOutput) return;
    navigator.clipboard.writeText(formattedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!formattedOutput) return;
    const blob = new Blob([formattedOutput], {
      type: outputFormat === "json" ? "application/json" : "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `neuraldesk-result-${id}.${outputFormat === "json" ? "json" : "md"}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const badgeText = isSkipped
    ? "Bypassed"
    : isFalseBranch
    ? "False Path"
    : outputFormat;

  return (
    <BaseNode
      id={id}
      selected={selected}
      kind="output"
      title={(nodeData.label as string) || "Output Delivery"}
      subtitle="Terminal Egress Viewport"
      badgeLabel={badgeText}
      inputs={inputs}
      outputs={[]}
    >
      <div className="space-y-2">
        {/* Header Controls */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-charcoal-400 px-1">
          <div className="flex items-center gap-1.5 font-medium">
            {outputFormat === "json" ? (
              <FileJson className={cn("w-3.5 h-3.5", isFalseBranch ? "text-amber-600 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-300")} />
            ) : (
              <FileText className={cn("w-3.5 h-3.5", isFalseBranch ? "text-amber-600 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-300")} />
            )}
            <span className={cn("uppercase text-[10px] tracking-wider", isFalseBranch ? "text-amber-700 dark:text-amber-400 font-semibold" : "text-emerald-700 dark:text-emerald-300")}>
              {isFalseBranch ? "Standard / False Route" : `${outputFormat} Output`}
            </span>
          </div>

          {formattedOutput && (
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopy}
                title="Copy to clipboard"
                className="p-1 hover:bg-slate-200 dark:hover:bg-charcoal-800 rounded text-slate-500 dark:text-charcoal-300 hover:text-slate-900 dark:hover:text-white"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
              <button
                onClick={handleDownload}
                title="Download export"
                className="p-1 hover:bg-slate-200 dark:hover:bg-charcoal-800 rounded text-slate-500 dark:text-charcoal-300 hover:text-slate-900 dark:hover:text-white"
              >
                <Download className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Live Output Preview */}
        {isCompleted && formattedOutput ? (
          <div
            className={cn(
              "p-2 rounded font-mono text-[11px] max-h-28 overflow-y-auto whitespace-pre-wrap leading-relaxed border",
              isFalseBranch
                ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-500/30 text-amber-950 dark:text-amber-200"
                : "bg-slate-100 dark:bg-charcoal-950 border-emerald-200 dark:border-emerald-500/30 text-emerald-950 dark:text-emerald-200"
            )}
          >
            {formattedOutput}
          </div>
        ) : isSkipped ? (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-charcoal-950 border border-slate-200 dark:border-charcoal-800 text-[11px]">
            <FastForward className="w-4 h-4 text-slate-400 dark:text-charcoal-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-slate-700 dark:text-charcoal-300">Branch Bypassed</p>
              <p className="text-[10px] text-slate-500 dark:text-charcoal-400 leading-tight">
                Upstream condition routed execution to an alternative branch.
              </p>
            </div>
          </div>
        ) : isRunning ? (
          <div className="flex items-center justify-center gap-2 p-3 rounded bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-500/30 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-ping" />
            <span>Processing egress payload...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1.5 p-3 rounded bg-slate-50 dark:bg-charcoal-950/50 border border-slate-200 dark:border-charcoal-800/60 text-center text-[11px] text-slate-400 dark:text-charcoal-500">
            <Clock className="w-3.5 h-3.5" />
            <span>Awaiting upstream execution...</span>
          </div>
        )}
      </div>
    </BaseNode>
  );
};
