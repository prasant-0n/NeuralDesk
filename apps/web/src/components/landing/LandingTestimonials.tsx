import React from "react";
import { Star, CheckCircle2, Quote } from "lucide-react";

export const LandingTestimonials: React.FC = () => {
  const testimonials = [
    {
      name: "Marcus Vance",
      role: "VP of Artificial Intelligence",
      company: "ApexFin Technologies",
      avatar: "MV",
      content:
        "Before NeuralDesk, our autonomous underwriting agents would occasionally trigger cyclic loops that burned through $12,000 in OpenAI tokens in hours. Kahn topological DAG enforcement saved us tens of thousands in compute overnight.",
      metric: "99.98% Pipeline Determinism",
    },
    {
      name: "Dr. Elena Rostova",
      role: "Chief Information Security Officer",
      company: "BioHealth Diagnostics",
      avatar: "ER",
      content:
        "The Zero-Knowledge BYOK architecture was the only way our compliance board would approve multi-agent workflows handling HIPAA-adjacent clinical data. Dual AES-256-GCM envelope encryption is the gold standard.",
      metric: "SOC-2 & HIPAA Ready",
    },
    {
      name: "Devon Chen",
      role: "Principal Infrastructure Architect",
      company: "Kinesis Robotics",
      avatar: "DC",
      content:
        "The native SSE telemetry is shockingly fast. Our operations team watches real-time agent reasoning steps with sub-15ms node latency. It feels like watching an enterprise OS compile code in real time.",
      metric: "12ms Real-Time Telemetry",
    },
  ];

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <Star className="w-3.5 h-3.5 fill-indigo-400" />
            <span>Enterprise Customer Voices</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Trusted by Teams Deploying Autonomous AI to Production
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            From regulated FinTech to high-throughput autonomous systems, see how lead architects depend on NeuralDesk.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="relative rounded-3xl p-8 border border-slate-800/80 bg-slate-950/80 dark:bg-charcoal-950/80 shadow-xl flex flex-col justify-between hover:border-indigo-500/40 transition-all duration-300"
            >
              <div>
                <Quote className="w-8 h-8 text-indigo-500/30 mb-4" />
                <p className="text-sm text-slate-300 leading-relaxed mb-6 font-normal">
                  "{t.content}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-bold flex items-center justify-center text-xs font-mono shadow-md">
                      {t.avatar}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        {t.name}
                      </h4>
                      <p className="text-xs text-slate-400">{t.role}</p>
                      <p className="text-[11px] font-mono text-indigo-400">
                        {t.company}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-mono">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{t.metric}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};