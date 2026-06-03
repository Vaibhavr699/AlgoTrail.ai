import { create } from "zustand";
import type { ExplainProblemResult } from "@/types";

interface ExplainState {
  url: string;
  result: ExplainProblemResult | null;
  step: number;
  setUrl: (url: string) => void;
  setResult: (result: ExplainProblemResult) => void;
  setStep: (step: number) => void;
  reset: () => void;
}

// In-memory store (mirrors chat.store.ts) so the explainer's input, result, and
// walkthrough step survive navigating away from /explain and back.
export const useExplainStore = create<ExplainState>()((set) => ({
  url: "",
  result: null,
  step: 0,

  setUrl: (url) => set({ url }),
  // A fresh explanation always starts the walkthrough from step 0.
  setResult: (result) => set({ result, step: 0 }),
  setStep: (step) => set({ step }),
  reset: () => set({ url: "", result: null, step: 0 }),
}));
