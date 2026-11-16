import React from "react";
import { Zap, Shield, GitCommit, CheckCircle, Radio } from "lucide-react";

export const LandingMetrics: React.FC = () => {
  const metrics = [
    {
      value: "10M+",
      label: "DAG Nodes Executed",
      description: "Resolved across mission-critical enterprise production pipelines",
      metricSub: "0 Deadlocks Encountered",
      icon: GitCommit,
      color: "text-indigo-600 dark:text-indigo-400",
      bgGlow: "group-hover:bg-indigo-500/10",
    },
    {
      value: "< 15ms",
      label: "Evaluation Latency",
      description: "Ultra-low overhead Kahn topological dependency resolution per node",
      metricSub: "O(V + E) Complexity",
      icon: Zap,
      color: "text-cyan-600 dark:text-cyan-400",
      bgGlow: "group-hover:bg-cyan-500/10",
    },
    {
      value: "100%",
      label: "Cycle-Free Guarantee",
      description: "Pre-execution topological sorting prevents infinite token burning loops",
      metricSub: "RFC 7807 Exception Model",
      icon: CheckCircle,
      color: "text-emerald-600 dark:text-emerald-400",
      bgGlow: "group-hover:bg-emerald-500/10",
    },
    {
      value: "256-bit",
      label: "BYOK Encryption",
      description: "Client-side AES-256-GCM zero-knowledge envelope security architecture",
      metricSub: "Zero Plaintext in Lakebase",
      icon: Shield,
      color: "text-purple-600 dark:text-purple-400",
      bgGlow: "group-hover:bg-purple-500/10",
    },
  ];

  return (
    <section className="relative py-16 border-y border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-charcoal-950/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Live Runtime Status Strip */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-slate-200/80 dark:border-slate-800/60 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-900 dark:text-slate-200">PRODUCTION ENGINE POOL</span>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <span>14 Active Edge Workers</span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-slate-500">
            <span>TOPOLOGY: STRICT_DAG</span>
            <span>ENCLAVE: AES_256_GCM</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">99.99% UPTIME</span>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                className="flex flex-col space-y-2.5 p-4 rounded-2xl transition-all duration-300 hover:bg-white dark:hover:bg-slate-900/40 hover:shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-800 group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 transition-colors ${m.bgGlow}`}>
                    <Icon className={`w-4 h-4 ${m.color} group-hover:scale-110 transition-transform`} />
                  </div>
                  <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
                    {m.value}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-sans">
                  {m.label}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  {m.description}
                </p>
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                  {m.metricSub}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
