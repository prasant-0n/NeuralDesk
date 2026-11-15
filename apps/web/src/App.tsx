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
