"use client";

import { use, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { TopNav } from "@/components/layout/top-nav";
import { QuestionCard } from "@/components/interview/question-card";
import { InterviewFilters } from "@/components/interview/interview-filters";
import {
  useInterviewCategory,
  useInterviewProgress,
  useToggleInterviewProgress,
} from "@/hooks/use-interview";
import type { Difficulty } from "@/types";

export default function InterviewCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = use(params);
  const { data: session } = useSession();
  const cat = useInterviewCategory(category);
  const progress = useInterviewProgress();
  const toggle = useToggleInterviewProgress();

  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "ALL">("ALL");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const questions = useMemo(() => cat.data?.questions ?? [], [cat.data]);
  const allTags = useMemo(
    () => Array.from(new Set(questions.flatMap((q) => q.tags))).sort(),
    [questions]
  );

  const progressById = new Map(
    (progress.data ?? []).map((p) => [p.interview_question_id, p])
  );

  const filtered = questions.filter((q) => {
    if (difficulty !== "ALL" && q.difficulty !== difficulty) return false;
    if (activeTag && !q.tags.includes(activeTag)) return false;
    if (query && !q.question.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  function handleToggle(questionId: string, field: "reviewed" | "bookmarked") {
    if (!session) return; // read-only when signed out
    const cur = progressById.get(questionId);
    toggle.mutate({
      questionId,
      [field]: !(cur?.[field] ?? false),
    });
  }

  return (
    <>
      <TopNav title={cat.data?.title ?? "Interview Prep"} />
      <div className="flex-1 p-6 max-w-3xl w-full mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <span aria-hidden>{cat.data?.icon}</span> {cat.data?.title}
          </h1>
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">{cat.data?.description}</p>
        </div>

        <InterviewFilters
          query={query}
          onQuery={setQuery}
          difficulty={difficulty}
          onDifficulty={setDifficulty}
          tags={allTags}
          activeTag={activeTag}
          onTag={setActiveTag}
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
            <p className="text-sm text-[rgb(var(--muted))]">No questions match your filters.</p>
          )}
        </div>
      </div>
    </>
  );
}
