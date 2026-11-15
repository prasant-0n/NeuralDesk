import { create } from "zustand";

export type ExecutionMode = "live" | "mock";
export type ThemeMode = "dark" | "light";

interface SettingsState {
  geminiApiKey: string;
  executionMode: ExecutionMode;
  theme: ThemeMode;
  workspaceId: string;
  isSettingsOpen: boolean;

  setGeminiApiKey: (key: string) => void;
  setExecutionMode: (mode: ExecutionMode) => void;
  setTheme: (theme: ThemeMode) => void;
  setWorkspaceId: (id: string) => void;
  setIsSettingsOpen: (open: boolean) => void;
}

const STORAGE_KEY_API_KEY = "neuraldesk_byok_gemini_key";
const STORAGE_KEY_EXEC_MODE = "neuraldesk_exec_mode";
const STORAGE_KEY_THEME = "neuraldesk_theme";

export const useSettingsStore = create<SettingsState>((set) => ({
  geminiApiKey: typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY_API_KEY) || "" : "",
  executionMode: (typeof window !== "undefined" && (localStorage.getItem(STORAGE_KEY_EXEC_MODE) as ExecutionMode)) || "mock",
  theme: (typeof window !== "undefined" && (localStorage.getItem(STORAGE_KEY_THEME) as ThemeMode)) || "dark",
  workspaceId: "ws_default_production",
  isSettingsOpen: false,

  setGeminiApiKey: (key: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_API_KEY, key);
    }
    set({ geminiApiKey: key });
  },

  setExecutionMode: (mode: ExecutionMode) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_EXEC_MODE, mode);
    }
    set({ executionMode: mode });
  },

  setTheme: (theme: ThemeMode) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      }
    }
    set({ theme });
  },

  setWorkspaceId: (id: string) => set({ workspaceId: id }),
  setIsSettingsOpen: (open: boolean) => set({ isSettingsOpen: open }),
}));
