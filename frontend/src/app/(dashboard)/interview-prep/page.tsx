"use client";

import { MessageSquareCode } from "lucide-react";
import { TopNav } from "@/components/layout/top-nav";
import { CategoryCard } from "@/components/interview/category-card";
import { useInterviewCategories } from "@/hooks/use-interview";

export default function InterviewPrepPage() {
  const categories = useInterviewCategories();
  const data = categories.data ?? [];

  const totalQuestions = data.reduce((s, c) => s + c.question_count, 0);
  const totalReviewed = data.reduce((s, c) => s + c.reviewed_count, 0);

  return (
    <>
      <TopNav title="Interview Prep" />
      <div className="flex-1 p-6 max-w-5xl w-full mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquareCode className="h-6 w-6 text-brand-500" />
            Interview Prep
          </h1>
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">
            In-depth interview questions across languages and frameworks, with explanations,
            real code examples, gotchas, and follow-ups.
          </p>
          {!categories.isLoading && !categories.isError && data.length > 0 && (
            <p className="mt-2 text-xs text-[rgb(var(--muted))]">
              <span className="font-medium text-[rgb(var(--foreground))]">{totalQuestions}</span>{" "}
              questions across{" "}
              <span className="font-medium text-[rgb(var(--foreground))]">{data.length}</span>{" "}
              categories
              {totalReviewed > 0 && (
                <>
                  {" · "}
                  <span className="font-medium text-brand-600">{totalReviewed} reviewed</span>
                </>
              )}
            </p>
          )}
        </div>

        {categories.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-36 rounded-lg border border-[rgb(var(--border))] bg-gray-50 dark:bg-gray-800/40 animate-pulse"
              />
            ))}
          </div>
        ) : categories.isError ? (
          <div className="rounded-lg border border-[rgb(var(--border))] p-6 text-sm text-[rgb(var(--muted))]">
            Couldn&apos;t load interview categories.{" "}
            <button
              onClick={() => categories.refetch()}
              className="text-brand-600 underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        ) : data.length === 0 ? (
          <p className="text-sm text-[rgb(var(--muted))]">No categories yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((c) => (
              <CategoryCard key={c.id} category={c} reviewedCount={c.reviewed_count} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
