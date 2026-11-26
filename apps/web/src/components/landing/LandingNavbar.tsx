import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Cpu,
  ArrowRight,
  Menu,
  X,
  Sun,
  Moon,
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
      setIsScrolled(window.scrollY > 16);
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
    { label: "Architecture", href: "#architecture" },
    { label: "Security & BYOK", href: "#security" },
    { label: "Comparison", href: "#comparison" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-150 ${
        isScrolled
          ? "bg-white/90 dark:bg-[#0b0d14]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-[rgba(238,240,245,0.08)] py-3"
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-[#eef0f5] text-white dark:text-[#0b0d14] flex items-center justify-center transition-opacity hover:opacity-90">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-base tracking-tight text-slate-900 dark:text-[#eef0f5]">
                NeuralDesk
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-[#7a8296]">
                dag.studio
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-[#a3a9b8] dark:hover:text-[#eef0f5] transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-[#7a8296] dark:hover:text-[#eef0f5] transition-colors"
            >
              <span>API Docs</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-[#7a8296] dark:hover:text-[#eef0f5] dark:hover:bg-[#1a1e28] transition-colors"
              aria-label="Toggle Theme"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {session?.user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-600 dark:text-[#a3a9b8]">
                  {session.user.name || session.user.email}
                </span>
                <button
                  onClick={() => navigate("/studio")}
                  className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#eef0f5] dark:hover:bg-white dark:text-[#0b0d14] text-xs font-medium transition-colors"
                >
                  <span>Launch Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/signin"
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-[#a3a9b8] dark:hover:text-[#eef0f5] transition-colors px-2 py-1"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#eef0f5] dark:hover:bg-white dark:text-[#0b0d14] text-xs font-medium transition-colors"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-600 dark:text-[#a3a9b8] hover:bg-slate-100 dark:hover:bg-[#1a1e28]"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-700 dark:text-[#eef0f5] hover:bg-slate-100 dark:hover:bg-[#1a1e28]"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#0b0d14] border-b border-slate-200 dark:border-[rgba(238,240,245,0.08)] px-4 pt-3 pb-5 mt-2 space-y-3">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-[#a3a9b8] hover:text-slate-900 dark:hover:text-[#eef0f5] rounded-lg hover:bg-slate-100 dark:hover:bg-[#1a1e28]"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-600 dark:text-[#a3a9b8] hover:text-slate-900 dark:hover:text-[#eef0f5] rounded-lg"
            >
              <span>API Documentation</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-[rgba(238,240,245,0.08)] flex flex-col gap-2">
            {session?.user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/studio");
                }}
                className="w-full h-10 flex items-center justify-center gap-2 rounded-lg bg-slate-900 text-white dark:bg-[#eef0f5] dark:text-[#0b0d14] font-medium text-sm"
              >
                <span>Open Studio Canvas</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <Link
                  to="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium text-slate-700 dark:text-[#a3a9b8] hover:text-slate-900 dark:hover:text-[#eef0f5]"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full h-10 flex items-center justify-center gap-2 rounded-lg bg-slate-900 text-white dark:bg-[#eef0f5] dark:text-[#0b0d14] font-medium text-sm"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
