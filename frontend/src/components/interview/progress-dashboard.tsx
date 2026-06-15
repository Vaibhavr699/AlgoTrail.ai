"use client";

import { Check, Bookmark, CircleDashed, Trophy, Sparkles } from "lucide-react";
import type { InterviewCategoryOut } from "@/types";

function Ring({ pct }: { pct: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 80 80" className="h-24 w-24 -rotate-90">
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          strokeWidth="8"
          className="stroke-gray-100 dark:stroke-gray-800"
        />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className="stroke-brand-500 transition-[stroke-dashoffset] duration-700 ease-out"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold tabular-nums">{pct}%</span>
        <span className="text-[10px] uppercase tracking-wide text-[rgb(var(--muted))]">done</span>
      </div>
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
  className,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  className?: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${className}`}>
        {icon}
      </div>
      <div className="leading-tight">
        <div className="text-lg font-semibold tabular-nums">{value}</div>
        <div className="text-[11px] text-[rgb(var(--muted))]">{label}</div>
      </div>
    </div>
  );
}

export function ProgressDashboard({
  categories,
  signedIn,
}: {
  categories: InterviewCategoryOut[];
  signedIn: boolean;
}) {
  const totalQuestions = categories.reduce((s, c) => s + c.question_count, 0);
  const totalReviewed = categories.reduce((s, c) => s + c.reviewed_count, 0);
  const totalBookmarked = categories.reduce((s, c) => s + c.bookmarked_count, 0);
  const remaining = Math.max(0, totalQuestions - totalReviewed);
  const pct = totalQuestions ? Math.round((totalReviewed / totalQuestions) * 100) : 0;

  const completedCats = categories.filter(
    (c) => c.question_count > 0 && c.reviewed_count >= c.question_count
  ).length;
  const startedCats = categories.filter((c) => c.reviewed_count > 0).length;
  const allDone = totalQuestions > 0 && totalReviewed >= totalQuestions;

  return (
    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Ring pct={pct} />
          <div>
            <p className="text-sm font-semibold">Your progress</p>
            <p className="mt-0.5 text-xs text-[rgb(var(--muted))]">
              {signedIn
                ? `${totalReviewed} of ${totalQuestions} questions reviewed`
                : "Sign in to track your progress"}
            </p>
            {signedIn && startedCats > 0 && (
              <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-brand-600">
                {allDone ? (
                  <>
                    <Trophy className="h-3.5 w-3.5" /> All categories complete — nice work!
                  </>
                ) : completedCats > 0 ? (
                  <>
                    <Sparkles className="h-3.5 w-3.5" /> {completedCats} categor
                    {completedCats === 1 ? "y" : "ies"} completed · {startedCats} in progress
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" /> {startedCats} categor
                    {startedCats === 1 ? "y" : "ies"} in progress
                  </>
                )}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 sm:ml-auto">
          <Stat
            icon={<Check className="h-4 w-4 text-brand-600" />}
            value={totalReviewed}
            label="Reviewed"
            className="bg-brand-50 dark:bg-brand-900/30"
          />
          <Stat
            icon={<Bookmark className="h-4 w-4 text-amber-600" />}
            value={totalBookmarked}
            label="Saved"
            className="bg-amber-50 dark:bg-amber-900/20"
          />
          <Stat
            icon={<CircleDashed className="h-4 w-4 text-[rgb(var(--muted))]" />}
            value={remaining}
            label="Remaining"
            className="bg-gray-100 dark:bg-gray-800"
          />
        </div>
      </div>
    </div>
  );
}
