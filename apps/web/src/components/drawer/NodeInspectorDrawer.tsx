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
    <aside
      className="fixed right-0 top-0 bottom-0 w-96 bg-charcoal-900 border-l border-charcoal-800 shadow-2xl z-30 flex flex-col backdrop-blur-xl animate-in slide-in-from-right duration-200"
      aria-label="Node Inspector"
    >
      {/* Header */}
      <div className="p-4 border-b border-charcoal-800 flex items-center justify-between bg-charcoal-950/60">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Settings2 className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h3 className="text-xs font-bold text-charcoal-100 uppercase tracking-wider">Node Inspector</h3>
            <p className="text-[10px] text-charcoal-400 font-mono truncate">{selectedNodeId}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => duplicateNode(selectedNodeId)}
            className="p-1.5 hover:bg-charcoal-800 rounded-lg text-charcoal-400 hover:text-white"
            title="Duplicate Node"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => removeNode(selectedNodeId)}
            className="p-1.5 hover:bg-rose-950/50 rounded-lg text-charcoal-400 hover:text-rose-400"
            title="Delete Node"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => selectNode(null)}
            className="p-1.5 hover:bg-charcoal-800 rounded-lg text-charcoal-400 hover:text-white ml-1"
            title="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-charcoal-800 bg-charcoal-950/40">
        <button
          onClick={() => setActiveTab("config")}
          className={cn(
            "flex-1 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center justify-center gap-1.5",
            activeTab === "config"
              ? "border-indigo-500 text-indigo-400 bg-indigo-500/5 font-semibold"
              : "border-transparent text-charcoal-400 hover:text-charcoal-200"
          )}
        >
          <Settings2 className="w-3.5 h-3.5" />
          Configuration
        </button>
        <button
          onClick={() => setActiveTab("telemetry")}
          className={cn(
            "flex-1 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center justify-center gap-1.5",
            activeTab === "telemetry"
              ? "border-indigo-500 text-indigo-400 bg-indigo-500/5 font-semibold"
              : "border-transparent text-charcoal-400 hover:text-charcoal-200"
          )}
        >
          <Activity className="w-3.5 h-3.5" />
          Execution Trace
          {status !== "idle" && (
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                status === "running" && "bg-amber-400 animate-ping",
                status === "completed" && "bg-emerald-400",
                status === "failed" && "bg-rose-400",
                status === "skipped" && "bg-charcoal-500"
              )}
            />
          )}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === "config" ? (
          <div className="space-y-4">
            {/* General Settings */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-charcoal-300">Node Label</label>
              <input
                type="text"
                value={(nodeData.label as string) || ""}
                onChange={(e) => updateNodeData(selectedNodeId, { label: e.target.value })}
                className="w-full bg-charcoal-950 border border-charcoal-800 rounded-lg px-3 py-2 text-xs text-charcoal-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-charcoal-300">Description</label>
              <input
                type="text"
                value={(nodeData.description as string) || ""}
                onChange={(e) => updateNodeData(selectedNodeId, { description: e.target.value })}
                className="w-full bg-charcoal-950 border border-charcoal-800 rounded-lg px-3 py-2 text-xs text-charcoal-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <hr className="border-charcoal-800/80 my-2" />

            {/* Specialized Settings by Kind */}
            {kind === "trigger" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-charcoal-300">Trigger Type</label>
                  <select
                    value={(config.triggerType as string) || "webhook"}
                    onChange={(e) => handleConfigChange("triggerType", e.target.value)}
                    className="w-full bg-charcoal-950 border border-charcoal-800 rounded-lg px-3 py-2 text-xs text-charcoal-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="webhook">Webhook (HTTP Ingress)</option>
                    <option value="schedule">Schedule (Cron)</option>
                    <option value="manual">Manual Execution</option>
                  </select>
                </div>

                {config.triggerType === "webhook" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-charcoal-300">HTTP Method</label>
                      <select
                        value={(config.webhookMethod as string) || "POST"}
                        onChange={(e) => handleConfigChange("webhookMethod", e.target.value)}
                        className="w-full bg-charcoal-950 border border-charcoal-800 rounded-lg px-3 py-2 text-xs text-charcoal-100 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="POST">POST</option>
                        <option value="GET">GET</option>
                        <option value="PUT">PUT</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-charcoal-300">Webhook Route</label>
                      <input
                        type="text"
                        value={(config.webhookPath as string) || "/api/v1/ingress/webhook-1"}
                        onChange={(e) => handleConfigChange("webhookPath", e.target.value)}
                        className="w-full bg-charcoal-950 border border-charcoal-800 rounded-lg px-3 py-2 text-xs font-mono text-charcoal-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </>
                )}

                {config.triggerType === "schedule" && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-charcoal-300">Cron Expression</label>
                    <input
                      type="text"
                      value={(config.cronExpression as string) || "0 * * * *"}
                      onChange={(e) => handleConfigChange("cronExpression", e.target.value)}
                      placeholder="e.g. 0 * * * *"
                      className="w-full bg-charcoal-950 border border-charcoal-800 rounded-lg px-3 py-2 text-xs font-mono text-charcoal-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}
              </div>
            )}

            {kind === "llm" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-charcoal-300">Gemini Model</label>
                  <select
                    value={(config.model as string) || "gemini-1.5-flash"}
                    onChange={(e) => handleConfigChange("model", e.target.value)}
                    className="w-full bg-charcoal-950 border border-charcoal-800 rounded-lg px-3 py-2 text-xs text-charcoal-100 focus:outline-none focus:border-indigo-500 font-mono"
                  >
                    {SUPPORTED_GEMINI_MODELS.map((m: string) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-semibold text-charcoal-300">Temperature</span>
                    <span className="font-mono text-charcoal-400">{((config.temperature as number) ?? 0.3).toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={(config.temperature as number) ?? 0.3}
                    onChange={(e) => handleConfigChange("temperature", parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-charcoal-950 border border-charcoal-800">
                  <span className="text-xs text-charcoal-300">Structured JSON Mode</span>
                  <input
                    type="checkbox"
                    checked={Boolean(config.jsonMode)}
                    onChange={(e) => handleConfigChange("jsonMode", e.target.checked)}
                    className="w-4 h-4 rounded accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-charcoal-300">System Instruction</label>
                  <textarea
                    rows={3}
                    value={(config.systemPrompt as string) || ""}
                    onChange={(e) => handleConfigChange("systemPrompt", e.target.value)}
                    className="w-full bg-charcoal-950 border border-charcoal-800 rounded-lg p-2 text-xs text-charcoal-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {kind === "prompt" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-charcoal-300">Prompt Template</label>
                  <textarea
                    rows={6}
                    value={(config.template as string) || ""}
                    onChange={(e) => handleConfigChange("template", e.target.value)}
                    placeholder="Write prompt with {{variables}}..."
                    className="w-full bg-charcoal-950 border border-charcoal-800 rounded-lg p-2.5 text-xs font-mono text-charcoal-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
                  <p className="text-[10px] text-charcoal-500">Variables enclosed in double braces automatically create input ports.</p>
                </div>
              </div>
            )}

            {kind === "condition" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-charcoal-300">Boolean Expression</label>
                  <input
                    type="text"
                    value={(config.expression as string) || ""}
                    onChange={(e) => handleConfigChange("expression", e.target.value)}
                    placeholder="e.g. {{sentiment}} == 'NEGATIVE'"
                    className="w-full bg-charcoal-950 border border-charcoal-800 rounded-lg px-3 py-2 text-xs font-mono text-charcoal-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-charcoal-300">Fallback Branch</label>
                  <select
                    value={(config.fallbackBranch as string) || "false"}
                    onChange={(e) => handleConfigChange("fallbackBranch", e.target.value)}
                    className="w-full bg-charcoal-950 border border-charcoal-800 rounded-lg px-3 py-2 text-xs text-charcoal-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                </div>
              </div>
            )}

            {kind === "tool" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-charcoal-300">HTTP Method</label>
                  <select
                    value={(config.httpMethod as string) || "POST"}
                    onChange={(e) => handleConfigChange("httpMethod", e.target.value)}
                    className="w-full bg-charcoal-950 border border-charcoal-800 rounded-lg px-3 py-2 text-xs text-charcoal-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-charcoal-300">Endpoint URL</label>
                  <input
                    type="url"
                    value={(config.url as string) || ""}
                    onChange={(e) => handleConfigChange("url", e.target.value)}
                    placeholder="https://api.domain.com/v1/action"
                    className="w-full bg-charcoal-950 border border-charcoal-800 rounded-lg px-3 py-2 text-xs font-mono text-charcoal-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-charcoal-300">Timeout (ms)</label>
                  <input
                    type="number"
                    value={(config.timeoutMs as number) || 5000}
                    onChange={(e) => handleConfigChange("timeoutMs", parseInt(e.target.value, 10))}
                    className="w-full bg-charcoal-950 border border-charcoal-800 rounded-lg px-3 py-2 text-xs font-mono text-charcoal-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {kind === "output" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-charcoal-300">Output Format</label>
                  <select
                    value={(config.outputFormat as string) || "json"}
                    onChange={(e) => handleConfigChange("outputFormat", e.target.value)}
                    className="w-full bg-charcoal-950 border border-charcoal-800 rounded-lg px-3 py-2 text-xs text-charcoal-100 focus:outline-none focus:border-indigo-500"
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
          <div className="space-y-4">
            {/* Status Card */}
            <div className="p-3 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-charcoal-400">Execution Status</span>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider",
                    status === "running" && "bg-amber-500/10 text-amber-400 border border-amber-500/20",
                    status === "completed" && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                    status === "failed" && "bg-rose-500/10 text-rose-400 border border-rose-500/20",
                    status === "skipped" && "bg-charcoal-800 text-charcoal-400",
                    status === "idle" && "bg-charcoal-800 text-charcoal-400"
                  )}
                >
                  {status}
                </span>
              </div>

              {telemetry && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-charcoal-800/80 text-center font-mono">
                  <div className="p-1.5 bg-charcoal-900/60 rounded">
                    <p className="text-[9px] text-charcoal-500">Latency</p>
                    <p className="text-xs text-charcoal-200 mt-0.5">{formatDuration(telemetry.durationMs)}</p>
                  </div>
                  <div className="p-1.5 bg-charcoal-900/60 rounded">
                    <p className="text-[9px] text-charcoal-500">Tokens</p>
                    <p className="text-xs text-charcoal-200 mt-0.5">
                      {formatTokens((telemetry.promptTokens || 0) + (telemetry.completionTokens || 0))}
                    </p>
                  </div>
                  <div className="p-1.5 bg-charcoal-900/60 rounded">
                    <p className="text-[9px] text-charcoal-500">Est. Cost</p>
                    <p className="text-xs text-emerald-400 mt-0.5">{formatCost(telemetry.costUsd)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Live Streaming Output */}
            {telemetry?.streamText && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Streaming Output Buffer</span>
                </div>
                <div className="p-2.5 rounded-lg bg-charcoal-950 border border-indigo-500/30 text-xs font-mono text-indigo-200 max-h-40 overflow-y-auto leading-relaxed">
                  {telemetry.streamText}
                </div>
              </div>
            )}

            {/* Output Data JSON Viewer */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-charcoal-300 font-semibold">
                <FileJson className="w-3.5 h-3.5 text-emerald-400" />
                <span>Computed Node Output</span>
              </div>
              <pre className="p-2.5 rounded-lg bg-charcoal-950 border border-charcoal-800 text-[11px] font-mono text-charcoal-300 max-h-60 overflow-y-auto leading-relaxed">
                {telemetry?.outputData ? JSON.stringify(telemetry.outputData, null, 2) : "// No execution output recorded yet"}
              </pre>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
