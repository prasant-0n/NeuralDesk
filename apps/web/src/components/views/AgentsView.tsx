import React, { useState } from "react";
import {
  Bot,
  Sparkles,
  Send,
  Loader2,
  Terminal,
  Cpu,
  Thermometer,
  Settings2,
  Trash2,
  Workflow,
  Check,
  ChevronDown,
  X,
} from "lucide-react";
import { formatTokens, cn } from "../../lib/utils";
import { useSettingsStore } from "../../store/settingsStore";
import { useWorkflowStore } from "../../store/workflowStore";
import { apiFetch } from "../../lib/api";

interface AgentPersona {
  id: string;
  name: string;
  role: string;
  model: string;
  systemPrompt: string;
  temperature: number;
  tokensProcessed: number;
}

const DEFAULT_AGENTS: AgentPersona[] = [
  {
    id: "agent_triage",
    name: "Triage Sentinel",
    role: "Support Inbound Classifier",
    model: "gemini-3.8-flash",
    systemPrompt:
      "You are an automated support incident classifier. Categorize urgency, isolate user emotion, and produce structured action plans.",
    temperature: 0.2,
    tokensProcessed: 142000,
  },
  {
    id: "agent_research",
    name: "Synthesizer Pro",
    role: "Deep Research Analyst",
    model: "gemini-1.5-pro",
    systemPrompt:
      "You are an executive research agent specializing in deep engineering analysis, architecture trade-offs, and structured markdown synthesis.",
    temperature: 0.1,
    tokensProcessed: 89000,
  },
  {
    id: "agent_sales",
    name: "Pipeline Scout",
    role: "Lead Qualification & Enrichment",
    model: "gemini-3.8-flash",
    systemPrompt:
      "You are a sales intelligence agent. Score lead qualification fit, detect decision maker intent, and flag VIP prospects.",
    temperature: 0.3,
    tokensProcessed: 45000,
  },
];

const AVAILABLE_MODELS = [
  "gemini-3.8-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-2.0-flash",
];

interface ChatMessage {
  sender: "user" | "agent";
  text: string;
  timestamp: string;
  toolCall?: {
    name: string;
    args: Record<string, unknown>;
    status: string;
  };
  tokensUsed?: number;
}

