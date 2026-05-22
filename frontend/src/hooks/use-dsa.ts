"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Status } from "@/types";

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
