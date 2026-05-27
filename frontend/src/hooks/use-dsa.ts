"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ChatMessage, Status } from "@/types";

export function useTopics() {
  return useQuery({ queryKey: ["topics"], queryFn: api.topics.list });
}

export function useTopic(slug: string) {
  return useQuery({
    queryKey: ["topic", slug],
    queryFn: () => api.topics.get(slug),
    enabled: !!slug,
  });
}

export function useProgress() {
  return useQuery({ queryKey: ["progress"], queryFn: api.progress.list });
}

export function useStats() {
  return useQuery({ queryKey: ["stats"], queryFn: api.stats.get });
}

export function useUpdateProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      questionId,
      status,
      timeSpent,
    }: {
      questionId: string;
      status: Status;
      timeSpent?: number;
    }) => api.progress.upsert(questionId, status, timeSpent),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["progress"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useDailyChallenge() {
  return useQuery({
    queryKey: ["daily-challenge"],
    queryFn: api.dailyChallenge.get,
    staleTime: 1000 * 60 * 5,
  });
}

export function useNote(questionSlug: string) {
  return useQuery({
    queryKey: ["note", questionSlug],
    queryFn: () => api.notes.get(questionSlug),
    enabled: !!questionSlug,
  });
}

export function useUpsertNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      questionId,
      content,
      language,
      codeSnippet,
    }: {
      questionId: string;
      content: string;
      language?: string;
      codeSnippet?: string;
    }) => api.notes.upsert(questionId, content, language, codeSnippet),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["note"] });
    },
  });
}

export function useLeetCodeProblem(slug: string | null | undefined) {
  return useQuery({
    queryKey: ["leetcode", slug],
    queryFn: () => api.leetcode.problem(slug!),
    enabled: !!slug,
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });
}

export function useAIHint(questionSlug: string) {
  return useMutation({
    mutationFn: (level: number) => api.ai.hint(questionSlug, level),
  });
}

export function useAIExplain(questionSlug: string) {
  return useMutation({
    mutationFn: (language: string) => api.ai.explain(questionSlug, language),
  });
}

export function useGenerateStudyPath() {
  return useMutation({
    mutationFn: ({ goal, weeks }: { goal: string; weeks: number }) =>
      api.ai.generatePath(goal, weeks),
  });
}

export function useTeachPattern() {
  return useMutation({
    mutationFn: ({ patternName, topicContext }: { patternName: string; topicContext?: string }) =>
      api.ai.teachPattern(patternName, topicContext),
  });
}

export function usePatternChat() {
  return useMutation({
    mutationFn: ({ patternName, messages }: { patternName: string; messages: ChatMessage[] }) =>
      api.ai.chat(patternName, messages),
  });
}
