"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Check, Lock, ChevronRight } from "lucide-react";
import { TopNav } from "@/components/layout/top-nav";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PatternTag } from "@/components/topic/pattern-tag";
import { useStats, useTopics } from "@/hooks/use-dsa";
import { cn, pct } from "@/lib/utils";

const UNLOCK_THRESHOLD = 0.3;

export default function RoadmapPage() {
  const topics = useTopics();
  const stats = useStats();

  const items = useMemo(() => {
    if (!topics.data) return [];
    const byTopic = new Map((stats.data?.by_topic ?? []).map((t) => [t.slug, t]));
    let prevRatio = 1; // first topic always unlocked
    return topics.data.map((t) => {
      const s = byTopic.get(t.slug);
      const solved = s?.solved ?? 0;
      const total = s?.total ?? 0;
      const ratio = total === 0 ? 0 : solved / total;
      const unlocked = prevRatio >= UNLOCK_THRESHOLD;
      const completed = total > 0 && solved === total;
      const inProgress = unlocked && !completed && solved > 0;
      const state = !unlocked ? "locked" : completed ? "completed" : inProgress ? "in-progress" : "not-started";
      prevRatio = ratio;
      return { topic: t, solved, total, ratio, state } as const;
    });
  }, [topics.data, stats.data]);

  const totalSolved = stats.data?.total_solved ?? 0;
  const dailyTarget = 3;
  const remaining = (items.reduce((s, i) => s + i.total, 0) || 150) - totalSolved;
  const weeksLeft = Math.ceil(remaining / (dailyTarget * 7));

  return (
    <>
      <TopNav title="Roadmap" />
      <div className="flex-1 p-4 sm:p-6 max-w-6xl w-full mx-auto">
        <Card className="p-4 sm:p-5 mb-6 bg-brand-50 border-brand-200 dark:bg-brand-900/20 dark:border-brand-800">
          <p className="text-xs sm:text-sm">
            <span className="font-semibold">Recommended pace:</span> at{" "}
            <span className="font-mono">{dailyTarget}</span> problems/day, you&apos;ll finish in roughly{" "}
            <span className="font-mono">{weeksLeft}</span> weeks. 🎯
          </p>
        </Card>

        <div className="relative">
          {/* vertical line */}
          <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-px bg-[rgb(var(--border))]" />

          <ol className="space-y-3 sm:space-y-4">
            {items.map(({ topic, solved, total, state }) => {
              const p = pct(solved, total);
              return (
                <li key={topic.id} className="relative pl-10 sm:pl-14">
                  {/* node */}
                  <div
                    className={cn(
                      "absolute left-1 sm:left-3 top-4 sm:top-5 h-6 w-6 sm:h-7 sm:w-7 rounded-full border-2 flex items-center justify-center bg-[rgb(var(--card))]",
                      state === "completed" && "border-emerald-500 bg-emerald-500",
                      state === "in-progress" && "border-brand-500 animate-pulse-soft",
                      state === "locked" && "border-[rgb(var(--border))] bg-gray-100 dark:bg-gray-800",
                      state === "not-started" && "border-[rgb(var(--border))]"
                    )}
                  >
                    {state === "completed" && <Check className="h-4 w-4 text-white" />}
                    {state === "locked" && <Lock className="h-3 w-3 text-[rgb(var(--muted))]" />}
                    {state === "in-progress" && <div className="h-2 w-2 rounded-full bg-brand-500" />}
                  </div>

                  <TopicLink
                    href={state === "locked" ? null : `/topic/${topic.slug}`}
                  >
                    <Card
                      className={cn(
                        "p-4 sm:p-5 transition-colors",
                        state === "locked" && "opacity-60",
                        state === "in-progress" && "ring-2 ring-brand-300 dark:ring-brand-700"
                      )}
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="text-2xl sm:text-3xl shrink-0">{topic.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm sm:text-base font-semibold">{topic.title}</h3>
                            {state === "in-progress" && (
                              <Badge variant="default" className="text-[10px] uppercase">
                                Active
                              </Badge>
                            )}
                            {state === "completed" && (
                              <Badge variant="easy" className="text-[10px] uppercase">
                                Done
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1 text-[11px] sm:text-xs text-[rgb(var(--muted))] font-mono">
                            ~{topic.estimated_days} days · {total} questions
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1 sm:gap-1.5">
                            {topic.patterns.map((pt) => (
                              <PatternTag key={pt} pattern={pt} />
                            ))}
                          </div>
                          {/* Progress bar — inline on mobile */}
                          <div className="mt-3 flex items-center gap-2 sm:hidden">
                            <Progress value={p} className="flex-1" />
                            <span className="text-[11px] font-mono text-[rgb(var(--muted))] shrink-0">{p}%</span>
                          </div>
                        </div>
                        {/* Progress bar — side on desktop */}
                        <div className="hidden sm:block text-right shrink-0">
                          <div className="text-xs font-mono text-[rgb(var(--muted))]">
                            {p}%
                          </div>
                          <Progress value={p} className="mt-2 w-28" />
                        </div>
                        <ChevronRight className="h-4 w-4 text-[rgb(var(--muted))] shrink-0 mt-1 hidden sm:block" />
                      </div>
                    </Card>
                  </TopicLink>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </>
  );
}

function TopicLink({ href, children }: { href: string | null; children: React.ReactNode }) {
  if (!href) return <div className="block">{children}</div>;
  return <Link href={href} className="block">{children}</Link>;
}
