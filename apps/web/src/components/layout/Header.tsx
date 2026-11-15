import React from "react";
import {
  Zap,
  Key,
  Settings,
  Layers,
  ChevronDown,
  ShieldCheck,
  Moon,
  Sun,
} from "lucide-react";
import { useSettingsStore } from "../../store/settingsStore";
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

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="h-14 border-b border-slate-200 dark:border-charcoal-800 bg-white/95 dark:bg-charcoal-900/95 px-4 flex items-center justify-between z-20 backdrop-blur-md select-none transition-colors duration-150">
      {/* Brand & Workspace Switcher */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">NeuralDesk</span>
              <span className="text-[9px] uppercase font-bold tracking-widest px-1 rounded bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 dark:border-indigo-500/30">
                PROD
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-charcoal-400 font-mono">Enterprise AI DAG Studio</p>
          </div>
        </div>

        {/* Workspace Switcher */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/90 dark:bg-charcoal-950/80 border border-slate-200 dark:border-charcoal-800 text-xs">
          <Layers className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
          <span className="text-slate-700 dark:text-charcoal-200 font-medium">{workspaceId}</span>
          <ChevronDown className="w-3 h-3 text-slate-400 dark:text-charcoal-500 ml-1" />
        </div>
      </div>

      {/* Center Breadcrumb */}
      <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 dark:text-charcoal-400 font-mono">
        <span>Workspace</span>
        <span>/</span>
        <span className="text-slate-800 dark:text-charcoal-200 font-semibold capitalize">{activeView}</span>
      </div>

      {/* Right Controls: BYOK Status, Settings, Theme */}
      <div className="flex items-center gap-2.5">
        {/* Mode & BYOK Badge */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className={cn(
            "flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono border transition-all cursor-pointer",
            geminiApiKey
              ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-700/50 hover:bg-emerald-100 dark:hover:bg-emerald-950/70"
              : "bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-300 dark:bg-charcoal-950 dark:text-charcoal-400 dark:border-charcoal-800 dark:hover:border-charcoal-700"
          )}
          title="Manage BYOK Gemini API Key and Runtime Execution Mode"
        >
          {geminiApiKey ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>BYOK Active</span>
            </>
          ) : (
            <>
              <Key className="w-3.5 h-3.5 text-slate-500 dark:text-charcoal-400" />
              <span>{executionMode === "live" ? "Live API" : "Simulated Engine"}</span>
            </>
          )}
        </button>

        {/* Settings Dialog Trigger */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-charcoal-800 text-slate-500 dark:text-charcoal-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          title="Studio Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-charcoal-800 text-slate-500 dark:text-charcoal-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>
      </div>
    </header>
  );
};
