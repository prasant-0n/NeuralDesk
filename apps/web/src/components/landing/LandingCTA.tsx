import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, CheckCircle2, Zap } from "lucide-react";
import { authClient } from "../../lib/authClient";

export const LandingCTA: React.FC = () => {
  const handleGoogleSignIn = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: window.location.origin + "/studio",
      });
    } catch {
      window.location.href = "/signin";
    }
  };

  return (
    <section id="cta" className="relative py-20 md:py-28 bg-[#f5f7fa] dark:bg-[#0b0d14] border-t border-slate-200/70 dark:border-[rgba(238,240,245,0.06)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="rounded-2xl p-8 sm:p-12 md:p-16 border border-slate-200 dark:border-[rgba(238,240,245,0.08)] bg-white dark:bg-[#11141c]">
          <div className="max-w-2xl mx-auto">
            <div className="text-xs font-mono text-slate-500 dark:text-[#7a8296] mb-3">
              Get started in under 30 seconds
            </div>

            <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-slate-900 dark:text-[#eef0f5] mb-4">
              Automate multi-agent workflows with mathematical precision
            </h2>

            <p className="text-sm sm:text-base text-slate-600 dark:text-[#a3a9b8] mb-8 leading-relaxed">
              Join engineering teams deploying deterministic pipelines with zero-knowledge encryption,
              formal Kahn cycle validation, and sub-15ms node telemetry.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
              <button
                onClick={handleGoogleSignIn}
                className="w-full sm:w-auto h-11 px-5 rounded-lg bg-white hover:bg-slate-50 dark:bg-[#1a1e28] dark:hover:bg-[#232325] text-slate-800 dark:text-[#eef0f5] text-xs sm:text-sm font-medium border border-slate-300 dark:border-[rgba(238,240,245,0.08)] inline-flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <Link
                to="/signup"
                className="w-full sm:w-auto h-11 px-5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#eef0f5] dark:hover:bg-white dark:text-[#0b0d14] text-xs sm:text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors"
              >
                <span>Sign Up with Email</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-[#7a8296]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-[#4cc38a]" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-[#6366f1]" />
                <span>Zero-knowledge BYOK security</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-[#d97706]" />
                <span>Instant workspace provisioning</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
