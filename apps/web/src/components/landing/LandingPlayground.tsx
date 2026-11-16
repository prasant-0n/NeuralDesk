import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  GitBranch,
  Play,
  Terminal,
  CheckCircle,
  Clock,
  Zap,
} from "lucide-react";

interface WorkflowTemplate {
  id: string;
  title: string;
  tag: string;
  description: string;
  nodes: {
    name: string;
    role: string;
    status: string;
    time: string;
    color: string;
  }[];
  streamLog: string[];
}

export const LandingPlayground: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("lead-scoring");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [simulatedLogs, setSimulatedLogs] = useState<string[]>([]);

  const templates: Record<string, WorkflowTemplate> = {
    "lead-scoring": {
      id: "lead-scoring",
      title: "Autonomous B2B Lead Qualification",
      tag: "Revenue AI",
      description:
        "Ingests incoming webhook leads, enriches domain metrics with external APIs, routes to Gemini 2.0 Flash for enterprise qualification, and alerts sales executives on Slack.",
      nodes: [
        { name: "Webhook Lead Ingress", role: "Trigger", status: "200 OK", time: "4ms", color: "border-sky-500/50 text-sky-400 bg-sky-500/10" },
        { name: "Domain Enrichment", role: "Tool Node", status: "Enriched", time: "82ms", color: "border-indigo-500/50 text-indigo-400 bg-indigo-500/10" },
        { name: "Gemini 2.0 Lead Scorer", role: "LLM Agent", status: "Score: 94/100", time: "164ms", color: "border-purple-500/50 text-purple-400 bg-purple-500/10" },
        { name: "Salesforce / Slack Sync", role: "Integration", status: "Dispatched", time: "38ms", color: "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" },
      ],
      streamLog: [
        "[00:00:04] INGRESS: Inbound payload parsed: acme-corp.com (Revenue: $45M, 280 Employees)",
        "[00:00:86] ENRICHMENT: Cleared security audit. Tech stack: AWS, React, Python, Postgres.",
        "[00:02:50] GEMINI 2.0 FLASH: Intent high. Score 94. Recommended Tier: Enterprise Multi-Seat.",
        "[00:02:88] DISPATCH: Hubspot deal #9928 updated. Slack alert posted to #enterprise-pipeline.",
      ],
    },
    "secops-triage": {
      id: "secops-triage",
      title: "Real-Time SOC-2 Threat Incident Response",
      tag: "Security Operations",
      description:
        "Monitors CloudTrail & Auth events. Scans prompts for injection vectors with dual AES-256 safeguards. Automatically quarantines compromised tokens and alerts on-call engineers.",
      nodes: [
        { name: "Auth Log Stream", role: "Ingress", status: "Streaming", time: "2ms", color: "border-rose-500/50 text-rose-400 bg-rose-500/10" },
        { name: "Injection Vector Audit", role: "Guardrail", status: "Safe (0.01)", time: "14ms", color: "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" },
        { name: "Anomalous IP Detector", role: "Agent Node", status: "High Risk", time: "112ms", color: "border-amber-500/50 text-amber-400 bg-amber-500/10" },
        { name: "Session Revocation", role: "Remediation", status: "Revoked", time: "18ms", color: "border-rose-500/50 text-rose-400 bg-rose-500/10" },
      ],
      streamLog: [
        "[00:00:02] CLOUDTRAIL: Multiple failed authentications from subnet 185.220.101.0/24",
        "[00:00:16] GUARDRAIL: Zero prompt injection detected in payload metadata.",
        "[00:01:28] REASONING: IP flagged in Tor exit node registry. Risk score: 0.98 (CRITICAL).",
        "[00:01:46] REMEDIATION: Session invalidated. Token blacklisted. PagerDuty incident triggered.",
      ],
    },
    "hitl-refund": {
      id: "hitl-refund",
      title: "Customer Support with Executive Approval Gate",
      tag: "Human-in-the-Loop",
      description:
        "Triage high-value dispute tickets. For refund requests over $500, execution safely pauses at a Human-in-the-Loop policy gate, awaiting manager sign-off before Stripe execution.",
      nodes: [
        { name: "Zendesk Webhook", role: "Trigger", status: "Ticket #4102", time: "6ms", color: "border-sky-500/50 text-sky-400 bg-sky-500/10" },
        { name: "Dispute Analyzer", role: "LLM Agent", status: "Amount: $1,250", time: "148ms", color: "border-indigo-500/50 text-indigo-400 bg-indigo-500/10" },
        { name: "Human Approval Gate", role: "Policy Gate", status: "Pending Manager", time: "Paused", color: "border-amber-500/50 text-amber-400 bg-amber-500/10" },
        { name: "Stripe Refund Dispatch", role: "Payment", status: "Awaiting", time: "--", color: "border-slate-500/50 text-slate-400 bg-slate-500/10" },
      ],
      streamLog: [
        "[00:00:06] ZENDESK: Inbound ticket: Enterprise yearly renewal refund request.",
        "[00:01:54] ANALYZER: Refund calculated at $1,250.00. Rule: Ref > $500 requires Manager Gate.",
        "[00:01:55] POLICY GATE: Execution safely paused. Webhook dispatched to approval channel.",
        "[00:01:56] STATUS: Graph suspended state saved. Awaiting manager signature...",
      ],
    },
  };

  const current = templates[selectedTemplate];

  const runSimulation = () => {
    setIsPlaying(true);
    setSimulatedLogs([]);
    current.streamLog.forEach((log, index) => {
      setTimeout(() => {
        setSimulatedLogs((prev) => [...prev, log]);
        if (index === current.streamLog.length - 1) {
          setIsPlaying(false);
        }
      }, (index + 1) * 450);
    });
  };

  return (
    <section id="playground" className="relative py-24 md:py-32 bg-slate-950/60 dark:bg-charcoal-950/80 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>Interactive Workflow Sandbox</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Test Pre-Built Production Graphs
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Select a real-world enterprise template and simulate deterministic DAG execution right in your browser.
          </p>
        </div>

        {/* Template Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {Object.values(templates).map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => {
                setSelectedTemplate(tpl.id);
                setSimulatedLogs([]);
              }}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                selectedTemplate === tpl.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-[1.02]"
                  : "bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <GitBranch className="w-4 h-4 text-cyan-300" />
              <span>{tpl.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950/50 text-slate-300 font-mono">
                {tpl.tag}
              </span>
            </button>
          ))}
        </div>

        {/* Playground Interactive Container */}
        <div className="rounded-3xl border border-slate-800 bg-slate-950/90 shadow-2xl p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-6 border-b border-slate-800/80 mb-8 gap-4">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                TEMPLATE: {current.tag}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                {current.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
                {current.description}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={runSimulation}
                disabled={isPlaying}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{isPlaying ? "Executing Graph..." : "Simulate Live Run"}</span>
              </button>

              <button
                onClick={() => navigate("/studio")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              >
                <span>Open in Canvas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Node Flow Representation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {current.nodes.map((node, index) => (
              <div
                key={node.name}
                className={`p-4 rounded-2xl border transition-all ${node.color} bg-slate-900/60`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400">
                    Step 0{index + 1} // {node.role}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{node.time}</span>
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white mb-2 truncate">
                  {node.name}
                </h4>
                <div className="flex items-center gap-1.5 text-xs">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-300 font-mono text-[11px]">{node.status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Simulated Terminal Console */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3 text-slate-400">
              <span className="flex items-center gap-2 text-cyan-400">
                <Terminal className="w-4 h-4" />
                <span>EXECUTION STREAM // SSE TELEMETRY</span>
              </span>
              <span className="text-[11px] text-slate-500">
                KAHN SORT: DETERMINISTIC O(V+E)
              </span>
            </div>

            <div className="space-y-1.5 min-h-[90px]">
              {(simulatedLogs.length > 0 ? simulatedLogs : current.streamLog).map((line, idx) => (
                <div key={idx} className="text-slate-300 leading-relaxed">
                  <span className="text-indigo-400">&gt;</span> {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};