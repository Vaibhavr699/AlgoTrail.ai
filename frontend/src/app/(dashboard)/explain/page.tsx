"use client";

import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Clock,
  HardDrive,
  AlertTriangle,
} from "lucide-react";
import { TopNav } from "@/components/layout/top-nav";
import { Card, CardContent } from "@/components/ui/card";
import { DotsLoader } from "@/components/ui/dots-loader";
import { api } from "@/lib/api";
import { useExplainStore } from "@/stores/explain.store";
import type { ExplainProblemResult } from "@/types";

function apiError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  const idx = msg.indexOf(": ");
  if (idx !== -1) {
    try {
      const parsed = JSON.parse(msg.slice(idx + 2));
      if (parsed?.detail) return parsed.detail as string;
    } catch {
      /* fall through */
    }
  }
  return "Something went wrong. Please try again.";
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "text-green-600 bg-green-50 dark:bg-green-900/20",
  Medium: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
  Hard: "text-red-600 bg-red-50 dark:bg-red-900/20",
};

export default function ExplainPage() {
  const { url, setUrl, result, setResult } = useExplainStore();

  const explain = useMutation({
    mutationFn: (link: string) => api.ai.explainProblem(link),
    onSuccess: (data) => setResult(data),
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (trimmed) explain.mutate(trimmed);
  }

  return (
    <>
      <TopNav title="Explain a Problem" />
      <div className="flex-1 p-4 sm:p-6 max-w-5xl w-full mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-brand-500" />
            Stuck on a LeetCode problem?
          </h1>
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">
            Paste the problem link and Aria will walk you through it step by step.
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://leetcode.com/problems/two-sum/"
            disabled={explain.isPending}
            className="flex-1 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={explain.isPending || !url.trim()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-600 transition disabled:opacity-60 disabled:pointer-events-none"
          >
            <Sparkles className="h-4 w-4" />
            Explain
          </button>
        </form>

        {!result && !explain.isPending && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-[rgb(var(--muted))]">
            <span>Try:</span>
            {["two-sum", "valid-parentheses", "merge-two-sorted-lists"].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setUrl(`https://leetcode.com/problems/${s}/`);
                }}
                className="rounded-full border border-[rgb(var(--border))] px-2.5 py-1 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {explain.isPending && (
          <Card>
            <CardContent className="py-10 flex flex-col items-center gap-3 text-center">
              <DotsLoader />
              <p className="text-sm text-[rgb(var(--muted))]">
                Reading the problem and building your walkthrough…
              </p>
            </CardContent>
          </Card>
        )}

        {explain.isError && (
          <Card>
            <CardContent className="py-5 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm">{apiError(explain.error)}</p>
            </CardContent>
          </Card>
        )}

        {result && !explain.isPending && <Walkthrough result={result} />}
      </div>
    </>
  );
}

function Walkthrough({ result }: { result: ExplainProblemResult }) {
  const { explanation: ex } = result;
  const { step, setStep } = useExplainStore();
  const total = ex.steps.length;
  // Guard against a persisted step that exceeds a different problem's step count.
  const safeStep = Math.min(step, total - 1);
  const current = ex.steps[safeStep];
  const diffClass = DIFFICULTY_COLORS[result.difficulty] ?? "text-[rgb(var(--muted))] bg-gray-100 dark:bg-gray-800";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-bold">{result.title}</h2>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${diffClass}`}>
          {result.difficulty}
        </span>
        <a
          href={result.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700"
        >
          <ExternalLink className="h-3 w-3" />
          Open on LeetCode
        </a>
      </div>

      {/* TL;DR + intuition */}
      <Card>
        <CardContent className="py-4 space-y-3">
          <p className="text-sm">
            <span className="font-semibold">TL;DR&nbsp;</span>
            {ex.tldr}
          </p>
          <p className="text-sm text-[rgb(var(--muted))]">{ex.intuition}</p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-2.5 py-0.5 text-xs font-medium">
              {ex.pattern}
            </span>
            {ex.example_input && (
              <span className="text-xs text-[rgb(var(--muted))] font-mono truncate">
                example: {ex.example_input}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stepper */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-[rgb(var(--muted))]">
              Step {safeStep + 1} of {total}
            </p>
            <div className="flex gap-1">
              {ex.steps.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-5 rounded-full transition-colors ${
                    i <= safeStep ? "bg-brand-500" : "bg-[rgb(var(--border))]"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="min-h-[200px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={safeStep}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18 }}
                className="space-y-3"
              >
                <p className="text-sm font-semibold">{current.title}</p>
                <p className="text-sm text-[rgb(var(--muted))]">{current.explanation}</p>
                {current.state && (
                  <pre className="overflow-x-auto rounded-lg bg-gray-900 text-gray-100 p-3 text-xs leading-relaxed font-mono">
                    {current.state}
                  </pre>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between pt-4 mt-2 border-t border-[rgb(var(--border))]">
            <button
              onClick={() => setStep(Math.max(0, safeStep - 1))}
              disabled={safeStep === 0}
              className="inline-flex items-center gap-1 rounded-lg border border-[rgb(var(--border))] px-3 py-1.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <button
              onClick={() => setStep(Math.min(total - 1, safeStep + 1))}
              disabled={safeStep === total - 1}
              className="inline-flex items-center gap-1 rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-600 transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Complexity + edge cases */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardContent className="py-4 space-y-2">
            <p className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-brand-500" />
              <span className="font-semibold">Time</span>
            </p>
            <p className="text-sm text-[rgb(var(--muted))]">{ex.time_complexity}</p>
            <p className="text-sm flex items-center gap-2 pt-1">
              <HardDrive className="h-4 w-4 text-brand-500" />
              <span className="font-semibold">Space</span>
            </p>
            <p className="text-sm text-[rgb(var(--muted))]">{ex.space_complexity}</p>
          </CardContent>
        </Card>
        {ex.edge_cases?.length > 0 && (
          <Card>
            <CardContent className="py-4">
              <p className="text-sm font-semibold mb-2">Watch out for</p>
              <ul className="space-y-1.5">
                {ex.edge_cases.map((c, i) => (
                  <li key={i} className="text-sm text-[rgb(var(--muted))] flex gap-2">
                    <span className="text-brand-500">•</span>
                    {c}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
