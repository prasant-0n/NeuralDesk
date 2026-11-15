import React, { useState } from "react";
import {
  Bot,
  Sparkles,
  Send,
  Loader2,
  Terminal,
  Cpu,
  Thermometer,
} from "lucide-react";
import { formatTokens } from "../../lib/utils";

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
    model: "gemini-1.5-flash",
    systemPrompt: "You are an automated support incident classifier. Categorize urgency, isolate user emotion, and produce structured action plans.",
    temperature: 0.2,
    tokensProcessed: 142000,
  },
  {
    id: "agent_research",
    name: "Synthesizer Pro",
    role: "Deep Research Analyst",
    model: "gemini-1.5-pro",
    systemPrompt: "You are an executive research agent specializing in deep engineering analysis, architecture trade-offs, and structured markdown synthesis.",
    temperature: 0.1,
    tokensProcessed: 89000,
  },
  {
    id: "agent_sales",
    name: "Pipeline Scout",
    role: "Lead Qualification & Enrichment",
    model: "gemini-1.5-flash",
    systemPrompt: "You are a sales intelligence agent. Score lead qualification fit, detect decision maker intent, and flag VIP prospects.",
    temperature: 0.3,
    tokensProcessed: 45000,
  },
];

interface ChatMessage {
  sender: "user" | "agent";
  text: string;
  timestamp: string;
}

export const AgentsView: React.FC = () => {
  const [agents] = useState<AgentPersona[]>(DEFAULT_AGENTS);
  const [selectedAgent, setSelectedAgent] = useState<AgentPersona>(DEFAULT_AGENTS[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "agent",
      text: "Greetings. I am Triage Sentinel, powered by Gemini 1.5 Flash. Dispatch any customer ticket or event payload to evaluate.",
      timestamp: "10:00 AM",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      sender: "user",
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Simulate Agent Cognitive Reasoning & Response
    setTimeout(() => {
      const responses: Record<string, string> = {
        agent_triage: `[Triage Evaluation]
• Intent: Urgent Infrastructure Issue
• Urgency Rating: 5/5
• Sentiment: NEGATIVE
• Recommended Action: Escalate to Level 3 DevOps channel via Slack Pager webhook.`,
        agent_research: `[Technical Synthesis]
1. Core Architectural Invariant: Directed Acyclic Graph (DAG) validation via Kahn's algorithm guarantees absence of circular wait dependencies.
2. Token Economics: Zero-leak server proxy yields 65% cost efficiency over unmonitored SDK calls.`,
        agent_sales: `[Lead Intent Score: 92/100]
• Category: Enterprise Tier 1
• Decision Maker Identified: VP of Engineering
• Recommendation: Fast-track to Account Executive demo calendar.`,
      };

      const replyText = responses[selectedAgent.id] || "Instruction processed successfully.";

      setMessages((prev) => [
        ...prev,
        {
          sender: "agent",
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="flex-1 overflow-hidden flex bg-charcoal-950 select-none">
      {/* Left Agent Personas List */}
      <div className="w-80 border-r border-charcoal-800 bg-charcoal-900 flex flex-col">
        <div className="p-4 border-b border-charcoal-800">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-white">AI Agent Studio</h2>
          </div>
          <p className="text-xs text-charcoal-400 mt-0.5">Autonomous agents configured with Gemini intelligence</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {agents.map((agent) => (
            <div
              key={agent.id}
              onClick={() => {
                setSelectedAgent(agent);
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
                  ? "bg-indigo-500/10 border-indigo-500 ring-1 ring-indigo-500"
                  : "bg-charcoal-950/60 border-charcoal-800 hover:border-charcoal-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white">{agent.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                  {agent.model}
                </span>
              </div>
              <p className="text-[11px] text-charcoal-400 mt-1">{agent.role}</p>

              <div className="flex items-center gap-3 mt-2 text-[10px] text-charcoal-500 font-mono">
                <span className="flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-charcoal-600" />
                  {agent.temperature}
                </span>
                <span className="flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-charcoal-600" />
                  {formatTokens(agent.tokensProcessed)} tk
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Interactive Chat / Playground */}
      <div className="flex-1 flex flex-col bg-charcoal-950">
        {/* Playground Header */}
        <div className="h-14 border-b border-charcoal-800 bg-charcoal-900/60 px-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">{selectedAgent.name}</h3>
              <p className="text-[10px] text-charcoal-400 font-mono">
                {selectedAgent.model} • Temp {selectedAgent.temperature}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-charcoal-400">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Interactive Test Bench</span>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div className="text-[10px] text-charcoal-500 mb-1 px-1">
                {m.sender === "user" ? "Client Operator" : selectedAgent.name} • {m.timestamp}
              </div>
              <div
                className={`max-w-xl p-3.5 rounded-2xl whitespace-pre-wrap leading-relaxed shadow-lg ${
                  m.sender === "user"
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-charcoal-900 border border-charcoal-800 text-charcoal-200 rounded-tl-none font-mono"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-charcoal-400 text-xs font-mono">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span>{selectedAgent.name} is reasoning...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 border-t border-charcoal-800 bg-charcoal-900">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Send test prompt to ${selectedAgent.name}...`}
              className="flex-1 bg-charcoal-950 border border-charcoal-800 rounded-xl px-4 py-2.5 text-xs text-charcoal-100 placeholder-charcoal-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isTyping || !inputText.trim()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
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
