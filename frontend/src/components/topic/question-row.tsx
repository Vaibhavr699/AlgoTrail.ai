"use client";

import Link from "next/link";
import { Check, Circle, RotateCcw, ExternalLink } from "lucide-react";
import { DotsLoader } from "@/components/ui/dots-loader";
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
        "flex items-start sm:items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-3 border-b border-[rgb(var(--border))] hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
        status === "SOLVED" && "opacity-75"
      )}
    >
      <button
        onClick={cycleStatus}
        disabled={update.isPending}
        aria-label="Toggle status"
        className={cn(
          "h-6 w-6 rounded-full flex items-center justify-center border transition-colors shrink-0 mt-0.5 sm:mt-0",
          status === "SOLVED" && "bg-emerald-500 border-emerald-500 text-white",
          status === "NEEDS_REVIEW" && "bg-amber-500 border-amber-500 text-white",
          status === "IN_PROGRESS" && "bg-brand-500 border-brand-500 text-white",
          status === "NOT_STARTED" && "border-[rgb(var(--border))] hover:border-brand-400"
        )}
      >
        {update.isPending ? (
          <DotsLoader size="sm" />
        ) : status === "SOLVED" ? (
          <Check className="h-3 w-3" />
        ) : status === "NEEDS_REVIEW" ? (
          <RotateCcw className="h-3 w-3" />
        ) : status === "IN_PROGRESS" ? (
          <Circle className="h-3 w-3 fill-current" />
        ) : null}
      </button>

      <span className="text-xs font-mono text-[rgb(var(--muted))] hidden sm:block shrink-0">#{index}</span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link
            href={`/question/${question.slug}`}
            className={cn("text-sm font-medium truncate hover:text-brand-600 transition-colors block flex-1 min-w-0", status === "SOLVED" && "line-through")}
          >
            {question.title}
          </Link>
          <DifficultyBadge difficulty={question.difficulty} />
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1 sm:gap-1.5">
          <PatternTag pattern={question.pattern} />
          {question.companies.slice(0, 2).map((c) => (
            <Badge key={c} variant="muted" className="text-[10px] hidden sm:inline-flex">
              {c}
            </Badge>
          ))}
          {question.leetcode_slug && (
            <a
              href={`https://leetcode.com/problems/${question.leetcode_slug}/`}
              target="_blank"
              rel="noreferrer"
              className="text-[rgb(var(--muted))] hover:text-brand-500 ml-auto sm:ml-0"
              aria-label="Open on LeetCode"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
