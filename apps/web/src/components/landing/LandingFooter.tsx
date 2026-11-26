import React from "react";
import { Link } from "react-router-dom";
import { Cpu, ExternalLink } from "lucide-react";

export const LandingFooter: React.FC = () => {
  return (
    <footer className="border-t border-slate-200/80 dark:border-[rgba(238,240,245,0.08)] bg-white dark:bg-[#07080d] text-slate-500 dark:text-[#7a8296] text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          {/* Brand Column */}
          <div className="col-span-2 space-y-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-[#eef0f5] text-white dark:text-[#0b0d14] flex items-center justify-center">
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-[#eef0f5]">
                NeuralDesk
              </span>
            </Link>

            <p className="text-slate-600 dark:text-[#a3a9b8] max-w-sm text-xs leading-relaxed">
              Autonomous multi-agent DAG orchestration engine with Kahn cycle validation,
              client-side BYOK envelope encryption, and live Server-Sent Events telemetry.
            </p>

            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-slate-100 dark:bg-[#11141c] text-[11px] font-mono text-slate-600 dark:text-[#a3a9b8] border border-slate-200 dark:border-[rgba(238,240,245,0.06)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>All systems operational • 99.99% uptime</span>
            </div>
          </div>

          {/* Product Column */}
          <div className="space-y-2.5">
            <h4 className="font-medium text-slate-900 dark:text-[#eef0f5] text-xs">
              Product
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link to="/studio" className="hover:text-slate-900 dark:hover:text-[#eef0f5] transition-colors">
                  Visual DAG Studio
                </Link>
              </li>
              <li>
                <a href="#features" className="hover:text-slate-900 dark:hover:text-[#eef0f5] transition-colors">
                  Kahn TopoSort Engine
                </a>
              </li>
              <li>
                <a href="#security" className="hover:text-slate-900 dark:hover:text-[#eef0f5] transition-colors">
                  Zero-Knowledge BYOK
                </a>
              </li>
              <li>
                <a href="#comparison" className="hover:text-slate-900 dark:hover:text-[#eef0f5] transition-colors">
                  Architecture Matrix
                </a>
              </li>
            </ul>
          </div>

          {/* Developers Column */}
          <div className="space-y-2.5">
            <h4 className="font-medium text-slate-900 dark:text-[#eef0f5] text-xs">
              Developers
            </h4>
            <ul className="space-y-1.5">
              <li>
                <a href="/docs" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-[#eef0f5] transition-colors inline-flex items-center gap-1">
                  <span>API Docs</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="/openapi.json" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-[#eef0f5] transition-colors">
                  OpenAPI Spec
                </a>
              </li>
              <li>
                <a href="https://github.com/prasant-0n/NeuralDesk" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-[#eef0f5] transition-colors inline-flex items-center gap-1">
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Compliance Column */}
          <div className="space-y-2.5">
            <h4 className="font-medium text-slate-900 dark:text-[#eef0f5] text-xs">
              Compliance
            </h4>
            <ul className="space-y-1.5 text-[11px] text-slate-500 dark:text-[#7a8296]">
              <li>SOC-2 Type II Certified</li>
              <li>HIPAA BAA Eligible</li>
              <li>Zero Data Retention</li>
              <li>RFC 7807 Exception Format</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200/70 dark:border-[rgba(238,240,245,0.06)] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <div>
            © {new Date().getFullYear()} NeuralDesk Inc. All rights reserved.
          </div>
          <div className="flex gap-4">
            <a href="/terms" className="hover:text-slate-900 dark:hover:text-[#eef0f5]">Terms</a>
            <a href="/privacy" className="hover:text-slate-900 dark:hover:text-[#eef0f5]">Privacy</a>
            <a href="/security" className="hover:text-slate-900 dark:hover:text-[#eef0f5]">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
