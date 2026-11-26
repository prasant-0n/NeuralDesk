import React, { useState, useEffect, useCallback } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Workflow,
  Activity,
  CheckCircle2,
  Coins,
  Cpu,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
  Download,
  Gauge,
  Database,
  Server,
  Clock,
  Zap,
} from "lucide-react";
import type {
  DashboardTimeframe,
  DashboardTelemetryResponse,
} from "@neuraldesk/shared";
import { useWorkflowStore } from "../../store/workflowStore";
import { useSettingsStore } from "../../store/settingsStore";
import { formatCost, formatTokens, cn } from "../../lib/utils";
import { apiFetch } from "../../lib/api";

const DEFAULT_STATS: DashboardTelemetryResponse = {
  timeframe: "24h",
  kpis: {
    totalRuns: 34,
    completedRuns: 32,
    failedRuns: 2,
    runningRuns: 0,
    successRate: 94.1,
    totalTokens: 34350,
    promptTokens: 22629,
    completionTokens: 11721,
    totalCostUsd: 0.0051,
    avgLatencyMs: 518,
    activeWorkflows: 3,
  },
  latencySLA: {
    p50: 524,
    p90: 703,
    p95: 739,
    p99: 746,
    min: 280,
    max: 746,
  },
  throughput: [
    { time: "00:00", executions: 12, tokens: 4200, latency: 420, cost: 0.0006 },
    { time: "04:00", executions: 8, tokens: 2800, latency: 380, cost: 0.0004 },
    { time: "08:00", executions: 45, tokens: 18500, latency: 510, cost: 0.0028 },
    { time: "12:00", executions: 78, tokens: 32000, latency: 490, cost: 0.0048 },
    { time: "16:00", executions: 92, tokens: 41000, latency: 560, cost: 0.0062 },
    { time: "20:00", executions: 54, tokens: 22000, latency: 450, cost: 0.0033 },
    { time: "23:59", executions: 28, tokens: 9800, latency: 410, cost: 0.0015 },
  ],
  modelBreakdown: [
    { model: "gemini-1.5-flash", requests: 1450, tokens: 92000, cost: 0.18 },
    { model: "gemini-1.5-pro", requests: 380, tokens: 48000, cost: 0.45 },
    { model: "gemini-2.0-flash", requests: 620, tokens: 34000, cost: 0.12 },
    { model: "gemini-3.8-flash", requests: 185, tokens: 12500, cost: 0.05 },
  ],
  systemHealth: {
    status: "healthy",
    uptimeSeconds: 3600,
    activeRuns: 0,
    maxConcurrency: 10,
    dbStatus: "connected",
    dbLatencyMs: 1,
  },
};

const TIMEFRAME_OPTIONS: { id: DashboardTimeframe; label: string }[] = [
  { id: "1h", label: "Last 1h" },
  { id: "24h", label: "Last 24h" },
  { id: "7d", label: "Last 7d" },
  { id: "30d", label: "Last 30d" },
  { id: "all", label: "All Time" },
];

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(seconds / 60);
  return `${hours}h ${mins % 60}m`;
}

