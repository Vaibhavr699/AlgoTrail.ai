"use client";

import { useState } from "react";
import { ChevronDown, Bookmark, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { InterviewQuestionOut } from "@/types";

const DIFF_COLOR: Record<string, string> = {
  EASY: "text-green-600",
  MEDIUM: "text-amber-600",
  HARD: "text-red-600",
};

export function QuestionCard({
  q,
  reviewed,
  bookmarked,
  onToggleReviewed,
  onToggleBookmark,
}: {
  q: InterviewQuestionOut;
  reviewed: boolean;
  bookmarked: boolean;
  onToggleReviewed: () => void;
  onToggleBookmark: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className={cn("text-xs font-semibold", DIFF_COLOR[q.difficulty])}>
          {q.difficulty}
        </span>
        <span className="flex-1 text-sm font-medium">{q.question}</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="border-t border-[rgb(var(--border))] px-4 py-4 space-y-4 text-sm">
          <p className="font-medium">{q.tldr}</p>
          <p className="whitespace-pre-wrap text-[rgb(var(--muted))]">{q.explanation}</p>

          {q.code_examples.map((ex, i) => (
            <div key={i} className="rounded-md bg-gray-900 text-gray-100 overflow-x-auto">
              {ex.label && <div className="px-3 pt-2 text-xs text-gray-400">{ex.label}</div>}
              <pre className="p-3 text-xs leading-relaxed">
                <code>{ex.code}</code>
              </pre>
            </div>
          ))}

          {q.gotchas.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase text-[rgb(var(--muted))]">Gotchas</p>
              <ul className="mt-1 list-disc pl-5">
                {q.gotchas.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
          )}

          {q.follow_ups.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase text-[rgb(var(--muted))]">
                Follow-ups
              </p>
              <ul className="mt-1 list-disc pl-5">
                {q.follow_ups.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={onToggleReviewed}
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-3 py-1 text-xs",
                reviewed
                  ? "bg-green-500 text-white border-green-500"
                  : "border-[rgb(var(--border))]"
              )}
            >
              <Check className="h-3 w-3" /> {reviewed ? "Reviewed" : "Mark reviewed"}
            </button>
            <button
              onClick={onToggleBookmark}
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-3 py-1 text-xs",
                bookmarked
                  ? "bg-brand-500 text-white border-brand-500"
                  : "border-[rgb(var(--border))]"
              )}
            >
              <Bookmark className="h-3 w-3" /> {bookmarked ? "Saved" : "Bookmark"}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
