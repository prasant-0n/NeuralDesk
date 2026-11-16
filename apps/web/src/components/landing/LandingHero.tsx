import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Play,
  CheckCircle2,
  Zap,
  Terminal,
  Sparkles,
  GitBranch,
  SkipForward,
} from "lucide-react";

export const LandingHero: React.FC = () => {
  const navigate = useNavigate();
  const [activeHeroNode, setActiveHeroNode] = useState<number>(1);
  const [isSimulating, setIsSimulating] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<"payload" | "trace" | "proof">("payload");

  const heroNodes = [
    {
      id: 0,
      title: "Webhook Ingress",
      type: "Trigger Node",
      badge: "HTTP POST",
      status: "Verified",
      inDegree: 0,
      color: "border-sky-500/50 text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10",
      latency: "4ms",
      details: {
        payload: '{ "lead": "enterprise", "intent": "autonomous_agent_deploy", "org": "ApexFin" }',
        output: "Ingress signature validated against HMAC-SHA256 • RFC 7807 compliant",
        proof: "In-Degree: 0 (Graph Root Node) • Kahn Layer: 0 • Zero Prior Dependencies",
        trace: "Worker #02 spawned [T+0ms] -> Schema validated [T+4ms] -> Dispatched to L1 queue",
      },
    },
    {
      id: 1,
      title: "Gemini 2.0 Orchestrator",
      type: "Reasoner Agent",
      badge: "LLM Reasoner",
      status: "Completed",
      inDegree: 1,
      color: "border-indigo-500/50 text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10",
      latency: "184ms",
      details: {
        payload: 'Prompt: "Classify incoming lead, score multi-agent intent, and select routing path"',
        output: "Confidence: 99.4% • Intent: Multi-Seat Production • Tokens: 342 in / 118 out",
        proof: "In-Degree: 1 -> 0 (Resolved after Webhook) • Kahn Layer: 1 • Cycle: None",
        trace: "SSE chunked stream received • Node latency: 184ms • Model: gemini-2.0-flash",
      },
    },
    {
      id: 2,
      title: "Zero-Knowledge Guardrail",
      type: "Security Enclave",
      badge: "AES-256-GCM",
      status: "Enforced",
      inDegree: 1,
      color: "border-emerald-500/50 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10",
      latency: "12ms",
      details: {
        payload: "Scan prompt & output buffers for injection vectors and PII exposure (ND-SEC-03)",
        output: "Zero prompt injection detected • Credentials isolated in ephemeral WebCrypto RAM",
        proof: "In-Degree: 1 -> 0 • Kahn Layer: 2 • Parallel Worker Thread #05",
        trace: "Payload hash verified: 0x88c4... • Zero persistence on host memory",
      },
    },
    {
      id: 3,
      title: "Human Approval Policy",
      type: "Governance Gate",
      badge: "HITL Gate",
      status: "Auto-Approved",
      inDegree: 1,
      color: "border-amber-500/50 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10",
      latency: "Instant",
      details: {
        payload: "Policy Rule: If Lead Score > 90 AND SecOps Safe => Auto-Pass; Else Slack Gate",
        output: "Condition evaluated TRUE. Auto-approved under SOC-2 rule #GOV-991",
        proof: "In-Degree: 2 -> 0 (Requires Gemini + Guardrail) • Kahn Layer: 3",
        trace: "Webhook gate bypassed due to high-confidence score (99.4%) • Log written to Lakebase",
      },
    },
    {
      id: 4,
      title: "Dispatch & ERP Sync",
      type: "Integration Node",
      badge: "REST Webhook",
      status: "Live Dispatched",
      inDegree: 1,
      color: "border-purple-500/50 text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10",
      latency: "42ms",
      details: {
        payload: "POST https://api.crm.internal/v2/opportunities { account: 'ApexFin', tier: 'Enterprise' }",
        output: "HTTP 200 OK • Opportunity #9401 created • Slack alert sent to #enterprise-deals",
        proof: "In-Degree: 1 -> 0 (Terminal Sink Node) • Kahn Layer: 4 • Pipeline Complete",
        trace: "Pipeline resolved in 242ms total elapsed wall-clock time • Zero deadlock encountered",
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
    }, 650);
  };

  const handleStepForward = () => {
    setActiveHeroNode((prev) => (prev + 1) % heroNodes.length);
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-slate-50/50 dark:bg-charcoal-950/50">
      {/* Background Engineering Grid & Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.07]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[520px] bg-gradient-to-tr from-indigo-500/25 via-purple-500/15 to-cyan-400/20 blur-[130px] rounded-full" />
        <div className="absolute top-2/3 right-1/4 w-[460px] h-[360px] bg-cyan-400/15 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Release Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700/80 backdrop-blur-xl shadow-sm hover:shadow transition-all mb-8">
          <div className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-600 dark:bg-cyan-400" />
          </div>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            NeuralDesk v2.0
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-xs font-semibold bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent">
            Deterministic DAG Orchestration Engine
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
        </div>

        {/* Master Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-5xl mx-auto leading-[1.1] mb-6 font-sans">
          Orchestrate Autonomous AI Agents with{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-cyan-600 to-indigo-600 dark:from-indigo-400 dark:via-cyan-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Topological Precision
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
          Design, simulate, and execute mission-critical multi-agent pipelines
          in an interactive topological canvas. Guaranteed cycle-free execution via
          Kahn's algorithm, zero-knowledge BYOK encryption, and native Server-Sent Events telemetry.
        </p>

        {/* Clean, Prominent Call-to-Action Group (Zero Clutter) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            to="/signup"
            className="w-full sm:w-auto relative group overflow-hidden flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-sm sm:text-base shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>Launch Free Studio</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <button
            onClick={() => navigate("/studio")}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-100 dark:bg-charcoal-900 dark:hover:bg-charcoal-850 border border-slate-300 dark:border-charcoal-700 text-slate-800 dark:text-slate-100 font-semibold text-sm sm:text-base backdrop-blur-xl shadow-sm hover:shadow hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Play className="w-4 h-4 text-indigo-600 dark:text-indigo-400 fill-indigo-600/20 dark:fill-indigo-400/20" />
            <span>Explore Live Workspace</span>
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* INTERACTIVE HERO PRODUCT VISUALIZER CARD (HANDCRAFTED DAG)   */}
        {/* ------------------------------------------------------------- */}
        <div className="relative max-w-5xl mx-auto rounded-3xl border border-slate-200/90 dark:border-charcoal-800 bg-white/95 dark:bg-charcoal-950/95 shadow-2xl shadow-indigo-500/10 dark:shadow-indigo-950/40 backdrop-blur-2xl p-4 sm:p-6 text-left overflow-hidden">
          {/* Top Window Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-charcoal-800 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-medium">
                <GitBranch className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>production_pipeline.dag // KAHN_TOPOSORT_VERIFIED</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-mono font-semibold">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                <span>TOPOLOGY: 0 CYCLES</span>
              </span>

              <button
                onClick={handleStepForward}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-charcoal-800 dark:hover:bg-charcoal-700 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-charcoal-700 transition-colors"
                title="Advance to next node in topological order"
              >
                <SkipForward className="w-3 h-3" />
                <span>Step Next</span>
              </button>

              <button
                onClick={handleSimulate}
                disabled={isSimulating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
              >
                <Zap className="w-3 h-3 text-amber-300" />
                <span>{isSimulating ? "Traversing DAG..." : "Simulate Execution"}</span>
              </button>
            </div>
          </div>

          {/* Interactive DAG Pipeline Nodes Strip with Visual Connectors */}
          <div className="relative mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {heroNodes.map((node) => {
                const isActive = activeHeroNode === node.id;
                return (
                  <div
                    key={node.id}
                    onClick={() => setActiveHeroNode(node.id)}
                    className={`relative p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "border-indigo-500 bg-indigo-50/90 dark:bg-indigo-950/40 shadow-lg shadow-indigo-500/20 scale-[1.02] ring-2 ring-indigo-500/30"
                        : "border-slate-200/90 bg-slate-50/80 hover:border-slate-300 dark:border-charcoal-800 dark:bg-charcoal-900/60 dark:hover:border-charcoal-700 dark:hover:bg-charcoal-900/90"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${node.color}`}
                      >
                        {node.badge}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-medium">
                        {node.latency}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate mb-1">
                      {node.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>{node.status}</span>
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                        InDeg: {node.inDegree}
                      </span>
                    </div>

                    {/* Active Pip Indicator */}
                    {isActive && (
                      <div className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500 shadow-md" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Node Inspector Console with Interactive Diagnostic Tabs */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-slate-800 mb-3 gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>INSPECTOR // {heroNodes[activeHeroNode].title}</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                  {heroNodes[activeHeroNode].type}
                </span>
              </div>

              {/* Inspector Diagnostic Tabs */}
              <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                <button
                  onClick={() => setInspectorTab("payload")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    inspectorTab === "payload" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Payload
                </button>
                <button
                  onClick={() => setInspectorTab("proof")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    inspectorTab === "proof" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Kahn Proof
                </button>
                <button
                  onClick={() => setInspectorTab("trace")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    inspectorTab === "trace" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Trace
                </button>
              </div>
            </div>

            {/* Diagnostic Content Body */}
            <div className="space-y-1.5 min-h-[50px] leading-relaxed">
              {inspectorTab === "payload" && (
                <>
                  <div className="text-slate-400">
                    <span className="text-cyan-400 font-semibold">&gt; INPUT:</span>{" "}
                    <span className="text-slate-300 font-mono">
                      {heroNodes[activeHeroNode].details.payload}
                    </span>
                  </div>
                  <div className="text-slate-400">
                    <span className="text-emerald-400 font-semibold">&gt; RESULT:</span>{" "}
                    <span className="text-slate-200 font-mono font-medium">
                      {heroNodes[activeHeroNode].details.output}
                    </span>
                  </div>
                </>
              )}

              {inspectorTab === "proof" && (
                <div className="text-slate-300">
                  <span className="text-purple-400 font-semibold">&gt; MATHEMATICAL PROOF:</span>{" "}
                  <span className="text-slate-200 font-mono">
                    {heroNodes[activeHeroNode].details.proof}
                  </span>
                </div>
              )}

              {inspectorTab === "trace" && (
                <div className="text-slate-300">
                  <span className="text-amber-400 font-semibold">&gt; SSE TELEMETRY:</span>{" "}
                  <span className="text-slate-200 font-mono">
                    {heroNodes[activeHeroNode].details.trace}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
