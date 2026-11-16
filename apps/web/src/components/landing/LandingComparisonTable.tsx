import React from "react";
import { Check, X, Sparkles, Shield, Cpu, Lock, Radio, Layers } from "lucide-react";

export const LandingComparisonTable: React.FC = () => {
  const categories = [
    {
      category: "Graph Determinism & Topology",
      icon: Layers,
      items: [
        {
          feature: "Topological Cycle Detection (Kahn Algorithm)",
          neuraldesk: true,
          langgraph: false,
          n8n: false,
          scripts: false,
          note: "Pre-execution in-degree topological sorting eliminates recursive agent deadlocks before token billing.",
        },
        {
          feature: "Mathematical O(V + E) Traversal Guarantee",
          neuraldesk: true,
          langgraph: "Unpredictable",
          n8n: false,
          scripts: false,
          note: "Formal graph verification proves completion bounds before initiating network requests.",
        },
      ],
    },
    {
      category: "Zero-Knowledge Cryptography",
      icon: Lock,
      items: [
        {
          feature: "Client-Side BYOK Envelope Encryption (AES-256)",
          neuraldesk: true,
          langgraph: false,
          n8n: false,
          scripts: false,
          note: "Keys are derived client-side via PBKDF2; persistent database stores only binary ciphertext.",
        },
        {
          feature: "Ephemeral Memory Enclave & Zeroing",
          neuraldesk: true,
          langgraph: false,
          n8n: false,
          scripts: false,
          note: "Secrets exist in isolated worker RAM only during execution; sanitized upon node completion.",
        },
      ],
    },
    {
      category: "Telemetry & Governance",
      icon: Radio,
      items: [
        {
          feature: "Native Server-Sent Events (SSE) Streaming",
          neuraldesk: true,
          langgraph: "Complex",
          n8n: false,
          scripts: "DIY",
          note: "Sub-millisecond node timestamps and live token metering streamed over chunked HTTP.",
        },
        {
          feature: "Human-in-the-Loop Policy Gateways with Timeouts",
          neuraldesk: true,
          langgraph: "Manual",
          n8n: "Basic",
          scripts: false,
          note: "Automatic graph suspension and state save to Lakebase pending manager sign-off.",
        },
      ],
    },
    {
      category: "Developer Architecture",
      icon: Cpu,
      items: [
        {
          feature: "Visual Canvas + Declarative JSON/YAML Sync",
          neuraldesk: true,
          langgraph: false,
          n8n: true,
          scripts: false,
          note: "Export schema to Git repositories or edit in visual ReactFlow studio bi-directionally.",
        },
        {
          feature: "Multi-Model Dynamic Routing (Gemini 2.0, Claude, GPT, Ollama)",
          neuraldesk: true,
          langgraph: true,
          n8n: "Limited",
          scripts: "DIY",
          note: "Mix and match foundation models per-node based on latency and cost budgets.",
        },
      ],
    },
  ];

  return (
    <section id="comparison" className="relative py-24 md:py-32 bg-slate-50/50 dark:bg-charcoal-950/60 border-t border-slate-200 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-4">
            <Shield className="w-3.5 h-3.5" />
            <span>Architectural Comparison Matrix</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
            Why Systems Engineers Choose NeuralDesk
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Compare NeuralDesk's mathematical determinism against ad-hoc agent loops and legacy visual automation tools.
          </p>
        </div>

        {/* Table Container */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/90 shadow-xl dark:shadow-2xl overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-mono uppercase text-slate-600 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-900/60">
                <th className="py-4 px-6 w-2/5">Capability / Architecture</th>
                <th className="py-4 px-6 text-center text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/70 dark:bg-indigo-950/20 border-x border-indigo-200 dark:border-indigo-500/20">
                  <span className="flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>NeuralDesk 2.0</span>
                  </span>
                </th>
                <th className="py-4 px-6 text-center text-slate-600 dark:text-slate-400">LangGraph / Code</th>
                <th className="py-4 px-6 text-center text-slate-600 dark:text-slate-400">n8n / Zapier</th>
                <th className="py-4 px-6 text-center text-slate-600 dark:text-slate-400">Ad-Hoc Scripts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 text-sm">
              {categories.map((cat) => (
                <React.Fragment key={cat.category}>
                  {/* Category Header Row */}
                  <tr className="bg-slate-50/70 dark:bg-slate-900/40">
                    <td colSpan={5} className="py-2.5 px-6 font-mono text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <cat.icon className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{cat.category}</span>
                    </td>
                  </tr>

                  {cat.items.map((row) => (
                    <tr key={row.feature} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-900 dark:text-slate-200">{row.feature}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{row.note}</div>
                      </td>

                      {/* NeuralDesk Column */}
                      <td className="py-4 px-6 text-center bg-indigo-50/40 dark:bg-indigo-950/15 border-x border-indigo-200 dark:border-indigo-500/20">
                        <div className="flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
                            <Check className="w-4 h-4 stroke-[2.5]" />
                          </div>
                        </div>
                      </td>

                      {/* LangGraph */}
                      <td className="py-4 px-6 text-center text-slate-600 dark:text-slate-400 text-xs font-mono font-medium">
                        {row.langgraph === true ? (
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
                        ) : row.langgraph === false ? (
                          <X className="w-4 h-4 text-rose-500/70 mx-auto" />
                        ) : (
                          <span>{row.langgraph}</span>
                        )}
                      </td>

                      {/* n8n */}
                      <td className="py-4 px-6 text-center text-slate-600 dark:text-slate-400 text-xs font-mono font-medium">
                        {row.n8n === true ? (
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
                        ) : row.n8n === false ? (
                          <X className="w-4 h-4 text-rose-500/70 mx-auto" />
                        ) : (
                          <span>{row.n8n}</span>
                        )}
                      </td>

                      {/* Ad-Hoc Scripts */}
                      <td className="py-4 px-6 text-center text-slate-600 dark:text-slate-400 text-xs font-mono font-medium">
                        {row.scripts === true ? (
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
                        ) : row.scripts === false ? (
                          <X className="w-4 h-4 text-rose-500/70 mx-auto" />
                        ) : (
                          <span>{row.scripts}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
