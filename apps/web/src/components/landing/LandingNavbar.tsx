import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Cpu,
  ArrowRight,
  Menu,
  X,
  Sun,
  Moon,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { useSession } from "../../lib/authClient";
import { useSettingsStore } from "../../store/settingsStore";

export const LandingNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const { theme, setTheme } = useSettingsStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Interactive Demo", href: "#playground" },
    { label: "Architecture", href: "#architecture" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-slate-950/80 dark:bg-charcoal-950/85 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl shadow-indigo-950/20 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/25 transition-transform duration-300 group-hover:scale-105">
              <div className="w-full h-full bg-slate-950 dark:bg-charcoal-950 rounded-[11px] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-indigo-400 group-hover:text-cyan-300 transition-colors" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-xl blur-sm opacity-30 group-hover:opacity-75 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-white font-sans">
                  NeuralDesk
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-semibold">
                  v2.0
                </span>
              </div>
              <span className="text-[10px] tracking-wider uppercase text-slate-400 font-mono">
                Autonomous DAG Engine
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 dark:bg-charcoal-900/60 border border-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-full">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-full hover:bg-slate-800/70 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-indigo-300 rounded-full hover:bg-slate-800/70 transition-colors"
            >
              API Docs
              <ExternalLink className="w-3 h-3" />
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800/60 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400" />
              )}
            </button>

            {session?.user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-slate-200">
                    {session.user.name || session.user.email}
                  </span>
                </div>
                <button
                  onClick={() => navigate("/studio")}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:shadow-indigo-600/50 hover:scale-[1.02]"
                >
                  <span>Launch Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/signin"
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="relative group overflow-hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all hover:shadow-indigo-600/40 hover:scale-[1.02]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                  <span>Start Free</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400" />
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 dark:bg-charcoal-950/95 border-b border-slate-800/80 px-4 pt-4 pb-6 mt-3 space-y-3 backdrop-blur-2xl">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/70"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 rounded-lg hover:bg-slate-800/70"
            >
              <span>API Documentation</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {session?.user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/studio");
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm shadow-lg shadow-indigo-600/30"
              >
                <span>Open Studio Canvas</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <Link
                  to="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium text-slate-300 hover:text-white rounded-xl border border-slate-800"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-medium text-sm shadow-lg shadow-indigo-600/30"
                >
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>Get Started Free</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};