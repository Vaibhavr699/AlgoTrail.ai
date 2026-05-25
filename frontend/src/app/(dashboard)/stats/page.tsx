"use client";

import { useMemo } from "react";
import {
  CheckCircle2,
  Flame,
  Trophy,
  Target,
  TrendingUp,
  Calendar,
  Zap,
} from "lucide-react";
import { TopNav } from "@/components/layout/top-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap";
import { useStats, useTopics } from "@/hooks/use-dsa";
import { cn } from "@/lib/utils";

const READINESS_LABELS: Record<string, { label: string; icon: typeof Target }> = {
  arrays_and_strings: { label: "Arrays & Strings", icon: Target },
  core_data_structures: { label: "Core Data Structures", icon: Zap },
  search_and_optimization: { label: "Search & Optimization", icon: TrendingUp },
  advanced: { label: "Advanced", icon: Trophy },
};

export default function StatsPage() {
  const stats = useStats();
  const topics = useTopics();

  const difficultyData = useMemo(() => {
    if (!stats.data) return [];
    const { EASY, MEDIUM, HARD } = stats.data.by_difficulty;
    const total = EASY + MEDIUM + HARD || 1;
    return [
      { label: "Easy", value: EASY, pct: Math.round((EASY / total) * 100), color: "bg-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
      { label: "Medium", value: MEDIUM, pct: Math.round((MEDIUM / total) * 100), color: "bg-amber-500", bg: "bg-amber-100 dark:bg-amber-900/30" },
      { label: "Hard", value: HARD, pct: Math.round((HARD / total) * 100), color: "bg-red-500", bg: "bg-red-100 dark:bg-red-900/30" },
    ];
  }, [stats.data]);

  const topicsSorted = useMemo(() => {
    if (!stats.data) return [];
    return [...stats.data.by_topic].sort((a, b) => {
      const aPct = a.total > 0 ? a.solved / a.total : 0;
      const bPct = b.total > 0 ? b.solved / b.total : 0;
      return bPct - aPct;
    });
  }, [stats.data]);

  const overallReadiness = useMemo(() => {
    if (!stats.data) return 0;
    const r = stats.data.readiness;
    return Math.round(
      (r.arrays_and_strings + r.core_data_structures + r.search_and_optimization + r.advanced) / 4
    );
  }, [stats.data]);

  const weeklyAvg = useMemo(() => {
    if (!stats.data?.activity.length) return 0;
    const last28 = stats.data.activity.slice(-28);
    const total = last28.reduce((s, a) => s + a.count, 0);
    return Math.round((total / 4) * 10) / 10;
  }, [stats.data]);

  if (!stats.data) {
    return (
      <>
        <TopNav title="Stats" />
        <div className="flex-1 p-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopNav title="Stats" />
      <div className="flex-1 p-6 max-w-6xl w-full mx-auto space-y-6">
        {/* Top stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MiniStat icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />} label="Total Solved" value={stats.data.total_solved} />
          <MiniStat icon={<Flame className="h-5 w-5 text-orange-500" />} label="Current Streak" value={`${stats.data.streak}d`} />
          <MiniStat icon={<Trophy className="h-5 w-5 text-amber-500" />} label="Longest Streak" value={`${stats.data.longest_streak}d`} />
          <MiniStat icon={<Calendar className="h-5 w-5 text-blue-500" />} label="Weekly Avg" value={weeklyAvg} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* MAANG Readiness */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Interview Readiness</span>
                <span className={cn(
                  "text-2xl font-bold",
                  overallReadiness >= 70 ? "text-emerald-500" : overallReadiness >= 40 ? "text-amber-500" : "text-red-500"
                )}>
                  {overallReadiness}%
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(stats.data.readiness).map(([key, value]) => {
                const meta = READINESS_LABELS[key];
                if (!meta) return null;
                const Icon = meta.icon;
                return (
                  <div key={key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-[rgb(var(--muted))]" />
                        {meta.label}
                      </span>
                      <span className="font-mono font-medium">{Math.round(value)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          value >= 70 ? "bg-emerald-500" : value >= 40 ? "bg-amber-500" : "bg-red-400"
                        )}
                        style={{ width: `${Math.min(value, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Difficulty breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">By Difficulty</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-end justify-center gap-8 h-40">
                {difficultyData.map((d) => (
                  <div key={d.label} className="flex flex-col items-center gap-2">
                    <span className="text-xs font-mono font-bold">{d.value}</span>
                    <div className={cn("w-14 rounded-t-lg transition-all duration-500", d.color)} style={{ height: `${Math.max(d.pct * 1.2, 8)}px` }} />
                    <span className="text-xs font-medium">{d.label}</span>
                  </div>
                ))}
              </div>
              <div className="h-3 rounded-full overflow-hidden flex">
                {difficultyData.map((d) => (
                  <div key={d.label} className={cn("h-full transition-all duration-500", d.color)} style={{ width: `${d.pct}%` }} />
                ))}
              </div>
              <div className="flex justify-between text-xs text-[rgb(var(--muted))]">
                {difficultyData.map((d) => (
                  <span key={d.label}>{d.label}: {d.pct}%</span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity heatmap */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold tracking-tight">Activity</h2>
          <p className="text-xs text-[rgb(var(--muted))] mb-4">Last 12 weeks</p>
          <ActivityHeatmap activity={stats.data.activity} />
        </Card>

        {/* Topic breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Topic Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topicsSorted.map((t) => {
                const pct = t.total > 0 ? Math.round((t.solved / t.total) * 100) : 0;
                return (
                  <div key={t.topic_id} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-44 truncate">{t.title}</span>
                    <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          pct === 100 ? "bg-emerald-500" : pct > 0 ? "bg-brand-500" : "bg-gray-200 dark:bg-gray-700"
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-[rgb(var(--muted))] w-16 text-right">
                      {t.solved}/{t.total}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-xs text-[rgb(var(--muted))]">{label}</p>
          <p className="text-xl font-bold font-mono">{value}</p>
        </div>
      </div>
    </Card>
  );
}
