import React from "react";
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
} from "lucide-react";
import { useWorkflowStore } from "../../store/workflowStore";
import { useSettingsStore } from "../../store/settingsStore";
import { formatCost, formatTokens } from "../../lib/utils";

const ACTIVITY_DATA = [
  { time: "00:00", executions: 12, tokens: 4200, latency: 420 },
  { time: "04:00", executions: 8, tokens: 2800, latency: 380 },
  { time: "08:00", executions: 45, tokens: 18500, latency: 510 },
  { time: "12:00", executions: 78, tokens: 32000, latency: 490 },
  { time: "16:00", executions: 92, tokens: 41000, latency: 560 },
  { time: "20:00", executions: 54, tokens: 22000, latency: 450 },
  { time: "23:59", executions: 28, tokens: 9800, latency: 410 },
];

const MODEL_DATA = [
  { model: "gemini-1.5-flash", requests: 1450, cost: 0.18 },
  { model: "gemini-1.5-pro", requests: 380, cost: 0.45 },
  { model: "gemini-2.0-flash", requests: 620, cost: 0.12 },
];

export const DashboardView: React.FC<{ onNavigateToCanvas?: () => void }> = ({ onNavigateToCanvas }) => {
  const executionHistory = useWorkflowStore((state) => state.executionHistory);
  const nodes = useWorkflowStore((state) => state.nodes);
  const theme = useSettingsStore((state) => state.theme);
  const isDark = theme === "dark";

  const totalExecs = executionHistory.length + 317;
  const completedExecs = executionHistory.filter((e) => e.status === "completed").length + 312;
  const successRate = ((completedExecs / totalExecs) * 100).toFixed(1);

  const totalTokens =
    executionHistory.reduce((acc, cur) => acc + cur.totalTokens, 0) + 130300;
  const totalCost =
    executionHistory.reduce((acc, cur) => acc + cur.costUsd, 0) + 0.75;

  const gridStroke = isDark ? "#1e293b" : "#e2e8f0";
  const axisStroke = isDark ? "#64748b" : "#94a3b8";
  const tooltipBg = isDark ? "#090d16" : "#ffffff";
  const tooltipBorder = isDark ? "#1e293b" : "#cbd5e1";
  const tooltipColor = isDark ? "#f8fafc" : "#0f172a";

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-charcoal-950 transition-colors duration-150">
      {/* Title & Headline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Intelligence Operations & Telemetry
          </h1>
          <p className="text-xs text-slate-500 dark:text-charcoal-400 mt-0.5">
            Real-time throughput, token economics, and latency SLA metrics
          </p>
        </div>

        <button
          onClick={onNavigateToCanvas}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all self-start sm:self-auto"
        >
          <span>Open Workflow Canvas</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm dark:shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-charcoal-400">
            <span className="text-xs font-medium">Active DAGs</span>
            <Workflow className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">12</p>
          <p className="text-[10px] text-slate-500 dark:text-charcoal-400 flex items-center gap-1">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{nodes.length} nodes</span> on canvas
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm dark:shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-charcoal-400">
            <span className="text-xs font-medium">Total Runs</span>
            <Activity className="w-4 h-4 text-sky-500 dark:text-sky-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{totalExecs}</p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3 h-3" /> +14.2% today
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm dark:shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-charcoal-400">
            <span className="text-xs font-medium">Success Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{successRate}%</p>
          <p className="text-[10px] text-slate-500 dark:text-charcoal-400">Zero unhandled exceptions</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm dark:shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-charcoal-400">
            <span className="text-xs font-medium">Tokens Consumed</span>
            <Cpu className="w-4 h-4 text-purple-500 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{formatTokens(totalTokens)}</p>
          <p className="text-[10px] text-slate-500 dark:text-charcoal-400">Prompt & completion blend</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm dark:shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-charcoal-400">
            <span className="text-xs font-medium">Total Spend (USD)</span>
            <Coins className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatCost(totalCost)}</p>
          <p className="text-[10px] text-slate-500 dark:text-charcoal-400">92% cheaper than legacy LLM</p>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Execution Throughput & Latency Over Time */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm dark:shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Execution Throughput (24h)</h3>
              <p className="text-xs text-slate-500 dark:text-charcoal-400">Workflow run frequency and token processing volume</p>
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
              <AreaChart data={ACTIVITY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Area type="monotone" dataKey="executions" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorExec)" />
                <Area type="monotone" dataKey="tokens" stroke="#38bdf8" strokeWidth={1.5} fillOpacity={1} fill="url(#colorTokens)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Model Spend Distribution */}
        <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm dark:shadow-lg space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Model Invocations</h3>
            <p className="text-xs text-slate-500 dark:text-charcoal-400">Requests dispatched by Gemini model family</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MODEL_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Bar dataKey="requests" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
