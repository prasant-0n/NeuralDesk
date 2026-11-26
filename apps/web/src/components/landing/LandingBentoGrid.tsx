import React, { useState } from "react";
import {
  Layers,
  Lock,
  UserCheck,
  Activity,
  Cpu,
  History,
  GitFork,
  Radio,
  AlertTriangle,
  CheckCircle2,
  KeyRound,
} from "lucide-react";

export const LandingBentoGrid: React.FC = () => {
  const [cycleMode, setCycleMode] = useState<"acyclic" | "cyclic">("acyclic");
  const [vaultKeyDerived, setVaultKeyDerived] = useState(false);
  const [hitlStatus, setHitlStatus] = useState<"pending" | "approved" | "rejected">("pending");

  return (
    <section id="features" className="py-20 md:py-28 bg-[#fafafa] dark:bg-[#07080d] border-b border-slate-200/70 dark:border-[rgba(238,240,245,0.06)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <div className="text-xs font-mono text-slate-500 dark:text-[#7a8296] mb-2">
            Architecture & Verification
          </div>
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-slate-900 dark:text-[#eef0f5] mb-3">
            Engineered for deterministic autonomous execution
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-[#a3a9b8] leading-relaxed">
            Eliminate infinite agent loops and unverified dependencies with in-degree topological sort,
            zero-knowledge BYOK encryption, and Server-Sent Events telemetry.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {/* Card 1: Large Span (2 columns) - Kahn Topological Engine */}
          <div className="md:col-span-2 rounded-xl p-6 border border-slate-200 dark:border-[rgba(238,240,245,0.08)] bg-white dark:bg-[#11141c] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-[#1a1e28] flex items-center justify-center text-slate-700 dark:text-[#eef0f5]">
                  <Layers className="w-4 h-4" />
                </div>

                {/* Interactive Cycle Mode Toggle */}
                <div className="flex items-center gap-1 p-0.5 rounded-md bg-slate-100 dark:bg-[#1a1e28] text-xs font-mono">
                  <button
                    onClick={() => setCycleMode("acyclic")}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      cycleMode === "acyclic"
                        ? "bg-slate-900 text-white dark:bg-[#eef0f5] dark:text-[#0b0d14] font-medium"
                        : "text-slate-600 dark:text-[#7a8296] hover:text-slate-900 dark:hover:text-[#eef0f5]"
                    }`}
                  >
                    Acyclic DAG
                  </button>
                  <button
                    onClick={() => setCycleMode("cyclic")}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      cycleMode === "cyclic"
                        ? "bg-rose-600 text-white font-medium"
                        : "text-slate-600 dark:text-[#7a8296] hover:text-slate-900 dark:hover:text-[#eef0f5]"
                    }`}
                  >
                    Inject Cycle
                  </button>
                </div>
              </div>

              <h3 className="text-base font-medium text-slate-900 dark:text-[#eef0f5] mb-2">
                Kahn topological DAG engine
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#a3a9b8] leading-relaxed mb-5">
                Mathematical zero-deadlock guarantee via in-degree topological sorting.
                Pipelines resolve in deterministic O(V + E) complexity, halting recursive agent loops
                before token billing starts.
              </p>
            </div>

            {/* Interactive Visual Simulator Strip inside Bento Card */}
            <div className="rounded-lg border border-slate-200 dark:border-[rgba(238,240,245,0.08)] bg-slate-50 dark:bg-[#07080d] p-3 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-[#7a8296] mb-2 border-b border-slate-200 dark:border-[rgba(238,240,245,0.06)] pb-2">
                <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-[#a3a9b8]">
                  <GitFork className="w-3.5 h-3.5" />
                  <span>KAHN_ANALYZER // RUNTIME_VALIDATOR</span>
                </span>
                {cycleMode === "acyclic" ? (
                  <span className="text-emerald-600 dark:text-[#4cc38a] text-[11px] font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>0 cycles detected</span>
                  </span>
                ) : (
                  <span className="text-rose-600 dark:text-[#e5484d] text-[11px] font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Loop detected: Node_C → Node_A</span>
                  </span>
                )}
              </div>

              {cycleMode === "acyclic" ? (
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-white dark:bg-[#11141c] border border-slate-200/80 dark:border-[rgba(238,240,245,0.06)]">
                    <span className="text-slate-500 dark:text-[#7a8296]">In-Degree:</span>{" "}
                    <span className="text-slate-900 dark:text-[#eef0f5] font-medium">0 [Cleared]</span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-[#11141c] border border-slate-200/80 dark:border-[rgba(238,240,245,0.06)]">
                    <span className="text-slate-500 dark:text-[#7a8296]">Order:</span>{" "}
                    <span className="text-slate-900 dark:text-[#eef0f5] font-medium">L0 → L1 → L2</span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-[#11141c] border border-slate-200/80 dark:border-[rgba(238,240,245,0.06)]">
                    <span className="text-slate-500 dark:text-[#7a8296]">Resolution:</span>{" "}
                    <span className="text-slate-900 dark:text-[#eef0f5] font-medium tabular-nums">14ms O(V+E)</span>
                  </div>
                </div>
              ) : (
                <div className="p-2 rounded bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-[11px] text-rose-700 dark:text-rose-300">
                  RFC 7807 exception caught: Dependency cycle detected between Node_C and Node_A. Traversal suspended cleanly without infinite execution billing.
                </div>
              )}
            </div>
          </div>

          {/* Card 2: BYOK Zero-Knowledge Vault */}
          <div className="rounded-xl p-6 border border-slate-200 dark:border-[rgba(238,240,245,0.08)] bg-white dark:bg-[#11141c] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-[#1a1e28] flex items-center justify-center text-slate-700 dark:text-[#eef0f5]">
                  <Lock className="w-4 h-4" />
                </div>
                <button
                  onClick={() => setVaultKeyDerived(!vaultKeyDerived)}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-[#1a1e28] hover:bg-slate-200 dark:hover:bg-[#232325] text-[11px] font-mono text-slate-700 dark:text-[#a3a9b8] transition-colors flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>{vaultKeyDerived ? "Re-Derive" : "Derive Key"}</span>
                </button>
              </div>

              <h3 className="text-base font-medium text-slate-900 dark:text-[#eef0f5] mb-2">
                Zero-knowledge BYOK vault
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#a3a9b8] leading-relaxed mb-5">
                Bring Your Own Key (BYOK) with client-side AES-256-GCM envelope encryption.
                Secrets reside only in transient WebCrypto memory enclaves during evaluation.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-[rgba(238,240,245,0.08)] bg-slate-50 dark:bg-[#07080d] p-3 font-mono text-[11px] text-slate-700 dark:text-[#a3a9b8] flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-slate-900 dark:text-[#eef0f5]">
                  {vaultKeyDerived ? "DEK: 0x9f4a... [Active]" : "AES_256_GCM_READY"}
                </span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-[#7a8296] tabular-nums">RAM wipe: 2ms</span>
            </div>
          </div>

          {/* Card 3: Human-in-the-Loop Gateway */}
          <div className="rounded-xl p-6 border border-slate-200 dark:border-[rgba(238,240,245,0.08)] bg-white dark:bg-[#11141c] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-[#1a1e28] flex items-center justify-center text-slate-700 dark:text-[#eef0f5]">
                  <UserCheck className="w-4 h-4" />
                </div>

                <div className="flex gap-1 font-mono text-[11px]">
                  <button
                    onClick={() => setHitlStatus("approved")}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      hitlStatus === "approved"
                        ? "bg-slate-900 text-white dark:bg-[#eef0f5] dark:text-[#0b0d14]"
                        : "bg-slate-100 dark:bg-[#1a1e28] text-slate-600 dark:text-[#7a8296]"
                    }`}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setHitlStatus("rejected")}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      hitlStatus === "rejected"
                        ? "bg-rose-600 text-white"
                        : "bg-slate-100 dark:bg-[#1a1e28] text-slate-600 dark:text-[#7a8296]"
                    }`}
                  >
                    Reject
                  </button>
                </div>
              </div>

              <h3 className="text-base font-medium text-slate-900 dark:text-[#eef0f5] mb-2">
                Human-in-the-loop policy gates
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#a3a9b8] leading-relaxed mb-5">
                Safeguard critical decisions. Traversal pauses automatically when
                high-risk thresholds are crossed, awaiting manager sign-off via webhook or UI.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-[rgba(238,240,245,0.08)] bg-slate-50 dark:bg-[#07080d] p-3 font-mono text-[11px] text-slate-700 dark:text-[#a3a9b8] flex items-center justify-between">
              <span className="text-slate-900 dark:text-[#eef0f5]">
                Status: {hitlStatus}
              </span>
              <span className="text-slate-500 dark:text-[#7a8296]">Timeout: 24h</span>
            </div>
          </div>

          {/* Card 4: Large Span (2 columns) - Real-Time Streaming Telemetry */}
          <div className="md:col-span-2 rounded-xl p-6 border border-slate-200 dark:border-[rgba(238,240,245,0.08)] bg-white dark:bg-[#11141c] flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-[#1a1e28] flex items-center justify-center mb-5 text-slate-700 dark:text-[#eef0f5]">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="text-base font-medium text-slate-900 dark:text-[#eef0f5] mb-2">
                Live SSE telemetry & audit observability
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#a3a9b8] leading-relaxed mb-5">
                Stream token counts, intermediate reasoning states, node execution latencies,
                and economics in real-time using native chunked Server-Sent Events (SSE).
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-[rgba(238,240,245,0.08)] bg-slate-50 dark:bg-[#07080d] p-3 font-mono text-xs text-slate-700 dark:text-[#a3a9b8] flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-slate-500 dark:text-[#7a8296] border-b border-slate-200 dark:border-[rgba(238,240,245,0.06)] pb-1.5">
                <span className="flex items-center gap-1.5 text-slate-900 dark:text-[#eef0f5]">
                  <Radio className="w-3.5 h-3.5 text-emerald-500" />
                  <span>STREAMING /api/v1/executions/sse</span>
                </span>
                <span className="text-emerald-600 dark:text-[#4cc38a] text-[11px]">200 OK • Chunked</span>
              </div>
              <div className="text-[11px] truncate text-slate-600 dark:text-[#a3a9b8]">
                event: node_progress | data: &#123; "node": "gemini_agent", "tokens": 482, "elapsedMs": 142, "status": "COMPLETED" &#125;
              </div>
            </div>
          </div>

          {/* Card 5: Multi-Model Hub */}
          <div className="rounded-xl p-6 border border-slate-200 dark:border-[rgba(238,240,245,0.08)] bg-white dark:bg-[#11141c] flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-[#1a1e28] flex items-center justify-center mb-5 text-slate-700 dark:text-[#eef0f5]">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="text-base font-medium text-slate-900 dark:text-[#eef0f5] mb-2">
                Multi-model orchestrator
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#a3a9b8] leading-relaxed mb-4">
                Route tasks per-node based on latency and cost: Gemini 2.0 Flash for fast reasoning, Claude 3.5 Sonnet for code logic, and local Ollama for zero-cost offline runs.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1a1e28] text-slate-700 dark:text-[#a3a9b8]">Gemini 2.0 • 140ms</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1a1e28] text-slate-700 dark:text-[#a3a9b8]">Claude 3.5 • 310ms</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1a1e28] text-slate-700 dark:text-[#a3a9b8]">GPT-4o</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1a1e28] text-slate-700 dark:text-[#a3a9b8]">Ollama Local</span>
            </div>
          </div>

          {/* Card 6: Immutable Replay */}
          <div className="rounded-xl p-6 border border-slate-200 dark:border-[rgba(238,240,245,0.08)] bg-white dark:bg-[#11141c] flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-[#1a1e28] flex items-center justify-center mb-5 text-slate-700 dark:text-[#eef0f5]">
                <History className="w-4 h-4" />
              </div>
              <h3 className="text-base font-medium text-slate-900 dark:text-[#eef0f5] mb-2">
                One-click execution replay
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#a3a9b8] leading-relaxed mb-4">
                Node inputs and outputs are recorded as immutable checkpoints. Replay failing subgraphs without re-running upstream root steps.
              </p>
            </div>
            <div className="rounded bg-slate-50 dark:bg-[#07080d] p-2 font-mono text-[11px] text-slate-500 dark:text-[#7a8296]">
              CHECKPOINT: 0x99a4c8 • Cached
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
