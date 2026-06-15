"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { InterviewProgressOut } from "@/types";

export function useInterviewCategories() {
  return useQuery({ queryKey: ["interview-categories"], queryFn: api.interview.categories });
}

export function useInterviewCategory(slug: string) {
  return useQuery({
    queryKey: ["interview-category", slug],
    queryFn: () => api.interview.category(slug),
    enabled: !!slug,
  });
}

export function useInterviewProgress() {
  return useQuery({
    queryKey: ["interview-progress"],
    queryFn: api.interview.progress,
  });
}

export function useToggleInterviewProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      questionId,
      reviewed,
      bookmarked,
    }: {
      questionId: string;
      reviewed?: boolean;
      bookmarked?: boolean;
    }) => api.interview.setProgress(questionId, { reviewed, bookmarked }),
    onSuccess: (updated: InterviewProgressOut) => {
      qc.setQueryData<InterviewProgressOut[]>(["interview-progress"], (prev) => {
        const list = prev ?? [];
        const i = list.findIndex(
          (p) => p.interview_question_id === updated.interview_question_id
        );
        if (i === -1) return [...list, updated];
        const copy = [...list];
        copy[i] = updated;
        return copy;
      });
      qc.invalidateQueries({ queryKey: ["interview-categories"] });
    },
  });
}
