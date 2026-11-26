import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Play,
  CheckCircle2,
  Terminal,
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
    }, 550);
  };

  const handleStepForward = () => {
    setActiveHeroNode((prev) => (prev + 1) % heroNodes.length);
  };

  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 border-b border-slate-200/70 dark:border-[rgba(238,240,245,0.06)] bg-[#f5f7fa] dark:bg-[#0b0d14]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Release Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-200/60 dark:bg-[#1a1e28] text-slate-700 dark:text-[#a3a9b8] text-xs font-mono mb-8 border border-slate-300/60 dark:border-[rgba(238,240,245,0.08)]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>NeuralDesk 2.0</span>
          <span className="text-slate-400 dark:text-[#7a8296]">•</span>
          <span>Deterministic DAG engine</span>
        </div>

        {/* Master Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-slate-900 dark:text-[#eef0f5] max-w-4xl mx-auto leading-[1.08] mb-5">
          Orchestrate autonomous agent pipelines with mathematical precision
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 dark:text-[#a3a9b8] max-w-2xl mx-auto leading-relaxed mb-8">
          Design, simulate, and execute multi-agent workflows with in-degree Kahn topological sorting,
          zero-knowledge BYOK encryption, and native Server-Sent Events telemetry.
        </p>

        {/* Primary and Secondary Action */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
          <button
            onClick={() => navigate("/studio")}
            className="w-full sm:w-auto h-11 px-5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#eef0f5] dark:hover:bg-white dark:text-[#0b0d14] text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Explore Live Workspace</span>
          </button>

          <Link
            to="/signup"
            className="w-full sm:w-auto h-11 px-5 rounded-lg bg-white hover:bg-slate-50 dark:bg-[#11141c] dark:hover:bg-[#1a1e28] text-slate-800 dark:text-[#eef0f5] border border-slate-300 dark:border-[rgba(238,240,245,0.08)] text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors"
          >
            <span>Create Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Interactive DAG Console Preview */}
        <div className="relative max-w-4xl mx-auto rounded-2xl border border-slate-200 dark:border-[rgba(238,240,245,0.08)] bg-white dark:bg-[#11141c] text-left overflow-hidden shadow-sm">
          {/* Top Frame Bar */}
          <div className="h-10 px-4 bg-slate-50 dark:bg-[#07080d] border-b border-slate-200 dark:border-[rgba(238,240,245,0.08)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-[#1a1e28]" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-[#1a1e28]" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-[#1a1e28]" />
              </div>
              <span className="text-xs font-mono text-slate-600 dark:text-[#a3a9b8] flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-slate-500 dark:text-[#7a8296]" />
                <span>pipeline.dag • Kahn verified</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-600 dark:text-[#4cc38a] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#4cc38a]" />
                <span>0 cycles</span>
              </span>

              <button
                onClick={handleStepForward}
                className="h-7 px-2.5 rounded bg-slate-200/70 hover:bg-slate-200 dark:bg-[#1a1e28] dark:hover:bg-[#232325] text-slate-700 dark:text-[#eef0f5] text-xs font-mono inline-flex items-center gap-1 transition-colors"
                title="Advance node"
              >
                <SkipForward className="w-3 h-3" />
                <span>Step</span>
              </button>

              <button
                onClick={handleSimulate}
                disabled={isSimulating}
                className="h-7 px-3 rounded bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#eef0f5] dark:hover:bg-white dark:text-[#0b0d14] text-xs font-mono inline-flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <span>{isSimulating ? "Traversing..." : "Run"}</span>
              </button>
            </div>
          </div>

          {/* Node Strip */}
          <div className="p-4 border-b border-slate-200 dark:border-[rgba(238,240,245,0.08)] bg-slate-50/50 dark:bg-[#07080d]/60">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              {heroNodes.map((node) => {
                const isActive = activeHeroNode === node.id;
                return (
                  <button
                    key={node.id}
                    onClick={() => setActiveHeroNode(node.id)}
                    className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                      isActive
                        ? "border-slate-900 bg-white dark:border-[#eef0f5] dark:bg-[#1a1e28]"
                        : "border-slate-200 bg-white hover:border-slate-300 dark:border-[rgba(238,240,245,0.08)] dark:bg-[#11141c] dark:hover:border-[rgba(238,240,245,0.16)]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono text-slate-500 dark:text-[#7a8296]">
                        {node.badge}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-[#7a8296] tabular-nums">
                        {node.latency}
                      </span>
                    </div>

                    <div className="text-xs font-medium text-slate-900 dark:text-[#eef0f5] truncate mb-2">
                      {node.title}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-[#7a8296]">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-[#4cc38a]" />
                        <span>{node.status}</span>
                      </span>
                      <span className="font-mono text-[10px]">
                        in:{node.inDegree}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Inspector Panel */}
          <div className="p-4 bg-white dark:bg-[#07080d] font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[rgba(238,240,245,0.08)] mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-slate-500 dark:text-[#7a8296]" />
                <span className="text-slate-900 dark:text-[#eef0f5] font-medium">
                  {heroNodes[activeHeroNode].title}
                </span>
                <span className="text-slate-400 dark:text-[#7a8296]">/</span>
                <span className="text-slate-500 dark:text-[#7a8296]">
                  {heroNodes[activeHeroNode].type}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {(["payload", "proof", "trace"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setInspectorTab(tab)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono capitalize transition-colors ${
                      inspectorTab === tab
                        ? "bg-slate-900 text-white dark:bg-[#eef0f5] dark:text-[#0b0d14]"
                        : "text-slate-500 hover:text-slate-900 dark:text-[#7a8296] dark:hover:text-[#eef0f5]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-[46px] leading-relaxed text-slate-700 dark:text-[#a3a9b8]">
              {inspectorTab === "payload" && (
                <div className="space-y-1">
                  <div>
                    <span className="text-slate-500 dark:text-[#7a8296]">Input:</span>{" "}
                    <span className="text-slate-800 dark:text-[#eef0f5]">
                      {heroNodes[activeHeroNode].details.payload}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-600 dark:text-[#4cc38a]">Output:</span>{" "}
                    <span className="text-slate-800 dark:text-[#eef0f5]">
                      {heroNodes[activeHeroNode].details.output}
                    </span>
                  </div>
                </div>
              )}

              {inspectorTab === "proof" && (
                <div>
                  <span className="text-indigo-600 dark:text-[#6366f1]">Topological proof:</span>{" "}
                  <span className="text-slate-800 dark:text-[#eef0f5]">
                    {heroNodes[activeHeroNode].details.proof}
                  </span>
                </div>
              )}

              {inspectorTab === "trace" && (
                <div>
                  <span className="text-amber-600 dark:text-[#d97706]">Telemetry trace:</span>{" "}
                  <span className="text-slate-800 dark:text-[#eef0f5]">
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
