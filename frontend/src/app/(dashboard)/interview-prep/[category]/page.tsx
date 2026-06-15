"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft } from "lucide-react";
import { TopNav } from "@/components/layout/top-nav";
import { Progress } from "@/components/ui/progress";
import { QuestionCard } from "@/components/interview/question-card";
import { InterviewFilters } from "@/components/interview/interview-filters";
import { CategoryIcon, categoryBrandColor } from "@/components/interview/category-icon";
import {
  useInterviewCategory,
  useInterviewProgress,
  useToggleInterviewProgress,
} from "@/hooks/use-interview";
import type { Difficulty } from "@/types";

export default function InterviewCategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const { category } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const cat = useInterviewCategory(category);
  const progress = useInterviewProgress();
  const toggle = useToggleInterviewProgress();

  // Filter state, hydrated from the URL so it survives refresh / back.
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [difficulty, setDifficulty] = useState<Difficulty | "ALL">(
    (searchParams.get("d") as Difficulty | "ALL") || "ALL"
  );
  const [activeTag, setActiveTag] = useState<string | null>(searchParams.get("tag"));
  const [bookmarkedOnly, setBookmarkedOnly] = useState(searchParams.get("saved") === "1");

  // Reflect filter state into the URL (replace, so back still returns to the hub).
  useEffect(() => {
    const sp = new URLSearchParams();
    if (query) sp.set("q", query);
    if (difficulty !== "ALL") sp.set("d", difficulty);
    if (activeTag) sp.set("tag", activeTag);
    if (bookmarkedOnly) sp.set("saved", "1");
    const qs = sp.toString();
    router.replace(`/interview-prep/${category}${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [query, difficulty, activeTag, bookmarkedOnly, category, router]);

  const questions = useMemo(() => cat.data?.questions ?? [], [cat.data]);
  const allTags = useMemo(
    () => Array.from(new Set(questions.flatMap((q) => q.tags))).sort(),
    [questions]
  );

  const progressById = useMemo(
    () => new Map((progress.data ?? []).map((p) => [p.interview_question_id, p])),
    [progress.data]
  );

  const reviewedCount = useMemo(
    () => questions.filter((q) => progressById.get(q.id)?.reviewed).length,
    [questions, progressById]
  );

  const diffCounts = useMemo(() => {
    const c = { EASY: 0, MEDIUM: 0, HARD: 0 } as Record<Difficulty, number>;
    questions.forEach((q) => (c[q.difficulty] += 1));
    return c;
  }, [questions]);

  const filtered = questions.filter((q) => {
    if (difficulty !== "ALL" && q.difficulty !== difficulty) return false;
    if (activeTag && !q.tags.includes(activeTag)) return false;
    if (bookmarkedOnly && !progressById.get(q.id)?.bookmarked) return false;
    if (query && !q.question.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  function clearAll() {
    setQuery("");
    setDifficulty("ALL");
    setActiveTag(null);
    setBookmarkedOnly(false);
  }

  function handleToggle(questionId: string, field: "reviewed" | "bookmarked") {
    if (!session) return; // read-only when signed out
    const cur = progressById.get(questionId);
    toggle.mutate({ questionId, [field]: !(cur?.[field] ?? false) });
  }

  const pct = questions.length ? Math.round((reviewedCount / questions.length) * 100) : 0;

  return (
    <>
      <TopNav title={cat.data?.title ?? "Interview Prep"} />
      <div className="flex-1 p-6 max-w-5xl w-full mx-auto space-y-5">
        {/* Breadcrumb / back */}
        <Link
          href="/interview-prep"
          className="inline-flex items-center gap-1.5 text-sm text-[rgb(var(--muted))] transition-colors hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" /> Interview Prep
        </Link>

        {cat.isError ? (
          <div className="rounded-lg border border-[rgb(var(--border))] p-6 text-sm text-[rgb(var(--muted))]">
            Couldn&apos;t load this category.{" "}
            <button onClick={() => cat.refetch()} className="text-brand-600 underline underline-offset-2">
              Retry
            </button>
          </div>
        ) : cat.isLoading ? (
          <>
            <div className="h-20 animate-pulse rounded-xl border border-[rgb(var(--border))] bg-gray-50 dark:bg-gray-800/40" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-lg border border-[rgb(var(--border))] bg-gray-50 dark:bg-gray-800/40"
                />
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Category hero */}
            <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-5">
              <div className="flex items-start gap-3">
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${categoryBrandColor(category)}1A` }}
                >
                  <CategoryIcon slug={category} className="h-7 w-7" />
                </span>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold tracking-tight">{cat.data?.title}</h1>
                  <p className="mt-0.5 text-sm text-[rgb(var(--muted))]">{cat.data?.description}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[rgb(var(--muted))]">
                <span className="font-medium text-[rgb(var(--foreground))]">
                  {questions.length} questions
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> {diffCounts.EASY} easy
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-amber-500" /> {diffCounts.MEDIUM} medium
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-500" /> {diffCounts.HARD} hard
                </span>
              </div>

              {session && (
                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-xs text-[rgb(var(--muted))]">
                    <span>{reviewedCount} reviewed</span>
                    <span className="font-medium text-brand-600">{pct}%</span>
                  </div>
                  <Progress value={pct} />
                </div>
              )}
            </div>

            <InterviewFilters
              query={query}
              onQuery={setQuery}
              difficulty={difficulty}
              onDifficulty={setDifficulty}
              tags={allTags}
              activeTag={activeTag}
              onTag={setActiveTag}
              bookmarkedOnly={bookmarkedOnly}
              onBookmarkedOnly={setBookmarkedOnly}
              resultCount={filtered.length}
              totalCount={questions.length}
              onClearAll={clearAll}
            />

            {!session && (
              <p className="text-xs text-[rgb(var(--muted))]">
                Sign in to track reviewed and bookmarked questions.
              </p>
            )}

            <div className="space-y-3">
              {filtered.map((q) => {
                const p = progressById.get(q.id);
                return (
                  <QuestionCard
                    key={q.id}
                    q={q}
                    reviewed={p?.reviewed ?? false}
                    bookmarked={p?.bookmarked ?? false}
                    onToggleReviewed={() => handleToggle(q.id, "reviewed")}
                    onToggleBookmark={() => handleToggle(q.id, "bookmarked")}
                  />
                );
              })}
              {filtered.length === 0 && (
                <div className="rounded-lg border border-dashed border-[rgb(var(--border))] py-10 text-center text-sm text-[rgb(var(--muted))]">
                  No questions match your filters.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
