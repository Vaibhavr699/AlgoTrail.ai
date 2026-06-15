"use client";

import type { Difficulty } from "@/types";

export function InterviewFilters({
  query,
  onQuery,
  difficulty,
  onDifficulty,
  tags,
  activeTag,
  onTag,
}: {
  query: string;
  onQuery: (v: string) => void;
  difficulty: Difficulty | "ALL";
  onDifficulty: (v: Difficulty | "ALL") => void;
  tags: string[];
  activeTag: string | null;
  onTag: (v: string | null) => void;
}) {
  return (
    <div className="space-y-3">
      <input
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder="Search questions…"
        className="w-full rounded-md border border-[rgb(var(--border))] bg-transparent px-3 py-2 text-sm"
      />
      <div className="flex flex-wrap gap-2">
        {(["ALL", "EASY", "MEDIUM", "HARD"] as const).map((d) => (
          <button
            key={d}
            onClick={() => onDifficulty(d)}
            className={`rounded-full px-3 py-1 text-xs border ${
              difficulty === d
                ? "bg-brand-500 text-white border-brand-500"
                : "border-[rgb(var(--border))] text-[rgb(var(--muted))]"
            }`}
          >
            {d[0] + d.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => onTag(activeTag === t ? null : t)}
              className={`rounded-full px-2.5 py-0.5 text-xs border ${
                activeTag === t
                  ? "bg-brand-500 text-white border-brand-500"
                  : "border-[rgb(var(--border))] text-[rgb(var(--muted))]"
              }`}
            >
              #{t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
