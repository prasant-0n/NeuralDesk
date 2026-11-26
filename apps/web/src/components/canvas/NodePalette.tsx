import React, { useState, useEffect } from "react";
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
  X,
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
  badge: string;
}

const PALETTE_ITEMS: PaletteItem[] = [
  {
    kind: "trigger",
    label: "Trigger",
    category: "Ingress",
    description: "Webhook, cron schedule, or manual ingress",
    icon: Zap,
    badge: "Ingress",
  },
  {
    kind: "llm",
    label: "Gemini LLM",
    category: "AI & Templating",
    description: "Multi-turn Gemini 1.5 Flash / Pro reasoning",
    icon: Sparkles,
    badge: "Reasoning",
  },
  {
    kind: "prompt",
    label: "Prompt Template",
    category: "AI & Templating",
    description: "Mustache interpolation with input ports",
    icon: FileText,
    badge: "Templating",
  },
  {
    kind: "condition",
    label: "Condition Router",
    category: "Logic & Transform",
    description: "Boolean branching router (True / False)",
    icon: GitBranch,
    badge: "Branching",
  },
  {
    kind: "transform",
    label: "JSON Transform",
    category: "Logic & Transform",
    description: "Reshape, pluck, and map JSON keys",
    icon: ArrowRightLeft,
    badge: "Utility",
  },
  {
    kind: "tool",
    label: "HTTP REST Tool",
    category: "Tools & Human",
    description: "External API call with retries and timeout",
    icon: Wrench,
    badge: "Integration",
  },
  {
    kind: "approval",
    label: "Human Gate",
    category: "Tools & Human",
    description: "Pause workflow execution for manual sign-off",
    icon: ShieldCheck,
    badge: "Governance",
  },
  {
    kind: "output",
    label: "Output Egress",
    category: "Egress",
    description: "Formatted JSON/Markdown terminal delivery",
    icon: Share2,
    badge: "Egress",
  },
];

export const NodePalette: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth <= 1024;
    }
    return false;
  });

  const [isTabletOrMobile, setIsTabletOrMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth <= 1024;
    }
    return false;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const addNode = useWorkflowStore((state) => state.addNode);

  useEffect(() => {
    const handleResize = () => {
      const isTablet = window.innerWidth <= 1024;
      setIsTabletOrMobile(isTablet);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const handleAddAndCloseOnMobile = (kind: NodeKind) => {
    addNode(kind);
    if (isTabletOrMobile) {
      setIsCollapsed(true);
    }
  };

  return (
    <>
      {isTabletOrMobile && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black/40 dark:bg-black/60 z-30 transition-opacity"
          onClick={() => setIsCollapsed(true)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "flex flex-col bg-white dark:bg-[#07080d] border-r border-slate-200 dark:border-[rgba(238,240,245,0.08)] select-none transition-all duration-200",
          isTabletOrMobile && !isCollapsed
            ? "fixed top-13 bottom-0 left-14 sm:left-16 z-40 w-72 max-w-[calc(100vw-4.5rem)] shadow-lg"
            : isCollapsed
            ? "w-14 relative z-10"
            : "w-72 relative z-10"
        )}
      >
        {/* Header & Collapse Toggle */}
        <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-[rgba(238,240,245,0.08)]">
          {!isCollapsed && (
            <div className="min-w-0 pr-2">
              <h3 className="text-xs font-medium text-slate-900 dark:text-[#eef0f5] truncate">
                Node Library
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-[#7a8296] truncate">
                Drag to canvas or click to add
              </p>
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#1a1e28] text-slate-500 dark:text-[#7a8296] hover:text-slate-900 dark:hover:text-[#eef0f5] transition-colors ml-auto shrink-0 cursor-pointer"
            title={isCollapsed ? "Expand Node Library" : "Collapse Node Library"}
            aria-label={isCollapsed ? "Expand Palette" : "Collapse Palette"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : isTabletOrMobile ? (
              <X className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Search Bar */}
        {!isCollapsed && (
          <div className="p-2.5 border-b border-slate-200 dark:border-[rgba(238,240,245,0.06)]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#7a8296]" />
              <input
                type="text"
                placeholder="Search nodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 dark:bg-[#11141c] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] rounded-md pl-8 pr-2.5 py-1.5 text-xs text-slate-900 dark:text-[#eef0f5] placeholder-slate-400 dark:placeholder-[#7a8296] focus:outline-none focus:border-slate-400 dark:focus:border-[rgba(238,240,245,0.2)] transition-colors"
              />
            </div>
          </div>
        )}

        {/* Palette Items List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.kind}
                draggable
                onDragStart={(e) => onDragStart(e, item.kind)}
                onClick={() => handleAddAndCloseOnMobile(item.kind)}
                title={isCollapsed ? `${item.label} - ${item.description}` : undefined}
                className={cn(
                  "group flex items-center gap-2.5 p-2 rounded-lg border border-slate-200/80 dark:border-[rgba(238,240,245,0.06)] bg-white dark:bg-[#11141c] hover:bg-slate-50 dark:hover:bg-[#1a1e28] hover:border-slate-300 dark:hover:border-[rgba(238,240,245,0.12)] cursor-grab active:cursor-grabbing transition-colors",
                  isCollapsed && "justify-center p-2.5"
                )}
              >
                <div className="p-1.5 rounded-md bg-slate-100 dark:bg-[#07080d] text-slate-600 dark:text-[#a3a9b8] shrink-0">
                  <Icon className="w-4 h-4" />
                </div>

                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-900 dark:text-[#eef0f5] truncate">
                        {item.label}
                      </span>
                      <span className="text-[10px] font-mono px-1 rounded bg-slate-100 dark:bg-[#07080d] text-slate-500 dark:text-[#7a8296] shrink-0">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-[#7a8296] truncate mt-0.5">
                      {item.description}
                    </p>
                  </div>
                )}

                {!isCollapsed && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddAndCloseOnMobile(item.kind);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 dark:hover:bg-[#232325] rounded text-slate-400 hover:text-slate-900 dark:hover:text-[#eef0f5] transition-opacity shrink-0"
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
    </>
  );
};
