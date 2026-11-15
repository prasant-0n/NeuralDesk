import React, { useState } from "react";
import {
  Zap,
  Sparkles,
  FileText,
  GitBranch,
  ArrowRightLeft,
  Wrench,
  ShieldCheck,
  Share2,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
} from "lucide-react";
import { type NodeKind } from "@neuraldesk/shared";
import { useWorkflowStore } from "../../store/workflowStore";
import { cn } from "../../lib/utils";

interface PaletteItem {
  kind: NodeKind;
  label: string;
  category: "Ingress" | "AI & Templating" | "Logic & Transform" | "Tools & Human" | "Egress";
  description: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  borderHover: string;
  badge: string;
}

const PALETTE_ITEMS: PaletteItem[] = [
  {
    kind: "trigger",
    label: "Trigger",
    category: "Ingress",
    description: "Webhook, cron schedule, or manual ingress",
    icon: Zap,
    color: "text-amber-500 dark:text-amber-400",
    borderHover: "hover:border-amber-500/50",
    badge: "Ingress",
  },
  {
    kind: "llm",
    label: "Gemini LLM",
    category: "AI & Templating",
    description: "Multi-turn Gemini 1.5 Flash / Pro reasoning",
    icon: Sparkles,
    color: "text-indigo-500 dark:text-indigo-400",
    borderHover: "hover:border-indigo-500/50",
    badge: "Intelligence",
  },
  {
    kind: "prompt",
    label: "Prompt Template",
    category: "AI & Templating",
    description: "Mustache interpolation with input ports",
    icon: FileText,
    color: "text-sky-500 dark:text-sky-400",
    borderHover: "hover:border-sky-500/50",
    badge: "Templating",
  },
  {
    kind: "condition",
    label: "Condition Router",
    category: "Logic & Transform",
    description: "Boolean branching router (True / False)",
    icon: GitBranch,
    color: "text-emerald-500 dark:text-emerald-400",
    borderHover: "hover:border-emerald-500/50",
    badge: "Branching",
  },
  {
    kind: "transform",
    label: "JSON Transform",
    category: "Logic & Transform",
    description: "Reshape, pluck, and map JSON keys",
    icon: ArrowRightLeft,
    color: "text-orange-500 dark:text-orange-400",
    borderHover: "hover:border-orange-500/50",
    badge: "Utility",
  },
  {
    kind: "tool",
    label: "HTTP REST Tool",
    category: "Tools & Human",
    description: "External API call with retries and timeout",
    icon: Wrench,
    color: "text-purple-500 dark:text-purple-400",
    borderHover: "hover:border-purple-500/50",
    badge: "Integration",
  },
  {
    kind: "approval",
    label: "Human Gate",
    category: "Tools & Human",
    description: "Pause workflow execution for manual sign-off",
    icon: ShieldCheck,
    color: "text-yellow-600 dark:text-yellow-400",
    borderHover: "hover:border-yellow-500/50",
    badge: "Governance",
  },
  {
    kind: "output",
    label: "Output Egress",
    category: "Egress",
    description: "Formatted JSON/Markdown terminal delivery",
    icon: Share2,
    color: "text-emerald-500 dark:text-emerald-400",
    borderHover: "hover:border-emerald-500/50",
    badge: "Egress",
  },
];

export const NodePalette: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const addNode = useWorkflowStore((state) => state.addNode);

  const filteredItems = PALETTE_ITEMS.filter(
    (item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onDragStart = (event: React.DragEvent, kind: NodeKind) => {
    event.dataTransfer.setData("application/reactflow", kind);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside
      className={cn(
        "relative flex flex-col bg-white/95 dark:bg-charcoal-900/90 border-r border-slate-200 dark:border-charcoal-800 backdrop-blur-md transition-all duration-300 z-10 select-none",
        isCollapsed ? "w-14" : "w-72"
      )}
    >
      {/* Header & Collapse Toggle */}
      <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-charcoal-800">
        {!isCollapsed && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-charcoal-200">
              Node Library
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-charcoal-400">Drag to canvas or click to add</p>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-charcoal-800 text-slate-500 dark:text-charcoal-400 hover:text-slate-900 dark:hover:text-white transition-colors ml-auto"
          title={isCollapsed ? "Expand Palette" : "Collapse Palette"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Search Bar (When Expanded) */}
      {!isCollapsed && (
        <div className="p-2.5 border-b border-slate-200 dark:border-charcoal-800/60">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-charcoal-400" />
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-charcoal-950/80 border border-slate-200 dark:border-charcoal-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-800 dark:text-charcoal-100 placeholder-slate-400 dark:placeholder-charcoal-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>
      )}

      {/* Palette Items List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.kind}
              draggable
              onDragStart={(e) => onDragStart(e, item.kind)}
              onClick={() => addNode(item.kind)}
              title={isCollapsed ? `${item.label} - ${item.description}` : undefined}
              className={cn(
                "group flex items-center gap-3 p-2 rounded-xl border border-slate-200 dark:border-charcoal-800/80 bg-white dark:bg-charcoal-950/50 hover:bg-slate-50 dark:hover:bg-charcoal-850 hover:shadow-sm cursor-grab active:cursor-grabbing transition-all duration-150",
                item.borderHover,
                isCollapsed && "justify-center p-2.5"
              )}
            >
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 group-hover:scale-105 transition-transform shrink-0">
                <Icon className={cn("w-4 h-4", item.color)} />
              </div>

              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 dark:text-charcoal-200 group-hover:text-indigo-600 dark:group-hover:text-white truncate">
                      {item.label}
                    </span>
                    <span className="text-[9px] uppercase font-mono px-1 rounded bg-slate-100 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 text-slate-600 dark:text-charcoal-400">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-charcoal-400 truncate mt-0.5">{item.description}</p>
                </div>
              )}

              {!isCollapsed && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addNode(item.kind);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 dark:hover:bg-charcoal-800 rounded text-slate-500 dark:text-charcoal-400 hover:text-slate-900 dark:hover:text-white transition-opacity"
                  title="Add node to canvas"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
