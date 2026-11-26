import React from "react";
import { Check, X, Layers, Lock, Radio, Cpu } from "lucide-react";

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
    <section id="comparison" className="py-20 md:py-28 bg-[#fafafa] dark:bg-[#07080d] border-b border-slate-200/70 dark:border-[rgba(238,240,245,0.06)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <div className="text-xs font-mono text-slate-500 dark:text-[#7a8296] mb-2">
            Competitive Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-slate-900 dark:text-[#eef0f5] mb-3">
            Why lead architects build on NeuralDesk
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-[#a3a9b8] leading-relaxed">
            Comparing architectural guarantees across graph determinism, client-side encryption, and live telemetry.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="rounded-xl border border-slate-200 dark:border-[rgba(238,240,245,0.08)] bg-white dark:bg-[#11141c] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[rgba(238,240,245,0.08)] bg-slate-50 dark:bg-[#07080d]">
                  <th className="py-3 px-4 font-mono font-medium text-slate-500 dark:text-[#7a8296] w-2/5">
                    Architectural capability
                  </th>
                  <th className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-[#eef0f5] w-1/5 bg-slate-100/70 dark:bg-[#1a1e28]/50">
                    NeuralDesk
                  </th>
                  <th className="py-3 px-4 font-mono font-medium text-slate-500 dark:text-[#7a8296] w-1/5">
                    LangGraph
                  </th>
                  <th className="py-3 px-4 font-mono font-medium text-slate-500 dark:text-[#7a8296] w-1/5">
                    n8n / DIY
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, catIdx) => (
                  <React.Fragment key={cat.category}>
                    <tr className="border-b border-slate-200/70 dark:border-[rgba(238,240,245,0.06)] bg-slate-50/50 dark:bg-[#0b0d14]/40">
                      <td colSpan={4} className="py-2.5 px-4 font-mono text-[11px] font-medium text-slate-700 dark:text-[#a3a9b8]">
                        <span className="flex items-center gap-1.5">
                          <cat.icon className="w-3.5 h-3.5 text-slate-500 dark:text-[#7a8296]" />
                          <span>{cat.category}</span>
                        </span>
                      </td>
                    </tr>
                    {cat.items.map((item, itemIdx) => (
                      <tr
                        key={item.feature}
                        className={`border-b border-slate-100 dark:border-[rgba(238,240,245,0.04)] ${
                          itemIdx === cat.items.length - 1 && catIdx !== categories.length - 1
                            ? "border-b-slate-200 dark:border-b-[rgba(238,240,245,0.08)]"
                            : ""
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900 dark:text-[#eef0f5] mb-0.5">
                            {item.feature}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-[#7a8296] leading-relaxed">
                            {item.note}
                          </div>
                        </td>
                        <td className="py-3 px-4 bg-slate-100/40 dark:bg-[#1a1e28]/30">
                          {item.neuraldesk === true ? (
                            <span className="inline-flex items-center gap-1 font-mono text-emerald-600 dark:text-[#4cc38a]">
                              <Check className="w-3.5 h-3.5" />
                              <span>Enforced</span>
                            </span>
                          ) : (
                            <span className="text-slate-500 dark:text-[#7a8296]">{item.neuraldesk}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500 dark:text-[#7a8296]">
                          {item.langgraph === true ? (
                            <span className="inline-flex items-center gap-1 text-slate-700 dark:text-[#a3a9b8]">
                              <Check className="w-3.5 h-3.5" />
                              <span>Supported</span>
                            </span>
                          ) : item.langgraph === false ? (
                            <span className="inline-flex items-center gap-1 text-slate-400 dark:text-[#7a8296]">
                              <X className="w-3.5 h-3.5" />
                              <span>None</span>
                            </span>
                          ) : (
                            <span className="font-mono text-[11px]">{item.langgraph}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500 dark:text-[#7a8296]">
                          {item.n8n === true ? (
                            <span className="inline-flex items-center gap-1 text-slate-700 dark:text-[#a3a9b8]">
                              <Check className="w-3.5 h-3.5" />
                              <span>Supported</span>
                            </span>
                          ) : item.n8n === false ? (
                            <span className="inline-flex items-center gap-1 text-slate-400 dark:text-[#7a8296]">
                              <X className="w-3.5 h-3.5" />
                              <span>None</span>
                            </span>
                          ) : (
                            <span className="font-mono text-[11px]">{item.n8n}</span>
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
      </div>
    </section>
  );
};
