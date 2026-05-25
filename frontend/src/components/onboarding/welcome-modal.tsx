"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, Target, Flame, BookOpen } from "lucide-react";
import { useUIStore } from "@/stores/ui.store";
import { AgentAvatar } from "./agent-avatar";

export function WelcomeModal() {
  const { onboardingComplete, onboardingStep, setOnboardingStep } = useUIStore();
  const [dismissed, setDismissed] = useState(false);

  if (onboardingComplete || onboardingStep !== 0 || dismissed) return null;

  const startTour = () => {
    setOnboardingStep(1);
  };

  const skipTour = () => {
    setDismissed(true);
    useUIStore.getState().completeOnboarding();
  };

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={skipTour} />
      <div className="relative w-full max-w-md rounded-3xl bg-[rgb(var(--card))] border border-[rgb(var(--border))] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Top decoration */}
        <div className="h-2 bg-gradient-to-r from-brand-400 via-emerald-400 to-brand-500" />

        <div className="px-6 pt-6 pb-2 text-center">
          <div className="flex justify-center mb-4">
            <AgentAvatar size="lg" pulse />
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Hey! I'm Aria
          </h2>
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">
            Your AI study guide on AlgoTrail
          </p>
        </div>

        <div className="px-6 py-4 space-y-3">
          <FeatureRow
            icon={<Target className="h-4 w-4 text-brand-500" />}
            title="Guided Roadmap"
            desc="I'll show you exactly which problem to solve next"
          />
          <FeatureRow
            icon={<Sparkles className="h-4 w-4 text-amber-500" />}
            title="AI Hints & Explanations"
            desc="Stuck? I'll give you progressive hints, not spoilers"
          />
          <FeatureRow
            icon={<Flame className="h-4 w-4 text-orange-500" />}
            title="Track Your Streak"
            desc="Build consistency — I'll keep you accountable"
          />
          <FeatureRow
            icon={<BookOpen className="h-4 w-4 text-blue-500" />}
            title="LeetCode Integration"
            desc="Read problems and take notes without leaving the app"
          />
        </div>

        <div className="px-6 pb-6 pt-2 space-y-2">
          <button
            onClick={startTour}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            Show me around
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <button
            onClick={skipTour}
            className="flex w-full items-center justify-center py-2 text-xs text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] transition-colors"
          >
            I'll explore on my own
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureRow({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3">
      <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-white dark:bg-gray-700 shadow-sm">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-[rgb(var(--muted))]">{desc}</p>
      </div>
    </div>
  );
}
