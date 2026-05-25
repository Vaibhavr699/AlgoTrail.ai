import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark";

interface UIState {
  sidebarOpen: boolean;
  mobileSidebarOpen: boolean;
  searchOpen: boolean;
  theme: Theme;
  onboardingComplete: boolean;
  onboardingStep: number;
  toggleSidebar: () => void;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  setSearchOpen: (open: boolean) => void;
  setTheme: (theme: Theme) => void;
  setOnboardingStep: (step: number) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      mobileSidebarOpen: false,
      searchOpen: false,
      theme: "light",
      onboardingComplete: false,
      onboardingStep: 0,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      openMobileSidebar: () => set({ mobileSidebarOpen: true }),
      closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
      setSearchOpen: (open) => set({ searchOpen: open }),
      setTheme: (theme) => set({ theme }),
      setOnboardingStep: (step) => set({ onboardingStep: step }),
      completeOnboarding: () => set({ onboardingComplete: true, onboardingStep: -1 }),
      resetOnboarding: () => set({ onboardingComplete: false, onboardingStep: 0 }),
    }),
    { name: "algotrail-ui" }
  )
);
