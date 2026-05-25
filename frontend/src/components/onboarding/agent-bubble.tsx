"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useUIStore } from "@/stores/ui.store";
import { AgentAvatar } from "./agent-avatar";
import { cn } from "@/lib/utils";

const TIPS = [
  "Try solving one problem a day — consistency beats intensity.",
  "Start with Easy problems to build your pattern recognition.",
  "Use the AI Hints feature when stuck — nudges help you learn better than answers.",
  "Review problems you've solved after a week. Spaced repetition works!",
  "Focus on understanding the pattern, not memorizing the solution.",
  "Check your Interview Readiness score on the Stats page.",
  "Take notes on every problem — your future self will thank you.",
  "The roadmap follows the optimal topic order. Trust the path!",
];

export function AgentBubble() {
  const { onboardingComplete } = useUIStore();
  const [open, setOpen] = useState(false);
  const [tipIndex] = useState(() => Math.floor(Math.random() * TIPS.length));

  if (!onboardingComplete) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Popup */}
      {open && (
        <div className="absolute bottom-16 right-0 w-72 rounded-2xl bg-[rgb(var(--card))] border border-[rgb(var(--border))] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200">
          <div className="flex items-center gap-2 px-4 pt-3 pb-2">
            <AgentAvatar size="sm" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Aria</p>
              <p className="text-[10px] text-[rgb(var(--muted))]">Quick Tip</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-3.5 w-3.5 text-[rgb(var(--muted))]" />
            </button>
          </div>

          <div className="px-4 pb-3">
            <p className="text-xs text-[rgb(var(--muted))] leading-relaxed">{TIPS[tipIndex]}</p>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "group h-12 w-12 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95",
          open
            ? "bg-gray-200 dark:bg-gray-700"
            : "bg-brand-500 hover:bg-brand-600"
        )}
        aria-label="Talk to Aria"
      >
        {open ? (
          <X className="h-5 w-5 text-[rgb(var(--foreground))]" />
        ) : (
          <AgentAvatar size="sm" className="pointer-events-none" />
        )}
      </button>
    </div>
  );
}
