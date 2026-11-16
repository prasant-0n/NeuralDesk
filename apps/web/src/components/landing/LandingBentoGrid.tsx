import React, { useState } from "react";
import {
  Layers,
  Lock,
  UserCheck,
  Activity,
  Cpu,
  History,
  Sparkles,
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
    <section id="features" className="relative py-24 md:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Industrial Core Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
            Engineered for Deterministic{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-cyan-600 to-indigo-600 dark:from-indigo-400 dark:via-cyan-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Autonomous Operations
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
            NeuralDesk replaces chaotic agent loops and hallucinated dependencies
            with mathematical graph determinism and zero-knowledge encryption.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Large Span (2 columns) - Kahn Topological Engine */}
          <div className="md:col-span-2 relative group rounded-3xl p-8 border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-charcoal-950/80 hover:border-indigo-500/50 transition-all duration-300 shadow-md dark:shadow-xl overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/20 transition-all" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                  <Layers className="w-6 h-6" />
                </div>

                {/* Interactive Cycle Mode Toggle */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono">
                  <button
                    onClick={() => setCycleMode("acyclic")}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      cycleMode === "acyclic"
                        ? "bg-emerald-600 text-white font-semibold shadow-sm"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Acyclic DAG
                  </button>
                  <button
                    onClick={() => setCycleMode("cyclic")}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      cycleMode === "cyclic"
                        ? "bg-rose-600 text-white font-semibold shadow-sm"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Inject Cycle
                  </button>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
                Kahn Topological DAG Engine
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed mb-6">
                Mathematical zero-deadlock guarantee through in-degree topological sorting.
                Pipelines resolve in deterministic O(V + E) complexity, halting recursive agent loops
                before a single model token is billed.
              </p>
            </div>

            {/* Interactive Visual Simulator Strip inside Bento Card */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4 font-mono text-xs shadow-inner">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 font-semibold">
                  <GitFork className="w-3.5 h-3.5" />
                  <span>KAHN_ANALYZER // RUNTIME_VALIDATOR</span>
                </span>
                {cycleMode === "acyclic" ? (
                  <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>0 CYCLES (TOPOLOGICALLY VALID)</span>
                  </span>
                ) : (
                  <span className="text-rose-600 dark:text-rose-400 text-[11px] font-semibold flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    <span>CYCLE BLOCKED: Node_C -&gt; Node_A</span>
                  </span>
                )}
              </div>

              {cycleMode === "acyclic" ? (
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">In-Degree:</span>{" "}
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">0 [Roots Cleared]</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Order:</span>{" "}
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">L0 -&gt; L1 -&gt; L2</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Resolution:</span>{" "}
                    <span className="text-cyan-600 dark:text-cyan-400 font-bold">14ms O(V+E)</span>
                  </div>
                </div>
              ) : (
                <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-[11px] text-rose-700 dark:text-rose-300">
                  <span>RFC 7807 Exception caught: Dependency loop detected between Node_C and Node_A. Traversal suspended cleanly without infinite execution billing.</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: BYOK Zero-Knowledge Vault */}
          <div className="relative group rounded-3xl p-8 border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-charcoal-950/80 hover:border-purple-500/50 transition-all duration-300 shadow-md dark:shadow-xl overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/20 transition-all" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm">
                  <Lock className="w-6 h-6" />
                </div>
                <button
                  onClick={() => setVaultKeyDerived(!vaultKeyDerived)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-[10px] font-mono text-purple-600 dark:text-purple-400 transition-colors flex items-center gap-1 font-semibold"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>{vaultKeyDerived ? "Re-Derive" : "Derive Key"}</span>
                </button>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Zero-Knowledge BYOK Vault
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Bring Your Own Key (BYOK) with client-side AES-256-GCM envelope encryption.
                Secrets reside only in transient WebCrypto memory enclaves during node evaluation.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3.5 font-mono text-[11px] text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <span className="font-semibold text-purple-700 dark:text-purple-300">
                  {vaultKeyDerived ? "DEK: 0x9f4a... (ENCLAVE ACTIVE)" : "AES_256_GCM_READY"}
                </span>
              </span>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">RAM WIPE: 2ms</span>
            </div>
          </div>

          {/* Card 3: Human-in-the-Loop Gateway */}
          <div className="relative group rounded-3xl p-8 border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-charcoal-950/80 hover:border-amber-500/50 transition-all duration-300 shadow-md dark:shadow-xl overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
                  <UserCheck className="w-6 h-6" />
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => setHitlStatus("approved")}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors ${
                      hitlStatus === "approved" ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setHitlStatus("rejected")}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors ${
                      hitlStatus === "rejected" ? "bg-rose-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Reject
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Human-in-the-Loop Policy Gates
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Safeguard critical operations. Graph traversal pauses automatically when
                high-risk thresholds are crossed, awaiting manager sign-off via Webhook, Slack, or UI.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3.5 font-mono text-[11px] text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                STATUS: {hitlStatus.toUpperCase()}
              </span>
              <span className="text-slate-600 dark:text-slate-400 font-medium">TIMEOUT: 24h</span>
            </div>
          </div>

          {/* Card 4: Large Span (2 columns) - Real-Time Streaming Telemetry */}
          <div className="md:col-span-2 relative group rounded-3xl p-8 border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-charcoal-950/80 hover:border-cyan-500/50 transition-all duration-300 shadow-md dark:shadow-xl overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />

            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 flex items-center justify-center mb-6 text-cyan-600 dark:text-cyan-400 shadow-sm">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
                Live SSE Telemetry & Audit Observability
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed mb-6">
                Stream token counts, intermediate reasoning states, node execution latencies,
                and execution costs in real-time using native Server-Sent Events (SSE).
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4 font-mono text-xs text-slate-700 dark:text-slate-300 flex flex-col gap-2 shadow-inner">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 font-semibold">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>STREAMING /api/v1/executions/sse</span>
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">200 OK • CHUNKED_TRANSFER</span>
              </div>
              <div className="text-slate-600 dark:text-slate-400 text-[11px] truncate">
                event: node_progress | data: &#123; "node": "gemini_agent", "tokens": 482, "elapsedMs": 142, "status": "COMPLETED" &#125;
              </div>
            </div>
          </div>

          {/* Card 5: Multi-Model Hub */}
          <div className="relative group rounded-3xl p-8 border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-charcoal-950/80 hover:border-emerald-500/50 transition-all duration-300 shadow-md dark:shadow-xl overflow-hidden flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400 shadow-sm">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Multi-Model Orchestrator
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Route tasks per-node based on latency and cost: Gemini 2.0 Flash for sub-200ms reasoning, Claude 3.5 Sonnet for code logic, and local Ollama for zero-cost offline runs.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
              <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold">Gemini 2.0 • 140ms</span>
              <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold">Claude 3.5 • 310ms</span>
              <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold">GPT-4o</span>
              <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold">Ollama Local</span>
            </div>
          </div>

          {/* Card 6: Immutable Replay */}
          <div className="relative group rounded-3xl p-8 border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-charcoal-950/80 hover:border-rose-500/50 transition-all duration-300 shadow-md dark:shadow-xl overflow-hidden flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center mb-6 text-rose-600 dark:text-rose-400 shadow-sm">
                <History className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                1-Click Execution Replay
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Every node's inputs and outputs are captured as immutable Lakebase checkpoints. Replay failing subgraphs without re-running upstream root steps.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2.5 font-mono text-[11px] text-slate-600 dark:text-slate-400">
              STATE_CHECKPOINT: 0x99a4c8 • CACHED
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
