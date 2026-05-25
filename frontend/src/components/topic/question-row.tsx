"use client";

import Link from "next/link";
import { Check, Circle, RotateCcw, ExternalLink, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DifficultyBadge } from "@/components/topic/difficulty-badge";
import { PatternTag } from "@/components/topic/pattern-tag";
import { useUpdateProgress } from "@/hooks/use-dsa";
import type { QuestionOut, Status } from "@/types";
import { cn } from "@/lib/utils";

const NEXT_STATUS: Record<Status, Status> = {
  NOT_STARTED: "SOLVED",
  IN_PROGRESS: "SOLVED",
  SOLVED: "NEEDS_REVIEW",
  NEEDS_REVIEW: "NOT_STARTED",
};

export function QuestionRow({
  question,
  status,
  index,
}: {
  question: QuestionOut;
  status: Status;
  index: number;
}) {
  const update = useUpdateProgress();

  const cycleStatus = () => {
    update.mutate({ questionId: question.id, status: NEXT_STATUS[status] });
  };

  return (
    <div
      className={cn(
        "grid grid-cols-[auto_auto_1fr_auto_auto] gap-3 items-center px-4 py-3 border-b border-[rgb(var(--border))] hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
        status === "SOLVED" && "opacity-75"
      )}
    >
      <button
        onClick={cycleStatus}
        disabled={update.isPending}
        aria-label="Toggle status"
        className={cn(
          "h-6 w-6 rounded-full flex items-center justify-center border transition-colors",
          status === "SOLVED" && "bg-emerald-500 border-emerald-500 text-white",
          status === "NEEDS_REVIEW" && "bg-amber-500 border-amber-500 text-white",
          status === "IN_PROGRESS" && "bg-brand-500 border-brand-500 text-white",
          status === "NOT_STARTED" && "border-[rgb(var(--border))] hover:border-brand-400"
        )}
      >
        {update.isPending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : status === "SOLVED" ? (
          <Check className="h-3 w-3" />
        ) : status === "NEEDS_REVIEW" ? (
          <RotateCcw className="h-3 w-3" />
        ) : status === "IN_PROGRESS" ? (
          <Circle className="h-3 w-3 fill-current" />
        ) : null}
      </button>

      <span className="text-xs font-mono text-[rgb(var(--muted))]">#{index}</span>

      <div className="min-w-0">
        <Link
          href={`/question/${question.slug}`}
          className={cn("text-sm font-medium truncate hover:text-brand-600 transition-colors block", status === "SOLVED" && "line-through")}
        >
          {question.title}
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <PatternTag pattern={question.pattern} />
          {question.companies.slice(0, 3).map((c) => (
            <Badge key={c} variant="muted" className="text-[10px]">
              {c}
            </Badge>
          ))}
        </div>
      </div>

      <DifficultyBadge difficulty={question.difficulty} />

      {question.leetcode_slug && (
        <a
          href={`https://leetcode.com/problems/${question.leetcode_slug}/`}
          target="_blank"
          rel="noreferrer"
          className="text-[rgb(var(--muted))] hover:text-brand-500"
          aria-label="Open on LeetCode"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}
