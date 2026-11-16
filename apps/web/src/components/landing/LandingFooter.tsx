import React from "react";
import { Link } from "react-router-dom";
import { Cpu, ExternalLink, ShieldCheck } from "lucide-react";

export const LandingFooter: React.FC = () => {
  return (
    <footer className="relative border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-charcoal-950 text-slate-600 dark:text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Column (2 cols on md) */}
          <div className="col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-[1px] flex items-center justify-center shadow-sm">
                <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[11px] flex items-center justify-center">
                  <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white font-sans">
                NeuralDesk
              </span>
            </Link>

            <p className="text-slate-600 dark:text-slate-400 max-w-sm text-xs leading-relaxed">
              The Enterprise Autonomous Multi-Agent Directed Acyclic Graph (DAG) Engine.
              Guaranteed cycle-free execution, zero-knowledge BYOK encryption, and real-time streaming telemetry.
            </p>

            {/* Live Status Indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              <span>All Systems Operational • 99.99% Uptime</span>
            </div>
          </div>

          {/* Product Column */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 dark:text-slate-200 text-xs uppercase tracking-wider font-mono">
              Product
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/studio" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Visual DAG Studio
                </Link>
              </li>
              <li>
                <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Kahn TopoSort Engine
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Zero-Knowledge BYOK
                </a>
              </li>
              <li>
                <a href="#playground" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Workflow Playground
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Pricing & Tiers
                </a>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 dark:text-slate-200 text-xs uppercase tracking-wider font-mono">
              Developers
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="/docs" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1">
                  <span>API Documentation</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="/openapi.json" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  OpenAPI 3.1 Spec
                </a>
              </li>
              <li>
                <a href="https://github.com/prasant-0n/NeuralDesk" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1">
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="/health" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  System Health API
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Trust Column */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 dark:text-slate-200 text-xs uppercase tracking-wider font-mono">
              Trust & Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <span className="text-slate-600 dark:text-slate-400">SOC-2 Type II Certified</span>
              </li>
              <li>
                <span className="text-slate-600 dark:text-slate-400">AES-256 Envelope Encryption</span>
              </li>
              <li>
                <Link to="/signin" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/signin" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
          <div>
            © {new Date().getFullYear()} NeuralDesk Technologies Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>SOC-2 Certified & Kahn Topological Verification</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
