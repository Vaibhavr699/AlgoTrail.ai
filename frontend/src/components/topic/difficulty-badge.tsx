import { Badge } from "@/components/ui/badge";
import type { Difficulty } from "@/types";

const labels: Record<Difficulty, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
};

const variants: Record<Difficulty, "easy" | "medium" | "hard"> = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return <Badge variant={variants[difficulty]}>{labels[difficulty]}</Badge>;
}
