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

// LeetCode types
export interface LeetCodeTag {
  name: string;
  slug: string;
}

export interface LeetCodeProblem {
  question_id: string | null;
  title: string;
  title_slug: string;
  difficulty: string;
  content: string | null;
  topic_tags: LeetCodeTag[];
  hints: string[];
  sample_test_case: string | null;
  is_paid_only: boolean;
}

export interface LeetCodeSearchItem {
  question_id: string | null;
  frontend_question_id: string | null;
  title: string;
  title_slug: string;
  difficulty: string;
  topic_tags: LeetCodeTag[];
  is_paid_only: boolean;
  ac_rate: number | null;
}

export interface LeetCodeSearchResult {
  total: number;
  questions: LeetCodeSearchItem[];
}

// Daily Challenge
export interface DailyChallengeOut {
  question_id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  pattern: string;
  leetcode_id: number | null;
  leetcode_slug: string | null;
  topic_title: string;
  topic_slug: string;
  topic_icon: string;
  topic_color: string;
  date: string;
}

// AI types
export interface AIHint {
  hint: string;
  level: number;
  key_concept: string;
  complexity_target: string;
}

export interface AIExplanation {
  approach: string;
  intuition: string;
  steps: string[];
  code: string;
  time_complexity: string;
  space_complexity: string;
  common_mistakes: string[];
  follow_up: string;
}

export interface PatternLesson {
  pattern_name: string;
  summary: string;
  when_to_use: string;
  how_it_works: string;
  template: string;
  time_complexity: string;
  space_complexity: string;
  classic_examples: Array<{ problem: string; why: string }>;
  common_mistakes: string[];
  pro_tips: string[];
  related_patterns: string[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AIStudyPath {
  title: string;
  summary: string;
  weeks: Array<{
    week: number;
    theme: string;
    topics: string[];
    daily_hours: number;
    focus_areas: string[];
    tips: string;
  }>;
  daily_routine: {
    warmup: string;
    main_practice: string;
    review: string;
  };
  advice: string;
}

export interface BillingInfo {
  plan: "free" | "pro" | string;
  status: string | null;
  daily_limit: number;
  billing_configured: boolean;
}

export interface VisualExplanationStep {
  title: string;
  explanation: string;
  state: string;
}

export interface VisualExplanation {
  tldr: string;
  intuition: string;
  pattern: string;
  example_input: string;
  steps: VisualExplanationStep[];
  time_complexity: string;
  space_complexity: string;
  edge_cases: string[];
}

export interface ExplainProblemResult {
  slug: string;
  title: string;
  difficulty: string;
  url: string;
  explanation: VisualExplanation;
}
