"use client";

import { Search, Bookmark, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Difficulty } from "@/types";

const DIFFICULTIES: (Difficulty | "ALL")[] = ["ALL", "EASY", "MEDIUM", "HARD"];

export function InterviewFilters({
  query,
  onQuery,
  difficulty,
  onDifficulty,
  bookmarkedOnly,
  onBookmarkedOnly,
  resultCount,
  totalCount,
  onClearAll,
}: {
  query: string;
  onQuery: (v: string) => void;
  difficulty: Difficulty | "ALL";
  onDifficulty: (v: Difficulty | "ALL") => void;
  bookmarkedOnly: boolean;
  onBookmarkedOnly: (v: boolean) => void;
  resultCount: number;
  totalCount: number;
  onClearAll: () => void;
}) {
  const hasActiveFilters = !!query || difficulty !== "ALL" || bookmarkedOnly;

  return (
    <div className="sticky top-14 z-[5] -mx-4 border-b border-[rgb(var(--border))] bg-[rgb(var(--background))]/85 px-4 py-3 backdrop-blur-md space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--muted))]" />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search questions…"
            className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-brand-400"
          />
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-0.5">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => onDifficulty(d)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                difficulty === d
                  ? "bg-brand-500 text-white"
                  : "text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]"
              )}
            >
              {d === "ALL" ? "All" : d[0] + d.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <button
          onClick={() => onBookmarkedOnly(!bookmarkedOnly)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
            bookmarkedOnly
              ? "border-brand-300 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
              : "border-[rgb(var(--border))] text-[rgb(var(--muted))] hover:border-brand-300"
          )}
        >
          <Bookmark className={cn("h-3.5 w-3.5", bookmarkedOnly && "fill-current")} />
          Saved
        </button>
      </div>
      <div className="flex items-center justify-between text-xs text-[rgb(var(--muted))]">
        <span>
          <span className="font-medium text-[rgb(var(--foreground))]">{resultCount}</span> of{" "}
          {totalCount} {totalCount === 1 ? "question" : "questions"}
        </span>
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="inline-flex items-center gap-1 text-brand-600 hover:underline"
          >
            <X className="h-3 w-3" /> Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
