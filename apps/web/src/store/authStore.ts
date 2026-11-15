import { create } from "zustand";

export type AuthTab = "signin" | "signup" | "demo";

export interface CustomUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthState {
  isAuthModalOpen: boolean;
  activeTab: AuthTab;
  customUser: CustomUser | null;

  setIsAuthModalOpen: (open: boolean) => void;
  setActiveTab: (tab: AuthTab) => void;
  setCustomUser: (user: CustomUser | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthModalOpen: false,
  activeTab: "signin",
  customUser: null,

  setIsAuthModalOpen: (open) => set({ isAuthModalOpen: open }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setCustomUser: (user) => set({ customUser: user }),
}));
