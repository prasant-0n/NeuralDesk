import React, { useState, useEffect, useMemo } from "react";
import {
  History,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  X,
  Layers,
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
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  // Filter & Search Records
  const filteredRecords = useMemo(() => {
    return executionHistory.filter((item) => {
      // Status filter
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }
      // Search query
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

  // Pagination slicing
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRecords.slice(startIndex, startIndex + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Status counts for filter pills
  const counts = useMemo(() => {
    return {
      all: executionHistory.length,
      completed: executionHistory.filter((e) => e.status === "completed").length,
      failed: executionHistory.filter((e) => e.status === "failed").length,
      running: executionHistory.filter((e) => e.status === "running").length,
      waiting_for_approval: executionHistory.filter((e) => e.status === "waiting_for_approval").length,
    };
  }, [executionHistory]);

  // Re-run execution action
  const handleRerun = async (e: React.MouseEvent, execId: string) => {
    e.stopPropagation();
    setActionLoadingId(execId);
    try {
      const res = await fetch(`/api/v1/executions/${execId}/rerun`, { method: "POST" });
      if (res.ok) {
        await fetchExecutionsFromApi();
      }
    } catch (err) {
      console.error("Failed to rerun execution:", err);
    } finally {
      setTimeout(() => setActionLoadingId(null), 500);
    }
  };

  // Cancel execution action
  const handleCancel = async (e: React.MouseEvent, execId: string) => {
    e.stopPropagation();
    setActionLoadingId(execId);
    try {
      const res = await fetch(`/api/v1/executions/${execId}/cancel`, { method: "POST" });
      if (res.ok) {
        await fetchExecutionsFromApi();
      }
    } catch (err) {
      console.error("Failed to cancel execution:", err);
    } finally {
      setTimeout(() => setActionLoadingId(null), 500);
    }
  };

  const handleCopyTrace = () => {
    if (!selectedExec) return;
    navigator.clipboard.writeText(JSON.stringify(selectedExec, null, 2));
    setCopiedTrace(true);
    setTimeout(() => setCopiedTrace(false), 1500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50 dark:bg-charcoal-950 flex flex-col select-none transition-colors duration-150">
      {/* Title & Refresh Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Execution History &amp; Telemetry
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-mono">
              <History className="w-3.5 h-3.5" />
              {executionHistory.length} Recorded Runs
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-charcoal-400 mt-0.5">
            Immutable audit trail of past DAG runs, step waterfall, and token ledger
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 hover:bg-slate-100 dark:hover:bg-charcoal-800 text-slate-700 dark:text-charcoal-300 text-xs font-medium transition-colors shadow-sm disabled:opacity-50 self-start sm:self-auto"
          title="Refresh execution records from backend"
        >
          <RefreshCw className={cn("w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400", isRefreshing && "animate-spin")} />
          <span>Refresh Audit</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: "all", label: "All", count: counts.all },
              { id: "completed", label: "Completed", count: counts.completed },
              { id: "failed", label: "Failed", count: counts.failed },
              { id: "running", label: "Running", count: counts.running },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setCurrentPage(1);
              }}
              className={cn(
                "px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5",
                statusFilter === tab.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-charcoal-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-charcoal-800"
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                  statusFilter === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 dark:bg-charcoal-800 text-slate-600 dark:text-charcoal-400"
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID or trigger..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-charcoal-800 bg-slate-50 dark:bg-charcoal-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
          />
        </div>
      </div>

      {/* Executions Table */}
      <div className="bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl flex-1 flex flex-col justify-between">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-charcoal-800 bg-slate-50/80 dark:bg-charcoal-950/70 text-slate-500 dark:text-charcoal-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Execution ID</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Trigger</th>
                <th className="py-3 px-4">Started At</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Tokens</th>
                <th className="py-3 px-4">Cost (USD)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-charcoal-800/60 font-mono">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-charcoal-500 font-sans italic">
                    {searchQuery ? "No executions match your search filter." : "No execution records found."}
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedExec(item)}
                    className="hover:bg-slate-50 dark:hover:bg-charcoal-850/60 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-charcoal-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.id}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          item.status === "completed"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                            : item.status === "running"
                            ? "bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 animate-pulse"
                            : item.status === "waiting_for_approval"
                            ? "bg-purple-50 text-purple-700 border border-purple-300 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20"
                            : "bg-rose-50 text-rose-700 border border-rose-300 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                        }`}
                      >
                        {item.status === "completed" && <CheckCircle2 className="w-3 h-3" />}
                        {item.status === "failed" && <AlertCircle className="w-3 h-3" />}
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 capitalize text-slate-700 dark:text-charcoal-300">{item.triggerSource}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-charcoal-400">{new Date(item.startedAt).toLocaleTimeString()}</td>
                    <td className="py-3 px-4 text-slate-700 dark:text-charcoal-300">{formatDuration(item.durationMs)}</td>
                    <td className="py-3 px-4 text-slate-700 dark:text-charcoal-300">{formatTokens(item.totalTokens)}</td>
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">{formatCost(item.costUsd)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Re-run Button */}
                        <button
                          onClick={(e) => handleRerun(e, item.id)}
                          disabled={actionLoadingId === item.id}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-charcoal-800 text-slate-500 dark:text-charcoal-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          title="Replay this execution with original inputs"
                        >
                          <RotateCcw className={cn("w-3.5 h-3.5", actionLoadingId === item.id && "animate-spin text-indigo-500")} />
                        </button>

                        {/* Cancel Button if running */}
                        {item.status === "running" && (
                          <button
                            onClick={(e) => handleCancel(e, item.id)}
                            disabled={actionLoadingId === item.id}
                            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 transition-colors"
                            title="Cancel active execution"
                          >
                            <StopCircle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* View Trace */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedExec(item);
                          }}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-charcoal-800 rounded-lg text-slate-400 hover:text-slate-800 dark:text-charcoal-400 dark:hover:text-white"
                          title="Inspect Execution Trace"
                        >
                          <ChevronRight className="w-4 h-4" />
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
        <div className="p-3 border-t border-slate-200 dark:border-charcoal-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-charcoal-400">
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
                className="bg-slate-50 dark:bg-charcoal-950 border border-slate-200 dark:border-charcoal-800 rounded px-1.5 py-0.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span>Page {currentPage} of {totalPages}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-1 rounded border border-slate-200 dark:border-charcoal-800 hover:bg-slate-100 dark:hover:bg-charcoal-800 disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-1 rounded border border-slate-200 dark:border-charcoal-800 hover:bg-slate-100 dark:hover:bg-charcoal-800 disabled:opacity-40"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Execution Trace Modal */}
      {selectedExec && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedExec(null)}
        >
          <div
            className="w-full max-w-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 rounded-2xl shadow-2xl overflow-hidden select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 dark:border-charcoal-800 flex items-center justify-between bg-slate-50 dark:bg-charcoal-950/60">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                  Execution Trace: {selectedExec.id}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyTrace}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 hover:bg-slate-100 dark:hover:bg-charcoal-800 text-[11px] font-medium text-slate-700 dark:text-charcoal-300"
                  title="Copy full trace JSON to clipboard"
                >
                  {copiedTrace ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedTrace ? "Copied" : "Copy JSON"}</span>
                </button>

                <button
                  onClick={() => setSelectedExec(null)}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-charcoal-800 rounded text-slate-400 hover:text-slate-800 dark:text-charcoal-400 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4 text-xs font-mono max-h-[70vh] overflow-y-auto">
              {/* Stat Summary Grid */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-2 bg-slate-50 dark:bg-charcoal-950 rounded-lg border border-slate-200 dark:border-charcoal-800">
                  <p className="text-[10px] text-slate-500 dark:text-charcoal-500">Status</p>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase mt-0.5">
                    {selectedExec.status}
                  </p>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-charcoal-950 rounded-lg border border-slate-200 dark:border-charcoal-800">
                  <p className="text-[10px] text-slate-500 dark:text-charcoal-500">Total Latency</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-charcoal-200 mt-0.5">
                    {formatDuration(selectedExec.durationMs)}
                  </p>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-charcoal-950 rounded-lg border border-slate-200 dark:border-charcoal-800">
                  <p className="text-[10px] text-slate-500 dark:text-charcoal-500">Total Tokens</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-charcoal-200 mt-0.5">
                    {formatTokens(selectedExec.totalTokens)}
                  </p>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-charcoal-950 rounded-lg border border-slate-200 dark:border-charcoal-800">
                  <p className="text-[10px] text-slate-500 dark:text-charcoal-500">Cost (USD)</p>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {formatCost(selectedExec.costUsd)}
                  </p>
                </div>
              </div>

              {/* Node Statuses */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-charcoal-200 uppercase tracking-wider">
                  Node Step Topography
                </h4>
                <div className="space-y-1.5">
                  {Object.entries(selectedExec.nodeStatuses).length === 0 ? (
                    <div className="p-3 bg-slate-50 dark:bg-charcoal-950 border border-slate-200 dark:border-charcoal-800 rounded-lg text-slate-500 italic text-[11px]">
                      Historical simulation record. Individual step traces captured in server ledger.
                    </div>
                  ) : (
                    Object.entries(selectedExec.nodeStatuses).map(([nodeId, status]) => (
                      <div
                        key={nodeId}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-charcoal-950 border border-slate-200 dark:border-charcoal-800/80"
                      >
                        <span className="text-slate-700 dark:text-charcoal-300 font-semibold">{nodeId}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            status === "completed"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400"
                              : status === "skipped"
                              ? "bg-slate-200 text-slate-500 dark:bg-charcoal-800 dark:text-charcoal-500"
                              : "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400"
                          }`}
                        >
                          {status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Node Outputs */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-charcoal-200 uppercase tracking-wider">
                  Captured Output Payloads
                </h4>
                <pre className="p-3 bg-slate-100 dark:bg-charcoal-950 border border-slate-200 dark:border-charcoal-800 rounded-xl text-[11px] text-slate-800 dark:text-charcoal-300 overflow-x-auto leading-relaxed">
                  {JSON.stringify(selectedExec.nodeOutputs || {}, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
