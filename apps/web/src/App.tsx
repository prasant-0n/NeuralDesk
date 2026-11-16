import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";
import { LandingPage } from "./pages/LandingPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

/**
 * Primary Studio Workspace (Canvas, Workflows, Agents, Executions)
 * Accessible directly on / and /studio.
 */
const StudioWorkspace: React.FC = () => {
  const [activeView, setActiveView] = useState<NavView>("canvas");

  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 dark:bg-charcoal-950 text-slate-900 dark:text-charcoal-100 antialiased select-none transition-colors duration-150">
        {/* Top Universal Header with Auth Status & Navigation */}
        <Header activeView={activeView} />

        {/* Main App Workspace */}
        <div className="flex flex-1 overflow-hidden">
          {/* Primary Navigation Sidebar */}
          <Sidebar activeView={activeView} onSelectView={setActiveView} />

          {/* Dynamic View Router */}
          <main className="flex-1 flex overflow-hidden bg-slate-50 dark:bg-charcoal-950">
            {activeView === "canvas" && <CanvasView />}
            {activeView === "dashboard" && (
              <DashboardView onNavigateToCanvas={() => setActiveView("canvas")} />
            )}
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
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Landing Page (World-Class Conversion Showcase) */}
          <Route path="/" element={<LandingPage />} />

          {/* Primary Studio Workspace (Canvas, Workflows, Agents, Executions) */}
          <Route path="/studio" element={<StudioWorkspace />} />
          <Route path="/workspace" element={<StudioWorkspace />} />
          <Route path="/canvas" element={<StudioWorkspace />} />

          {/* Dedicated Production Authentication Routes */}
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/login" element={<Navigate to="/signin" replace />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/sign-up" element={<Navigate to="/signup" replace />} />

          {/* Fallback to Root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
