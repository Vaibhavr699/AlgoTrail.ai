"use client";

import { MessageSquareCode } from "lucide-react";
import { TopNav } from "@/components/layout/top-nav";
import { CategoryCard } from "@/components/interview/category-card";
import { useInterviewCategories } from "@/hooks/use-interview";

export default function InterviewPrepPage() {
  const categories = useInterviewCategories();

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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(categories.data ?? []).map((c) => (
            <CategoryCard key={c.id} category={c} reviewedCount={0} />
          ))}
        </div>
      </div>
    </>
  );
}
