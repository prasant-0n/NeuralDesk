import React from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  Key,
  Settings,
  Layers,
  ChevronDown,
  ShieldCheck,
  Moon,
  Sun,
  LogOut,
  LogIn,
} from "lucide-react";
import { useSettingsStore } from "../../store/settingsStore";
import { useAuthStore } from "../../store/authStore";
import { authClient } from "../../lib/authClient";
import { cn } from "../../lib/utils";

interface HeaderProps {
  activeView: string;
}

export const Header: React.FC<HeaderProps> = ({ activeView }) => {
  const geminiApiKey = useSettingsStore((state) => state.geminiApiKey);
  const executionMode = useSettingsStore((state) => state.executionMode);
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const setIsSettingsOpen = useSettingsStore((state) => state.setIsSettingsOpen);
  const workspaceId = useSettingsStore((state) => state.workspaceId);
  const setIsAuthModalOpen = useAuthStore((state) => state.setIsAuthModalOpen);
  const customUser = useAuthStore((state) => state.customUser);
  const { data: sessionData } = authClient.useSession();
  const activeUser = sessionData?.user || customUser;

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="h-13 border-b border-slate-200 dark:border-[rgba(238,240,245,0.08)] bg-white dark:bg-[#07080d] px-3 sm:px-4 flex items-center justify-between z-20 select-none transition-colors duration-150 shrink-0">
      {/* Brand & Workspace Switcher */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-[#eef0f5] text-white dark:text-[#0b0d14] flex items-center justify-center transition-opacity hover:opacity-90">
            <Zap className="w-3.5 h-3.5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xs sm:text-sm tracking-tight text-slate-900 dark:text-[#eef0f5]">
                NeuralDesk
              </span>
              <span className="text-[9px] uppercase font-mono px-1 rounded bg-slate-100 dark:bg-[#1a1e28] text-slate-600 dark:text-[#a3a9b8] border border-slate-200 dark:border-[rgba(238,240,245,0.08)]">
                Studio
              </span>
            </div>
          </div>
        </Link>

        {/* Workspace Switcher */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#11141c] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] text-xs shrink-0 max-w-[140px] lg:max-w-[180px]">
          <Layers className="w-3.5 h-3.5 text-slate-500 dark:text-[#7a8296] shrink-0" />
          <span className="text-slate-700 dark:text-[#a3a9b8] font-mono truncate">
            {workspaceId}
          </span>
          <ChevronDown className="w-3 h-3 text-slate-400 dark:text-[#7a8296] ml-0.5 shrink-0" />
        </div>
      </div>

      {/* Center Breadcrumb */}
      <div className="hidden xl:flex items-center gap-2 text-xs text-slate-500 dark:text-[#7a8296] font-mono">
        <span>Workspace</span>
        <span>/</span>
        <span className="text-slate-800 dark:text-[#eef0f5] font-medium capitalize">{activeView}</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Mode & BYOK Badge */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className={cn(
            "flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono border transition-colors cursor-pointer shrink-0",
            geminiApiKey
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-[#11141c] dark:text-[#4cc38a] dark:border-emerald-900/60"
              : "bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-300 dark:bg-[#11141c] dark:text-[#a3a9b8] dark:border-[rgba(238,240,245,0.08)]"
          )}
          title="Manage BYOK Gemini API Key and Runtime Execution Mode"
        >
          {geminiApiKey ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-[#4cc38a] shrink-0" />
              <span className="hidden sm:inline">BYOK Active</span>
              <span className="sm:hidden">BYOK</span>
            </>
          ) : (
            <>
              <Key className="w-3.5 h-3.5 text-slate-500 dark:text-[#7a8296] shrink-0" />
              <span className="hidden xl:inline">
                {executionMode === "live" ? "Live API" : "Simulated Engine"}
              </span>
              <span className="xl:hidden">
                {executionMode === "live" ? "Live" : "Sim"}
              </span>
            </>
          )}
        </button>

        {/* Settings Dialog Trigger */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1a1e28] text-slate-500 dark:text-[#7a8296] hover:text-slate-900 dark:hover:text-[#eef0f5] transition-colors shrink-0"
          title="Studio Settings"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1a1e28] text-slate-500 dark:text-[#7a8296] hover:text-slate-900 dark:hover:text-[#eef0f5] transition-colors shrink-0"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* User Account */}
        {activeUser ? (
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-md border border-slate-200 dark:border-[rgba(238,240,245,0.08)] bg-slate-50 dark:bg-[#11141c] text-slate-800 dark:text-[#eef0f5] text-xs transition-colors"
              title={`Logged in as ${activeUser.name || activeUser.email}`}
            >
              <div className="w-5 h-5 rounded bg-slate-900 text-white dark:bg-[#eef0f5] dark:text-[#0b0d14] font-medium text-[10px] flex items-center justify-center shrink-0">
                {activeUser.name ? activeUser.name.charAt(0).toUpperCase() : "U"}
              </div>
              <span className="font-mono text-xs max-w-[80px] truncate">
                {activeUser.name || "User"}
              </span>
            </button>
            <button
              onClick={async () => {
                await authClient.signOut();
                useAuthStore.getState().signOut();
              }}
              className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
              title="Sign Out of NeuralDesk"
              aria-label="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 shrink-0">
            <Link
              to="/signin"
              className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-[#a3a9b8] hover:text-slate-900 dark:hover:text-[#eef0f5] rounded-md transition-colors inline-flex items-center gap-1"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
