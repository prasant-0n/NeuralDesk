import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  GitBranch,
  Play,
  Terminal,
  CheckCircle,
  Copy,
  Check,
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
  }[];
  streamLog: string[];
}

export const LandingPlayground: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("lead-scoring");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [simulatedLogs, setSimulatedLogs] = useState<string[]>([]);
  const [copiedLog, setCopiedLog] = useState<boolean>(false);

  const templates: Record<string, WorkflowTemplate> = {
    "lead-scoring": {
      id: "lead-scoring",
      title: "Autonomous B2B lead qualification",
      tag: "Revenue AI",
      description:
        "Ingests incoming webhook leads, enriches domain metrics with external APIs, routes to Gemini 2.0 Flash for enterprise qualification, and alerts sales executives on Slack.",
      nodes: [
        { name: "Webhook Lead Ingress", role: "Trigger", status: "200 OK", time: "4ms" },
        { name: "Domain Enrichment", role: "Tool Node", status: "Enriched", time: "82ms" },
        { name: "Gemini 2.0 Lead Scorer", role: "LLM Agent", status: "Score: 94/100", time: "164ms" },
        { name: "Salesforce / Slack Sync", role: "Integration", status: "Dispatched", time: "38ms" },
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
      title: "Real-time SOC-2 threat incident response",
      tag: "Security Ops",
      description:
        "Monitors CloudTrail & Auth events. Scans prompts for injection vectors with dual AES-256 safeguards. Automatically quarantines compromised tokens and alerts on-call engineers.",
      nodes: [
        { name: "Auth Log Stream", role: "Ingress", status: "Streaming", time: "2ms" },
        { name: "Injection Vector Audit", role: "Guardrail", status: "Safe (0.01)", time: "14ms" },
        { name: "Anomalous IP Detector", role: "Agent Node", status: "High Risk", time: "112ms" },
        { name: "Session Revocation", role: "Remediation", status: "Revoked", time: "18ms" },
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
      title: "Customer dispute with sign-off gate",
      tag: "Governance",
      description:
        "Triage high-value dispute tickets. For refund requests over $500, execution safely pauses at a Human-in-the-Loop policy gate, awaiting manager sign-off before Stripe execution.",
      nodes: [
        { name: "Zendesk Webhook", role: "Trigger", status: "Ticket #4102", time: "6ms" },
        { name: "Dispute Analyzer", role: "LLM Agent", status: "Amount: $1,250", time: "148ms" },
        { name: "Human Approval Gate", role: "Policy Gate", status: "Pending Manager", time: "Paused" },
        { name: "Stripe Refund Dispatch", role: "Payment", status: "Awaiting Sign-off", time: "--" },
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
    setActiveStepIndex(0);

    current.streamLog.forEach((log, index) => {
      setTimeout(() => {
        setSimulatedLogs((prev) => [...prev, log]);
        setActiveStepIndex(index);
        if (index === current.streamLog.length - 1) {
          setIsPlaying(false);
        }
      }, (index + 1) * 450);
    });
  };

  const copyTelemetry = () => {
    navigator.clipboard.writeText((simulatedLogs.length > 0 ? simulatedLogs : current.streamLog).join("\n"));
    setCopiedLog(true);
    setTimeout(() => setCopiedLog(false), 2000);
  };

  return (
    <section id="playground" className="py-20 md:py-28 bg-[#fafafa] dark:bg-[#07080d] border-b border-slate-200/70 dark:border-[rgba(238,240,245,0.06)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <div className="text-xs font-mono text-slate-500 dark:text-[#7a8296] mb-2">
            Interactive Sandbox
          </div>
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-slate-900 dark:text-[#eef0f5] mb-3">
            Simulate production agent graphs
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-[#a3a9b8] leading-relaxed">
            Select a verified enterprise pipeline template and test deterministic topological execution directly in the browser.
          </p>
        </div>

        {/* Template Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {Object.values(templates).map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => {
                setSelectedTemplate(tpl.id);
                setSimulatedLogs([]);
                setActiveStepIndex(-1);
              }}
              className={`h-9 px-3.5 rounded-lg text-xs font-medium inline-flex items-center gap-2 transition-colors cursor-pointer ${
                selectedTemplate === tpl.id
                  ? "bg-slate-900 text-white dark:bg-[#eef0f5] dark:text-[#0b0d14]"
                  : "bg-white dark:bg-[#11141c] text-slate-600 dark:text-[#a3a9b8] hover:text-slate-900 dark:hover:text-[#eef0f5] border border-slate-200 dark:border-[rgba(238,240,245,0.08)]"
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>{tpl.title}</span>
              <span className="text-[10px] font-mono text-slate-400 dark:text-[#7a8296]">
                [{tpl.tag}]
              </span>
            </button>
          ))}
        </div>

        {/* Playground Interactive Container */}
        <div className="rounded-xl border border-slate-200 dark:border-[rgba(238,240,245,0.08)] bg-white dark:bg-[#11141c] p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-4 border-b border-slate-200 dark:border-[rgba(238,240,245,0.08)] mb-6 gap-3">
            <div>
              <div className="text-xs font-mono text-slate-500 dark:text-[#7a8296]">
                TEMPLATE: {current.tag.toUpperCase()} • TOPOSORT ACTIVE
              </div>
              <h3 className="text-base font-medium text-slate-900 dark:text-[#eef0f5] mt-0.5">
                {current.title}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={runSimulation}
                disabled={isPlaying}
                className="h-8 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#eef0f5] dark:hover:bg-white dark:text-[#0b0d14] text-xs font-mono inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{isPlaying ? "Executing..." : "Run Simulation"}</span>
              </button>

              <button
                onClick={() => navigate("/studio")}
                className="h-8 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#1a1e28] dark:hover:bg-[#232325] text-slate-700 dark:text-[#eef0f5] text-xs font-mono inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Studio</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Node Progression Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
            {current.nodes.map((node, index) => {
              const isFinished = activeStepIndex >= index;
              return (
                <div
                  key={node.name}
                  className={`p-3.5 rounded-lg border transition-colors ${
                    isFinished
                      ? "border-slate-900 bg-white dark:border-[#eef0f5] dark:bg-[#1a1e28]"
                      : "border-slate-200 bg-slate-50/50 dark:border-[rgba(238,240,245,0.06)] dark:bg-[#07080d]"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-[#7a8296] mb-1.5">
                    <span>{node.role}</span>
                    <span className="tabular-nums">{node.time}</span>
                  </div>
                  <div className="text-xs font-medium text-slate-900 dark:text-[#eef0f5] truncate mb-2">
                    {node.name}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-[#4cc38a]">
                    <CheckCircle className="w-3 h-3" />
                    <span>{node.status}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stream Logs */}
          <div className="rounded-lg border border-slate-200 dark:border-[rgba(238,240,245,0.08)] bg-slate-50 dark:bg-[#07080d] p-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[rgba(238,240,245,0.06)] mb-2 text-slate-500 dark:text-[#7a8296]">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-[#a3a9b8]">
                <Terminal className="w-3.5 h-3.5" />
                <span>STREAM_TELEMETRY // SSE_DISPATCH</span>
              </span>
              <button
                onClick={copyTelemetry}
                className="hover:text-slate-900 dark:hover:text-[#eef0f5] transition-colors inline-flex items-center gap-1 text-[11px]"
              >
                {copiedLog ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLog ? "Copied" : "Copy Log"}</span>
              </button>
            </div>
            <div className="space-y-1 text-slate-700 dark:text-[#a3a9b8] leading-relaxed">
              {(simulatedLogs.length > 0 ? simulatedLogs : current.streamLog).map((line, idx) => (
                <div key={idx} className="truncate">
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
