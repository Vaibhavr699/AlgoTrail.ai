"use client";

import { useEffect, useState, useCallback } from "react";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { useUIStore } from "@/stores/ui.store";
import { AgentAvatar } from "./agent-avatar";
import { cn } from "@/lib/utils";

export interface TourStep {
  target: string;
  title: string;
  message: string;
  position?: "top" | "bottom" | "left" | "right";
}

const AGENT_NAME = "Aria";

export function OnboardingTour({ steps }: { steps: TourStep[] }) {
  const { onboardingComplete, onboardingStep, setOnboardingStep, completeOnboarding } = useUIStore();
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [visible, setVisible] = useState(false);

  const currentStep = steps[onboardingStep];

  const updatePosition = useCallback(() => {
    if (!currentStep) return;
    const el = document.querySelector(`[data-tour="${currentStep.target}"]`);
    if (el) {
      setRect(el.getBoundingClientRect());
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [currentStep]);

  useEffect(() => {
    if (onboardingComplete || onboardingStep < 0 || onboardingStep >= steps.length) return;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [onboardingComplete, onboardingStep, steps.length, updatePosition]);

  if (onboardingComplete || onboardingStep < 0 || onboardingStep >= steps.length) return null;
  if (!currentStep) return null;

  const pos = currentStep.position || "bottom";

  const next = () => {
    if (onboardingStep >= steps.length - 1) {
      completeOnboarding();
    } else {
      setOnboardingStep(onboardingStep + 1);
    }
  };

  const prev = () => {
    if (onboardingStep > 0) setOnboardingStep(onboardingStep - 1);
  };

  const tooltipStyle = getTooltipPosition(rect, pos);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[9998] bg-black/40 transition-opacity duration-300" />

      {/* Spotlight cutout */}
      {rect && visible && (
        <div
          className="fixed z-[9999] rounded-lg ring-4 ring-brand-400/60 transition-all duration-300 pointer-events-none"
          style={{
            top: rect.top - 4,
            left: rect.left - 4,
            width: rect.width + 8,
            height: rect.height + 8,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.4)",
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="fixed z-[10000] w-80 transition-all duration-300"
        style={tooltipStyle}
      >
        <div className="rounded-2xl bg-[rgb(var(--card))] border border-[rgb(var(--border))] shadow-2xl overflow-hidden">
          {/* Agent header */}
          <div className="flex items-center gap-3 px-4 pt-4 pb-2">
            <AgentAvatar size="sm" pulse />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{AGENT_NAME}</p>
              <p className="text-[10px] text-[rgb(var(--muted))]">Your AI Study Guide</p>
            </div>
            <button
              onClick={completeOnboarding}
              className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Skip tour"
            >
              <X className="h-3.5 w-3.5 text-[rgb(var(--muted))]" />
            </button>
          </div>

          {/* Content */}
          <div className="px-4 pb-3">
            <h4 className="text-sm font-semibold text-[rgb(var(--foreground))]">{currentStep.title}</h4>
            <p className="mt-1 text-xs text-[rgb(var(--muted))] leading-relaxed">{currentStep.message}</p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-[rgb(var(--border))] px-4 py-2.5 bg-gray-50/50 dark:bg-gray-900/30">
            <div className="flex items-center gap-1">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === onboardingStep ? "w-4 bg-brand-500" : "w-1.5 bg-gray-300 dark:bg-gray-600"
                  )}
                />
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              {onboardingStep > 0 && (
                <button
                  onClick={prev}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-[rgb(var(--muted))] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <ChevronLeft className="h-3 w-3" />
                  Back
                </button>
              )}
              <button
                onClick={next}
                className="inline-flex items-center gap-1 rounded-lg bg-brand-500 text-white px-3 py-1 text-xs font-medium hover:bg-brand-600 transition-colors"
              >
                {onboardingStep >= steps.length - 1 ? (
                  <>
                    Let's go!
                    <Sparkles className="h-3 w-3" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-3 w-3" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function getTooltipPosition(rect: DOMRect | null, position: string): React.CSSProperties {
  if (!rect) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

  const gap = 16;
  switch (position) {
    case "top":
      return { top: rect.top - gap, left: rect.left + rect.width / 2, transform: "translate(-50%, -100%)" };
    case "bottom":
      return { top: rect.bottom + gap, left: Math.min(rect.left + rect.width / 2, window.innerWidth - 180), transform: "translateX(-50%)" };
    case "left":
      return { top: rect.top + rect.height / 2, left: rect.left - gap, transform: "translate(-100%, -50%)" };
    case "right":
      return { top: rect.top + rect.height / 2, left: rect.right + gap, transform: "translateY(-50%)" };
    default:
      return { top: rect.bottom + gap, left: rect.left + rect.width / 2, transform: "translateX(-50%)" };
  }
}
