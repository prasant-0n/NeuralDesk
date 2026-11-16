import React from "react";
import { Zap, Shield, GitCommit, CheckCircle } from "lucide-react";

export const LandingMetrics: React.FC = () => {
  const metrics = [
    {
      value: "10M+",
      label: "DAG Nodes Executed",
      description: "Topological executions resolved across production pipelines",
      icon: GitCommit,
      color: "text-indigo-600 dark:text-indigo-400",
    },
    {
      value: "< 15ms",
      label: "Evaluation Latency",
      description: "Ultra-low overhead Kahn dependency resolution per node",
      icon: Zap,
      color: "text-cyan-600 dark:text-cyan-400",
    },
    {
      value: "100%",
      label: "Cycle-Free Guarantee",
      description: "Mathematical zero-deadlock guarantee with RFC 7807 logging",
      icon: CheckCircle,
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      value: "256-bit",
      label: "BYOK Encryption",
      description: "Client-side AES-256-GCM zero-knowledge enterprise security",
      icon: Shield,
      color: "text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <section className="relative py-16 border-y border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-charcoal-950/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="flex flex-col space-y-2 group">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-5 h-5 ${m.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
                    {m.value}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {m.label}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {m.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};