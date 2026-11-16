import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  Check,
  X,
} from "lucide-react";
import { AuthLayout } from "../components/auth/AuthLayout";
import { DemoPersonaPicker } from "../components/auth/DemoPersonaPicker";
import { authClient } from "../lib/authClient";
import { useAuthStore } from "../store/authStore";

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const { data: sessionData } = authClient.useSession();
  const customUser = useAuthStore((state) => state.customUser);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // If already logged in, redirect automatically
  useEffect(() => {
    if (sessionData?.user || customUser) {
      navigate(redirectUrl, { replace: true });
    }
  }, [sessionData, customUser, navigate, redirectUrl]);

  // Password strength calculation
  const hasMinLength = password.length >= 8;
  const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
    password
  );
  const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password);

  let strengthScore = 0;
  if (password.length > 0) strengthScore += 1;
  if (hasMinLength) strengthScore += 1;
  if (hasNumberOrSymbol) strengthScore += 1;
  if (hasMixedCase) strengthScore += 1;

  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    "bg-rose-500",
    "bg-amber-500",
    "bg-sky-500",
    "bg-emerald-500",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      setErrorMessage("Please enter a valid work email.");
      return;
    }
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    if (!agreeTerms) {
      setErrorMessage("Please accept the Terms of Service to continue.");
      return;
    }

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
        setErrorMessage(
          res.error.message ||
            "Failed to create account. User might already exist."
        );
      } else {
        setSuccessMessage("Account created successfully! Loading workspace...");
        setTimeout(() => {
          navigate(redirectUrl, { replace: true });
        }, 600);
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || "Failed to contact authentication gateway."
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
          res.error.message?.toLowerCase().includes("not found")
        ) {
          setErrorMessage(
            "Google OAuth is not yet configured on this environment (GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET are not set in the server environment). Please use Work Email registration or a 1-Click Instant Evaluation persona below."
          );
        } else {
          setErrorMessage(
            res.error.message ||
              "Google Workspace OAuth is not configured with client credentials. Provide GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET or use registration below."
          );
        }
      }
    } catch (err: any) {
      setErrorMessage(
        "Google OAuth integration requires active OAuth credentials or Neon Managed Auth enabled. Use standard registration or 1-Click Evaluation below."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join enterprise teams building and orchestrating resilient agent graphs"
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
          title="Sign up with Google Workspace"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Sign up with Google</span>
        </button>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-charcoal-800" />
        </div>
        <span className="relative px-3 bg-white dark:bg-charcoal-900 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-charcoal-500">
          Or register with work email
        </span>
      </div>

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Full Name */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700 dark:text-charcoal-300">
            Full Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 dark:text-charcoal-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sarah Connor"
              required
              autoFocus
              autoComplete="name"
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50/50 dark:bg-charcoal-950/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-charcoal-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Work Email */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700 dark:text-charcoal-300">
            Work Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 dark:text-charcoal-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sarah@acme-ai.com"
              required
              autoComplete="email"
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50/50 dark:bg-charcoal-950/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-charcoal-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700 dark:text-charcoal-300">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 dark:text-charcoal-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              autoComplete="new-password"
              className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50/50 dark:bg-charcoal-950/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-charcoal-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-charcoal-300"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Real-time Password Strength Meter */}
          {password.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-500 dark:text-charcoal-400">
                  Password Strength:
                </span>
                <span
                  className={`font-semibold ${
                    strengthScore <= 1
                      ? "text-rose-500"
                      : strengthScore === 2
                      ? "text-amber-500"
                      : strengthScore === 3
                      ? "text-sky-500"
                      : "text-emerald-500"
                  }`}
                >
                  {strengthLabels[strengthScore - 1] || "Weak"}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1 h-1.5">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`rounded-full transition-all duration-300 ${
                      idx < strengthScore
                        ? strengthColors[strengthScore - 1]
                        : "bg-slate-200 dark:bg-charcoal-800"
                    }`}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 dark:text-charcoal-400 pt-0.5">
                <span className="flex items-center gap-1">
                  {hasMinLength ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <X className="w-3 h-3 text-slate-400" />
                  )}
                  8+ characters
                </span>
                <span className="flex items-center gap-1">
                  {hasMixedCase ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <X className="w-3 h-3 text-slate-400" />
                  )}
                  Upper &amp; lowercase
                </span>
                <span className="flex items-center gap-1">
                  {hasNumberOrSymbol ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <X className="w-3 h-3 text-slate-400" />
                  )}
                  Number or symbol
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700 dark:text-charcoal-300">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 dark:text-charcoal-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              autoComplete="new-password"
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50/50 dark:bg-charcoal-950/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-charcoal-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          {confirmPassword && confirmPassword !== password && (
            <p className="text-[10px] text-rose-500 font-medium">
              Passwords do not match
            </p>
          )}
        </div>

        {/* Terms of Service Checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              required
              className="w-3.5 h-3.5 mt-0.5 rounded border-slate-300 dark:border-charcoal-700 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-[11px] text-slate-600 dark:text-charcoal-400 leading-tight">
              I agree to the{" "}
              <a href="#terms" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                Privacy Policy
              </a>
              .
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !agreeTerms || (confirmPassword !== "" && confirmPassword !== password)}
          className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>Create NeuralDesk Account</span>
            </>
          )}
        </button>
      </form>

      {/* Switch to Sign In */}
      <div className="text-center text-xs text-slate-600 dark:text-charcoal-400 pt-1">
        Already have an account?{" "}
        <Link
          to="/signin"
          className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Sign in
        </Link>
      </div>

      {/* 1-Click Instant Evaluation Personas */}
      <DemoPersonaPicker onSuccessRedirect={redirectUrl} />
    </AuthLayout>
  );
};
