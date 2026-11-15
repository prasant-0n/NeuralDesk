import { create } from "zustand";

export type AuthTab = "signin" | "signup" | "demo";

export interface CustomUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

const STORAGE_KEY_PERSONA = "neuraldesk_auth_persona";

const getSavedPersona = (): CustomUser | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PERSONA);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
};

interface AuthState {
  isAuthModalOpen: boolean;
  activeTab: AuthTab;
  customUser: CustomUser | null;

  setIsAuthModalOpen: (open: boolean) => void;
  setActiveTab: (tab: AuthTab) => void;
  setCustomUser: (user: CustomUser | null) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthModalOpen: false,
  activeTab: "signin",
  customUser: getSavedPersona(),

  setIsAuthModalOpen: (open) => set({ isAuthModalOpen: open }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setCustomUser: (user) => {
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem(STORAGE_KEY_PERSONA, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY_PERSONA);
      }
    }
    set({ customUser: user });
  },
  signOut: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY_PERSONA);
    }
    set({ customUser: null });
  },
}));
