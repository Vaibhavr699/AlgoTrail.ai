import { getSession } from "next-auth/react";
import type {
  AIExplanation,
  AIHint,
  AIStudyPath,
  ChatMessage,
  DailyChallengeOut,
  InterviewCategoryOut,
  InterviewCategoryWithQuestions,
  InterviewProgressOut,
  LeetCodeProblem,
  LeetCodeSearchResult,
  NoteOut,
  PatternLesson,
  ProgressMutationResult,
  ProgressOut,
  Status,
  StatsOut,
  TopicOut,
  TopicWithQuestions,
} from "@/types";
import type { BillingInfo, ExplainProblemResult } from "@/types";
import { getAccessToken, setAccessToken } from "./auth-token";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Bearer is the backend-issued JWT. The in-memory cache (kept warm by TokenSync)
// is the fast path; on a cold start we resolve it once from the session.
async function getAuthHeader(): Promise<Record<string, string>> {
  if (typeof window === "undefined") return {};
  let token = getAccessToken();
  if (!token) {
    const session = await getSession();
    token = session?.accessToken ?? null;
    setAccessToken(token);
  }
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function http<T>(
  path: string,
  init?: RequestInit & { json?: unknown }
): Promise<T> {
  const { json, headers, ...rest } = init ?? {};
  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(await getAuthHeader()),
      ...(headers ?? {}),
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  topics: {
    list: () => http<TopicOut[]>("/api/topics"),
    get: (slug: string) => http<TopicWithQuestions>(`/api/topics/${slug}`),
  },
  progress: {
    list: () => http<ProgressOut[]>("/api/progress"),
    upsert: (questionId: string, status: Status, timeSpent?: number) =>
      http<ProgressMutationResult>("/api/progress", {
        method: "PATCH",
        json: { question_id: questionId, status, time_spent: timeSpent },
      }),
  },
  notes: {
    get: (questionSlug: string) =>
      http<NoteOut | null>(`/api/notes/${questionSlug}`),
    upsert: (questionId: string, content: string, language = "python", codeSnippet?: string) =>
      http<NoteOut>("/api/notes", {
        method: "POST",
        json: {
          question_id: questionId,
          content,
          language,
          code_snippet: codeSnippet,
        },
      }),
  },
  stats: {
    get: () => http<StatsOut>("/api/stats"),
  },
  leetcode: {
    problem: (slug: string) => http<LeetCodeProblem>(`/api/leetcode/problems/${slug}`),
    search: (params: { q?: string; difficulty?: string; tags?: string; limit?: number; skip?: number }) => {
      const sp = new URLSearchParams();
      if (params.q) sp.set("q", params.q);
      if (params.difficulty) sp.set("difficulty", params.difficulty);
      if (params.tags) sp.set("tags", params.tags);
      if (params.limit) sp.set("limit", String(params.limit));
      if (params.skip) sp.set("skip", String(params.skip));
      return http<LeetCodeSearchResult>(`/api/leetcode/search?${sp.toString()}`);
    },
  },
  dailyChallenge: {
    get: () => http<DailyChallengeOut>("/api/daily-challenge"),
  },
  ai: {
    generatePath: (goal = "MAANG interview prep", weeks = 8) =>
      http<AIStudyPath>("/api/ai/generate-path", {
        method: "POST",
        json: { goal, weeks },
      }),
    hint: (questionSlug: string, level = 1) =>
      http<AIHint>("/api/ai/hint", {
        method: "POST",
        json: { question_slug: questionSlug, level },
      }),
    explain: (questionSlug: string, language = "python") =>
      http<AIExplanation>("/api/ai/explain", {
        method: "POST",
        json: { question_slug: questionSlug, language },
      }),
    teachPattern: (patternName: string, topicContext?: string) =>
      http<PatternLesson>("/api/ai/teach-pattern", {
        method: "POST",
        json: { pattern_name: patternName, topic_context: topicContext },
      }),
    patternTemplate: (patternName: string, language: string) =>
      http<{ template: string; language: string }>("/api/ai/pattern-template", {
        method: "POST",
        json: { pattern_name: patternName, language },
      }),
    chat: (patternName: string, messages: ChatMessage[]) =>
      http<{ reply: string }>("/api/ai/chat", {
        method: "POST",
        json: { pattern_name: patternName, messages },
      }),
    explainProblem: (url: string) =>
      http<ExplainProblemResult>("/api/ai/explain-problem", {
        method: "POST",
        json: { url },
      }),
  },
  billing: {
    me: () => http<BillingInfo>("/api/billing/me"),
    checkout: () => http<{ url: string }>("/api/billing/checkout", { method: "POST" }),
    portal: () => http<{ url: string }>("/api/billing/portal", { method: "POST" }),
  },
  interview: {
    categories: () => http<InterviewCategoryOut[]>("/api/interview/categories"),
    category: (slug: string) =>
      http<InterviewCategoryWithQuestions>(`/api/interview/categories/${slug}`),
    progress: () => http<InterviewProgressOut[]>("/api/interview/progress"),
    setProgress: (questionId: string, patch: { reviewed?: boolean; bookmarked?: boolean }) =>
      http<InterviewProgressOut>(`/api/interview/progress/${questionId}`, {
        method: "POST",
        json: patch,
      }),
  },
  account: {
    notifications: () => http<{ weekly_digest: boolean }>("/api/account/notifications"),
    setWeeklyDigest: (weekly_digest: boolean) =>
      http<{ weekly_digest: boolean }>("/api/account/notifications", {
        method: "PATCH",
        json: { weekly_digest },
      }),
    sendDigestPreview: () =>
      http<{ sent_to: string; digest: Record<string, number> }>("/api/account/digest-preview", {
        method: "POST",
      }),
  },
};
