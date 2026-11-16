import React from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  Activity,
  ArrowLeft,
  Sun,
  Moon,
  ExternalLink,
} from "lucide-react";
import { useSettingsStore } from "../../store/settingsStore";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen w-screen flex bg-slate-50 dark:bg-charcoal-950 text-slate-900 dark:text-charcoal-100 transition-colors duration-150 overflow-x-hidden">
      {/* ========================================================
          LEFT PANE: Enterprise Brand Showcase (Desktop / lg+)
          ======================================================== */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-slate-900 text-white overflow-hidden border-r border-slate-800 select-none">
        {/* Ambient Gradient Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/25 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-sky-500/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Subtle Background Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Top Header / Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">
                  NeuralDesk
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Agentic Graph Orchestration Engine
              </p>
            </div>
          </Link>
        </div>

        {/* Center Showcase: Value Proposition & Live DAG Visualization Card */}
        <div className="relative z-10 my-auto py-8 space-y-8 max-w-lg">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              v1.0.0 Production Engine Live
            </div>
            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Orchestrate autonomous agent graphs with{" "}
              <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-sky-300 bg-clip-text text-transparent">
                mathematical precision.
              </span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Deterministic topological execution, self-healing agent fallbacks, and real-time OpenTelemetry trace streaming engineered for enterprise-scale AI.
            </p>
          </div>

          {/* Visual DAG Execution Simulation Card */}
          <div className="rounded-xl border border-slate-700/80 bg-slate-800/60 backdrop-blur-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-mono font-semibold text-slate-200">
                  DAG Pipeline: Lead-Qualification-v2
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ACTIVE • 118ms
              </span>
            </div>

            {/* Pipeline Stage Visualizer */}
            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-700/40">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-200">1. Data Ingestion & Sanitization</span>
                </div>
                <span className="text-[11px] text-slate-400">32ms</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/30">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                  <span className="text-indigo-200 font-medium">
                    2. GPT-4o Multi-Agent Synthesis
                  </span>
                </div>
                <span className="text-[11px] text-indigo-300">Streaming</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/40 border border-slate-800/60 opacity-60">
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="text-slate-400">3. CRM Dispatch & Webhook</span>
                </div>
                <span className="text-[11px] text-slate-500">Queued</span>
              </div>
            </div>

            {/* Bottom Engine Specs */}
            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-700/40">
              <span>Topological Kahn Guarantee</span>
              <span className="text-emerald-400 font-medium">Cycles: 0 (Validated)</span>
            </div>
          </div>

          {/* Social Proof Quote */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
            <p className="text-xs italic text-slate-300 leading-relaxed">
              &ldquo;NeuralDesk transformed our brittle agent scripts into rock-solid, production-grade DAG graphs with transparent telemetry and instant zero-cycle validation.&rdquo;
            </p>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-[10px] text-white">
                SC
              </div>
              <div>
                <span className="font-semibold text-white">Sarah Connor</span>
                <span className="text-slate-400 text-[11px]"> — Principal AI Architect, Acme Robotics</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Compliance & Badges */}
        <div className="relative z-10 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              SOC2 Type II
            </span>
            <span>•</span>
            <span>TLS 1.3 / AES-256</span>
            <span>•</span>
            <span>Better Auth 1.7</span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">ISO 27001 Ready</span>
        </div>
      </div>

      {/* ========================================================
          RIGHT PANE: Form Container (Responsive)
          ======================================================== */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-y-auto">
        {/* Top Navigation Bar in Form Pane */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-charcoal-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Workspace</span>
          </Link>

          <div className="flex items-center gap-3">
            <a
              href="/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-mono text-slate-500 dark:text-charcoal-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <span>Docs</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-charcoal-800 text-slate-500 dark:text-charcoal-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>
          </div>
        </div>

        {/* Center Form Container */}
        <div className="w-full max-w-md mx-auto my-auto space-y-6">
          {/* Mobile Brand Header (Visible only when left pane is hidden) */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
              NeuralDesk
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Enterprise
            </span>
          </div>

          {/* Heading */}
          <div className="text-center space-y-1.5">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-charcoal-400">
              {subtitle}
            </p>
          </div>

          {/* Form Content */}
          <div className="bg-white dark:bg-charcoal-900 rounded-2xl border border-slate-200 dark:border-charcoal-800 shadow-xl shadow-slate-200/50 dark:shadow-none p-6 sm:p-8 space-y-6">
            {children}
          </div>
        </div>

        {/* Bottom Form Footer */}
        <div className="w-full max-w-md mx-auto mt-6 pt-4 border-t border-slate-200/60 dark:border-charcoal-800/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 dark:text-charcoal-500 gap-2">
          <span>&copy; 2026 NeuralDesk AI Inc. All rights reserved.</span>
          <div className="flex items-center gap-3">
            <a href="#terms" className="hover:underline">
              Terms
            </a>
            <span>•</span>
            <a href="#privacy" className="hover:underline">
              Privacy
            </a>
            <span>•</span>
            <a href="#security" className="hover:underline">
              Security
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
