import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Play,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Terminal,
  Copy,
  Check,
  Activity,
  Sparkles,
  Lock,
  GitBranch,
} from "lucide-react";

export const LandingHero: React.FC = () => {
  const navigate = useNavigate();
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [activeHeroNode, setActiveHeroNode] = useState<number>(1);
  const [isSimulating, setIsSimulating] = useState(false);

  const copyNpm = () => {
    navigator.clipboard.writeText("npx create-neuraldesk-app@latest");
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const heroNodes = [
    {
      id: 0,
      title: "Webhook Ingress",
      type: "Trigger",
      badge: "HTTP POST",
      status: "Verified",
      color: "border-sky-500/40 text-sky-400 bg-sky-500/10",
      latency: "4ms",
      details: {
        payload: '{ "lead": "enterprise", "intent": "autonomous_agent_deploy" }',
        output: "Ingress payload validated against RFC 7807 schema",
      },
    },
    {
      id: 1,
      title: "Gemini 2.0 Flash Orchestrator",
      type: "Agent Node",
      badge: "LLM Reasoner",
      status: "Completed",
      color: "border-indigo-500/50 text-indigo-400 bg-indigo-500/10",
      latency: "184ms",
      details: {
        payload: "Prompt: Analyze intent and generate execution strategy",
        output: "Confidence: 99.4% • Model: gemini-2.0-flash • Tokens: 342",
      },
    },
    {
      id: 2,
      title: "Zero-Knowledge Guardrail",
      type: "Security Shield",
      badge: "AES-256",
      status: "Enforced",
      color: "border-emerald-500/50 text-emerald-400 bg-emerald-500/10",
      latency: "12ms",
      details: {
        payload: "PII & Injection Scanning Matrix (ND-SEC-03)",
        output: "Zero prompt injection detected • Secrets encrypted at rest",
      },
    },
    {
      id: 3,
      title: "Human Approval Policy",
      type: "Policy Gateway",
      badge: "HITL Gate",
      status: "Approved",
      color: "border-amber-500/50 text-amber-400 bg-amber-500/10",
      latency: "Instant",
      details: {
        payload: "Threshold: Risk Score < 0.2 => Auto-Approval",
        output: "Approved by Automated Enterprise SecOps Rule",
      },
    },
    {
      id: 4,
      title: "Dispatch & ERP Sync",
      type: "Output Sync",
      badge: "REST Webhook",
      status: "Live Sync",
      color: "border-purple-500/50 text-purple-400 bg-purple-500/10",
      latency: "42ms",
      details: {
        payload: "Target: Webhook -> Slack #incident-triage & CRM",
        output: "HTTP 200 OK • Payload dispatched to production",
      },
    },
  ];

  const handleSimulate = () => {
    setIsSimulating(true);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < heroNodes.length) {
        setActiveHeroNode(step);
      } else {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 600);
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background Ambient Glows & Grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle Engineering Grid */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />

        {/* Radial Aurora Highlights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-indigo-600/30 via-purple-600/20 to-cyan-500/20 blur-[130px] rounded-full" />
        <div className="absolute top-2/3 right-1/4 w-[450px] h-[350px] bg-cyan-500/15 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Release Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-charcoal-900/90 border border-indigo-500/30 backdrop-blur-xl shadow-md shadow-indigo-500/5 mb-8 animate-fade-in">
          <div className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-600 dark:bg-cyan-500" />
          </div>
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Introducing NeuralDesk 2.0
          </span>
          <span className="text-slate-400 dark:text-slate-700">•</span>
          <span className="text-xs font-semibold bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent">
            Deterministic Autonomous Multi-Agent DAGs
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
        </div>

        {/* Master Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-5xl mx-auto leading-[1.1] mb-6">
          Orchestrate Autonomous AI Agents with{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-cyan-500 to-indigo-500 dark:from-indigo-500 dark:via-cyan-400 dark:to-indigo-400 bg-clip-text text-transparent animate-gradient">
            DAG Precision
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
          Design, simulate, and execute mission-critical multi-agent workflows
          in a visual topological canvas. Guaranteed cycle-free execution with
          Kahn's algorithm, zero-knowledge BYOK encryption, and real-time streaming telemetry.
        </p>

        {/* Call-to-Action Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            to="/signup"
            className="w-full sm:w-auto relative group overflow-hidden flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] transition-all duration-200"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>Start Building Free</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </Link>

          <button
            onClick={() => navigate("/studio")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-charcoal-900/80 dark:hover:bg-charcoal-800 border border-slate-300 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 font-semibold text-sm backdrop-blur-xl shadow-md hover:border-slate-400 dark:hover:border-slate-600 transition-all duration-200"
          >
            <Play className="w-4 h-4 text-indigo-600 dark:text-indigo-400 fill-indigo-600/20 dark:fill-indigo-400/20" />
            <span>Explore Interactive Studio</span>
          </button>

          {/* Quick CLI Snippet */}
          <div
            onClick={copyNpm}
            className="w-full sm:w-auto hidden lg:flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-slate-100/90 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-xs font-mono cursor-pointer transition-colors group shadow-sm"
            title="Click to copy CLI installer"
          >
            <Terminal className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>npx create-neuraldesk-app</span>
            {copiedSnippet ? (
              <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
            )}
          </div>
        </div>

        {/* Trust Badges Strip */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 dark:text-slate-400 mb-16">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Kahn DAG Topological Sort</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Dual AES-256 BYOK Encryption</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Sub-Millisecond SSE Streaming</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>SOC-2 Type II Certified</span>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* INTERACTIVE HERO PRODUCT VISUALIZER CARD                      */}
        {/* ------------------------------------------------------------- */}
        <div className="relative max-w-5xl mx-auto rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-charcoal-950/95 shadow-2xl shadow-indigo-500/10 dark:shadow-indigo-950/50 backdrop-blur-2xl p-4 sm:p-6 text-left overflow-hidden">
          {/* Top Window Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800/80 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs font-mono text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>workflow_lead_scoring_v2.dag</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                <span>ENGINE: ONLINE</span>
              </span>

              <button
                onClick={handleSimulate}
                disabled={isSimulating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
              >
                <Zap className="w-3 h-3 text-amber-300" />
                <span>{isSimulating ? "Simulating..." : "Simulate Flow"}</span>
              </button>
            </div>
          </div>

          {/* Interactive DAG Pipeline Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-6">
            {heroNodes.map((node) => {
              const isActive = activeHeroNode === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setActiveHeroNode(node.id)}
                  className={`relative p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/30 shadow-lg shadow-indigo-500/20 scale-[1.02]"
                      : "border-slate-200 bg-slate-50/70 hover:border-slate-300 dark:border-slate-800/80 dark:bg-slate-900/40 dark:hover:border-slate-700 dark:hover:bg-slate-900/70"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${node.color}`}
                    >
                      {node.badge}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {node.latency}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate mb-1">
                    {node.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>{node.status}</span>
                  </p>

                  {/* Active Indicator Pip */}
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-md shadow-cyan-500/50" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Node Inspector Console Output */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-3 text-slate-400">
              <span className="flex items-center gap-1.5 text-indigo-400">
                <Terminal className="w-3.5 h-3.5" />
                <span>INSPECTOR // {heroNodes[activeHeroNode].title}</span>
              </span>
              <span className="text-[11px] text-slate-500">
                LATENCY: {heroNodes[activeHeroNode].latency} • CYCLE-FREE
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="text-slate-400">
                <span className="text-cyan-400">&gt; INPUT:</span>{" "}
                <span className="text-slate-300">
                  {heroNodes[activeHeroNode].details.payload}
                </span>
              </div>
              <div className="text-slate-400">
                <span className="text-emerald-400">&gt; RESULT:</span>{" "}
                <span className="text-slate-200 font-semibold">
                  {heroNodes[activeHeroNode].details.output}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};