"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight } from "lucide-react";
import { useTopics } from "@/hooks/use-dsa";
import { useUIStore } from "@/stores/ui.store";
import { cn } from "@/lib/utils";
import type { QuestionOut, TopicWithQuestions } from "@/types";

interface SearchResult {
  question: QuestionOut;
  topicSlug: string;
  topicTitle: string;
}

export function SearchCommand() {
  const open = useUIStore((s) => s.searchOpen);
  const setOpen = useUIStore((s) => s.setSearchOpen);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const topics = useTopics();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(!open);
        if (!open) {
          setQuery("");
          setSelectedIndex(0);
        }
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  const results = useMemo(() => {
    if (!query.trim() || !topics.data) return [];
    const q = query.toLowerCase();
    const matches: SearchResult[] = [];

    for (const topic of topics.data as TopicWithQuestions[]) {
      if (!topic.questions) continue;
      for (const question of topic.questions) {
        if (
          question.title.toLowerCase().includes(q) ||
          question.pattern.toLowerCase().includes(q) ||
          topic.title.toLowerCase().includes(q)
        ) {
          matches.push({ question, topicSlug: topic.slug, topicTitle: topic.title });
        }
      }
    }
    return matches.slice(0, 8);
  }, [query, topics.data]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const navigate = (result: SearchResult) => {
    router.push(`/question/${result.question.slug}`);
    setOpen(false);
  };

  const onKeyNav = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      navigate(results[selectedIndex]);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh] p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-lg rounded-2xl bg-[rgb(var(--card))] border border-[rgb(var(--border))] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 px-4 border-b border-[rgb(var(--border))]">
          <Search className="h-4 w-4 text-[rgb(var(--muted))] shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyNav}
            placeholder="Search questions, patterns, topics..."
            className="flex-1 h-12 bg-transparent text-sm outline-none placeholder:text-[rgb(var(--muted))]"
          />
          <button onClick={() => setOpen(false)} className="text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {query.trim() && results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-[rgb(var(--muted))]">
              No questions found for &ldquo;{query}&rdquo;
            </div>
          )}

          {results.map((r, i) => (
            <button
              key={r.question.id}
              onClick={() => navigate(r)}
              onMouseEnter={() => setSelectedIndex(i)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                i === selectedIndex ? "bg-brand-50 dark:bg-brand-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
              )}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{r.question.title}</p>
                <p className="text-xs text-[rgb(var(--muted))] flex items-center gap-1.5 mt-0.5">
                  <span>{r.topicTitle}</span>
                  <span className="text-[rgb(var(--border))]">/</span>
                  <span>{r.question.pattern}</span>
                </p>
              </div>
              <span className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                r.question.difficulty === "EASY" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                r.question.difficulty === "MEDIUM" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                r.question.difficulty === "HARD" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
              )}>
                {r.question.difficulty}
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-[rgb(var(--muted))] shrink-0" />
            </button>
          ))}

          {!query.trim() && (
            <div className="px-4 py-6 text-center text-sm text-[rgb(var(--muted))]">
              Start typing to search across all questions...
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 px-4 py-2 border-t border-[rgb(var(--border))] text-[10px] text-[rgb(var(--muted))]">
          <span className="flex items-center gap-1">
            <kbd className="font-mono border border-[rgb(var(--border))] rounded px-1 py-0.5">↑↓</kbd>
            navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="font-mono border border-[rgb(var(--border))] rounded px-1 py-0.5">↵</kbd>
            open
          </span>
          <span className="flex items-center gap-1">
            <kbd className="font-mono border border-[rgb(var(--border))] rounded px-1 py-0.5">esc</kbd>
            close
          </span>
        </div>
      </div>
    </div>
  );
}