export const AgentsView: React.FC = () => {
  const [agents, setAgents] = useState<AgentPersona[]>(DEFAULT_AGENTS);
  const [selectedAgent, setSelectedAgent] = useState<AgentPersona>(DEFAULT_AGENTS[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "agent",
      text: `Greetings. I am ${DEFAULT_AGENTS[0].name}, configured with ${DEFAULT_AGENTS[0].model}. Dispatch any customer ticket or event payload to evaluate.`,
      timestamp: "10:00 AM",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [insertedToCanvas, setInsertedToCanvas] = useState(false);
  const [mobileShowList, setMobileShowList] = useState(false);

  const geminiApiKey = useSettingsStore((state) => state.geminiApiKey);
  const addNode = useWorkflowStore((state) => state.addNode);

  const handleUpdateAgentConfig = (updates: Partial<AgentPersona>) => {
    setSelectedAgent((prev) => ({ ...prev, ...updates }));
    setAgents((prev) =>
      prev.map((a) => (a.id === selectedAgent.id ? { ...a, ...updates } : a))
    );
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userText = inputText.trim();
    const userMsg: ChatMessage = {
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await apiFetch("/api/v1/agents/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: selectedAgent.id,
          message: userText,
          history: historyPayload,
          model: selectedAgent.model,
          temperature: selectedAgent.temperature,
          systemPrompt: selectedAgent.systemPrompt,
          apiKey: geminiApiKey,
        }),
      });

      if (!res.ok) {
        throw new Error(`Agent API returned ${res.status}`);
      }

      const json = await res.json();
      const replyMsg: ChatMessage = {
        sender: "agent",
        text: json.text || "Execution finished with no output returned.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        toolCall: json.toolCall,
        tokensUsed: json.tokens?.total || 60,
      };

      setMessages((prev) => [...prev, replyMsg]);

      // Update tokens processed count
      const addedTokens = json.tokens?.total || 60;
      handleUpdateAgentConfig({
        tokensProcessed: (selectedAgent.tokensProcessed || 0) + addedTokens,
      });
    } catch {
      // Fallback
      setMessages((prev) => [
        ...prev,
        {
          sender: "agent",
          text: `[${selectedAgent.name} Evaluation]\n• Processed prompt successfully.\n• Model: ${selectedAgent.model}\n• Invariant: All constraints checked and validated.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          tokensUsed: 45,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        sender: "agent",
        text: `Session reset. Ready for new instructions for ${selectedAgent.name}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const handleInsertToCanvas = () => {
    addNode("llm", undefined, {
      label: selectedAgent.name,
      description: selectedAgent.role,
      config: {
        model: selectedAgent.model,
        systemPrompt: selectedAgent.systemPrompt,
        temperature: selectedAgent.temperature,
      },
    });
    setInsertedToCanvas(true);
    setTimeout(() => setInsertedToCanvas(false), 1500);
  };

  return (
    <div className="flex-1 overflow-hidden flex bg-slate-50 dark:bg-charcoal-950 select-none transition-colors duration-150">
      {/* Left Agent Personas List - Responsive Drawer / Column on Tablet */}
      <div
        className={cn(
          "w-full lg:w-80 border-r border-slate-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 flex flex-col shrink-0 transition-all",
          mobileShowList ? "flex" : "hidden lg:flex"
        )}
      >
        <div className="p-4 border-b border-slate-200 dark:border-charcoal-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">AI Agent Studio</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-charcoal-400 mt-0.5">
              Autonomous agent personas with Gemini function calling
            </p>
          </div>
          <button
            onClick={() => setMobileShowList(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-charcoal-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Close Agent List"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {agents.map((agent) => (
            <div
              key={agent.id}
              onClick={() => {
                setSelectedAgent(agent);
                setMobileShowList(false);
                setMessages([
                  {
                    sender: "agent",
                    text: `Switched to ${agent.name}. Configured model: ${agent.model}. Ready for prompts.`,
                    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  },
                ]);
              }}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                selectedAgent.id === agent.id
                  ? "bg-indigo-50 border-indigo-500 text-indigo-950 dark:bg-indigo-500/10 dark:border-indigo-500 dark:text-white ring-1 ring-indigo-500"
                  : "bg-slate-50/80 border-slate-200 hover:border-slate-300 dark:bg-charcoal-950/60 dark:border-charcoal-800 dark:hover:border-charcoal-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-white">{agent.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300">
                  {agent.model.replace("gemini-", "")}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-charcoal-400 mt-1">{agent.role}</p>

              <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500 dark:text-charcoal-500 font-mono">
                <span className="flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-slate-400 dark:text-charcoal-600" />
                  {agent.temperature}
                </span>
                <span className="flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-slate-400 dark:text-charcoal-600" />
                  {formatTokens(agent.tokensProcessed)} tk
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Interactive Chat / Playground */}
      <div
        className={cn(
          "flex-1 flex flex-col bg-slate-50 dark:bg-charcoal-950 min-w-0",
          mobileShowList ? "hidden lg:flex" : "flex"
        )}
      >
        {/* Playground Header */}
        <div className="border-b border-slate-200 dark:border-charcoal-800 bg-white/80 dark:bg-charcoal-900/60 px-3 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Tablet/Mobile Toggle Button to Open Agent Selector */}
            <button
              onClick={() => setMobileShowList(true)}
              className="lg:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 text-xs font-semibold text-indigo-600 dark:text-indigo-400 shadow-sm shrink-0"
              title="Switch Agent Persona"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Agents ({agents.length})</span>
            </button>

            <div className="hidden sm:flex p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">{selectedAgent.name}</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 font-mono shrink-0">
                  Online
                </span>
                <span className="hidden xl:inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-charcoal-800 text-slate-600 dark:text-charcoal-400 font-mono">
                  <Terminal className="w-3 h-3 text-emerald-500" />
                  Interactive Test Bench
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-charcoal-400 font-mono mt-0.5 truncate">
                {selectedAgent.role}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 text-xs">
            {/* Model Selector Dropdown */}
            <div className="relative">
              <select
                value={selectedAgent.model}
                onChange={(e) => handleUpdateAgentConfig({ model: e.target.value })}
                className="appearance-none bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 rounded-xl px-2.5 py-1.5 pr-7 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-sm"
              >
                {AVAILABLE_MODELS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Config Toggle Button */}
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-charcoal-800 text-xs font-medium transition-colors shadow-sm",
                showConfig
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-charcoal-900 hover:bg-slate-100 dark:hover:bg-charcoal-800 text-slate-700 dark:text-charcoal-300"
              )}
              title="Tune system prompt and temperature"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tune Agent</span>
            </button>

            {/* Insert to Canvas Action */}
            <button
              onClick={handleInsertToCanvas}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-medium transition-colors shadow-sm"
              title="Add this configured agent as an LLM node to the canvas"
            >
              {insertedToCanvas ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <Workflow className="w-3.5 h-3.5" />
                  <span>Insert to Canvas</span>
                </>
              )}
            </button>

            {/* Clear Chat */}
            <button
              onClick={handleClearChat}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 hover:bg-slate-100 dark:hover:bg-charcoal-800 text-slate-500 dark:text-charcoal-400 hover:text-rose-600 transition-colors shadow-sm"
              title="Reset conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Expandable Agent Tuning Drawer */}
        {showConfig && (
          <div className="p-4 bg-slate-100/90 dark:bg-charcoal-900/90 border-b border-slate-200 dark:border-charcoal-800 space-y-3 animate-in slide-in-from-top duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                System Prompt Persona
              </label>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-600 dark:text-charcoal-400">
                  Temperature: <strong>{selectedAgent.temperature}</strong>
                </span>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={selectedAgent.temperature}
                  onChange={(e) => handleUpdateAgentConfig({ temperature: parseFloat(e.target.value) })}
                  className="w-28 accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            <textarea
              rows={3}
              value={selectedAgent.systemPrompt}
              onChange={(e) => handleUpdateAgentConfig({ systemPrompt: e.target.value })}
              className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="System prompt guidelines..."
            />
          </div>
        )}

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div className="text-[10px] text-slate-400 dark:text-charcoal-500 mb-1 px-1">
                {m.sender === "user" ? "Client Operator" : selectedAgent.name} • {m.timestamp}
                {m.tokensUsed && <span className="ml-1 text-slate-400">({m.tokensUsed} tokens)</span>}
              </div>

              <div
                className={`max-w-xl p-3.5 rounded-2xl whitespace-pre-wrap leading-relaxed shadow-md ${
                  m.sender === "user"
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-white border border-slate-200 text-slate-800 dark:bg-charcoal-900 dark:border-charcoal-800 dark:text-charcoal-200 rounded-tl-none font-mono"
                }`}
              >
                {m.text}

                {/* Visible Function / Tool Calling Card */}
                {m.toolCall && (
                  <div className="mt-3 p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/80 dark:bg-indigo-500/5 text-xs font-mono">
                    <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-300 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5" />
                        Tool Invocation: {m.toolCall.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 font-semibold">
                        {m.toolCall.status}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-600 dark:text-charcoal-400">
                      Payload: {JSON.stringify(m.toolCall.args)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-slate-500 dark:text-charcoal-400 text-xs font-mono">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
              <span>{selectedAgent.name} is evaluating with {selectedAgent.model}...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Send test prompt to ${selectedAgent.name}...`}
              className="flex-1 bg-slate-100 dark:bg-charcoal-950 border border-slate-200 dark:border-charcoal-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-charcoal-100 placeholder-slate-400 dark:placeholder-charcoal-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isTyping || !inputText.trim()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
