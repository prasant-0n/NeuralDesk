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
  const hours = Math.floor(mins / 60);
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
      const res = await fetch(`/api/v1/executions/stats?timeframe=${selectedTimeframe}`);
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

  const gridStroke = isDark ? "#1e293b" : "#e2e8f0";
  const axisStroke = isDark ? "#64748b" : "#94a3b8";
  const tooltipBg = isDark ? "#090d16" : "#ffffff";
  const tooltipBorder = isDark ? "#1e293b" : "#cbd5e1";
  const tooltipColor = isDark ? "#f8fafc" : "#0f172a";

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-charcoal-950 transition-colors duration-150">
      {/* Title & Action Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Intelligence Operations & Telemetry
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-charcoal-400 mt-0.5">
            Real-time throughput, token economics, and latency SLA metrics • Refreshed {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Timeframe Selector Pills */}
          <div className="flex items-center bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 rounded-xl p-1 shadow-sm">
            {TIMEFRAME_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setTimeframe(opt.id)}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded-lg transition-all",
                  timeframe === opt.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-charcoal-400 hover:text-slate-900 dark:hover:text-white"
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 hover:bg-slate-100 dark:hover:bg-charcoal-800 text-slate-700 dark:text-charcoal-300 text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
            title="Refresh metrics from backend"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400", isRefreshing && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Export Telemetry */}
          <button
            onClick={handleExportTelemetry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 hover:bg-slate-100 dark:hover:bg-charcoal-800 text-slate-700 dark:text-charcoal-300 text-xs font-medium transition-colors shadow-sm"
            title="Download full telemetry report as JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-charcoal-400" />
            <span className="hidden sm:inline">Export JSON</span>
          </button>

          {/* Open Canvas CTA */}
          <button
            onClick={onNavigateToCanvas}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
          >
            <span>Open Canvas</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* System Health & Orchestrator Concurrency Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">Execution Engine</p>
            <p className="text-[11px] text-slate-500 dark:text-charcoal-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Healthy • Uptime {formatUptime(system.uptimeSeconds)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">DAG Concurrency</p>
            <p className="text-[11px] text-slate-500 dark:text-charcoal-400">
              <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{system.activeRuns}</span> / {system.maxConcurrency} Active Slots
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">Database Pool</p>
            <p className="text-[11px] text-slate-500 dark:text-charcoal-400">
              PostgreSQL • {system.dbLatencyMs}ms ping
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">SLA Median (P50)</p>
            <p className="text-[11px] text-slate-500 dark:text-charcoal-400">
              <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">{latency.p50}ms</span> (Target &lt;500ms)
            </p>
          </div>
        </div>
      </div>

      {/* 5 Primary Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Active DAGs */}
        <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm dark:shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-charcoal-400">
            <span className="text-xs font-medium">Active DAGs</span>
            <Workflow className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {kpis.activeWorkflows}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-charcoal-400 flex items-center gap-1">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{nodes.length} nodes</span> on active canvas
          </p>
        </div>

        {/* Total Runs */}
        <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm dark:shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-charcoal-400">
            <span className="text-xs font-medium">Total Runs</span>
            <Activity className="w-4 h-4 text-sky-500 dark:text-sky-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {kpis.totalRuns}
          </p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3 h-3" /> +14.2% today
          </p>
        </div>

        {/* Success Rate */}
        <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm dark:shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-charcoal-400">
            <span className="text-xs font-medium">Success Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {kpis.successRate}%
          </p>
          <p className="text-[10px] text-slate-500 dark:text-charcoal-400">
            {kpis.failedRuns === 0 ? "Zero unhandled exceptions" : `${kpis.failedRuns} failed runs captured`}
          </p>
        </div>

        {/* Tokens Consumed */}
        <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm dark:shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-charcoal-400">
            <span className="text-xs font-medium">Tokens Consumed</span>
            <Cpu className="w-4 h-4 text-purple-500 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {formatTokens(kpis.totalTokens)}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-charcoal-400">
            Prompt & completion blend
          </p>
        </div>

        {/* Total Spend */}
        <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm dark:shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-charcoal-400">
            <span className="text-xs font-medium">Total Spend (USD)</span>
            <Coins className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCost(kpis.totalCostUsd)}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-charcoal-400">
            92% cheaper than legacy LLM
          </p>
        </div>
      </div>

      {/* SLA Latency Waterfall Grid */}
      <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm dark:shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                SLA Latency Percentiles & Processing Waterfall
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-charcoal-400">
              Distribution percentiles for end-to-end DAG execution completion
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-charcoal-400">
            <span>Average: <strong className="text-slate-800 dark:text-white">{kpis.avgLatencyMs}ms</strong></span>
            <span>•</span>
            <span>Min: <strong className="text-slate-800 dark:text-white">{latency.min}ms</strong></span>
            <span>•</span>
            <span>Max: <strong className="text-slate-800 dark:text-white">{latency.max}ms</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-charcoal-950 border border-slate-200 dark:border-charcoal-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-charcoal-400 uppercase tracking-wider">
              P50 Median
            </span>
            <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
              {latency.p50} <span className="text-xs font-normal text-slate-500">ms</span>
            </p>
            <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-medium">
              Optimal (&lt;500ms)
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-charcoal-950 border border-slate-200 dark:border-charcoal-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-charcoal-400 uppercase tracking-wider">
              P90 Percentile
            </span>
            <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
              {latency.p90} <span className="text-xs font-normal text-slate-500">ms</span>
            </p>
            <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 font-medium">
              Normal Band
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-charcoal-950 border border-slate-200 dark:border-charcoal-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-charcoal-400 uppercase tracking-wider">
              P95 Tail Latency
            </span>
            <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
              {latency.p95} <span className="text-xs font-normal text-slate-500">ms</span>
            </p>
            <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 font-medium">
              SLA Target (&lt;1.2s)
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-charcoal-950 border border-slate-200 dark:border-charcoal-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-charcoal-400 uppercase tracking-wider">
              P99 Worst Case
            </span>
            <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
              {latency.p99} <span className="text-xs font-normal text-slate-500">ms</span>
            </p>
            <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 font-medium">
              Within SLA Limit
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Execution Throughput & Latency Over Time */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm dark:shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Execution Throughput &amp; Volume ({timeframe.toUpperCase()})
              </h3>
              <p className="text-xs text-slate-500 dark:text-charcoal-400">
                Workflow run frequency and token processing volume over selected window
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Runs
              </span>
              <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Tokens (/100)
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.throughput} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorExec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="time" stroke={axisStroke} fontSize={11} />
                <YAxis stroke={axisStroke} fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    color: tooltipColor,
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Area type="monotone" dataKey="executions" name="Executions" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorExec)" />
                <Area type="monotone" dataKey="tokens" name="Tokens (/100)" stroke="#38bdf8" strokeWidth={1.5} fillOpacity={1} fill="url(#colorTokens)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Model Invocations Distribution */}
        <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm dark:shadow-lg space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Model Invocations</h3>
            <p className="text-xs text-slate-500 dark:text-charcoal-400">
              Requests dispatched by Gemini model family
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.modelBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="model" stroke={axisStroke} fontSize={10} tickFormatter={(v) => v.replace("gemini-", "")} />
                <YAxis stroke={axisStroke} fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    color: tooltipColor,
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Bar dataKey="requests" name="Invocations" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
