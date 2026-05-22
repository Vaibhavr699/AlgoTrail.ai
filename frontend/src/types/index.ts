export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export type Status =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "SOLVED"
  | "NEEDS_REVIEW";

export interface QuestionOut {
  id: string;
  topic_id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  pattern: string;
  leetcode_id: number | null;
  leetcode_slug: string | null;
  order: number;
  hint: string | null;
  key_insight: string | null;
  companies: string[];
}

export interface TopicOut {
  id: string;
  slug: string;
  title: string;
  icon: string;
  order: number;
  estimated_days: number;
  description: string;
  patterns: string[];
  color: string;
}

export interface TopicWithQuestions extends TopicOut {
  questions: QuestionOut[];
}

export interface ProgressOut {
  id: string;
  user_id: string;
  question_id: string;
  status: Status;
  solved_at: string | null;
  attempts: number;
  time_spent: number;
  revisit_at: string | null;
}

export interface ProgressMutationResult {
  progress: ProgressOut;
  new_streak: number;
  xp_gained: number;
}

export interface NoteOut {
  id: string;
  user_id: string;
  question_id: string;
  content: string;
  language: string;
  code_snippet: string | null;
  updated_at: string;
}

export interface StatsOut {
  total_solved: number;
  streak: number;
  longest_streak: number;
  by_difficulty: { EASY: number; MEDIUM: number; HARD: number };
  by_topic: Array<{
    topic_id: string;
    slug: string;
    title: string;
    solved: number;
    total: number;
  }>;
  activity: Array<{ date: string; count: number }>;
  readiness: {
    arrays_and_strings: number;
    core_data_structures: number;
    search_and_optimization: number;
    advanced: number;
  };
}
