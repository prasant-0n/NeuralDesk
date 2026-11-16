import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  LogIn,
} from "lucide-react";
import { AuthLayout } from "../components/auth/AuthLayout";
import { DemoPersonaPicker } from "../components/auth/DemoPersonaPicker";
import { authClient } from "../lib/authClient";
import { useAuthStore } from "../store/authStore";

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const { data: sessionData } = authClient.useSession();
  const customUser = useAuthStore((state) => state.customUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  // If already logged in, redirect automatically
  useEffect(() => {
    if (sessionData?.user || customUser) {
      navigate(redirectUrl, { replace: true });
    }
  }, [sessionData, customUser, navigate, redirectUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (res.error) {
        setErrorMessage(
          res.error.message ||
            "Invalid email or password. Please check your credentials."
        );
      } else {
        setSuccessMessage("Authentication successful! Redirecting to workspace...");
        setTimeout(() => {
          navigate(redirectUrl, { replace: true });
        }, 600);
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || "Unable to reach authentication gateway. Please retry."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await authClient.signIn.social({
        provider: "google",
        callbackURL: window.location.origin + redirectUrl,
      });

      if (res?.error) {
        if (
          res.error.message?.includes("Provider not found") ||
          (res.error as any)?.code === "PROVIDER_NOT_FOUND" ||
          res.error.message?.toLowerCase().includes("not found")
        ) {
          setErrorMessage(
            "Google OAuth configuration: Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the Render backend environment variables to enable Google Workspace login."
          );
        } else {
          setErrorMessage(
            res.error.message || "Failed to initiate Google OAuth login."
          );
        }
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || "Failed to initiate Google OAuth login."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to access your agent graphs and studio"
    >
      {/* Alert Banners */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">{successMessage}</div>
        </div>
      )}

      {/* Primary Google OAuth Button */}
      <div>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 hover:bg-slate-50 dark:hover:bg-charcoal-700 text-slate-700 dark:text-charcoal-200 text-xs font-semibold shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50"
          title="Sign in with Google Workspace"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Continue with Google</span>
        </button>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-charcoal-800" />
        </div>
        <span className="relative px-3 bg-white dark:bg-charcoal-900 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-charcoal-500">
          Or continue with work email
        </span>
      </div>

      {/* Main Email / Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-charcoal-300">
            Work Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 dark:text-charcoal-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@enterprise.com"
              required
              autoFocus
              autoComplete="email"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50/50 dark:bg-charcoal-950/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-charcoal-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700 dark:text-charcoal-300">
              Password
            </label>
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(true)}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 dark:text-charcoal-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              autoComplete="current-password"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50/50 dark:bg-charcoal-950/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-charcoal-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-charcoal-300"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-300 dark:border-charcoal-700 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs text-slate-600 dark:text-charcoal-400">
              Remember this device for 30 days
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying credentials...</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Sign In to Workspace</span>
            </>
          )}
        </button>
      </form>

      {/* Switch to Sign Up */}
      <div className="text-center text-xs text-slate-600 dark:text-charcoal-400 pt-1">
        Don&apos;t have an account?{" "}
        <Link
          to="/signup"
          className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Create account
        </Link>
      </div>

      {/* 1-Click Instant Evaluation Personas */}
      <DemoPersonaPicker onSuccessRedirect={redirectUrl} />

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Reset your password
            </h3>
            <p className="text-xs text-slate-500 dark:text-charcoal-400">
              Enter your registered work email and we&apos;ll send you a secure password reset link.
            </p>

            {forgotSent ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs">
                A password reset link has been dispatched to <b>{forgotEmail}</b>. Please check your inbox.
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (forgotEmail.trim()) {
                      setForgotSent(true);
                    }
                  }}
                  className="w-full py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-500 transition-colors"
                >
                  Send Reset Link
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setIsForgotModalOpen(false);
                setForgotSent(false);
              }}
              className="w-full py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-charcoal-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};
