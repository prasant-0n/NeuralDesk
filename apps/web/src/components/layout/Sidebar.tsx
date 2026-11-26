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
      className="w-14 sm:w-16 bg-white dark:bg-[#07080d] border-r border-slate-200 dark:border-[rgba(238,240,245,0.08)] flex flex-col items-center py-3 space-y-2 z-20 select-none transition-colors duration-150 shrink-0"
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
              "group relative w-10 h-10 rounded-lg flex items-center justify-center transition-colors cursor-pointer",
              isActive
                ? "bg-slate-900 text-white dark:bg-[#eef0f5] dark:text-[#0b0d14]"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-[#7a8296] dark:hover:text-[#eef0f5] dark:hover:bg-[#1a1e28]"
            )}
            title={item.label}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />

            {/* Hover Tooltip (Shown on Laptops & Desktops) */}
            <span className="hidden sm:block absolute left-14 sm:left-16 px-2.5 py-1 rounded bg-slate-900 text-white border border-slate-800 dark:bg-[#11141c] dark:border-[rgba(238,240,245,0.08)] dark:text-[#eef0f5] text-xs font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md z-50">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
