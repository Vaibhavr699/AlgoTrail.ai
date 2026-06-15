"use client";

import { MessageSquareCode } from "lucide-react";
import { useSession } from "next-auth/react";
import { TopNav } from "@/components/layout/top-nav";
import { CategoryCard } from "@/components/interview/category-card";
import { ProgressDashboard } from "@/components/interview/progress-dashboard";
import { useInterviewCategories } from "@/hooks/use-interview";

export default function InterviewPrepPage() {
  const categories = useInterviewCategories();
  const { data: session } = useSession();
  const data = categories.data ?? [];

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
        </div>

        {!categories.isLoading && !categories.isError && data.length > 0 && (
          <ProgressDashboard categories={data} signedIn={!!session} />
        )}

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
