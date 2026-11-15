import React, { useState } from "react";
import {
  X,
  Mail,
  Lock,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Zap,
  LogIn,
  UserPlus,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { authClient } from "../../lib/authClient";
import { useAuthStore } from "../../store/authStore";
import { cn } from "../../lib/utils";

const DEMO_PERSONAS = [
  {
    role: "owner",
    name: "System Administrator",
    email: "admin@neuraldesk.io",
    description: "Full access to all workflows, execution engine, API keys & audit logs.",
    badge: "SuperAdmin / Owner",
    badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  },
  {
    role: "member",
    name: "Lead AI Engineer",
    email: "engineer@neuraldesk.io",
    description: "Can design, test, and execute workflows; cannot modify workspace settings.",
    badge: "AI Engineer / Member",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  {
    role: "viewer",
    name: "Compliance Auditor",
    email: "auditor@neuraldesk.io",
    description: "Read-only access to DAG topologies and telemetry; cannot trigger runs.",
    badge: "Compliance / Auditor",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
];

export const AuthModal: React.FC = () => {
  const isAuthModalOpen = useAuthStore((state) => state.isAuthModalOpen);
  const setIsAuthModalOpen = useAuthStore((state) => state.setIsAuthModalOpen);
  const activeTab = useAuthStore((state) => state.activeTab);
  const setActiveTab = useAuthStore((state) => state.setActiveTab);
  const customUser = useAuthStore((state) => state.customUser);
  const setCustomUser = useAuthStore((state) => state.setCustomUser);

  const { data: sessionData } = authClient.useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const activeUser = sessionData?.user || customUser;

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
        setErrorMessage(res.error.message || "Invalid email or password");
      } else {
        setSuccessMessage("Signed in successfully!");
        setTimeout(() => {
          setIsAuthModalOpen(false);
          setSuccessMessage(null);
        }, 1200);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to contact authentication service");
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
        setErrorMessage(res.error.message || "Failed to create account");
      } else {
        setSuccessMessage("Account created successfully!");
        setTimeout(() => {
          setIsAuthModalOpen(false);
          setSuccessMessage(null);
        }, 1200);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to contact authentication service");
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
    setSuccessMessage(`Switched session to ${persona.name} (${persona.role.toUpperCase()})`);
    setTimeout(() => {
      setIsAuthModalOpen(false);
      setSuccessMessage(null);
    }, 1000);
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await authClient.signOut();
      setCustomUser(null);
      setSuccessMessage("Signed out successfully.");
      setTimeout(() => {
        setIsAuthModalOpen(false);
        setSuccessMessage(null);
      }, 800);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-charcoal-800 bg-slate-50/50 dark:bg-charcoal-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                NeuralDesk Authentication
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  Better Auth
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-charcoal-400 font-mono">
                Multi-Tenant Session &amp; RBAC Control
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-charcoal-800 text-slate-400 hover:text-slate-600 dark:hover:text-charcoal-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Active Logged-in Banner (if active) */}
        {activeUser && (
          <div className="p-4 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                {activeUser.name ? activeUser.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  {activeUser.name}
                  <span className="text-[10px] font-mono px-1 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    Active
                  </span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-charcoal-400 font-mono">{activeUser.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors border border-rose-200 dark:border-rose-900/50"
            >
              <LogOut className="w-3 h-3" />
              Sign Out
            </button>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-200 dark:border-charcoal-800 bg-slate-50 dark:bg-charcoal-950/40 p-1 gap-1">
          <button
            onClick={() => {
              setActiveTab("signin");
              setErrorMessage(null);
            }}
            className={cn(
              "flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5",
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
              "flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5",
              activeTab === "signup"
                ? "bg-white dark:bg-charcoal-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-600 dark:text-charcoal-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Sign Up
          </button>
          <button
            onClick={() => {
              setActiveTab("demo");
              setErrorMessage(null);
            }}
            className={cn(
              "flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5",
              activeTab === "demo"
                ? "bg-white dark:bg-charcoal-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-600 dark:text-charcoal-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
            1-Click Demo
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2 text-rose-600 dark:text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Alert */}
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
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
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
                className="w-full mt-2 py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                Sign In with Better Auth
              </button>

              <div className="text-center text-[11px] text-slate-500 dark:text-charcoal-400 pt-1">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("signup")}
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  Create one now
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Sign Up */}
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
                    placeholder="alex@enterprise.io"
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
                className="w-full mt-2 py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Create NeuralDesk Account
              </button>

              <div className="text-center text-[11px] text-slate-500 dark:text-charcoal-400 pt-1">
                Already registered?{" "}
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

          {/* Tab 3: 1-Click Demo Personas */}
          {activeTab === "demo" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-charcoal-400 mb-2">
                Select an enterprise persona to instantly test RBAC permissions, audit logs, and workspace capabilities:
              </p>

              {DEMO_PERSONAS.map((persona) => (
                <button
                  key={persona.role}
                  onClick={() => handleSelectDemoPersona(persona)}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-charcoal-800 hover:border-indigo-500 dark:hover:border-indigo-500/60 bg-white dark:bg-charcoal-950 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all flex items-center justify-between group"
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

              <div className="mt-4 p-3 rounded-lg bg-slate-100 dark:bg-charcoal-950/80 border border-slate-200 dark:border-charcoal-800 text-[11px] text-slate-500 dark:text-charcoal-400">
                <span className="font-semibold text-slate-700 dark:text-charcoal-300">💡 Testing Tip:</span> Switching to{" "}
                <span className="font-mono text-amber-600 dark:text-amber-400">Compliance Auditor</span> allows you to
                verify that human-in-the-loop approvals enforce viewer restrictions.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
