import React, { useState, useEffect, useMemo } from "react";
import {
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  X,
  RefreshCw,
  Search,
  RotateCcw,
  StopCircle,
  Copy,
  Check,
  ChevronLeft,
} from "lucide-react";
import { useWorkflowStore, type ExecutionRecord } from "../../store/workflowStore";
import { formatDuration, formatCost, formatTokens, cn } from "../../lib/utils";
import { apiFetch } from "../../lib/api";

type StatusFilter = "all" | "completed" | "failed" | "running" | "waiting_for_approval";

export const ExecutionsView: React.FC = () => {
  const executionHistory = useWorkflowStore((state) => state.executionHistory);
  const fetchExecutionsFromApi = useWorkflowStore((state) => state.fetchExecutionsFromApi);

  const [selectedExec, setSelectedExec] = useState<ExecutionRecord | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [copiedTrace, setCopiedTrace] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchExecutionsFromApi();
  }, [fetchExecutionsFromApi]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchExecutionsFromApi();
    } finally {
      setTimeout(() => setIsRefreshing(false), 350);
    }
  };

  const filteredRecords = useMemo(() => {
    return executionHistory.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesId = item.id.toLowerCase().includes(query);
        const matchesTrigger = (item.triggerSource || "").toLowerCase().includes(query);
        const matchesWorkflow = (item.workflowId || "").toLowerCase().includes(query);
        if (!matchesId && !matchesTrigger && !matchesWorkflow) {
          return false;
        }
      }
      return true;
    });
  }, [executionHistory, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRecords.slice(startIndex, startIndex + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const counts = useMemo(() => {
    return {
      all: executionHistory.length,
      completed: executionHistory.filter((e) => e.status === "completed").length,
      failed: executionHistory.filter((e) => e.status === "failed").length,
      running: executionHistory.filter((e) => e.status === "running").length,
      waiting_for_approval: executionHistory.filter((e) => e.status === "waiting_for_approval").length,
    };
  }, [executionHistory]);

  const handleRerun = async (e: React.MouseEvent, execId: string) => {
    e.stopPropagation();
    setActionLoadingId(execId);
    try {
      const res = await apiFetch(`/api/v1/executions/${execId}/rerun`, { method: "POST" });
      if (res.ok) {
        await fetchExecutionsFromApi();
      }
    } catch (err) {
      console.error("Failed to rerun execution:", err);
    } finally {
      setTimeout(() => setActionLoadingId(null), 400);
    }
  };

  const handleCancel = async (e: React.MouseEvent, execId: string) => {
    e.stopPropagation();
    setActionLoadingId(execId);
    try {
      const res = await apiFetch(`/api/v1/executions/${execId}/cancel`, { method: "POST" });
      if (res.ok) {
        await fetchExecutionsFromApi();
      }
    } catch (err) {
      console.error("Failed to cancel execution:", err);
    } finally {
      setTimeout(() => setActionLoadingId(null), 400);
    }
  };

  const copyTraceData = (exec: ExecutionRecord) => {
    navigator.clipboard.writeText(JSON.stringify(exec, null, 2));
    setCopiedTrace(true);
    setTimeout(() => setCopiedTrace(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#f5f7fa] dark:bg-[#0b0d14] flex flex-col transition-colors duration-150">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-medium text-slate-900 dark:text-[#eef0f5] tracking-tight">
              Execution History & Telemetry
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#11141c] text-slate-600 dark:text-[#a3a9b8] border border-slate-200 dark:border-[rgba(238,240,245,0.08)]">
              {executionHistory.length} Recorded
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#7a8296] mt-0.5 font-mono">
            Immutable Lakebase run checkpoints, token cost audits, and trace payloads
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 h-8 px-3 rounded-md border border-slate-200 dark:border-[rgba(238,240,245,0.08)] bg-white dark:bg-[#11141c] hover:bg-slate-50 dark:hover:bg-[#1a1e28] text-slate-700 dark:text-[#a3a9b8] text-xs font-mono transition-colors disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#11141c] p-2.5 rounded-lg border border-slate-200 dark:border-[rgba(238,240,245,0.08)]">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1 font-mono text-xs">
          {(
            [
              { id: "all", label: "All", count: counts.all },
              { id: "completed", label: "Completed", count: counts.completed },
              { id: "failed", label: "Failed", count: counts.failed },
              { id: "running", label: "Running", count: counts.running },
              { id: "waiting_for_approval", label: "Gate Pending", count: counts.waiting_for_approval },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setCurrentPage(1);
              }}
              className={cn(
                "px-2.5 py-1 rounded text-xs transition-colors cursor-pointer",
                statusFilter === tab.id
                  ? "bg-slate-900 text-white dark:bg-[#eef0f5] dark:text-[#0b0d14] font-medium"
                  : "text-slate-600 dark:text-[#7a8296] hover:text-slate-900 dark:hover:text-[#eef0f5]"
              )}
            >
              <span>{tab.label}</span>
              <span className="ml-1 opacity-70">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID or trigger..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-2.5 py-1 text-xs rounded border border-slate-200 dark:border-[rgba(238,240,245,0.08)] bg-slate-50 dark:bg-[#07080d] text-slate-900 dark:text-[#eef0f5] placeholder:text-slate-400 focus:outline-none focus:border-slate-400 font-mono"
          />
        </div>
      </div>

      {/* Executions Table */}
      <div className="bg-white dark:bg-[#11141c] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] rounded-xl overflow-hidden flex-1 flex flex-col justify-between">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[rgba(238,240,245,0.08)] bg-slate-50 dark:bg-[#07080d] text-slate-500 dark:text-[#7a8296] text-[11px]">
                <th className="py-2.5 px-4 font-medium">Execution ID</th>
                <th className="py-2.5 px-4 font-medium">Status</th>
                <th className="py-2.5 px-4 font-medium">Trigger</th>
                <th className="py-2.5 px-4 font-medium">Started At</th>
                <th className="py-2.5 px-4 font-medium">Duration</th>
                <th className="py-2.5 px-4 font-medium">Tokens</th>
                <th className="py-2.5 px-4 font-medium">Cost (USD)</th>
                <th className="py-2.5 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[rgba(238,240,245,0.04)]">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-[#7a8296] font-sans">
                    {searchQuery ? "No executions match your search filter." : "No execution records found."}
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedExec(item)}
                    className="hover:bg-slate-50 dark:hover:bg-[#1a1e28] transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-[#eef0f5]">
                      {item.id}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider",
                          item.status === "completed" && "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-[#4cc38a]",
                          item.status === "running" && "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
                          item.status === "waiting_for_approval" && "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
                          item.status === "failed" && "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-[#e5484d]"
                        )}
                      >
                        {item.status === "completed" && <CheckCircle2 className="w-3 h-3" />}
                        {item.status === "failed" && <AlertCircle className="w-3 h-3" />}
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-[#a3a9b8] capitalize">{item.triggerSource}</td>
                    <td className="py-2.5 px-4 text-slate-500 dark:text-[#7a8296] tabular-nums">{new Date(item.startedAt).toLocaleTimeString()}</td>
                    <td className="py-2.5 px-4 text-slate-700 dark:text-[#eef0f5] tabular-nums">{formatDuration(item.durationMs)}</td>
                    <td className="py-2.5 px-4 text-slate-700 dark:text-[#eef0f5] tabular-nums">{formatTokens(item.totalTokens)}</td>
                    <td className="py-2.5 px-4 text-slate-900 dark:text-[#eef0f5] font-medium tabular-nums">{formatCost(item.costUsd)}</td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => handleRerun(e, item.id)}
                          disabled={actionLoadingId === item.id}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#1a1e28] text-slate-400 hover:text-slate-700 dark:hover:text-[#eef0f5] transition-colors"
                          title="Replay this execution with original inputs"
                        >
                          <RotateCcw className={cn("w-3 h-3", actionLoadingId === item.id && "animate-spin")} />
                        </button>
                        {item.status === "running" && (
                          <button
                            onClick={(e) => handleCancel(e, item.id)}
                            disabled={actionLoadingId === item.id}
                            className="p-1 rounded hover:bg-rose-50 text-rose-500 transition-colors"
                            title="Cancel active execution"
                          >
                            <StopCircle className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedExec(item);
                          }}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-[#1a1e28] rounded text-slate-400 hover:text-slate-700 dark:hover:text-[#eef0f5]"
                          title="Inspect Execution Trace"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Strip */}
        <div className="p-3 border-t border-slate-200 dark:border-[rgba(238,240,245,0.08)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-[#7a8296] font-mono">
          <div className="flex items-center gap-2">
            <span>Showing {paginatedRecords.length} of {filteredRecords.length} records</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-100 dark:bg-[#07080d] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] rounded px-1.5 py-0.5 text-xs text-slate-800 dark:text-[#eef0f5]"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="tabular-nums">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded border border-slate-200 dark:border-[rgba(238,240,245,0.08)] disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-[#1a1e28] transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1 rounded border border-slate-200 dark:border-[rgba(238,240,245,0.08)] disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-[#1a1e28] transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Execution Detail Slide-Over Modal / Drawer */}
      {selectedExec && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 p-4 transition-opacity"
          onClick={() => setSelectedExec(null)}
        >
          <div
            className="w-full max-w-2xl bg-white dark:bg-[#11141c] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 dark:border-[rgba(238,240,245,0.08)] flex items-center justify-between bg-slate-50 dark:bg-[#07080d]">
              <div>
                <h3 className="text-xs font-mono font-medium text-slate-900 dark:text-[#eef0f5]">
                  Trace // {selectedExec.id}
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-[#7a8296] font-mono">
                  Trigger: {selectedExec.triggerSource} • Started {new Date(selectedExec.startedAt).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => copyTraceData(selectedExec)}
                  className="px-2.5 py-1 rounded border border-slate-200 dark:border-[rgba(238,240,245,0.08)] text-xs font-mono text-slate-700 dark:text-[#a3a9b8] hover:bg-slate-100 dark:hover:bg-[#1a1e28] inline-flex items-center gap-1"
                >
                  {copiedTrace ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedTrace ? "Copied" : "Copy"}</span>
                </button>
                <button
                  onClick={() => setSelectedExec(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-[#eef0f5]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 text-xs font-mono">
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded bg-slate-50 dark:bg-[#07080d] border border-slate-200 dark:border-[rgba(238,240,245,0.06)]">
                  <span className="text-[10px] text-slate-500">Status</span>
                  <p className="font-medium text-slate-900 dark:text-[#eef0f5] mt-0.5 uppercase">{selectedExec.status}</p>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-[#07080d] border border-slate-200 dark:border-[rgba(238,240,245,0.06)]">
                  <span className="text-[10px] text-slate-500">Duration</span>
                  <p className="font-medium text-slate-900 dark:text-[#eef0f5] mt-0.5">{formatDuration(selectedExec.durationMs)}</p>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-[#07080d] border border-slate-200 dark:border-[rgba(238,240,245,0.06)]">
                  <span className="text-[10px] text-slate-500">Tokens</span>
                  <p className="font-medium text-slate-900 dark:text-[#eef0f5] mt-0.5">{formatTokens(selectedExec.totalTokens)}</p>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-[#07080d] border border-slate-200 dark:border-[rgba(238,240,245,0.06)]">
                  <span className="text-[10px] text-slate-500">Cost</span>
                  <p className="font-medium text-slate-900 dark:text-[#eef0f5] mt-0.5">{formatCost(selectedExec.costUsd)}</p>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 dark:text-[#7a8296] block mb-1">Execution Payload JSON</span>
                <pre className="p-3 rounded bg-slate-50 dark:bg-[#07080d] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] text-[11px] text-slate-800 dark:text-[#a3a9b8] overflow-x-auto leading-relaxed">
                  {JSON.stringify(selectedExec, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
