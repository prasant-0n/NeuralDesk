import React, { useState } from "react";
import { type NodeProps } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { Copy, Download, Check, FileJson, FileText } from "lucide-react";
import { useWorkflowStore } from "../../../store/workflowStore";
import { type NodePort } from "@neuraldesk/shared";

export const OutputNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const nodeData = data as Record<string, unknown>;
  const config = (nodeData.config || {}) as Record<string, unknown>;
  const outputFormat = (config.outputFormat as string) || "json";
  const telemetry = useWorkflowStore((state) => state.nodeTelemetry[id]);

  const [copied, setCopied] = useState(false);
  const inputs = (nodeData.inputs as NodePort[]) || [{ id: "input", name: "Payload", type: "any" }];

  const outputData = telemetry?.outputData;
  const isCompleted = telemetry?.status === "completed";

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

  return (
    <BaseNode
      id={id}
      selected={selected}
      kind="output"
      title={(nodeData.label as string) || "Output Delivery"}
      subtitle="Terminal Egress Viewport"
      badgeLabel={outputFormat}
      inputs={inputs}
      outputs={[]}
    >
      <div className="space-y-2">
        {/* Header Controls */}
        <div className="flex items-center justify-between text-[11px] text-charcoal-400 px-1">
          <div className="flex items-center gap-1.5 font-medium text-emerald-300">
            {outputFormat === "json" ? <FileJson className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
            <span className="uppercase text-[10px] tracking-wider">{outputFormat} Output</span>
          </div>

          {formattedOutput && (
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopy}
                title="Copy to clipboard"
                className="p-1 hover:bg-charcoal-800 rounded text-charcoal-300 hover:text-white"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
              <button
                onClick={handleDownload}
                title="Download export"
                className="p-1 hover:bg-charcoal-800 rounded text-charcoal-300 hover:text-white"
              >
                <Download className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Live Output Preview */}
        {isCompleted && formattedOutput ? (
          <div className="p-2 rounded bg-charcoal-950 border border-emerald-500/30 font-mono text-[11px] text-emerald-200 max-h-28 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {formattedOutput}
          </div>
        ) : (
          <div className="p-3 rounded bg-charcoal-950/50 border border-charcoal-800/60 text-center text-[11px] text-charcoal-500 italic">
            Awaiting upstream execution...
          </div>
        )}
      </div>
    </BaseNode>
  );
};
