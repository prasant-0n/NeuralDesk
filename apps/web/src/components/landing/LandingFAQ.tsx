import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export const LandingFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "What makes Kahn's topological sort better than standard agent loops?",
      a: "Traditional agent systems suffer from infinite recursive loops, deadlocks, and unpredictable execution costs when agents cross-call each other. NeuralDesk represents workflows as a Directed Acyclic Graph (DAG) and runs Kahn's algorithm before execution to mathematically prove there are zero cycles, establishing a clean execution order in O(V + E) time.",
    },
    {
      q: "How does Zero-Knowledge BYOK encryption protect our API keys and data?",
      a: "With Bring Your Own Key (BYOK), all LLM provider secrets (Gemini, Claude, OpenAI) are encrypted client-side using AES-256-GCM envelope encryption with a user-supplied master passphrase. Our database only stores ciphertext that cannot be decrypted without your key. During execution, keys reside exclusively in isolated, transient memory enclaves.",
    },
    {
      q: "Can I execute multi-agent workflows purely through code and webhooks without the UI?",
      a: "Yes. Every visual workflow has a corresponding declarative JSON schema. You can trigger, stream, and inspect executions using our typed TypeScript SDK, Python library, or standard HTTP REST endpoints with HMAC-SHA256 signature verification.",
    },
    {
      q: "How does Human-in-the-Loop (HITL) policy enforcement work during graph execution?",
      a: "When a node encounters a high-stakes decision (e.g., executing a refund, deploying code, or deleting data), it evaluates custom threshold rules. If a rule triggers, graph traversal safely pauses, saving state to PostgreSQL and dispatching a webhook or Slack notification. The graph resumes only after an authorized user signs off.",
    },
    {
      q: "Can NeuralDesk be deployed self-hosted or in a private cloud VPC?",
      a: "Yes. The entire platform (Hono API backend, PostgreSQL database, and Vite React frontend) is 100% containerized with Docker and Kubernetes manifests. Enterprise plans include private VPC deployment, air-gapped on-prem installations, and custom SAML SSO.",
    },
    {
      q: "Which LLM model providers are supported out-of-the-box?",
      a: "NeuralDesk supports Google Gemini 2.0 Flash and 1.5 Pro, Anthropic Claude 3.5 Sonnet, OpenAI GPT-4o, and local offline models via Ollama. You can mix and match models on a per-node basis within the same DAG.",
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="relative py-24 md:py-32 overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Got Questions? We Have Answers.
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Everything you need to know about deterministic DAG execution, BYOK security, and deployment.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="rounded-2xl border border-slate-800 bg-slate-950/80 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-900/40 transition-colors"
                >
                  <span className="text-base font-semibold text-slate-200">
                    {faq.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0 ml-4 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-indigo-400 border-indigo-500/40" : ""
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm text-slate-400 leading-relaxed border-t border-slate-800/80 bg-slate-900/20 font-normal">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};