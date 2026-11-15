import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactFlowProvider } from "@xyflow/react";
import { Header } from "./components/layout/Header";
import { Sidebar, type NavView } from "./components/layout/Sidebar";
import { CanvasView } from "./components/views/CanvasView";
import { DashboardView } from "./components/views/DashboardView";
import { ExecutionsView } from "./components/views/ExecutionsView";
import { AgentsView } from "./components/views/AgentsView";
import { PromptsView } from "./components/views/PromptsView";
import { SettingsModal } from "./components/views/SettingsModal";
import { AuthModal } from "./components/auth/AuthModal";
import { LoginView } from "./components/auth/LoginView";
import { authClient } from "./lib/authClient";
import { useAuthStore } from "./store/authStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<NavView>("canvas");
  const { data: sessionData, isPending } = authClient.useSession();
  const customUser = useAuthStore((state) => state.customUser);

  const isAuthenticated = Boolean(sessionData?.user || customUser);

  // If session is checking on initial page load, display quick loader
  if (isPending && !customUser) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-charcoal-950 text-slate-900 dark:text-white select-none">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 animate-pulse mb-4">
          <svg className="w-6 h-6 text-white fill-white" viewBox="0 0 24 24">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
        <p className="text-sm font-bold tracking-tight text-slate-800 dark:text-charcoal-200">
          NeuralDesk
        </p>
        <p className="text-xs font-mono text-slate-400 dark:text-charcoal-500 mt-1">
          Verifying security session...
        </p>
      </div>
    );
  }

  // Mandatory Authentication Gate: If not authenticated, render LoginView
  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ReactFlowProvider>
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 dark:bg-charcoal-950 text-slate-900 dark:text-charcoal-100 antialiased select-none transition-colors duration-150">
          {/* Top Universal Header */}
          <Header activeView={activeView} />

          {/* Main App Workspace */}
          <div className="flex flex-1 overflow-hidden">
            {/* Primary Navigation Sidebar */}
            <Sidebar activeView={activeView} onSelectView={setActiveView} />

            {/* Dynamic View Router */}
            <main className="flex-1 flex overflow-hidden bg-slate-50 dark:bg-charcoal-950">
              {activeView === "canvas" && <CanvasView />}
              {activeView === "dashboard" && <DashboardView onNavigateToCanvas={() => setActiveView("canvas")} />}
              {activeView === "executions" && <ExecutionsView />}
              {activeView === "agents" && <AgentsView />}
              {activeView === "prompts" && <PromptsView />}
            </main>
          </div>

          {/* Global Settings & BYOK Modal */}
          <SettingsModal />

          {/* Better Auth Modal */}
          <AuthModal />
        </div>
      </ReactFlowProvider>
    </QueryClientProvider>
  );
};
