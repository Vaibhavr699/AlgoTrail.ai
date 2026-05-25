"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TopNav } from "@/components/layout/top-nav";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PatternTag } from "@/components/topic/pattern-tag";
import { QuestionRow } from "@/components/topic/question-row";
import { useProgress, useTopic } from "@/hooks/use-dsa";
import { pct } from "@/lib/utils";
import type { Difficulty, Status } from "@/types";

type Filter = "all" | "NOT_STARTED" | "IN_PROGRESS" | "SOLVED" | "NEEDS_REVIEW";

export default function TopicDetailPage({ params }: { params: { slug: string } }) {
  const topic = useTopic(params.slug);
  const progress = useProgress();
  const [filter, setFilter] = useState<Filter>("all");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");

  const progressByQ = useMemo(() => {
    const m = new Map<string, Status>();
    for (const p of progress.data ?? []) m.set(p.question_id, p.status);
    return m;
  }, [progress.data]);

  const filtered = useMemo(() => {
    const questions = topic.data?.questions ?? [];
    return questions.filter((q) => {
      const s = progressByQ.get(q.id) ?? "NOT_STARTED";
      if (filter !== "all" && s !== filter) return false;
      if (difficulty !== "all" && q.difficulty !== difficulty) return false;
      return true;
    });
  }, [topic.data, progressByQ, filter, difficulty]);

  if (topic.isLoading) {
    return (
      <>
        <TopNav title="Loading…" />
        <div className="p-6 text-sm text-[rgb(var(--muted))]">Loading topic…</div>
      </>
    );
  }
  if (!topic.data) {
    return (
      <>
        <TopNav title="Not found" />
        <div className="p-6 text-sm">Topic not found.</div>
      </>
    );
  }

  const t = topic.data;
  const total = t.questions.length;
  const solved = t.questions.filter((q) => progressByQ.get(q.id) === "SOLVED").length;
  const ratio = pct(solved, total);

  const byDiff = {
    EASY: { total: 0, solved: 0 },
    MEDIUM: { total: 0, solved: 0 },
    HARD: { total: 0, solved: 0 },
  };
  for (const q of t.questions) {
    byDiff[q.difficulty].total += 1;
    if (progressByQ.get(q.id) === "SOLVED") byDiff[q.difficulty].solved += 1;
  }

  return (
    <>
      <TopNav title={t.title} />
      <div className="flex-1 p-6 max-w-6xl w-full mx-auto space-y-6">
        <Link
          href="/roadmap"
          className="inline-flex items-center gap-1 text-sm text-[rgb(var(--muted))] hover:text-brand-500"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Roadmap
        </Link>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">{t.icon}</div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold tracking-tight">{t.title}</h1>
              <p className="mt-1 text-sm text-[rgb(var(--muted))]">{t.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {t.patterns.map((p) => (
                  <PatternTag key={p} pattern={p} />
                ))}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-mono font-semibold">{ratio}%</div>
              <p className="text-xs text-[rgb(var(--muted))]">
                {solved} / {total} solved
              </p>
              <Progress value={ratio} className="mt-2 w-40" />
              <div className="mt-3 flex gap-3 justify-end text-xs font-mono text-[rgb(var(--muted))]">
                <span>E: {byDiff.EASY.solved}/{byDiff.EASY.total}</span>
                <span>M: {byDiff.MEDIUM.solved}/{byDiff.MEDIUM.total}</span>
                <span>H: {byDiff.HARD.solved}/{byDiff.HARD.total}</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="NOT_STARTED">Not Started</TabsTrigger>
              <TabsTrigger value="IN_PROGRESS">In Progress</TabsTrigger>
              <TabsTrigger value="SOLVED">Solved</TabsTrigger>
              <TabsTrigger value="NEEDS_REVIEW">Needs Review</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-1">
            {(["all", "EASY", "MEDIUM", "HARD"] as const).map((d) => (
              <Button
                key={d}
                size="sm"
                variant={difficulty === d ? "default" : "secondary"}
                onClick={() => setDifficulty(d)}
              >
                {d === "all" ? "All" : d.charAt(0) + d.slice(1).toLowerCase()}
              </Button>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden">
          {filtered.length === 0 ? (
            <p className="p-8 text-center text-sm text-[rgb(var(--muted))]">
              No questions match these filters.
            </p>
          ) : (
            filtered.map((q, i) => (
              <QuestionRow
                key={q.id}
                question={q}
                status={progressByQ.get(q.id) ?? "NOT_STARTED"}
                index={i + 1}
              />
            ))
          )}
        </Card>

        <Card className="p-5 bg-brand-50/50 border-brand-200 dark:bg-brand-900/10 dark:border-brand-800">
          <h3 className="text-sm font-semibold">Pattern insight</h3>
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">
            Each question in this topic exercises {t.patterns.join(", ")}. Read the
            hint and key insight on each problem to internalize *when* you&apos;d reach
            for these — not just *how* to code them.
          </p>
        </Card>
      </div>
    </>
  );
}
