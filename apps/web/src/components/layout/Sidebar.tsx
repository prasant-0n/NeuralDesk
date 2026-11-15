import React from "react";
import {
  Workflow,
  LayoutDashboard,
  History,
  Bot,
  FileCode,
} from "lucide-react";
import { cn } from "../../lib/utils";

export type NavView = "canvas" | "dashboard" | "executions" | "agents" | "prompts";

interface SidebarProps {
  activeView: NavView;
  onSelectView: (view: NavView) => void;
}

interface NavItem {
  id: NavView;
  label: string;
  icon: React.FC<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: "canvas", label: "Canvas", icon: Workflow },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "executions", label: "Executions", icon: History },
  { id: "agents", label: "Agents Studio", icon: Bot },
  { id: "prompts", label: "Prompt Library", icon: FileCode },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onSelectView }) => {
  return (
    <nav
      className="w-16 bg-charcoal-900 border-r border-charcoal-800 flex flex-col items-center py-4 space-y-3 z-20 select-none"
      aria-label="Primary Navigation"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectView(item.id)}
            className={cn(
              "group relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150",
              isActive
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-charcoal-400 hover:text-charcoal-200 hover:bg-charcoal-800/80"
            )}
            title={item.label}
          >
            <Icon className="w-5 h-5 transition-transform group-hover:scale-105" />

            {/* Hover Tooltip */}
            <span className="absolute left-16 px-2.5 py-1 rounded-md bg-charcoal-950 border border-charcoal-800 text-xs text-charcoal-200 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
