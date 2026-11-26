import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export const LandingFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "What makes Kahn's topological sort better than standard agent loops?",
      a: "Traditional agent systems suffer from infinite recursive loops, deadlocks, and unpredictable execution costs when agents cross-call each other. NeuralDesk represents workflows as a Directed Acyclic Graph (DAG) and runs Kahn's algorithm before execution to prove there are zero cycles, establishing a clean execution order in O(V + E) time.",
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
      a: "When a node encounters a high-stakes decision, it evaluates custom threshold rules. If a rule triggers, graph traversal safely pauses, saving state to PostgreSQL and dispatching a webhook or Slack notification. The graph resumes only after an authorized user signs off.",
    },
    {
      q: "Can NeuralDesk be deployed self-hosted or in a private cloud VPC?",
      a: "Yes. The entire platform (Hono API backend, PostgreSQL database, and Vite React frontend) is 100% containerized with Docker and Kubernetes manifests. Self-hosted deployments support private VPC configurations, air-gapped on-prem installations, and custom SAML SSO.",
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
    <section id="faq" className="py-20 md:py-28 bg-[#f5f7fa] dark:bg-[#0b0d14] border-b border-slate-200/70 dark:border-[rgba(238,240,245,0.06)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <div className="text-xs font-mono text-slate-500 dark:text-[#7a8296] mb-2">
            Frequently Asked Questions
          </div>
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-slate-900 dark:text-[#eef0f5] mb-3">
            Common questions on deterministic orchestration
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-[#a3a9b8] leading-relaxed">
            Everything you need to know about DAG cycle validation, BYOK encryption, and deployment.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="rounded-xl border border-slate-200 dark:border-[rgba(238,240,245,0.08)] bg-white dark:bg-[#11141c] overflow-hidden"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-slate-50 dark:hover:bg-[#1a1e28] transition-colors cursor-pointer"
                >
                  <span className="text-sm font-medium text-slate-900 dark:text-[#eef0f5]">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 dark:text-[#7a8296] shrink-0 ml-3 transition-transform duration-150 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-[#a3a9b8] leading-relaxed border-t border-slate-100 dark:border-[rgba(238,240,245,0.06)]">
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
