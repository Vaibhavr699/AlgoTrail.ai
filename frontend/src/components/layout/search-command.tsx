"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  ArrowRight,
  LayoutDashboard,
  Map,
  BarChart3,
  Settings,
  Shapes,
  BookOpen,
} from "lucide-react";
import { useTopics } from "@/hooks/use-dsa";
import { useUIStore } from "@/stores/ui.store";
import { useQueries } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { QuestionOut, TopicOut } from "@/types";

interface QuestionResult {
  type: "question";
  question: QuestionOut;
  topicSlug: string;
  topicTitle: string;
}

interface PageResult {
  type: "page";
  title: string;
  href: string;
  icon: React.ReactNode;
}

type SearchResult = QuestionResult | PageResult;

const PAGES: PageResult[] = [
  { type: "page", title: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { type: "page", title: "Roadmap", href: "/roadmap", icon: <Map className="h-4 w-4" /> },
  { type: "page", title: "Patterns", href: "/patterns", icon: <Shapes className="h-4 w-4" /> },
  { type: "page", title: "Stats", href: "/stats", icon: <BarChart3 className="h-4 w-4" /> },
  { type: "page", title: "Settings", href: "/settings", icon: <Settings className="h-4 w-4" /> },
];

export function SearchCommand() {
  const open = useUIStore((s) => s.searchOpen);
  const setOpen = useUIStore((s) => s.setSearchOpen);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const topics = useTopics();

  const topicQueries = useQueries({
    queries: (topics.data ?? []).map((t: TopicOut) => ({
      queryKey: ["topic", t.slug],
      queryFn: () => api.topics.get(t.slug),
      enabled: !!topics.data,
      staleTime: 1000 * 60 * 5,
    })),
  });

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
    const q = query.toLowerCase().trim();
    if (!q) return PAGES as SearchResult[];

    const matches: SearchResult[] = [];

    for (const page of PAGES) {
      if (page.title.toLowerCase().includes(q)) {
        matches.push(page);
      }
    }

    if (topics.data) {
      for (const page of topics.data) {
        if (page.title.toLowerCase().includes(q)) {
          matches.push({
            type: "page",
            title: page.title,
            href: `/topic/${page.slug}`,
            icon: <BookOpen className="h-4 w-4" />,
          });
        }
      }
    }

    for (const tq of topicQueries) {
      if (!tq.data?.questions) continue;
      for (const question of tq.data.questions) {
        if (
          question.title.toLowerCase().includes(q) ||
          question.pattern.toLowerCase().includes(q) ||
          question.slug.toLowerCase().includes(q)
        ) {
          matches.push({
            type: "question",
            question,
            topicSlug: tq.data.slug,
            topicTitle: tq.data.title,
          });
        }
      }
    }

    return matches.slice(0, 10);
  }, [query, topics.data, topicQueries]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const navigate = (result: SearchResult) => {
    if (result.type === "page") {
      router.push(result.href);
    } else {
      router.push(`/question/${result.question.slug}`);
    }
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
            placeholder="Search questions, topics, pages..."
            className="flex-1 h-12 bg-transparent text-sm outline-none placeholder:text-[rgb(var(--muted))]"
          />
          <button onClick={() => setOpen(false)} className="text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {query.trim() && results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-[rgb(var(--muted))]">
              No results for &ldquo;{query}&rdquo;
            </div>
          )}

          {!query.trim() && (
            <p className="px-4 pt-3 pb-1 text-[10px] font-semibold tracking-wider text-[rgb(var(--muted))]">
              QUICK NAVIGATION
            </p>
          )}

          {results.map((r, i) => (
            <button
              key={r.type === "page" ? r.href : r.question.id}
              onClick={() => navigate(r)}
              onMouseEnter={() => setSelectedIndex(i)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                i === selectedIndex ? "bg-brand-50 dark:bg-brand-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
              )}
            >
              {r.type === "page" ? (
                <>
                  <span className="text-[rgb(var(--muted))]">{r.icon}</span>
                  <span className="text-sm font-medium flex-1">{r.title}</span>
                </>
              ) : (
                <>
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
                </>
              )}
              <ArrowRight className="h-3.5 w-3.5 text-[rgb(var(--muted))] shrink-0" />
            </button>
          ))}
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
