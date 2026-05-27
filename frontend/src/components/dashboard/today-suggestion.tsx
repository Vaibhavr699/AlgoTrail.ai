"use client";

import Link from "next/link";
import { ArrowRight, Target, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DifficultyBadge } from "@/components/topic/difficulty-badge";
import { useUpdateProgress } from "@/hooks/use-dsa";
import type { QuestionOut, TopicOut } from "@/types";

export function TodaySuggestion({
  question,
  topic,
}: {
  question: QuestionOut | null;
  topic: TopicOut | null;
}) {
  const updateProgress = useUpdateProgress();

  if (!question || !topic) {
    return (
      <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 text-white">
        <div className="flex items-center gap-2 text-emerald-100">
          <Check className="h-4 w-4" />
          <span className="text-xs uppercase tracking-wider">All caught up</span>
        </div>
        <h2 className="mt-2 text-2xl font-semibold">Nice work — you&apos;ve cleared the queue.</h2>
        <p className="mt-1 text-sm text-emerald-100">
          Take a breather, then revisit a hard problem from earlier or pick a topic to re-read.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-brand-100">
          <Target className="h-4 w-4" />
          <span className="text-xs uppercase tracking-wider">Next up</span>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-brand-100">
          Topic {topic.order} of {topic.order + 16}
        </span>
      </div>

      <p className="mt-2 text-sm font-medium text-brand-100">{topic.title}</p>
      <h2 className="mt-1 text-2xl font-semibold leading-tight">
        {question.title}
      </h2>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-sm text-brand-100">
          <DifficultyBadge difficulty={question.difficulty} />
          <span>Pattern: <span className="font-mono">{question.pattern}</span></span>
          <span>· Est. 25 min</span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="secondary" className="!bg-white !text-brand-700 hover:!bg-brand-50 !rounded-full !px-4 !py-2 !text-sm">
            <Link href={`/topic/${topic.slug}`}>
              Start <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="!text-white/80 hover:!text-white hover:!bg-white/10 !rounded-full !px-4 !py-2 !text-sm border border-white/20"
            onClick={() => updateProgress.mutate({ questionId: question.id, status: "SOLVED" })}
            disabled={updateProgress.isPending}
          >
            <Check className="h-3.5 w-3.5 mr-1" />
            {updateProgress.isPending ? "Saving..." : "Mark Done"}
          </Button>
        </div>
      </div>
    </div>
  );
}
