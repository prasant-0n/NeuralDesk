import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Check, ArrowRight, Zap, Building2, Sparkles } from "lucide-react";

export const LandingPricing: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const tiers = [
    {
      name: "Developer",
      tagline: "For individual builders, AI researchers, and hobbyists.",
      price: "$0",
      cadence: "Free forever",
      popular: false,
      cta: "Start Free Now",
      ctaLink: "/signup",
      icon: Zap,
      features: [
        "1,000 DAG node executions / month",
        "Unlimited BYOK API Keys (Gemini, Claude, GPT, Ollama)",
        "3 Concurrent Active Workflows",
        "Full Visual Canvas & DAG Inspector",
        "Kahn Cycle-Free Topological Sorting",
        "Community Discord Support",
      ],
    },
    {
      name: "Pro Team",
      tagline: "For fast-moving AI teams running production pipelines.",
      price: isAnnual ? "$39" : "$49",
      cadence: "per seat / month, billed " + (isAnnual ? "annually" : "monthly"),
      popular: true,
      cta: "Upgrade to Pro",
      ctaLink: "/signup?plan=pro",
      icon: Sparkles,
      features: [
        "Unlimited DAG node executions (BYOK)",
        "50 Concurrent Active Workflows",
        "Human-in-the-Loop Policy Gateways & Webhooks",
        "Real-Time Server-Sent Events (SSE) Telemetry",
        "30-Day Historical State Replay & Rollbacks",
        "Slack & PagerDuty Integration Alerts",
        "Priority Email & Architecture Support",
      ],
    },
    {
      name: "Enterprise",
      tagline: "For regulated industries requiring compliance & dedicated VPCs.",
      price: "Custom",
      cadence: "Tailored for your scale",
      popular: false,
      cta: "Contact Enterprise Sales",
      ctaLink: "mailto:sales@neuraldesk.ai?subject=Enterprise%20Inquiry",
      icon: Building2,
      features: [
        "Dedicated VPC / On-Prem Kubernetes Deployment",
        "Zero-Retention Enclave Encryption (BYOK)",
        "SAML SSO & Role-Based Access Control (RBAC)",
        "99.99% Financial-Grade Uptime SLA",
        "Custom Model Integrations & Local Enclaves",
        "Dedicated Solutions Architect & 24/7 Phone Support",
        "SOC-2 Type II & HIPAA Compliance Documentation",
      ],
    },
  ];

  return (
    <section id="pricing" className="relative py-24 md:py-32 bg-slate-950/60 dark:bg-charcoal-950/80 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>Transparent Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Simple, Deterministic Pricing
          </h2>
          <p className="text-base sm:text-lg text-slate-400 mb-8">
            Start building for free. Scale seamlessly with BYOK without surprise token markups.
          </p>

          {/* Billing Cadence Toggle */}
          <div className="inline-flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-xl transition-all ${
                !isAnnual
                  ? "bg-slate-800 text-white font-semibold shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                isAnnual
                  ? "bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 text-[10px] font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.name}
                className={`relative rounded-3xl p-8 border flex flex-col justify-between transition-all duration-300 ${
                  tier.popular
                    ? "border-indigo-500 bg-slate-900/90 shadow-2xl shadow-indigo-950/60 scale-[1.02] z-10"
                    : "border-slate-800/80 bg-slate-950/80 hover:border-slate-700"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 font-bold text-[11px] uppercase tracking-wider shadow-md">
                    Most Popular
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono text-slate-500 uppercase">
                      TIER: {tier.name}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                  <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                    {tier.tagline}
                  </p>

                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl sm:text-5xl font-extrabold text-white font-sans tracking-tight">
                      {tier.price}
                    </span>
                    {tier.price !== "Custom" && (
                      <span className="text-xs text-slate-400 font-mono">
                        / month
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mb-8">
                    {tier.cadence}
                  </p>

                  <div className="space-y-3 mb-8 border-t border-slate-800/80 pt-6">
                    {tier.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  to={tier.ctaLink}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-xs transition-all ${
                    tier.popular
                      ? "bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.01]"
                      : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                  }`}
                >
                  <span>{tier.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};