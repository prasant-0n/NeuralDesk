import React, { useState } from "react";
import {
  History,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  X,
  Layers,
} from "lucide-react";
import { useWorkflowStore, type ExecutionRecord } from "../../store/workflowStore";
import { formatDuration, formatCost, formatTokens } from "../../lib/utils";

export const ExecutionsView: React.FC = () => {
  const executionHistory = useWorkflowStore((state) => state.executionHistory);
  const [selectedExec, setSelectedExec] = useState<ExecutionRecord | null>(null);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-charcoal-950 flex flex-col select-none">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Execution History & Telemetry</h1>
          <p className="text-xs text-charcoal-400 mt-0.5">Immutable audit trail of past DAG runs, latency, and token ledger</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-charcoal-400">
          <History className="w-4 h-4 text-indigo-400" />
          <span>{executionHistory.length} Recorded Runs</span>
        </div>
      </div>

      {/* Executions Table */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-charcoal-800 bg-charcoal-950/70 text-charcoal-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Execution ID</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Trigger</th>
                <th className="py-3 px-4">Started At</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Tokens</th>
                <th className="py-3 px-4">Cost (USD)</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800/60 font-mono">
              {executionHistory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-charcoal-500 font-sans italic">
                    No execution records found. Run a workflow on the canvas to generate telemetry.
                  </td>
                </tr>
              ) : (
                executionHistory.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedExec(item)}
                    className="hover:bg-charcoal-850/60 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-bold text-charcoal-200 group-hover:text-indigo-400 transition-colors">
                      {item.id}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          item.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : item.status === "running"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {item.status === "completed" && <CheckCircle2 className="w-3 h-3" />}
                        {item.status === "failed" && <AlertCircle className="w-3 h-3" />}
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 capitalize text-charcoal-300">{item.triggerSource}</td>
                    <td className="py-3 px-4 text-charcoal-400">{new Date(item.startedAt).toLocaleTimeString()}</td>
                    <td className="py-3 px-4 text-charcoal-300">{formatDuration(item.durationMs)}</td>
                    <td className="py-3 px-4 text-charcoal-300">{formatTokens(item.totalTokens)}</td>
                    <td className="py-3 px-4 text-emerald-400 font-semibold">{formatCost(item.costUsd)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedExec(item);
                        }}
                        className="p-1 hover:bg-charcoal-800 rounded text-charcoal-400 hover:text-white"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Execution Trace Modal */}
      {selectedExec && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedExec(null)}
        >
          <div
            className="w-full max-w-2xl bg-charcoal-900 border border-charcoal-800 rounded-2xl shadow-2xl overflow-hidden select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-charcoal-800 flex items-center justify-between bg-charcoal-950/60">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold text-white font-mono">Trace: {selectedExec.id}</h3>
              </div>
              <button
                onClick={() => setSelectedExec(null)}
                className="p-1 hover:bg-charcoal-800 rounded text-charcoal-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs font-mono max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-2 bg-charcoal-950 rounded-lg border border-charcoal-800">
                  <p className="text-[10px] text-charcoal-500">Status</p>
                  <p className="text-xs font-bold text-emerald-400 uppercase mt-0.5">{selectedExec.status}</p>
                </div>
                <div className="p-2 bg-charcoal-950 rounded-lg border border-charcoal-800">
                  <p className="text-[10px] text-charcoal-500">Total Latency</p>
                  <p className="text-xs font-bold text-charcoal-200 mt-0.5">{formatDuration(selectedExec.durationMs)}</p>
                </div>
                <div className="p-2 bg-charcoal-950 rounded-lg border border-charcoal-800">
                  <p className="text-[10px] text-charcoal-500">Total Tokens</p>
                  <p className="text-xs font-bold text-charcoal-200 mt-0.5">{formatTokens(selectedExec.totalTokens)}</p>
                </div>
                <div className="p-2 bg-charcoal-950 rounded-lg border border-charcoal-800">
                  <p className="text-[10px] text-charcoal-500">Cost (USD)</p>
                  <p className="text-xs font-bold text-emerald-400 mt-0.5">{formatCost(selectedExec.costUsd)}</p>
                </div>
              </div>

              {/* Node Statuses */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-charcoal-200 uppercase tracking-wider">Node Step Topography</h4>
                <div className="space-y-1.5">
                  {Object.entries(selectedExec.nodeStatuses).map(([nodeId, status]) => (
                    <div
                      key={nodeId}
                      className="flex items-center justify-between p-2 rounded-lg bg-charcoal-950 border border-charcoal-800/80"
                    >
                      <span className="text-charcoal-300 font-semibold">{nodeId}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          status === "completed"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : status === "skipped"
                            ? "bg-charcoal-800 text-charcoal-500"
                            : "bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Node Outputs */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-charcoal-200 uppercase tracking-wider">Captured Payloads</h4>
                <pre className="p-3 bg-charcoal-950 border border-charcoal-800 rounded-xl text-[11px] text-charcoal-300 overflow-x-auto leading-relaxed">
                  {JSON.stringify(selectedExec.nodeOutputs, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
