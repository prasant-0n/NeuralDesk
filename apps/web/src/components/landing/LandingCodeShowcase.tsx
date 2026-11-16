import React, { useState } from "react";
import { Copy, Check, Code, ExternalLink } from "lucide-react";

export const LandingCodeShowcase: React.FC = () => {
  const [activeLang, setActiveLang] = useState<"ts" | "py" | "curl">("ts");
  const [copied, setCopied] = useState(false);

  const snippets = {
    ts: `import { NeuralDesk } from "@neuraldesk/sdk";

// Initialize client with BYOK zero-knowledge credentials
const client = new NeuralDesk({
  apiKey: process.env.NEURALDESK_API_KEY,
  byokEncryptionKey: process.env.ENCRYPTION_KEY,
});

// Trigger autonomous DAG execution
const execution = await client.workflows.execute({
  workflowId: "wf_lead_qualification_v2",
  inputs: {
    domain: "acme-corp.com",
    urgency: "high",
    budget: 50000,
  },
  onStream: (event) => {
    console.log(\`Node: \${event.nodeId} completed in \${event.latencyMs}ms\`);
  },
});

console.log("Graph Output:", execution.outputs);`,
    py: `from neuraldesk import NeuralDesk
import os

# Initialize client with BYOK enclave key
client = NeuralDesk(
    api_key=os.getenv("NEURALDESK_API_KEY"),
    byok_key=os.getenv("ENCRYPTION_KEY")
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
    print(f"[{event.node_name}] State: {event.status}")`,
    curl: `curl -X POST https://neuraldesk-lovat.vercel.app/api/v1/executions \\
  -H "Authorization: Bearer nd_live_secret_key" \\
  -H "X-Workspace-Id: ws_enterprise_prod" \\
  -H "Content-Type: application/json" \\
  -d '{
    "workflowId": "wf_hitl_approval_v1",
    "inputs": {
      "ticketId": "ZD-9941",
      "refundAmount": 1250.00
    }
  }'`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="architecture" className="relative py-24 md:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Technical Narrative */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              <Code className="w-3.5 h-3.5" />
              <span>Developer-First Architecture</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Deploy in Code or Visual Studio.{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Zero Vendor Lock-In.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Every graph created in the visual canvas exports as clean, versionable
              JSON/YAML schemas. Trigger executions through modern SDKs, webhooks,
              or direct REST endpoints with RFC 7807 compliance.
            </p>

            <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
              <li className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Typed TypeScript & Python SDKs with auto-complete</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span>Streaming Server-Sent Events (SSE) out of the box</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>HMAC-SHA256 signature verification for inbound webhooks</span>
              </li>
            </ul>

            <div className="pt-2">
              <a
                href="/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-cyan-300 transition-colors"
              >
                <span>Read the Complete API Specification</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right Column: Code Window */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/95 shadow-2xl overflow-hidden">
              {/* Window Header with Language Tabs */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5 mr-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-[11px] font-mono">
                    <button
                      onClick={() => setActiveLang("ts")}
                      className={`px-3 py-1 rounded-md transition-colors ${
                        activeLang === "ts"
                          ? "bg-indigo-600 text-white font-semibold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      TypeScript
                    </button>
                    <button
                      onClick={() => setActiveLang("py")}
                      className={`px-3 py-1 rounded-md transition-colors ${
                        activeLang === "py"
                          ? "bg-indigo-600 text-white font-semibold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Python
                    </button>
                    <button
                      onClick={() => setActiveLang("curl")}
                      className={`px-3 py-1 rounded-md transition-colors ${
                        activeLang === "curl"
                          ? "bg-indigo-600 text-white font-semibold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      cURL
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Pre Container */}
              <div className="p-5 font-mono text-xs overflow-x-auto text-slate-300 bg-slate-950/80">
                <pre className="leading-relaxed">
                  <code>{snippets[activeLang]}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};