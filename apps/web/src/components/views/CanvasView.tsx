import React, { useRef, useState } from "react";
import {
  Play,
  RotateCcw,
  RotateCw,
  Download,
  Upload,
  LayoutTemplate,
  Trash2,
  Square,
  Check,
  CheckCircle2,
  AlertCircle,
  Cloud,
  Loader2,
  Radio,
  Server,
  Zap,
  ChevronDown,
} from "lucide-react";
import { WorkflowCanvas } from "../canvas/WorkflowCanvas";
import { NodePalette } from "../canvas/NodePalette";
import { NodeInspectorDrawer } from "../drawer/NodeInspectorDrawer";
import { useWorkflowStore } from "../../store/workflowStore";
import { useSettingsStore } from "../../store/settingsStore";
import { cn } from "../../lib/utils";

export type ExecutionTargetMode = "mock" | "live" | "client_mock";

interface ModeOption {
  id: ExecutionTargetMode;
  label: string;
  badge: string;
  description: string;
  icon: React.FC<{ className?: string }>;
}

const MODE_OPTIONS: ModeOption[] = [
  {
    id: "mock",
    label: "Backend SSE (Simulation)",
    badge: "Backend SSE",
    description: "Real-time SSE event stream via Hono backend with synthetic LLM latencies",
    icon: Server,
  },
  {
    id: "live",
    label: "Backend SSE (Live Gemini)",
    badge: "Live Gemini",
    description: "Production Google GenAI streaming with BYOK credential verification",
    icon: Zap,
  },
  {
    id: "client_mock",
    label: "Client Mock (Offline)",
    badge: "Offline",
    description: "In-browser pure topological DAG engine (no backend connection required)",
    icon: Zap,
  },
];

