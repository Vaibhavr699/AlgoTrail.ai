"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Flame,
  TrendingUp,
  Layers,
  CheckCircle2,
  Trophy,
  Target,
  Zap,
  ArrowRight,
} from "lucide-react";
import { TopNav } from "@/components/layout/top-nav";
import { StatCard } from "@/components/dashboard/stat-card";
import { TodaySuggestion } from "@/components/dashboard/today-suggestion";
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap";
import { TopicProgressCard } from "@/components/dashboard/topic-progress-card";
import { useStats, useTopics, useProgress } from "@/hooks/use-dsa";
import { api } from "@/lib/api";
import { useQueries } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const READINESS_META: Record<string, { label: string; icon: typeof Target }> = {
  arrays_and_strings: { label: "Arrays & Strings", icon: Target },
  core_data_structures: { label: "Data Structures", icon: Zap },
  search_and_optimization: { label: "Search & Opt", icon: TrendingUp },
  advanced: { label: "Advanced", icon: Trophy },
};

export default function DashboardPage() {
  const stats = useStats();
  const topics = useTopics();
  const progress = useProgress();

  const topicQueries = useQueries({
    queries: (topics.data ?? []).map((t) => ({
      queryKey: ["topic", t.slug],
      queryFn: () => api.topics.get(t.slug),
      enabled: !!topics.data,
    })),
  });

  const { nextQuestion, nextTopic } = useMemo(() => {
    if (!topics.data || !progress.data) return { nextQuestion: null, nextTopic: null };
    const solvedIds = new Set(
      progress.data.filter((p) => p.status === "SOLVED").map((p) => p.question_id)
    );

    for (const t of topics.data) {
      const tq = topicQueries.find((q) => q.data?.slug === t.slug);
      const questions = tq?.data?.questions ?? [];
      if (questions.length === 0) continue;
      const next = questions.find((q) => !solvedIds.has(q.id));
      if (next) return { nextQuestion: next, nextTopic: t };
    }
    return { nextQuestion: null, nextTopic: null };
  }, [topics.data, progress.data, topicQueries]);

  const totalQuestions = topicQueries.reduce(
    (acc, q) => acc + (q.data?.questions.length ?? 0),
    0
  );
  const totalSolved = stats.data?.total_solved ?? 0;
  const topicsStarted = (stats.data?.by_topic ?? []).filter((t) => t.solved > 0).length;
  const totalTopics = topics.data?.length ?? 0;

  const thisWeekSolved = (stats.data?.activity ?? [])
    .slice(-7)
    .reduce((sum, a) => sum + a.count, 0);

  const overallReadiness = useMemo(() => {
    if (!stats.data) return 0;
    const r = stats.data.readiness;
    return Math.round(
      (r.arrays_and_strings + r.core_data_structures + r.search_and_optimization + r.advanced) / 4
    );
  }, [stats.data]);

  return (
    <>
      <TopNav title="Dashboard" />
      <div className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Hero stats */}
        <div data-tour="stats-row" className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Solved"
            value={`${totalSolved} / ${totalQuestions || 150}`}
            icon={<CheckCircle2 className="h-4 w-4" />}
          />
          <StatCard
            label="Streak"
            value={
              <span className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                {stats.data?.streak ?? 0} days
              </span>
            }
            accent="orange"
          />
          <StatCard
            label="Topics"
            value={`${topicsStarted} / ${totalTopics}`}
            icon={<Layers className="h-4 w-4" />}
            accent="emerald"
          />
          <StatCard
            label="This week"
            value={`+${thisWeekSolved}`}
            hint="solved"
            icon={<TrendingUp className="h-4 w-4" />}
            accent="amber"
          />
        </div>

        {/* Next-up suggestion */}
        <div data-tour="next-up">
          <TodaySuggestion question={nextQuestion} topic={nextTopic} />
        </div>

        {/* Readiness + Activity row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Interview Readiness */}
          <Card data-tour="readiness">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Interview Readiness</CardTitle>
                <span className={cn(
                  "text-xl font-bold font-mono",
                  overallReadiness >= 70 ? "text-emerald-500" : overallReadiness >= 40 ? "text-amber-500" : "text-red-400"
                )}>
                  {overallReadiness}%
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.data && Object.entries(stats.data.readiness).map(([key, value]) => {
                const meta = READINESS_META[key];
                if (!meta) return null;
                const Icon = meta.icon;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <Icon className="h-3.5 w-3.5 text-[rgb(var(--muted))] shrink-0" />
                    <span className="text-xs w-28 truncate">{meta.label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-700",
                          value >= 70 ? "bg-emerald-500" : value >= 40 ? "bg-amber-400" : "bg-red-400"
                        )}
                        style={{ width: `${Math.min(value, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono w-10 text-right">{Math.round(value)}%</span>
                  </div>
                );
              })}
              <Link
                href="/stats"
                className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 pt-1"
              >
                View full stats <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>

          {/* Activity heatmap */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold tracking-tight">Activity</h2>
            <p className="text-xs text-[rgb(var(--muted))] mb-4">Last 12 weeks</p>
            {stats.data ? (
              <ActivityHeatmap activity={stats.data.activity} />
            ) : (
              <div className="h-24 animate-pulse bg-gray-100 dark:bg-gray-800 rounded" />
            )}
          </Card>
        </div>

        {/* Topic progress grid */}
        <div data-tour="topic-grid">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold tracking-tight">Topic progress</h2>
            <Link href="/roadmap" className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1">
              View roadmap <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {(topics.data ?? []).map((t) => {
              const topicStats = stats.data?.by_topic.find((s) => s.slug === t.slug);
              return (
                <TopicProgressCard
                  key={t.id}
                  topic={t}
                  solved={topicStats?.solved ?? 0}
                  total={topicStats?.total ?? 0}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
