import React, { useState } from "react";
import {
  X,
  Settings2,
  Activity,
  Trash2,
  Copy,
  Cpu,
  FileJson,
} from "lucide-react";
import { useWorkflowStore } from "../../store/workflowStore";
import { SUPPORTED_GEMINI_MODELS, type NodeKind } from "@neuraldesk/shared";
import { cn, formatDuration, formatCost, formatTokens } from "../../lib/utils";

export const NodeInspectorDrawer: React.FC = () => {
  const selectedNodeId = useWorkflowStore((state) => state.selectedNodeId);
  const nodes = useWorkflowStore((state) => state.nodes);
  const selectNode = useWorkflowStore((state) => state.selectNode);
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const updateNodeConfig = useWorkflowStore((state) => state.updateNodeConfig);
  const removeNode = useWorkflowStore((state) => state.removeNode);
  const duplicateNode = useWorkflowStore((state) => state.duplicateNode);
  const telemetry = useWorkflowStore((state) => (selectedNodeId ? state.nodeTelemetry[selectedNodeId] : null));

  const [activeTab, setActiveTab] = useState<"config" | "telemetry">("config");

  if (!selectedNodeId) return null;

  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node) return null;

  const nodeData = (node.data || {}) as Record<string, unknown>;
  const config = (nodeData.config || {}) as Record<string, unknown>;
  const kind = (node.type || nodeData.kind || "prompt") as NodeKind;
  const status = telemetry?.status ?? "idle";

  const handleConfigChange = (key: string, value: unknown) => {
    updateNodeConfig(selectedNodeId, { [key]: value });
  };

  return (
    <>
      {/* Backdrop overlay on tablet/mobile (< 1024px) for easy touch dismissal */}
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/60 z-30 lg:hidden transition-opacity"
        onClick={() => selectNode(null)}
        aria-hidden="true"
      />
      <aside
        className="fixed right-0 top-0 bottom-0 w-full max-w-sm sm:max-w-md lg:w-96 bg-white dark:bg-[#07080d] border-l border-slate-200 dark:border-[rgba(238,240,245,0.08)] shadow-xl z-40 flex flex-col select-none transition-colors duration-150"
        aria-label="Node Inspector"
      >
        {/* Header */}
        <div className="p-3.5 border-b border-slate-200 dark:border-[rgba(238,240,245,0.08)] flex items-center justify-between bg-slate-50 dark:bg-[#0b0d14]">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="p-1 rounded bg-slate-100 dark:bg-[#1a1e28] text-slate-600 dark:text-[#a3a9b8]">
              <Settings2 className="w-3.5 h-3.5" />
            </div>
            <div className="truncate">
              <h3 className="text-xs font-medium text-slate-900 dark:text-[#eef0f5]">Node Inspector</h3>
              <p className="text-[10px] text-slate-500 dark:text-[#7a8296] font-mono truncate">{selectedNodeId}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => duplicateNode(selectedNodeId)}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-[#1a1e28] rounded text-slate-400 hover:text-slate-700 dark:hover:text-[#eef0f5] transition-colors"
              title="Duplicate Node"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => removeNode(selectedNodeId)}
              className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded text-slate-400 hover:text-rose-600 transition-colors"
              title="Delete Node"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => selectNode(null)}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-[#1a1e28] rounded text-slate-400 hover:text-slate-700 dark:hover:text-[#eef0f5] transition-colors ml-1"
              title="Close Drawer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-[rgba(238,240,245,0.08)] bg-slate-50 dark:bg-[#07080d] text-xs font-mono">
          <button
            onClick={() => setActiveTab("config")}
            className={cn(
              "flex-1 py-2 border-b transition-colors flex items-center justify-center gap-1.5",
              activeTab === "config"
                ? "border-slate-900 dark:border-[#eef0f5] text-slate-900 dark:text-[#eef0f5] font-medium"
                : "border-transparent text-slate-500 dark:text-[#7a8296] hover:text-slate-900 dark:hover:text-[#eef0f5]"
            )}
          >
            <Settings2 className="w-3.5 h-3.5" />
            Configuration
          </button>
          <button
            onClick={() => setActiveTab("telemetry")}
            className={cn(
              "flex-1 py-2 border-b transition-colors flex items-center justify-center gap-1.5",
              activeTab === "telemetry"
                ? "border-slate-900 dark:border-[#eef0f5] text-slate-900 dark:text-[#eef0f5] font-medium"
                : "border-transparent text-slate-500 dark:text-[#7a8296] hover:text-slate-900 dark:hover:text-[#eef0f5]"
            )}
          >
            <Activity className="w-3.5 h-3.5" />
            Execution Trace
            {status !== "idle" && (
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full ml-1",
                  status === "running" && "bg-amber-500",
                  status === "completed" && "bg-emerald-500",
                  status === "failed" && "bg-rose-500",
                  status === "skipped" && "bg-slate-400"
                )}
              />
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === "config" ? (
            <div className="space-y-4 text-xs">
              {/* General Settings */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-700 dark:text-[#a3a9b8]">Node Label</label>
                <input
                  type="text"
                  value={(nodeData.label as string) || ""}
                  onChange={(e) => updateNodeData(selectedNodeId, { label: e.target.value })}
                  className="w-full bg-white dark:bg-[#11141c] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] rounded-md px-2.5 py-1.5 text-xs text-slate-900 dark:text-[#eef0f5] focus:outline-none focus:border-slate-400 dark:focus:border-[rgba(238,240,245,0.2)]"
                />
              </div>

              {kind === "trigger" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-700 dark:text-[#a3a9b8]">Trigger Type</label>
                    <select
                      value={(config.triggerType as string) || "webhook"}
                      onChange={(e) => handleConfigChange("triggerType", e.target.value)}
                      className="w-full bg-white dark:bg-[#11141c] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] rounded-md px-2.5 py-1.5 text-xs text-slate-900 dark:text-[#eef0f5] focus:outline-none focus:border-slate-400"
                    >
                      <option value="webhook">HTTP Webhook</option>
                      <option value="schedule">Cron Schedule</option>
                      <option value="manual">Manual Trigger</option>
                    </select>
                  </div>
                  {config.triggerType === "schedule" && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-700 dark:text-[#a3a9b8]">Cron Expression</label>
                      <input
                        type="text"
                        value={(config.cronExpression as string) || "0 * * * *"}
                        onChange={(e) => handleConfigChange("cronExpression", e.target.value)}
                        placeholder="e.g. 0 * * * *"
                        className="w-full bg-white dark:bg-[#11141c] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] rounded-md px-2.5 py-1.5 text-xs font-mono text-slate-900 dark:text-[#eef0f5] focus:outline-none focus:border-slate-400"
                      />
                    </div>
                  )}
                </div>
              )}

              {kind === "llm" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-700 dark:text-[#a3a9b8]">Gemini Model</label>
                    <select
                      value={(config.model as string) || "gemini-1.5-flash"}
                      onChange={(e) => handleConfigChange("model", e.target.value)}
                      className="w-full bg-white dark:bg-[#11141c] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] rounded-md px-2.5 py-1.5 text-xs text-slate-900 dark:text-[#eef0f5] focus:outline-none focus:border-slate-400 font-mono"
                    >
                      {SUPPORTED_GEMINI_MODELS.map((m: string) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-medium text-slate-700 dark:text-[#a3a9b8]">Temperature</span>
                      <span className="font-mono text-slate-500 dark:text-[#7a8296] tabular-nums">{((config.temperature as number) ?? 0.3).toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={(config.temperature as number) ?? 0.3}
                      onChange={(e) => handleConfigChange("temperature", parseFloat(e.target.value))}
                      className="w-full accent-slate-900 dark:accent-[#eef0f5] cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-md bg-slate-50 dark:bg-[#11141c] border border-slate-200 dark:border-[rgba(238,240,245,0.08)]">
                    <span className="text-xs text-slate-700 dark:text-[#a3a9b8]">Structured JSON Mode</span>
                    <input
                      type="checkbox"
                      checked={Boolean(config.jsonMode)}
                      onChange={(e) => handleConfigChange("jsonMode", e.target.checked)}
                      className="w-4 h-4 rounded accent-slate-900 dark:accent-[#eef0f5] cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-700 dark:text-[#a3a9b8]">System Instruction</label>
                    <textarea
                      rows={3}
                      value={(config.systemPrompt as string) || ""}
                      onChange={(e) => handleConfigChange("systemPrompt", e.target.value)}
                      className="w-full bg-white dark:bg-[#11141c] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] rounded-md p-2 text-xs text-slate-900 dark:text-[#eef0f5] focus:outline-none focus:border-slate-400"
                    />
                  </div>
                </div>
              )}

              {kind === "prompt" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-700 dark:text-[#a3a9b8]">Prompt Template</label>
                    <textarea
                      rows={6}
                      value={(config.template as string) || ""}
                      onChange={(e) => handleConfigChange("template", e.target.value)}
                      placeholder="Write prompt with {{variables}}..."
                      className="w-full bg-white dark:bg-[#11141c] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] rounded-md p-2 text-xs font-mono text-slate-900 dark:text-[#eef0f5] focus:outline-none focus:border-slate-400 leading-relaxed"
                    />
                    <p className="text-[10px] text-slate-500 dark:text-[#7a8296]">Double braces automatically create input ports.</p>
                  </div>
                </div>
              )}

              {kind === "condition" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-700 dark:text-[#a3a9b8]">Boolean Expression</label>
                    <input
                      type="text"
                      value={(config.expression as string) || ""}
                      onChange={(e) => handleConfigChange("expression", e.target.value)}
                      placeholder="e.g. {{sentiment}} == 'NEGATIVE'"
                      className="w-full bg-white dark:bg-[#11141c] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] rounded-md px-2.5 py-1.5 text-xs font-mono text-slate-900 dark:text-[#eef0f5] focus:outline-none focus:border-slate-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-700 dark:text-[#a3a9b8]">Fallback Branch</label>
                    <select
                      value={(config.fallbackBranch as string) || "false"}
                      onChange={(e) => handleConfigChange("fallbackBranch", e.target.value)}
                      className="w-full bg-white dark:bg-[#11141c] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] rounded-md px-2.5 py-1.5 text-xs text-slate-900 dark:text-[#eef0f5] focus:outline-none focus:border-slate-400"
                    >
                      <option value="false">Route to FALSE</option>
                      <option value="true">Route to TRUE</option>
                    </select>
                  </div>
                </div>
              )}

              {kind === "transform" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-700 dark:text-[#a3a9b8]">JSON Transform Template</label>
                    <textarea
                      rows={5}
                      value={(config.transformScript as string) || ""}
                      onChange={(e) => handleConfigChange("transformScript", e.target.value)}
                      placeholder='{ "lead": "{{inbound.lead}}", "score": {{inbound.score}} }'
                      className="w-full bg-white dark:bg-[#11141c] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] rounded-md p-2 text-xs font-mono text-slate-900 dark:text-[#eef0f5] focus:outline-none focus:border-slate-400"
                    />
                  </div>
                </div>
              )}

              {kind === "tool" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-700 dark:text-[#a3a9b8]">Endpoint URL</label>
                    <input
                      type="text"
                      value={(config.url as string) || ""}
                      onChange={(e) => handleConfigChange("url", e.target.value)}
                      placeholder="https://api.internal/v1/resource"
                      className="w-full bg-white dark:bg-[#11141c] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] rounded-md px-2.5 py-1.5 text-xs font-mono text-slate-900 dark:text-[#eef0f5] focus:outline-none focus:border-slate-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-700 dark:text-[#a3a9b8]">HTTP Method</label>
                    <select
                      value={(config.method as string) || "POST"}
                      onChange={(e) => handleConfigChange("method", e.target.value)}
                      className="w-full bg-white dark:bg-[#11141c] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] rounded-md px-2.5 py-1.5 text-xs text-slate-900 dark:text-[#eef0f5] focus:outline-none focus:border-slate-400"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </div>
                </div>
              )}

              {kind === "approval" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-700 dark:text-[#a3a9b8]">Approval Prompt</label>
                    <textarea
                      rows={3}
                      value={(config.prompt as string) || ""}
                      onChange={(e) => handleConfigChange("prompt", e.target.value)}
                      placeholder="Please review and approve this action..."
                      className="w-full bg-white dark:bg-[#11141c] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] rounded-md p-2 text-xs text-slate-900 dark:text-[#eef0f5] focus:outline-none focus:border-slate-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-700 dark:text-[#a3a9b8]">Timeout Action</label>
                    <select
                      value={(config.timeoutAction as string) || "reject"}
                      onChange={(e) => handleConfigChange("timeoutAction", e.target.value)}
                      className="w-full bg-white dark:bg-[#11141c] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] rounded-md px-2.5 py-1.5 text-xs text-slate-900 dark:text-[#eef0f5] focus:outline-none focus:border-slate-400"
                    >
                      <option value="reject">Auto Reject on Timeout</option>
                      <option value="approve">Auto Approve on Timeout</option>
                    </select>
                  </div>
                </div>
              )}

              {kind === "output" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-700 dark:text-[#a3a9b8]">Output Format</label>
                    <select
                      value={(config.outputFormat as string) || "json"}
                      onChange={(e) => handleConfigChange("outputFormat", e.target.value)}
                      className="w-full bg-white dark:bg-[#11141c] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] rounded-md px-2.5 py-1.5 text-xs text-slate-900 dark:text-[#eef0f5] focus:outline-none focus:border-slate-400"
                    >
                      <option value="json">Structured JSON</option>
                      <option value="markdown">Markdown Text</option>
                      <option value="text">Plain String</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Telemetry & Execution Trace */
            <div className="space-y-3">
              {/* Status Card */}
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#11141c] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-[#a3a9b8]">Execution Status</span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-mono font-medium uppercase tracking-wider",
                      status === "running" && "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
                      status === "completed" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-[#4cc38a]",
                      status === "failed" && "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-[#e5484d]",
                      status === "skipped" && "bg-slate-200 text-slate-700 dark:bg-[#1a1e28] dark:text-[#7a8296]",
                      status === "idle" && "bg-slate-200 text-slate-700 dark:bg-[#1a1e28] dark:text-[#7a8296]"
                    )}
                  >
                    {status.toUpperCase()}
                  </span>
                </div>

                {telemetry && (
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-[rgba(238,240,245,0.06)] text-center font-mono">
                    <div className="p-1.5 bg-white dark:bg-[#07080d] border border-slate-200 dark:border-[rgba(238,240,245,0.06)] rounded">
                      <p className="text-[9px] text-slate-500 dark:text-[#7a8296]">Latency</p>
                      <p className="text-xs text-slate-900 dark:text-[#eef0f5] mt-0.5 tabular-nums">{formatDuration(telemetry.durationMs)}</p>
                    </div>
                    <div className="p-1.5 bg-white dark:bg-[#07080d] border border-slate-200 dark:border-[rgba(238,240,245,0.06)] rounded">
                      <p className="text-[9px] text-slate-500 dark:text-[#7a8296]">Tokens</p>
                      <p className="text-xs text-slate-900 dark:text-[#eef0f5] mt-0.5 tabular-nums">
                        {formatTokens((telemetry.promptTokens || 0) + (telemetry.completionTokens || 0))}
                      </p>
                    </div>
                    <div className="p-1.5 bg-white dark:bg-[#07080d] border border-slate-200 dark:border-[rgba(238,240,245,0.06)] rounded">
                      <p className="text-[9px] text-slate-500 dark:text-[#7a8296]">Est. Cost</p>
                      <p className="text-xs text-slate-900 dark:text-[#eef0f5] mt-0.5 tabular-nums">{formatCost(telemetry.costUsd)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Live Streaming Output */}
              {telemetry?.streamText && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-[#a3a9b8]">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Streaming Output Buffer</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-[#11141c] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] text-xs font-mono text-slate-900 dark:text-[#eef0f5] max-h-40 overflow-y-auto leading-relaxed">
                    {telemetry.streamText}
                  </div>
                </div>
              )}

              {/* Output Data JSON Viewer */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-[#a3a9b8]">
                  <FileJson className="w-3.5 h-3.5" />
                  <span>Computed Node Output</span>
                </div>
                <pre className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#11141c] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] text-[11px] font-mono text-slate-800 dark:text-[#a3a9b8] max-h-60 overflow-y-auto leading-relaxed">
                  {telemetry?.outputData ? JSON.stringify(telemetry.outputData, null, 2) : "// No execution output recorded yet"}
                </pre>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
