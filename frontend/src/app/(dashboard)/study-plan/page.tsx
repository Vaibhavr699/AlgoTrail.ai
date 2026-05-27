"use client";

import { useState } from "react";
import { CalendarDays, Clock, Lightbulb, Target, BookOpen, Sparkles } from "lucide-react";
import { TopNav } from "@/components/layout/top-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DotsLoader } from "@/components/ui/dots-loader";
import { useGenerateStudyPath } from "@/hooks/use-dsa";
import type { AIStudyPath } from "@/types";

const WEEK_OPTIONS = [4, 6, 8, 12, 16];

export default function StudyPlanPage() {
  const [goal, setGoal] = useState("");
  const [weeks, setWeeks] = useState(8);
  const generatePath = useGenerateStudyPath();
  const plan: AIStudyPath | undefined = generatePath.data as AIStudyPath | undefined;

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!goal.trim()) return;
    generatePath.mutate({ goal: goal.trim(), weeks });
  }

  return (
    <>
      <TopNav title="Study Plan" />
      <div className="flex-1 p-6 max-w-5xl w-full mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-brand-500" />
            Study Plan Generator
          </h1>
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">
            Get a personalized, AI-generated study plan tailored to your goal and timeline.
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardContent className="p-5">
            <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="FAANG interview in 8 weeks"
                className="flex-1 h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-3 text-sm placeholder:text-[rgb(var(--muted))] focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
              <select
                value={weeks}
                onChange={(e) => setWeeks(Number(e.target.value))}
                className="h-10 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent sm:w-40"
              >
                {WEEK_OPTIONS.map((w) => (
                  <option key={w} value={w}>
                    {w} weeks
                  </option>
                ))}
              </select>
              <Button
                type="submit"
                disabled={!goal.trim() || generatePath.isPending}
                className="sm:w-auto"
              >
                {generatePath.isPending ? (
                  <>
                    Generating <DotsLoader size="sm" className="ml-1" />
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Plan
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Loading state */}
        {generatePath.isPending && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <DotsLoader size="lg" className="text-brand-500" />
            <p className="text-sm text-[rgb(var(--muted))]">
              Crafting your personalized study plan...
            </p>
          </div>
        )}

        {/* Error state */}
        {generatePath.isError && (
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="p-5">
              <p className="text-sm text-red-600 dark:text-red-400">
                Failed to generate study plan. Please try again.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Result */}
        {plan && !generatePath.isPending && (
          <div className="space-y-6">
            {/* Title & Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-brand-500" />
                  {plan.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[rgb(var(--muted))] leading-relaxed">
                  {plan.summary}
                </p>
              </CardContent>
            </Card>

            {/* Weekly Cards */}
            <div>
              <h2 className="text-lg font-semibold tracking-tight mb-4 flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-brand-500" />
                Weekly Breakdown
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {plan.weeks.map((w) => (
                  <Card key={w.week} className="overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3 border-b border-[rgb(var(--border))] bg-brand-50/50 dark:bg-brand-900/10">
                      <span className="text-sm font-semibold text-brand-700 dark:text-brand-300">
                        Week {w.week}
                      </span>
                      <span className="text-xs text-[rgb(var(--muted))] flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {w.daily_hours}h / day
                      </span>
                    </div>
                    <CardContent className="p-5 space-y-3">
                      <div>
                        <p className="text-sm font-medium">{w.theme}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[rgb(var(--muted))] uppercase tracking-wide mb-1.5">
                          Topics
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {w.topics.map((t) => (
                            <span
                              key={t}
                              className="inline-block text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 border border-brand-200 dark:border-brand-800"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      {w.focus_areas.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-[rgb(var(--muted))] uppercase tracking-wide mb-1.5">
                            Focus Areas
                          </p>
                          <ul className="text-xs text-[rgb(var(--muted))] space-y-0.5">
                            {w.focus_areas.map((fa) => (
                              <li key={fa} className="flex items-start gap-1.5">
                                <span className="text-brand-500 mt-0.5">-</span>
                                {fa}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {w.tips && (
                        <div className="flex items-start gap-2 rounded-md bg-amber-50/60 dark:bg-amber-900/10 px-3 py-2 border border-amber-200/60 dark:border-amber-800/40">
                          <Lightbulb className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                            {w.tips}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Daily Routine */}
            <div>
              <h2 className="text-lg font-semibold tracking-tight mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-brand-500" />
                Daily Routine
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: "Warmup", value: plan.daily_routine.warmup, color: "text-green-500" },
                  { label: "Main Practice", value: plan.daily_routine.main_practice, color: "text-brand-500" },
                  { label: "Review", value: plan.daily_routine.review, color: "text-purple-500" },
                ].map((item) => (
                  <Card key={item.label}>
                    <CardContent className="p-5">
                      <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${item.color}`}>
                        {item.label}
                      </p>
                      <p className="text-sm text-[rgb(var(--foreground))] leading-relaxed">
                        {item.value}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Final Advice */}
            <Card className="border-brand-200 dark:border-brand-800">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center shrink-0">
                    <Sparkles className="h-4 w-4 text-brand-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-1">Final Advice</p>
                    <p className="text-sm text-[rgb(var(--muted))] leading-relaxed">
                      {plan.advice}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
