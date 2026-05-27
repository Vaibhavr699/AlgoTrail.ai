import { create } from "zustand";
import type { Status } from "@/types";

interface ProgressEntry {
  questionId: string;
  status: Status;
  solvedAt: string | null;
  attempts: number;
  timeSpent: number;
}

interface ProgressState {
  byQuestion: Map<string, ProgressEntry>;
  lastSynced: number | null;

  setProgress: (entries: ProgressEntry[]) => void;
  updateQuestion: (questionId: string, status: Status, timeSpent?: number) => void;
  getStatus: (questionId: string) => Status;
  getSolvedCount: () => number;
  getSolvedIds: () => Set<string>;
  markSynced: () => void;
}

export const useProgressStore = create<ProgressState>()((set, get) => ({
  byQuestion: new Map(),
  lastSynced: null,

  setProgress: (entries) => {
    const map = new Map<string, ProgressEntry>();
    for (const e of entries) map.set(e.questionId, e);
    set({ byQuestion: map, lastSynced: Date.now() });
  },

  updateQuestion: (questionId, status, timeSpent) => {
    const current = get().byQuestion.get(questionId);
    const updated: ProgressEntry = {
      questionId,
      status,
      solvedAt: status === "SOLVED" ? new Date().toISOString() : (current?.solvedAt ?? null),
      attempts: (current?.attempts ?? 0) + (status === "SOLVED" ? 1 : 0),
      timeSpent: timeSpent ?? current?.timeSpent ?? 0,
    };
    const next = new Map(get().byQuestion);
    next.set(questionId, updated);
    set({ byQuestion: next });
  },

  getStatus: (questionId) => {
    return get().byQuestion.get(questionId)?.status ?? "NOT_STARTED";
  },

  getSolvedCount: () => {
    let count = 0;
    get().byQuestion.forEach((e) => {
      if (e.status === "SOLVED") count++;
    });
    return count;
  },

  getSolvedIds: () => {
    const ids = new Set<string>();
    get().byQuestion.forEach((e) => {
      if (e.status === "SOLVED") ids.add(e.questionId);
    });
    return ids;
  },

  markSynced: () => set({ lastSynced: Date.now() }),
}));
