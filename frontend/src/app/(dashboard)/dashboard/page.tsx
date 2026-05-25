"use client";

import { useMemo } from "react";
import { Flame, TrendingUp, Layers, CheckCircle2 } from "lucide-react";
import { TopNav } from "@/components/layout/top-nav";
import { StatCard } from "@/components/dashboard/stat-card";
import { TodaySuggestion } from "@/components/dashboard/today-suggestion";
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap";
import { TopicProgressCard } from "@/components/dashboard/topic-progress-card";
import { useStats, useTopics, useProgress } from "@/hooks/use-dsa";
import { api } from "@/lib/api";
import { useQueries } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";

export default function DashboardPage() {
  const stats = useStats();
  const topics = useTopics();
  const progress = useProgress();

  // Fetch each topic's full questions to compute "next up" — keep it cheap
  // by relying on react-query cache.
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
      const tq = topicQueries.find(
        (q) => q.data?.slug === t.slug
      );
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

  return (
    <>
      <TopNav title="Dashboard" />
      <div className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Hero stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        <TodaySuggestion question={nextQuestion} topic={nextTopic} />

        {/* Topic progress + activity */}
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-3">
            <h2 className="text-sm font-semibold tracking-tight">Topic progress</h2>
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
          <div className="lg:col-span-2">
            <Card className="p-5">
              <h2 className="text-sm font-semibold tracking-tight">Activity</h2>
              <p className="text-xs text-[rgb(var(--muted))] mb-4">
                Last 12 weeks
              </p>
              {stats.data ? (
                <ActivityHeatmap activity={stats.data.activity} />
              ) : (
                <div className="h-24 animate-pulse bg-gray-100 dark:bg-gray-800 rounded" />
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