export const CanvasView: React.FC = () => {
  const workflowTitle = useWorkflowStore((state) => state.workflowTitle);
  const setWorkflowTitle = useWorkflowStore((state) => state.setWorkflowTitle);
  const executionStatus = useWorkflowStore((state) => state.executionStatus);
  const isSaving = useWorkflowStore((state) => state.isSaving);
  const isStreaming = useWorkflowStore((state) => state.isStreaming);
  const runExecution = useWorkflowStore((state) => state.runExecution);
  const cancelExecution = useWorkflowStore((state) => state.cancelExecution);
  const saveWorkflowToApi = useWorkflowStore((state) => state.saveWorkflowToApi);
  const undo = useWorkflowStore((state) => state.undo);
  const redo = useWorkflowStore((state) => state.redo);
  const canUndo = useWorkflowStore((state) => state.canUndo);
  const canRedo = useWorkflowStore((state) => state.canRedo);
  const clearCanvas = useWorkflowStore((state) => state.clearCanvas);
  const loadTemplate = useWorkflowStore((state) => state.loadTemplate);
  const exportWorkflowJson = useWorkflowStore((state) => state.exportWorkflowJson);
  const importWorkflowJson = useWorkflowStore((state) => state.importWorkflowJson);

  const geminiApiKey = useSettingsStore((state) => state.geminiApiKey);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [templateDropdownOpen, setTemplateDropdownOpen] = useState(false);
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<ExecutionTargetMode>("mock");
  const [exportSuccess, setExportSuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isRunning = executionStatus === "running";
  const activeModeOption = MODE_OPTIONS.find((m) => m.id === selectedMode) || MODE_OPTIONS[0];
  const ActiveModeIcon = activeModeOption.icon;

  const handleRun = () => {
    if (isRunning) {
      cancelExecution();
    } else {
      runExecution(selectedMode, geminiApiKey);
    }
  };

  const handleSaveToApi = async () => {
    if (isSaving) return;
    const ok = await saveWorkflowToApi();
    if (ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  const handleExport = () => {
    const json = exportWorkflowJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `neuraldesk-workflow-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importWorkflowJson(content);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Top Workflow Control Bar */}
      <div className="h-12 bg-white dark:bg-[#07080d] border-b border-slate-200 dark:border-[rgba(238,240,245,0.08)] px-3 sm:px-4 flex items-center justify-between z-20 select-none transition-colors duration-150 gap-2 shrink-0">
        {/* Title & Status Badges */}
        <div className="flex items-center gap-2 min-w-0 shrink">
          <input
            type="text"
            value={workflowTitle}
            onChange={(e) => setWorkflowTitle(e.target.value)}
            className="bg-transparent text-xs sm:text-sm font-medium text-slate-900 dark:text-[#eef0f5] hover:bg-slate-100 dark:hover:bg-[#1a1e28] focus:bg-white dark:focus:bg-[#11141c] px-2 py-1 rounded-md border border-transparent focus:border-slate-400 dark:focus:border-[rgba(238,240,245,0.2)] focus:outline-none transition-colors min-w-0 max-w-[140px] sm:max-w-[200px] md:max-w-xs truncate"
            title="Click to edit workflow name"
          />

          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-500 dark:text-[#7a8296] bg-slate-100 dark:bg-[#11141c] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] shrink-0">
            Draft
          </span>

          {/* SSE Live Streaming Badge */}
          {isStreaming && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono text-indigo-600 dark:text-[#6366f1] bg-indigo-50 dark:bg-[#11141c] border border-indigo-200 dark:border-indigo-900/60 shrink-0">
              <Radio className="w-3 h-3 animate-spin" />
              <span className="hidden md:inline">SSE Stream Live</span>
            </span>
          )}

          {executionStatus === "completed" && !isStreaming && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-[#4cc38a] font-mono shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Executed</span>
            </span>
          )}
          {executionStatus === "failed" && !isStreaming && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-rose-600 dark:text-[#e5484d] font-mono shrink-0">
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Failed</span>
            </span>
          )}
        </div>

        {/* Center / Right Control Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Undo / Redo */}
          <div className="flex items-center bg-slate-100 dark:bg-[#11141c] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] rounded-md p-0.5 shrink-0">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-[#1a1e28] text-slate-500 dark:text-[#7a8296] hover:text-slate-900 dark:hover:text-[#eef0f5] disabled:opacity-30 disabled:pointer-events-none transition-opacity"
              title="Undo (Ctrl+Z)"
              aria-label="Undo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-[#1a1e28] text-slate-500 dark:text-[#7a8296] hover:text-slate-900 dark:hover:text-[#eef0f5] disabled:opacity-30 disabled:pointer-events-none transition-opacity"
              title="Redo (Ctrl+Y)"
              aria-label="Redo"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Templates Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setTemplateDropdownOpen(!templateDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-[#11141c] dark:hover:bg-[#1a1e28] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] text-xs text-slate-700 dark:text-[#a3a9b8] hover:text-slate-900 dark:hover:text-[#eef0f5] transition-colors"
              title="Load Pre-Built DAG Template"
            >
              <LayoutTemplate className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Templates</span>
            </button>

            {templateDropdownOpen && (
              <div
                className="absolute right-0 mt-1.5 w-64 bg-white dark:bg-[#11141c] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] rounded-lg shadow-lg py-1 z-50 text-xs select-none"
                onClick={() => setTemplateDropdownOpen(false)}
              >
                <div className="px-3 py-1 text-[10px] font-mono text-slate-400 dark:text-[#7a8296] border-b border-slate-100 dark:border-[rgba(238,240,245,0.06)]">
                  Pre-built DAG templates
                </div>
                <button
                  onClick={() => loadTemplate("support_triage")}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-[#1a1e28] text-slate-700 dark:text-[#a3a9b8] hover:text-slate-900 dark:hover:text-[#eef0f5] flex flex-col gap-0.5"
                >
                  <span className="font-medium text-slate-900 dark:text-[#eef0f5]">Customer Support Triage</span>
                  <span className="text-[10px] text-slate-500 dark:text-[#7a8296]">Classify inbound negative tickets and route escalation</span>
                </button>
                <button
                  onClick={() => loadTemplate("doc_summarizer")}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-[#1a1e28] text-slate-700 dark:text-[#a3a9b8] hover:text-slate-900 dark:hover:text-[#eef0f5] flex flex-col gap-0.5"
                >
                  <span className="font-medium text-slate-900 dark:text-[#eef0f5]">Document Summarizer</span>
                  <span className="text-[10px] text-slate-500 dark:text-[#7a8296]">Gemini 1.5 Pro deep brief generator</span>
                </button>
                <button
                  onClick={() => loadTemplate("lead_extractor")}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-[#1a1e28] text-slate-700 dark:text-[#a3a9b8] hover:text-slate-900 dark:hover:text-[#eef0f5] flex flex-col gap-0.5"
                >
                  <span className="font-medium text-slate-900 dark:text-[#eef0f5]">Lead Scoring & CRM</span>
                  <span className="text-[10px] text-slate-500 dark:text-[#7a8296]">Intent scorer with human approval gate</span>
                </button>
              </div>
            )}
          </div>

          {/* Save to Backend API Button */}
          <button
            onClick={handleSaveToApi}
            disabled={isSaving}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-colors shrink-0",
              saveSuccess
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-[#11141c] dark:text-[#4cc38a] dark:border-emerald-900/60"
                : "bg-slate-100 hover:bg-slate-200 dark:bg-[#11141c] dark:hover:bg-[#1a1e28] border-slate-200 dark:border-[rgba(238,240,245,0.08)] text-slate-700 dark:text-[#a3a9b8] hover:text-slate-900 dark:hover:text-[#eef0f5]"
            )}
            title="Persist current canvas workflow definition to backend database"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden lg:inline">Saving...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-[#4cc38a]" />
                <span className="hidden lg:inline">Saved</span>
              </>
            ) : (
              <>
                <Cloud className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Save API</span>
              </>
            )}
          </button>

          {/* Import / Export JSON */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-[#11141c] dark:hover:bg-[#1a1e28] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] text-slate-600 dark:text-[#7a8296] hover:text-slate-900 dark:hover:text-[#eef0f5] transition-colors shrink-0"
            title="Import Workflow JSON"
            aria-label="Import Workflow"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleExport}
            className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-[#11141c] dark:hover:bg-[#1a1e28] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] text-slate-600 dark:text-[#7a8296] hover:text-slate-900 dark:hover:text-[#eef0f5] transition-colors shrink-0"
            title="Export Workflow JSON"
            aria-label="Export Workflow"
          >
            {exportSuccess ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-[#4cc38a]" /> : <Download className="w-3.5 h-3.5" />}
          </button>

          {/* Clear Canvas */}
          <button
            onClick={() => {
              if (confirm("Are you sure you want to clear the entire canvas?")) {
                clearCanvas();
              }
            }}
            className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:text-[#7a8296] dark:hover:text-rose-400 transition-colors shrink-0"
            title="Clear Canvas"
            aria-label="Clear Canvas"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Execution Mode Selector Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setModeDropdownOpen(!modeDropdownOpen)}
              disabled={isRunning}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-mono transition-colors",
                "bg-slate-100 hover:bg-slate-200 dark:bg-[#11141c] dark:hover:bg-[#1a1e28] border-slate-200 dark:border-[rgba(238,240,245,0.08)] text-slate-700 dark:text-[#a3a9b8]",
                isRunning && "opacity-50 cursor-not-allowed"
              )}
              title="Select DAG Execution Runtime & Telemetry Target"
            >
              <ActiveModeIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xl:inline">{activeModeOption.label}</span>
              <span className="hidden md:inline xl:hidden">{activeModeOption.badge}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 dark:text-[#7a8296] ml-0.5" />
            </button>

            {modeDropdownOpen && (
              <div
                className="absolute right-0 mt-1.5 w-72 bg-white dark:bg-[#11141c] border border-slate-200 dark:border-[rgba(238,240,245,0.08)] rounded-lg shadow-lg py-1 z-50 text-xs select-none"
                onClick={() => setModeDropdownOpen(false)}
              >
                <div className="px-3 py-1 text-[10px] font-mono text-slate-400 dark:text-[#7a8296] border-b border-slate-100 dark:border-[rgba(238,240,245,0.06)]">
                  Execution runtime engine
                </div>
                {MODE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedMode === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedMode(opt.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-[#1a1e28] transition-colors flex items-start gap-2.5",
                        isSelected && "bg-slate-50 dark:bg-[#1a1e28]"
                      )}
                    >
                      <div className="p-1 rounded bg-slate-100 dark:bg-[#07080d] shrink-0 mt-0.5">
                        <Icon className="w-3.5 h-3.5 text-slate-600 dark:text-[#a3a9b8]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-900 dark:text-[#eef0f5] truncate">
                            {opt.label}
                          </span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-slate-900 dark:text-[#eef0f5] shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-[#7a8296] mt-0.5 leading-relaxed">
                          {opt.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Run / Stop Workflow Action */}
          <button
            onClick={handleRun}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors shrink-0 cursor-pointer",
              isRunning
                ? "bg-rose-600 hover:bg-rose-500 text-white"
                : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#eef0f5] dark:hover:bg-white dark:text-[#0b0d14]"
            )}
          >
            {isRunning ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current shrink-0" />
                <span className="hidden sm:inline">Stop Execution</span>
                <span className="sm:hidden">Stop</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                <span className="hidden sm:inline">Run Workflow</span>
                <span className="sm:hidden">Run</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Canvas Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        <NodePalette />
        <WorkflowCanvas />
        <NodeInspectorDrawer />
      </div>
    </div>
  );
};