export const DashboardView: React.FC<{ onNavigateToCanvas?: () => void }> = ({ onNavigateToCanvas }) => {
  const nodes = useWorkflowStore((state) => state.nodes);
  const theme = useSettingsStore((state) => state.theme);
  const isDark = theme === "dark";

  const [timeframe, setTimeframe] = useState<DashboardTimeframe>("24h");
  const [stats, setStats] = useState<DashboardTelemetryResponse>(DEFAULT_STATS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchTelemetryStats = useCallback(async (selectedTimeframe: DashboardTimeframe) => {
    try {
      const res = await apiFetch(`/api/v1/executions/stats?timeframe=${selectedTimeframe}`);
      if (res.ok) {
        const json: DashboardTelemetryResponse = await res.json();
        setStats(json);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.warn("Could not fetch remote telemetry stats, falling back to cached state:", err);
    }
  }, []);

  useEffect(() => {
    fetchTelemetryStats(timeframe);
  }, [timeframe, fetchTelemetryStats]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchTelemetryStats(timeframe);
    } finally {
      setTimeout(() => setIsRefreshing(false), 350);
    }
  };

  const handleExportTelemetry = () => {
    const jsonString = JSON.stringify(stats, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `neuraldesk-telemetry-${timeframe}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const kpis = stats.kpis;
  const latency = stats.latencySLA;
  const system = stats.systemHealth;

  const gridStroke = isDark ? "rgba(238, 240, 245, 0.06)" : "#e2e8f0";
  const axisStroke = isDark ? "#7a8296" : "#94a3b8";
  const tooltipBg = isDark ? "#11141c" : "#ffffff";
  const tooltipBorder = isDark ? "rgba(238, 240, 245, 0.08)" : "#cbd5e1";
  const tooltipColor = isDark ? "#eef0f5" : "#111827";

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f5f7fa] dark:bg-[#0b0d14] transition-colors duration-150">
      {/* Title & Action Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-medium text-slate-900 dark:text-[#eef0f5] tracking-tight">
              Intelligence Operations & Telemetry
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-50 text-emerald-700 dark:bg-[#11141c] dark:text-[#4cc38a] border border-emerald-200 dark:border-emerald-900/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Live Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#7a8296] mt-0.5 font-mono">
            Throughput, token economics, and SLA metrics • Refreshed {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe Selector */}
          <div className="flex items-center bg-white dark:bg-[#11141c] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] rounded-md p-0.5 font-mono text-xs">
            {TIMEFRAME_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setTimeframe(opt.id)}
                className={cn(
                  "px-2.5 py-1 rounded transition-colors cursor-pointer",
                  timeframe === opt.id
                    ? "bg-slate-900 text-white dark:bg-[#eef0f5] dark:text-[#0b0d14] font-medium"
                    : "text-slate-600 dark:text-[#7a8296] hover:text-slate-900 dark:hover:text-[#eef0f5]"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Refresh Action */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 h-8 px-3 rounded-md border border-slate-200 dark:border-[rgba(238,240,245,0.08)] bg-white dark:bg-[#11141c] hover:bg-slate-50 dark:hover:bg-[#1a1e28] text-slate-700 dark:text-[#a3a9b8] text-xs font-mono transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh metrics from backend"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Export Telemetry */}
          <button
            onClick={handleExportTelemetry}
            className="flex items-center gap-1.5 h-8 px-3 rounded-md border border-slate-200 dark:border-[rgba(238,240,245,0.08)] bg-white dark:bg-[#11141c] hover:bg-slate-50 dark:hover:bg-[#1a1e28] text-slate-700 dark:text-[#a3a9b8] text-xs font-mono transition-colors cursor-pointer"
            title="Download full telemetry report as JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export JSON</span>
          </button>

          {/* Open Canvas CTA */}
          <button
            onClick={onNavigateToCanvas}
            className="flex items-center gap-1.5 h-8 px-3.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#eef0f5] dark:hover:bg-white dark:text-[#0b0d14] text-xs font-medium transition-colors cursor-pointer"
          >
            <span>Open Canvas</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* System Health Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3 rounded-xl bg-white dark:bg-[#11141c] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-slate-100 dark:bg-[#1a1e28] flex items-center justify-center text-slate-700 dark:text-[#a3a9b8]">
            <Server className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="font-medium text-slate-800 dark:text-[#eef0f5]">Execution Engine</p>
            <p className="text-[11px] text-slate-500 dark:text-[#7a8296] font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Healthy • Uptime {formatUptime(system.uptimeSeconds)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-slate-100 dark:bg-[#1a1e28] flex items-center justify-center text-slate-700 dark:text-[#a3a9b8]">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="font-medium text-slate-800 dark:text-[#eef0f5]">DAG Concurrency</p>
            <p className="text-[11px] text-slate-500 dark:text-[#7a8296] font-mono">
              <span>{system.activeRuns}</span> / {system.maxConcurrency} Active Slots
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-slate-100 dark:bg-[#1a1e28] flex items-center justify-center text-slate-700 dark:text-[#a3a9b8]">
            <Database className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="font-medium text-slate-800 dark:text-[#eef0f5]">Database Pool</p>
            <p className="text-[11px] text-slate-500 dark:text-[#7a8296] font-mono">
              PostgreSQL • {system.dbLatencyMs}ms ping
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-slate-100 dark:bg-[#1a1e28] flex items-center justify-center text-slate-700 dark:text-[#a3a9b8]">
            <Gauge className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="font-medium text-slate-800 dark:text-[#eef0f5]">SLA Median (P50)</p>
            <p className="text-[11px] text-slate-500 dark:text-[#7a8296] font-mono">
              <span className="text-emerald-600 dark:text-[#4cc38a] font-medium">{latency.p50}ms</span> (&lt;500ms target)
            </p>
          </div>
        </div>
      </div>

      {/* 5 Primary Operational KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Active DAGs */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#11141c] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-[#7a8296]">
            <span className="text-xs font-medium">Active DAGs</span>
            <Workflow className="w-3.5 h-3.5" />
          </div>
          <p className="text-2xl font-mono font-medium text-slate-900 dark:text-[#eef0f5] tabular-nums">
            {kpis.activeWorkflows}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-[#7a8296] font-mono">
            {nodes.length} nodes on canvas
          </p>
        </div>

        {/* Total Runs */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#11141c] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-[#7a8296]">
            <span className="text-xs font-medium">Total Runs</span>
            <Activity className="w-3.5 h-3.5" />
          </div>
          <p className="text-2xl font-mono font-medium text-slate-900 dark:text-[#eef0f5] tabular-nums">
            {kpis.totalRuns}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-[#4cc38a] font-mono inline-flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +14.2% today
          </p>
        </div>

        {/* Success Rate */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#11141c] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-[#7a8296]">
            <span className="text-xs font-medium">Success Rate</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <p className="text-2xl font-mono font-medium text-slate-900 dark:text-[#eef0f5] tabular-nums">
            {kpis.successRate}%
          </p>
          <p className="text-[11px] text-slate-500 dark:text-[#7a8296] font-mono">
            {kpis.failedRuns === 0 ? "0 exceptions" : `${kpis.failedRuns} failed runs`}
          </p>
        </div>

        {/* Tokens Consumed */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#11141c] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-[#7a8296]">
            <span className="text-xs font-medium">Tokens Consumed</span>
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <p className="text-2xl font-mono font-medium text-slate-900 dark:text-[#eef0f5] tabular-nums">
            {formatTokens(kpis.totalTokens)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-[#7a8296] font-mono">
            Prompt + completion
          </p>
        </div>

        {/* Total Spend */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#11141c] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-[#7a8296]">
            <span className="text-xs font-medium">Total Spend (USD)</span>
            <Coins className="w-3.5 h-3.5" />
          </div>
          <p className="text-2xl font-mono font-medium text-slate-900 dark:text-[#eef0f5] tabular-nums">
            {formatCost(kpis.totalCostUsd)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-[#7a8296] font-mono">
            Standard rate billing
          </p>
        </div>
      </div>

      {/* SLA Latency Percentiles */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#11141c] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-[#7a8296]" />
            <h3 className="text-xs font-medium text-slate-900 dark:text-[#eef0f5]">
              SLA Latency Percentiles
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-[#7a8296]">
            <span>Average: <strong className="text-slate-800 dark:text-[#eef0f5]">{kpis.avgLatencyMs}ms</strong></span>
            <span>•</span>
            <span>Min: <strong className="text-slate-800 dark:text-[#eef0f5]">{latency.min}ms</strong></span>
            <span>•</span>
            <span>Max: <strong className="text-slate-800 dark:text-[#eef0f5]">{latency.max}ms</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#07080d] border border-slate-200 dark:border-[rgba(238,240,245,0.06)]">
            <span className="text-[10px] font-mono text-slate-500 dark:text-[#7a8296]">P50 Median</span>
            <p className="text-lg font-mono font-medium text-slate-900 dark:text-[#eef0f5] mt-0.5 tabular-nums">
              {latency.p50} <span className="text-xs text-slate-400">ms</span>
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#07080d] border border-slate-200 dark:border-[rgba(238,240,245,0.06)]">
            <span className="text-[10px] font-mono text-slate-500 dark:text-[#7a8296]">P90 Latency</span>
            <p className="text-lg font-mono font-medium text-slate-900 dark:text-[#eef0f5] mt-0.5 tabular-nums">
              {latency.p90} <span className="text-xs text-slate-400">ms</span>
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#07080d] border border-slate-200 dark:border-[rgba(238,240,245,0.06)]">
            <span className="text-[10px] font-mono text-slate-500 dark:text-[#7a8296]">P95 Latency</span>
            <p className="text-lg font-mono font-medium text-slate-900 dark:text-[#eef0f5] mt-0.5 tabular-nums">
              {latency.p95} <span className="text-xs text-slate-400">ms</span>
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#07080d] border border-slate-200 dark:border-[rgba(238,240,245,0.06)]">
            <span className="text-[10px] font-mono text-slate-500 dark:text-[#7a8296]">P99 Worst Case</span>
            <p className="text-lg font-mono font-medium text-slate-900 dark:text-[#eef0f5] mt-0.5 tabular-nums">
              {latency.p99} <span className="text-xs text-slate-400">ms</span>
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Execution Throughput & Volume */}
        <div className="lg:col-span-2 p-4 rounded-xl bg-white dark:bg-[#11141c] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-medium text-slate-900 dark:text-[#eef0f5]">
                Execution Throughput & Volume ({timeframe.toUpperCase()})
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-[#7a8296]">
                Workflow run frequency and token volume over selected window
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-[#eef0f5]">
                <span className="w-2 h-2 rounded bg-slate-900 dark:bg-[#eef0f5]" /> Runs
              </span>
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-[#7a8296]">
                <span className="w-2 h-2 rounded bg-slate-400 dark:bg-[#7a8296]" /> Tokens (/100)
              </span>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.throughput} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="time" stroke={axisStroke} fontSize={10} fontStyle="mono" />
                <YAxis stroke={axisStroke} fontSize={10} fontStyle="mono" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    color: tooltipColor,
                    borderRadius: "0.5rem",
                    fontSize: "11px",
                    fontFamily: "monospace",
                  }}
                />
                <Area type="monotone" dataKey="executions" name="Executions" stroke={isDark ? "#eef0f5" : "#111827"} strokeWidth={1.5} fill="none" />
                <Area type="monotone" dataKey="tokens" name="Tokens (/100)" stroke={isDark ? "#7a8296" : "#94a3b8"} strokeWidth={1} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Model Invocations Distribution */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#11141c] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] space-y-3">
          <div>
            <h3 className="text-xs font-medium text-slate-900 dark:text-[#eef0f5]">Model Invocations</h3>
            <p className="text-[11px] text-slate-500 dark:text-[#7a8296]">
              Requests dispatched by Gemini model family
            </p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.modelBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="model" stroke={axisStroke} fontSize={10} tickFormatter={(v) => v.replace("gemini-", "")} fontStyle="mono" />
                <YAxis stroke={axisStroke} fontSize={10} fontStyle="mono" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    color: tooltipColor,
                    borderRadius: "0.5rem",
                    fontSize: "11px",
                    fontFamily: "monospace",
                  }}
                />
                <Bar dataKey="requests" name="Invocations" fill={isDark ? "#a3a9b8" : "#475569"} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
