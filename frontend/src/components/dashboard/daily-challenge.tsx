"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Clock, ArrowRight, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDailyChallenge } from "@/hooks/use-dsa";
import { cn } from "@/lib/utils";
import type { Difficulty } from "@/types";

const difficultyVariant: Record<Difficulty, "easy" | "medium" | "hard"> = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
};

const difficultyLabel: Record<Difficulty, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
};

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    function calc() {
      const now = new Date();
      const tomorrow = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() + 1
        )
      );
      const diff = tomorrow.getTime() - now.getTime();
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      );
    }

    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);

  return timeLeft;
}

export function DailyChallengeCard() {
  const { data: challenge, isLoading, isError } = useDailyChallenge();
  const countdown = useCountdown();

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 p-5">
          <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="h-5 w-48 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
        </div>
      </Card>
    );
  }

  if (isError || !challenge) return null;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
          {/* Icon */}
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 shrink-0">
            <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-medium uppercase tracking-wider text-[rgb(var(--muted))]">
                Daily Challenge
              </span>
            </div>

            <h3 className="text-sm font-semibold leading-tight truncate">
              {challenge.title}
            </h3>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant={difficultyVariant[challenge.difficulty]}>
                {difficultyLabel[challenge.difficulty]}
              </Badge>
              <span className="text-xs text-[rgb(var(--muted))]">
                {challenge.pattern}
              </span>
              <span className="text-xs text-[rgb(var(--muted))]">
                &middot;
              </span>
              <span className="text-xs text-[rgb(var(--muted))]">
                {challenge.topic_title}
              </span>
            </div>
          </div>

          {/* Right side: timer + CTA */}
          <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-2 shrink-0">
            <div className={cn(
              "flex items-center gap-1.5 text-xs tabular-nums",
              "text-[rgb(var(--muted))]"
            )}>
              <Clock className="h-3 w-3" />
              <span>{countdown}</span>
            </div>

            <Button asChild size="sm" className="!rounded-full !px-4">
              <Link href={`/topic/${challenge.topic_slug}`}>
                Accept Challenge <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
