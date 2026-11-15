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
    <header className="h-14 border-b border-charcoal-800 bg-charcoal-900/95 px-4 flex items-center justify-between z-20 backdrop-blur-md select-none">
      {/* Brand & Workspace Switcher */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-white">NeuralDesk</span>
              <span className="text-[9px] uppercase font-bold tracking-widest px-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PROD
              </span>
            </div>
            <p className="text-[10px] text-charcoal-400 font-mono">Enterprise AI DAG Studio</p>
          </div>
        </div>

        {/* Workspace Switcher */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-charcoal-950/80 border border-charcoal-800 text-xs">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-charcoal-200 font-medium">{workspaceId}</span>
          <ChevronDown className="w-3 h-3 text-charcoal-500 ml-1" />
        </div>
      </div>

      {/* Center Breadcrumb */}
      <div className="hidden md:flex items-center gap-2 text-xs text-charcoal-400 font-mono">
        <span>Workspace</span>
        <span>/</span>
        <span className="text-charcoal-200 font-semibold capitalize">{activeView}</span>
      </div>

      {/* Right Controls: BYOK Status, Settings, Theme */}
      <div className="flex items-center gap-3">
        {/* Mode & BYOK Badge */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className={cn(
            "flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono border transition-all cursor-pointer",
            geminiApiKey
              ? "bg-emerald-950/40 text-emerald-400 border-emerald-700/50 hover:bg-emerald-950/70"
              : "bg-charcoal-950 text-charcoal-400 border-charcoal-800 hover:border-charcoal-700"
          )}
          title="Manage BYOK Gemini API Key and Runtime Execution Mode"
        >
          {geminiApiKey ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>BYOK Active</span>
            </>
          ) : (
            <>
              <Key className="w-3.5 h-3.5 text-charcoal-400" />
              <span>{executionMode === "live" ? "Live API" : "Simulated Engine"}</span>
            </>
          )}
        </button>

        {/* Settings Dialog Trigger */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 rounded-lg hover:bg-charcoal-800 text-charcoal-400 hover:text-white transition-colors"
          title="Studio Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-charcoal-800 text-charcoal-400 hover:text-white transition-colors"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>
      </div>
    </header>
  );
};
