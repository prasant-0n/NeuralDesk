import React, { useState } from "react";
import {
  Zap,
  Mail,
  Lock,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  LogIn,
  UserPlus,
  ChevronRight,
  Sun,
  Moon,
  Workflow,
  Server,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { authClient } from "../../lib/authClient";
import { useAuthStore } from "../../store/authStore";
import { useSettingsStore } from "../../store/settingsStore";
import { cn } from "../../lib/utils";

const DEMO_PERSONAS = [
  {
    role: "owner",
    name: "System Administrator",
    email: "admin@neuraldesk.io",
    description: "Full access to DAG canvas, execution engine, BYOK settings & audit telemetry.",
    badge: "SuperAdmin / Owner",
    badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  },
  {
    role: "member",
    name: "Lead AI Engineer",
    email: "engineer@neuraldesk.io",
    description: "Build, configure, and execute AI workflows; restricted from workspace deletion.",
    badge: "AI Engineer / Member",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  {
    role: "viewer",
    name: "Compliance Auditor",
    email: "auditor@neuraldesk.io",
    description: "Read-only access to DAG topologies, trace inspection & logs; execution locked.",
    badge: "Compliance / Auditor",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
];

export const LoginView: React.FC = () => {
  const activeTab = useAuthStore((state) => state.activeTab);
  const setActiveTab = useAuthStore((state) => state.setActiveTab);
  const setCustomUser = useAuthStore((state) => state.setCustomUser);

  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (res.error) {
        setErrorMessage(res.error.message || "Invalid credentials. Please verify your email and password.");
      } else {
        setSuccessMessage("Authenticated successfully! Loading workspace...");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to contact authentication gateway");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await authClient.signUp.email({
        email: email.trim(),
        password,
        name: name.trim(),
      });

      if (res.error) {
        setErrorMessage(res.error.message || "Failed to create account. User may already exist.");
      } else {
        setSuccessMessage("Account created successfully! Redirecting...");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to contact authentication gateway");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemoPersona = (persona: (typeof DEMO_PERSONAS)[0]) => {
    setCustomUser({
      id: `usr_${persona.role}_demo`,
      name: persona.name,
      email: persona.email,
      role: persona.role,
    });
  };

  return (
    <div className="min-h-screen w-screen flex flex-col justify-between bg-slate-50 dark:bg-charcoal-950 text-slate-900 dark:text-charcoal-100 antialiased select-none transition-colors duration-150 relative overflow-hidden">
      {/* Background Decorative Mesh Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header */}
      <header className="h-16 px-6 flex items-center justify-between border-b border-slate-200/80 dark:border-charcoal-800/80 bg-white/70 dark:bg-charcoal-900/70 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">NeuralDesk</span>
              <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 dark:border-indigo-500/30">
                ENTERPRISE
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-charcoal-400 font-mono">
              AI Workflow Intelligence Platform
            </p>
          </div>
        </div>

        {/* Right Header Options */}
        <div className="flex items-center gap-3">
          <a
            href="/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono font-medium text-slate-600 dark:text-charcoal-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            API Reference
          </a>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-charcoal-800 text-slate-500 dark:text-charcoal-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>
      </header>

      {/* Main Authentication Center Box */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-2xl transition-all">
          {/* Card Title Banner */}
          <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-charcoal-800 text-center space-y-1 bg-slate-50/40 dark:bg-charcoal-950/40">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Sign in to NeuralDesk
            </h1>
            <p className="text-xs text-slate-500 dark:text-charcoal-400">
              Authentication required to access workspace DAG canvas &amp; telemetry
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-slate-200 dark:border-charcoal-800 bg-slate-50 dark:bg-charcoal-950/60 p-1.5 gap-1">
            <button
              onClick={() => {
                setActiveTab("signin");
                setErrorMessage(null);
              }}
              className={cn(
                "flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                activeTab === "signin"
                  ? "bg-white dark:bg-charcoal-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-charcoal-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab("signup");
                setErrorMessage(null);
              }}
              className={cn(
                "flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                activeTab === "signup"
                  ? "bg-white dark:bg-charcoal-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-charcoal-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Create Account
            </button>
            <button
              onClick={() => {
                setActiveTab("demo");
                setErrorMessage(null);
              }}
              className={cn(
                "flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                activeTab === "demo"
                  ? "bg-white dark:bg-charcoal-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-charcoal-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              1-Click Demo
            </button>
          </div>

          {/* Form Body */}
          <div className="p-6">
            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2 text-rose-600 dark:text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-2 text-emerald-600 dark:text-emerald-400 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Tab 1: Sign In */}
            {activeTab === "signin" && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-charcoal-300 mb-1">
                    Work Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@enterprise.com"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-charcoal-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                  Sign In to Studio
                </button>

                <div className="text-center text-[11px] text-slate-500 dark:text-charcoal-400 pt-1">
                  Evaluating NeuralDesk?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("demo")}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                  >
                    Use 1-Click Demo Login
                  </button>
                </div>
              </form>
            )}

            {/* Tab 2: Create Account */}
            {activeTab === "signup" && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-charcoal-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Morgan"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-charcoal-300 mb-1">
                    Work Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@enterprise.com"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-charcoal-300 mb-1">
                    Password (min. 6 characters)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  Register &amp; Launch Studio
                </button>

                <div className="text-center text-[11px] text-slate-500 dark:text-charcoal-400 pt-1">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("signin")}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                  >
                    Sign in
                  </button>
                </div>
              </form>
            )}

            {/* Tab 3: 1-Click Demo Evaluation */}
            {activeTab === "demo" && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-charcoal-400 mb-2">
                  Select an enterprise persona to immediately enter the workspace with predefined RBAC rights:
                </p>

                {DEMO_PERSONAS.map((persona) => (
                  <button
                    key={persona.role}
                    onClick={() => handleSelectDemoPersona(persona)}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-charcoal-800 hover:border-indigo-500 dark:hover:border-indigo-500/60 bg-white dark:bg-charcoal-950 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-all flex items-center justify-between group cursor-pointer shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {persona.name}
                        </span>
                        <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded border", persona.badgeColor)}>
                          {persona.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-charcoal-400 leading-snug">
                        {persona.description}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}

                <div className="mt-4 p-3 rounded-lg bg-indigo-50/50 dark:bg-charcoal-950/80 border border-indigo-100 dark:border-charcoal-800 text-[11px] text-slate-600 dark:text-charcoal-400 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Instant Access:</strong> Choose <em>System Administrator</em> for full workspace privileges or <em>Compliance Auditor</em> to test read-only constraints.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Footer Feature Bar */}
      <footer className="h-14 px-6 border-t border-slate-200/80 dark:border-charcoal-800/80 bg-white/70 dark:bg-charcoal-900/70 backdrop-blur-md flex items-center justify-between text-xs text-slate-500 dark:text-charcoal-400 z-10">
        <div className="hidden sm:flex items-center gap-6 font-mono text-[11px]">
          <span className="flex items-center gap-1.5">
            <Workflow className="w-3.5 h-3.5 text-indigo-500" />
            Visual DAG Engine (Kahn's Sort)
          </span>
          <span className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-emerald-500" />
            Hono Real-Time SSE Streams
          </span>
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-sky-500" />
            PostgreSQL 16 Multi-Tenant
          </span>
        </div>
        <p className="text-[11px] font-mono">
          © 2026 NeuralDesk • Better Auth Protected
        </p>
      </footer>
    </div>
  );
};
