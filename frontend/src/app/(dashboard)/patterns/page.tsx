"use client";

import Link from "next/link";
import { ArrowRight, Shapes, BookOpen } from "lucide-react";
import { TopNav } from "@/components/layout/top-nav";
import { Card } from "@/components/ui/card";

import { useTopics } from "@/hooks/use-dsa";
import { cn } from "@/lib/utils";

const CATEGORY_COLORS: Record<string, string> = {
  "Arrays & Hashing": "bg-blue-500",
  "Two Pointers": "bg-indigo-500",
  "Sliding Window": "bg-purple-500",
  "Stack": "bg-pink-500",
  "Binary Search": "bg-red-500",
  "Linked List": "bg-orange-500",
  "Trees": "bg-amber-500",
  "Heap / Priority Queue": "bg-yellow-500",
  "Backtracking": "bg-lime-500",
  "Graphs": "bg-emerald-500",
  "Advanced Graphs": "bg-teal-500",
  "1D Dynamic Programming": "bg-cyan-500",
  "2D Dynamic Programming": "bg-sky-500",
  "Greedy": "bg-violet-500",
  "Intervals": "bg-fuchsia-500",
  "Math & Geometry": "bg-rose-500",
  "Bit Manipulation": "bg-stone-500",
};

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function PatternsPage() {
  const topics = useTopics();

  return (
    <>
      <TopNav title="Patterns" />
      <div className="flex-1 p-6 max-w-5xl w-full mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shapes className="h-6 w-6 text-brand-500" />
            Pattern Library
          </h1>
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">
            Master the 14+ core patterns that cover 95% of coding interview questions.
            Click any pattern to get an AI-powered deep dive with templates, examples, and a chatbot for your doubts.
          </p>
        </div>

        <div className="space-y-6">
          {(topics.data ?? []).map((topic) => (
            <Card key={topic.id} className="overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[rgb(var(--border))]">
                <div className={cn("h-2 w-2 rounded-full", CATEGORY_COLORS[topic.title] || "bg-brand-500")} />
                <h2 className="text-sm font-semibold">{topic.title}</h2>
                <span className="text-xs text-[rgb(var(--muted))]">{topic.patterns.length} patterns</span>
              </div>
              <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {topic.patterns.map((pattern) => (
                  <Link
                    key={pattern}
                    href={`/patterns/${toSlug(pattern)}?topic=${topic.slug}&name=${encodeURIComponent(pattern)}`}
                    className="group flex items-center justify-between rounded-xl border border-[rgb(var(--border))] px-4 py-3 hover:border-brand-300 hover:bg-brand-50/50 dark:hover:bg-brand-900/10 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <BookOpen className="h-4 w-4 text-brand-500 shrink-0" />
                      <span className="text-sm font-medium truncate">{pattern}</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-[rgb(var(--muted))] group-hover:text-brand-500 transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {!topics.data && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl" />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
