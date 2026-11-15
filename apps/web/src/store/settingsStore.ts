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

// ND-SEC-08: Protect BYOK API key by storing in ephemeral sessionStorage rather than long-term plaintext localStorage
const getStoredApiKey = (): string => {
  if (typeof window === "undefined") return "";
  try {
    const sessionKey = sessionStorage.getItem(STORAGE_KEY_API_KEY);
    if (sessionKey) return sessionKey;
    const legacyLocalKey = localStorage.getItem(STORAGE_KEY_API_KEY);
    if (legacyLocalKey) {
      sessionStorage.setItem(STORAGE_KEY_API_KEY, legacyLocalKey);
      localStorage.removeItem(STORAGE_KEY_API_KEY);
      return legacyLocalKey;
    }
  } catch {
    // Storage restricted
  }
  return "";
};

const storeApiKey = (key: string): void => {
  if (typeof window === "undefined") return;
  try {
    if (!key) {
      sessionStorage.removeItem(STORAGE_KEY_API_KEY);
      localStorage.removeItem(STORAGE_KEY_API_KEY);
    } else {
      sessionStorage.setItem(STORAGE_KEY_API_KEY, key);
      localStorage.removeItem(STORAGE_KEY_API_KEY);
    }
  } catch {
    // Storage restricted
  }
};

const getSavedTheme = (): ThemeMode => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    if (saved === "light" || saved === "dark") return saved;
  }
  return "dark";
};

export const useSettingsStore = create<SettingsState>((set) => ({
  geminiApiKey: getStoredApiKey(),
  executionMode: (typeof window !== "undefined" && (localStorage.getItem(STORAGE_KEY_EXEC_MODE) as ExecutionMode)) || "mock",
  theme: getSavedTheme(),
  workspaceId: "ws_default_production",
  isSettingsOpen: false,

  setGeminiApiKey: (key: string) => {
    storeApiKey(key);
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
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
    set({ theme });
  },

  setWorkspaceId: (id: string) => set({ workspaceId: id }),
  setIsSettingsOpen: (open: boolean) => set({ isSettingsOpen: open }),
}));
