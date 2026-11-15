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
} from "lucide-react";
import { WorkflowCanvas } from "../canvas/WorkflowCanvas";
import { NodePalette } from "../canvas/NodePalette";
import { NodeInspectorDrawer } from "../drawer/NodeInspectorDrawer";
import { useWorkflowStore } from "../../store/workflowStore";
import { useSettingsStore } from "../../store/settingsStore";
import { cn } from "../../lib/utils";

export const CanvasView: React.FC = () => {
  const workflowTitle = useWorkflowStore((state) => state.workflowTitle);
  const setWorkflowTitle = useWorkflowStore((state) => state.setWorkflowTitle);
  const executionStatus = useWorkflowStore((state) => state.executionStatus);
  const runExecution = useWorkflowStore((state) => state.runExecution);
  const cancelExecution = useWorkflowStore((state) => state.cancelExecution);
  const undo = useWorkflowStore((state) => state.undo);
  const redo = useWorkflowStore((state) => state.redo);
  const canUndo = useWorkflowStore((state) => state.canUndo);
  const canRedo = useWorkflowStore((state) => state.canRedo);
  const clearCanvas = useWorkflowStore((state) => state.clearCanvas);
  const loadTemplate = useWorkflowStore((state) => state.loadTemplate);
  const exportWorkflowJson = useWorkflowStore((state) => state.exportWorkflowJson);
  const importWorkflowJson = useWorkflowStore((state) => state.importWorkflowJson);

  const executionMode = useSettingsStore((state) => state.executionMode);
  const geminiApiKey = useSettingsStore((state) => state.geminiApiKey);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [templateDropdownOpen, setTemplateDropdownOpen] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const isRunning = executionStatus === "running";

  const handleRun = () => {
    if (isRunning) {
      cancelExecution();
    } else {
      runExecution(executionMode, geminiApiKey);
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
      <div className="h-13 bg-white dark:bg-charcoal-900 border-b border-slate-200 dark:border-charcoal-800 px-4 py-2 flex items-center justify-between z-20 select-none transition-colors duration-150">
        {/* Title & Status */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={workflowTitle}
            onChange={(e) => setWorkflowTitle(e.target.value)}
            className="bg-transparent text-sm font-bold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-charcoal-800/60 focus:bg-white dark:focus:bg-charcoal-950 px-2 py-1 rounded-lg border border-transparent focus:border-indigo-500 focus:outline-none transition-colors max-w-sm truncate"
            title="Click to edit workflow name"
          />

          <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
            DRAFT
          </span>

          {executionStatus === "completed" && (
            <span className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Executed</span>
            </span>
          )}
          {executionStatus === "failed" && (
            <span className="hidden sm:flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-mono">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Failed</span>
            </span>
          )}
        </div>

        {/* Center / Right Control Actions */}
        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <div className="flex items-center bg-slate-100/90 dark:bg-charcoal-950/80 border border-slate-200 dark:border-charcoal-800 rounded-lg p-0.5">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-charcoal-800 text-slate-500 dark:text-charcoal-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-opacity"
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-charcoal-800 text-slate-500 dark:text-charcoal-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-opacity"
              title="Redo (Ctrl+Y)"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Templates Dropdown */}
          <div className="relative">
            <button
              onClick={() => setTemplateDropdownOpen(!templateDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100/90 hover:bg-slate-200 dark:bg-charcoal-950/80 dark:hover:bg-charcoal-800 border border-slate-200 dark:border-charcoal-800 text-xs text-slate-700 dark:text-charcoal-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <LayoutTemplate className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Templates</span>
            </button>

            {templateDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 rounded-xl shadow-2xl py-1 z-50 text-xs select-none"
                onClick={() => setTemplateDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-charcoal-400 border-b border-slate-100 dark:border-charcoal-800">
                  Pre-Built Industry DAGs
                </div>
                <button
                  onClick={() => loadTemplate("support_triage")}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-charcoal-800 text-slate-700 dark:text-charcoal-200 hover:text-slate-900 dark:hover:text-white flex flex-col gap-0.5"
                >
                  <span className="font-semibold text-indigo-600 dark:text-indigo-300">Customer Support Triage</span>
                  <span className="text-[10px] text-slate-500 dark:text-charcoal-400">Classify negative tickets and escalate via Slack</span>
                </button>
                <button
                  onClick={() => loadTemplate("doc_summarizer")}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-charcoal-800 text-slate-700 dark:text-charcoal-200 hover:text-slate-900 dark:hover:text-white flex flex-col gap-0.5"
                >
                  <span className="font-semibold text-sky-600 dark:text-sky-300">Document Summarizer</span>
                  <span className="text-[10px] text-slate-500 dark:text-charcoal-400">Gemini 1.5 Pro deep technical brief generator</span>
                </button>
                <button
                  onClick={() => loadTemplate("lead_extractor")}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-charcoal-800 text-slate-700 dark:text-charcoal-200 hover:text-slate-900 dark:hover:text-white flex flex-col gap-0.5"
                >
                  <span className="font-semibold text-emerald-600 dark:text-emerald-300">Lead Scoring & CRM</span>
                  <span className="text-[10px] text-slate-500 dark:text-charcoal-400">Intent scorer with human approval gate</span>
                </button>
              </div>
            )}
          </div>

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
            className="p-1.5 rounded-lg bg-slate-100/90 hover:bg-slate-200 dark:bg-charcoal-950/80 dark:hover:bg-charcoal-800 border border-slate-200 dark:border-charcoal-800 text-slate-600 dark:text-charcoal-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Import Workflow JSON"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleExport}
            className="p-1.5 rounded-lg bg-slate-100/90 hover:bg-slate-200 dark:bg-charcoal-950/80 dark:hover:bg-charcoal-800 border border-slate-200 dark:border-charcoal-800 text-slate-600 dark:text-charcoal-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Export Workflow JSON"
          >
            {exportSuccess ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
          </button>

          {/* Clear Canvas */}
          <button
            onClick={() => {
              if (confirm("Are you sure you want to clear the entire canvas?")) {
                clearCanvas();
              }
            }}
            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-500 hover:text-rose-600 dark:text-charcoal-400 dark:hover:text-rose-400 transition-colors"
            title="Clear Canvas"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Run / Stop Workflow Action */}
          <button
            onClick={handleRun}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md",
              isRunning
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 animate-pulse"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
            )}
          >
            {isRunning ? (
              <>
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>Stop Execution</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Run Workflow</span>
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
