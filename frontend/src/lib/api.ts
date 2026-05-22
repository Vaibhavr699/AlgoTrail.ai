import type {
  NoteOut,
  ProgressMutationResult,
  ProgressOut,
  Status,
  StatsOut,
  TopicOut,
  TopicWithQuestions,
} from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function http<T>(
  path: string,
  init?: RequestInit & { json?: unknown }
): Promise<T> {
  const { json, headers, ...rest } = init ?? {};
  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
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
};
