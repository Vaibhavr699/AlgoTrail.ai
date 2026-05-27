import { create } from "zustand";
import type { ChatMessage } from "@/types";

interface ChatState {
  histories: Record<string, ChatMessage[]>;
  getMessages: (patternName: string) => ChatMessage[];
  setMessages: (patternName: string, messages: ChatMessage[]) => void;
  clearChat: (patternName: string) => void;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  histories: {},

  getMessages: (patternName) => {
    return get().histories[patternName] ?? [];
  },

  setMessages: (patternName, messages) => {
    set((s) => ({
      histories: { ...s.histories, [patternName]: messages },
    }));
  },

  clearChat: (patternName) => {
    set((s) => {
      const next = { ...s.histories };
      delete next[patternName];
      return { histories: next };
    });
  },
}));
