import React from "react";
import { Sparkles, Shield, Cpu, Eye, ChevronRight } from "lucide-react";
import { useAuthStore, type CustomUser } from "../../store/authStore";
import { useNavigate } from "react-router-dom";

export const DEMO_PERSONAS = [
  {
    role: "owner",
    name: "System Administrator",
    email: "admin@neuraldesk.io",
    badge: "Owner • Full Access",
    icon: Shield,
    color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  },
  {
    role: "member",
    name: "Lead AI Engineer",
    email: "engineer@neuraldesk.io",
    badge: "Member • Workflows",
    icon: Cpu,
    color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    role: "viewer",
    name: "Compliance Auditor",
    email: "auditor@neuraldesk.io",
    badge: "Viewer • Audit Only",
    icon: Eye,
    color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
];

interface DemoPersonaPickerProps {
  onSuccessRedirect?: string;
}

export const DemoPersonaPicker: React.FC<DemoPersonaPickerProps> = ({
  onSuccessRedirect = "/",
}) => {
  const setCustomUser = useAuthStore((state) => state.setCustomUser);
  const navigate = useNavigate();

  const handleSelect = (p: (typeof DEMO_PERSONAS)[0]) => {
    const user: CustomUser = {
      id: `usr_${p.role}_demo`,
      name: p.name,
      email: p.email,
      role: p.role,
    };
    setCustomUser(user);
    navigate(onSuccessRedirect);
  };

  return (
    <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-charcoal-800">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-charcoal-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          1-Click Instant Evaluation
        </span>
        <span className="text-[10px] text-slate-400 dark:text-charcoal-500">
          No sign up required
        </span>
      </div>

      <div className="grid grid-cols-1 gap-1.5">
        {DEMO_PERSONAS.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.role}
              type="button"
              onClick={() => handleSelect(p)}
              className="w-full flex items-center justify-between p-2 rounded-xl border border-slate-200/80 dark:border-charcoal-800 bg-slate-50/70 dark:bg-charcoal-950/40 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`p-1.5 rounded-lg border ${p.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-slate-800 dark:text-charcoal-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {p.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-charcoal-400">
                    {p.email}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${p.color}`}>
                  {p.badge}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
