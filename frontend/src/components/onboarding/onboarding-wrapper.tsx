"use client";

import { usePathname } from "next/navigation";
import { WelcomeModal } from "./welcome-modal";
import { OnboardingTour, TourStep } from "./onboarding-tour";
import { AgentBubble } from "./agent-bubble";

const DASHBOARD_STEPS: TourStep[] = [
  {
    target: "stats-row",
    title: "Your Progress at a Glance",
    message: "These cards show your overall progress — problems solved, current streak, topics started, and this week's activity. Your goal: keep that streak alive!",
    position: "bottom",
  },
  {
    target: "next-up",
    title: "What to Solve Next",
    message: "Aria picks the next problem for you based on the optimal learning order. No more scrolling through random lists — just click and start solving.",
    position: "bottom",
  },
  {
    target: "readiness",
    title: "Interview Readiness",
    message: "This shows how prepared you are across 4 key categories. Your target: get all bars above 70% before your interview.",
    position: "right",
  },
  {
    target: "topic-grid",
    title: "Topic Progress",
    message: "Each card represents a topic in the roadmap. Click any topic to see its problems. Topics are ordered so each one builds on the last.",
    position: "top",
  },
  {
    target: "sidebar-nav",
    title: "Navigate the App",
    message: "Use the sidebar to jump between Dashboard, Roadmap, Stats, and Settings. The Roadmap shows the full learning path with locked/unlocked topics.",
    position: "right",
  },
];

export function OnboardingWrapper() {
  const pathname = usePathname();

  const isDashboard = pathname === "/dashboard";

  return (
    <>
      {isDashboard && <WelcomeModal />}
      {isDashboard && <OnboardingTour steps={DASHBOARD_STEPS} />}
      <AgentBubble />
    </>
  );
}
