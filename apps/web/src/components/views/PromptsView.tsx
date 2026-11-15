import React, { useState } from "react";
import {
  FileCode,
  Copy,
  Check,
  Variable,
  Sparkles,
} from "lucide-react";

interface PromptTemplate {
  id: string;
  title: string;
  category: string;
  template: string;
  variables: string[];
}

const DEFAULT_PROMPTS: PromptTemplate[] = [
  {
    id: "p1",
    title: "Customer Support Urgency & Sentiment Triage",
    category: "Classification",
    template: `Analyze the incoming customer support message below:\n\nMessage: {{customer_message}}\n\nTask: Output strict JSON with:\n1. "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE"\n2. "urgency": integer 1-5\n3. "escalate": boolean\n4. "summary": 1-sentence technical distillation`,
    variables: ["customer_message"],
  },
  {
    id: "p2",
    title: "Executive Technical Synthesis & Key Takeaways",
    category: "Summarization",
    template: `You are an executive engineering analyst. Synthesize the following document into 3 key takeaways and actionable architectural recommendations:\n\nDocument Title: {{document_title}}\nContent:\n{{document_body}}`,
    variables: ["document_title", "document_body"],
  },
  {
    id: "p3",
    title: "Enterprise B2B Lead Intent Qualification",
    category: "Sales",
    template: `Evaluate the following lead record for enterprise software buying propensity:\nCompany: {{company_name}}\nEmployee Count: {{employee_count}}\nInquiry: {{inquiry_notes}}\n\nScore lead from 0 to 100 with qualification justification.`,
    variables: ["company_name", "employee_count", "inquiry_notes"],
  },
];

export const PromptsView: React.FC = () => {
  const [prompts] = useState<PromptTemplate[]>(DEFAULT_PROMPTS);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate>(DEFAULT_PROMPTS[0]);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({
    customer_message: "Our checkout API is timing out on charge #9382 and we are losing sales immediately!",
    document_title: "NeuralDesk DAG Engine Architecture",
    document_body: "NeuralDesk implements Kahn's topological sort for directed acyclic graph compilation...",
    company_name: "Acme Cloud Corp",
    employee_count: "2500",
    inquiry_notes: "Looking to deploy visual workflow builder on premise with Gemini Pro BYOK.",
  });
  const [copied, setCopied] = useState(false);

  // Compile prompt with variables
  const compiledPrompt = selectedPrompt.template.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
    return variableValues[key.trim()] || `{{${key}}}`;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(compiledPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex-1 overflow-hidden flex bg-slate-50 dark:bg-charcoal-950 select-none transition-colors duration-150">
      {/* Left List */}
      <div className="w-80 border-r border-slate-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-charcoal-800">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Prompt Template Library</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-charcoal-400 mt-0.5">Reusable Mustache templates with dynamic bindings</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {prompts.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedPrompt(p)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                selectedPrompt.id === p.id
                  ? "bg-sky-50 border-sky-500 ring-1 ring-sky-500 dark:bg-sky-500/10 dark:border-sky-500"
                  : "bg-slate-50/80 border-slate-200 hover:border-slate-300 dark:bg-charcoal-950/60 dark:border-charcoal-800 dark:hover:border-charcoal-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{p.title}</span>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-charcoal-800 dark:text-charcoal-400">
                  {p.category}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-sky-600 dark:text-sky-400 font-mono">
                <Variable className="w-3 h-3" />
                <span>{p.variables.length} variables</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Editor & Compiler */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-charcoal-950">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{selectedPrompt.title}</h2>
            <p className="text-xs text-slate-500 dark:text-charcoal-400 mt-0.5">Template definition & live variable compiler preview</p>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 dark:bg-charcoal-900 dark:hover:bg-charcoal-800 dark:border-charcoal-700 text-xs text-slate-700 dark:text-charcoal-200 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Rendered"}</span>
          </button>
        </div>

        {/* Template Source */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-charcoal-300">Raw Mustache Template</label>
          <pre className="p-4 rounded-xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 text-xs font-mono text-sky-950 dark:text-sky-200 whitespace-pre-wrap leading-relaxed shadow-sm dark:shadow-lg">
            {selectedPrompt.template}
          </pre>
        </div>

        {/* Live Variable Bindings */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-700 dark:text-charcoal-300">Dynamic Variable Inputs</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedPrompt.variables.map((varName) => (
              <div key={varName} className="space-y-1">
                <label className="text-[11px] font-mono text-sky-600 dark:text-sky-400">{`{{${varName}}}`}</label>
                <input
                  type="text"
                  value={variableValues[varName] || ""}
                  onChange={(e) =>
                    setVariableValues({ ...variableValues, [varName]: e.target.value })
                  }
                  className="w-full bg-white dark:bg-charcoal-900 border border-slate-300 dark:border-charcoal-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-charcoal-100 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Live Output Preview */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-charcoal-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Compiled Output (Ready for Gemini Inference)</span>
          </label>
          <pre className="p-4 rounded-xl bg-white dark:bg-charcoal-900 border border-emerald-300 dark:border-emerald-500/30 text-xs font-mono text-emerald-950 dark:text-emerald-200 whitespace-pre-wrap leading-relaxed shadow-sm dark:shadow-lg">
            {compiledPrompt}
          </pre>
        </div>
      </div>
    </div>
  );
};
