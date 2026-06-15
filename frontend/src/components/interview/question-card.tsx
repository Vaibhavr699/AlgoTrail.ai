"use client";

import { useState } from "react";
import { ChevronDown, Bookmark, Check, Copy, AlertTriangle, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { InterviewQuestionOut } from "@/types";

const DIFF_VARIANT: Record<string, "easy" | "medium" | "hard"> = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
};

function CodeBlock({ language, code, label }: { language: string; code: string; label?: string | null }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }
  return (
    <div className="group/code relative rounded-lg bg-gray-950 text-gray-100 overflow-hidden border border-gray-800">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-800/80">
        <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
          {label || language}
        </span>
        <button
          onClick={copy}
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-gray-400 hover:text-gray-100 hover:bg-white/10 transition-colors"
          aria-label="Copy code"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-3 text-xs leading-relaxed overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}

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
    <Card
      className={cn(
        "overflow-hidden transition-colors",
        reviewed && "border-brand-300 dark:border-brand-700/60",
        open && "ring-1 ring-brand-200 dark:ring-brand-800/50"
      )}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left"
        aria-expanded={open}
      >
        <Badge variant={DIFF_VARIANT[q.difficulty]} className="mt-0.5 shrink-0">
          {q.difficulty[0] + q.difficulty.slice(1).toLowerCase()}
        </Badge>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{q.question}</span>
            {reviewed && <Check className="h-3.5 w-3.5 shrink-0 text-brand-500" aria-label="Reviewed" />}
            {bookmarked && (
              <Bookmark className="h-3.5 w-3.5 shrink-0 fill-brand-500 text-brand-500" aria-label="Bookmarked" />
            )}
          </div>
        </div>

        <ChevronDown
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0 text-[rgb(var(--muted))] transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {/* grid-rows trick for a smooth height transition */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-[rgb(var(--border))] px-4 py-4 space-y-4 text-sm">
            <p className="font-medium text-[rgb(var(--foreground))]">{q.tldr}</p>
            <p className="whitespace-pre-wrap leading-relaxed text-[rgb(var(--muted))]">
              {q.explanation}
            </p>

            {q.code_examples.map((ex, i) => (
              <CodeBlock key={i} language={ex.language} code={ex.code} label={ex.label} />
            ))}

            {q.gotchas.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-900/40 dark:bg-amber-950/20">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5" /> Gotchas
                </p>
                <ul className="mt-1.5 space-y-1 text-[13px] text-amber-900/90 dark:text-amber-200/80">
                  {q.gotchas.map((g, i) => (
                    <li key={i} className="flex gap-1.5">
                      <span className="select-none text-amber-500">•</span>
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {q.follow_ups.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
                  Follow-ups
                </p>
                <ul className="mt-1.5 space-y-1">
                  {q.follow_ups.map((f, i) => (
                    <li key={i} className="flex gap-1.5 text-[13px] text-[rgb(var(--foreground))]">
                      <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-400" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={onToggleReviewed}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                  reviewed
                    ? "bg-brand-500 text-white border-brand-500 hover:bg-brand-600"
                    : "border-[rgb(var(--border))] hover:border-brand-300 hover:text-brand-600"
                )}
              >
                <Check className="h-3.5 w-3.5" /> {reviewed ? "Reviewed" : "Mark reviewed"}
              </button>
              <button
                onClick={onToggleBookmark}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                  bookmarked
                    ? "bg-brand-50 text-brand-700 border-brand-300 dark:bg-brand-900/30 dark:text-brand-300"
                    : "border-[rgb(var(--border))] hover:border-brand-300 hover:text-brand-600"
                )}
              >
                <Bookmark className={cn("h-3.5 w-3.5", bookmarked && "fill-current")} />
                {bookmarked ? "Saved" : "Bookmark"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
