import React from "react";
import { Zap, Shield, GitCommit, CheckCircle } from "lucide-react";

export const LandingMetrics: React.FC = () => {
  const metrics = [
    {
      value: "10M+",
      label: "DAG nodes executed",
      description: "Resolved across mission-critical enterprise production pipelines",
      metricSub: "0 deadlocks",
      icon: GitCommit,
    },
    {
      value: "< 15ms",
      label: "Evaluation latency",
      description: "Ultra-low overhead Kahn topological dependency resolution per node",
      metricSub: "O(V + E) complexity",
      icon: Zap,
    },
    {
      value: "100%",
      label: "Cycle-free guarantee",
      description: "Pre-execution topological sorting prevents infinite token burning loops",
      metricSub: "Kahn invariant",
      icon: CheckCircle,
    },
    {
      value: "256-bit",
      label: "BYOK encryption",
      description: "Client-side AES-256-GCM zero-knowledge envelope security architecture",
      metricSub: "Zero plaintext",
      icon: Shield,
    },
  ];

  return (
    <section className="py-12 border-b border-slate-200/70 dark:border-[rgba(238,240,245,0.06)] bg-[#fafafa] dark:bg-[#07080d]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m) => (
            <div key={m.label} className="p-4 rounded-xl border border-slate-200 dark:border-[rgba(238,240,245,0.08)] bg-white dark:bg-[#11141c]">
              <div className="flex items-center justify-between text-slate-500 dark:text-[#7a8296] mb-2">
                <m.icon className="w-4 h-4" />
                <span className="text-[10px] font-mono text-emerald-600 dark:text-[#4cc38a]">
                  {m.metricSub}
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-medium tracking-tight text-slate-900 dark:text-[#eef0f5] tabular-nums mb-1">
                {m.value}
              </div>
              <div className="text-xs font-medium text-slate-800 dark:text-[#eef0f5] mb-1">
                {m.label}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-[#7a8296] leading-relaxed">
                {m.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
