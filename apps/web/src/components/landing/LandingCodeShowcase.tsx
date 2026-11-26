import React, { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";

export const LandingCodeShowcase: React.FC = () => {
  const [activeLang, setActiveLang] = useState<"ts" | "py" | "curl">("ts");
  const [copied, setCopied] = useState(false);

  const snippets = {
    ts: `import { NeuralDesk } from "@neuraldesk/sdk";

// Initialize client with BYOK zero-knowledge credentials
const client = new NeuralDesk({
  apiKey: process.env.NEURALDESK_API_KEY,
  byokMasterPassphrase: process.env.ENCRYPTION_PASSPHRASE,
});

// Trigger deterministic topological DAG execution
const execution = await client.workflows.execute({
  workflowId: "wf_lead_qualification_v2",
  inputs: {
    domain: "acme-corp.com",
    urgency: "high",
    budget: 50000,
  },
  onStream: (event) => {
    // Sub-millisecond SSE stream updates per node
    console.log(\`Node [\${event.nodeId}] resolved in \${event.latencyMs}ms\`);
  },
});

console.log("DAG Final Outputs:", execution.outputs);`,
    py: `from neuraldesk import NeuralDesk
import os

# Initialize client with BYOK zero-knowledge enclave
client = NeuralDesk(
    api_key=os.getenv("NEURALDESK_API_KEY"),
    byok_passphrase=os.getenv("ENCRYPTION_PASSPHRASE")
)

# Execute deterministic multi-agent pipeline
execution = client.workflows.execute(
    workflow_id="wf_security_triage_v2",
    inputs={
        "log_event": "multiple_auth_failures",
        "ip_address": "185.220.101.4",
        "severity": "critical"
    }
)

for event in execution.stream():
    print(f"[{event.node_name}] State: {event.status} (In-Degree: {event.in_degree})")`,
    curl: `curl -X POST https://neuraldesk.app/api/v1/executions \\
  -H "Authorization: Bearer nd_live_secret_key" \\
  -H "X-Workspace-Id: ws_enterprise_prod" \\
  -H "Content-Type: application/json" \\
  -d '{
    "workflowId": "wf_hitl_approval_v1",
    "inputs": {
      "ticketId": "ZD-9941",
      "priority": "P0"
    }
  }'`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="code" className="py-20 md:py-28 bg-[#f5f7fa] dark:bg-[#0b0d14] border-b border-slate-200/70 dark:border-[rgba(238,240,245,0.06)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <div className="text-xs font-mono text-slate-500 dark:text-[#7a8296] mb-2">
            Developer APIs & SDKs
          </div>
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-slate-900 dark:text-[#eef0f5] mb-3">
            Programmatic DAG execution
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-[#a3a9b8] leading-relaxed">
            Trigger, stream, and introspect multi-agent graphs using typed TypeScript, Python, or standard HTTP REST.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-[rgba(238,240,245,0.08)] bg-white dark:bg-[#11141c] overflow-hidden">
          {/* Header Bar */}
          <div className="h-10 px-4 bg-slate-50 dark:bg-[#07080d] border-b border-slate-200 dark:border-[rgba(238,240,245,0.08)] flex items-center justify-between">
            <div className="flex items-center gap-1 font-mono text-xs">
              {(["ts", "py", "curl"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={`h-7 px-2.5 rounded transition-colors ${
                    activeLang === lang
                      ? "bg-slate-900 text-white dark:bg-[#eef0f5] dark:text-[#0b0d14] font-medium"
                      : "text-slate-600 dark:text-[#7a8296] hover:text-slate-900 dark:hover:text-[#eef0f5]"
                  }`}
                >
                  {lang === "ts" ? "TypeScript" : lang === "py" ? "Python" : "cURL"}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <a
                href="/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-slate-500 dark:text-[#7a8296] hover:text-slate-900 dark:hover:text-[#eef0f5] inline-flex items-center gap-1 transition-colors"
              >
                <span>Docs</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={handleCopy}
                className="h-7 px-2.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-[#1a1e28] dark:hover:bg-[#232325] text-slate-700 dark:text-[#eef0f5] text-xs font-mono inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          {/* Code Container */}
          <div className="p-4 bg-slate-50/50 dark:bg-[#07080d]/80 overflow-x-auto">
            <pre className="font-mono text-xs text-slate-800 dark:text-[#a3a9b8] leading-relaxed">
              <code>{snippets[activeLang]}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
};
