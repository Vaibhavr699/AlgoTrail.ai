"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface Cell {
  date: string;
  count: number;
}

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

export function ActivityHeatmap({ activity }: { activity: Cell[] }) {
  const days = activity.slice(-84);

  const cols: Cell[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    cols.push(days.slice(i, i + 7));
  }

  const max = Math.max(1, ...days.map((d) => d.count));
  const level = (c: number) => {
    if (c === 0) return 0;
    const r = c / max;
    if (r < 0.25) return 1;
    if (r < 0.5) return 2;
    if (r < 0.75) return 3;
    return 4;
  };
  const cls = [
    "bg-gray-100 dark:bg-gray-800",
    "bg-brand-200 dark:bg-brand-900/40",
    "bg-brand-400 dark:bg-brand-700",
    "bg-brand-500 dark:bg-brand-600",
    "bg-brand-700 dark:bg-brand-500",
  ];

  const monthLabels = useMemo(() => {
    const labels: { col: number; label: string }[] = [];
    let lastMonth = "";
    cols.forEach((week, i) => {
      if (week.length === 0) return;
      const d = new Date(week[0].date);
      const month = d.toLocaleString("en-US", { month: "short" });
      if (month !== lastMonth) {
        labels.push({ col: i, label: month });
        lastMonth = month;
      }
    });
    return labels;
  }, [cols]);

  const totalInPeriod = days.reduce((s, d) => s + d.count, 0);

  return (
    <div className="w-full">
      {/* Month labels */}
      <div className="flex ml-8 mb-1">
        {cols.map((_, i) => {
          const label = monthLabels.find((m) => m.col === i);
          return (
            <div key={i} className="flex-1 min-w-0">
              {label && (
                <span className="text-[10px] text-[rgb(var(--muted))]">{label.label}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Grid */}
      <div className="flex gap-[3px]">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] shrink-0 w-7 pr-1">
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="h-[14px] flex items-center justify-end">
              <span className="text-[10px] text-[rgb(var(--muted))] leading-none">{label}</span>
            </div>
          ))}
        </div>

        {/* Heatmap columns */}
        {cols.map((week, i) => (
          <div key={i} className="flex-1 flex flex-col gap-[3px]">
            {week.map((d) => (
              <div
                key={d.date}
                title={`${d.date}: ${d.count} solved`}
                className={cn(
                  "h-[14px] rounded-[3px] transition-colors",
                  cls[level(d.count)]
                )}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-[rgb(var(--muted))]">
          {totalInPeriod} problem{totalInPeriod !== 1 ? "s" : ""} in last 12 weeks
        </span>
        <div className="flex items-center gap-1.5 text-[10px] text-[rgb(var(--muted))]">
          <span>Less</span>
          {cls.map((c, i) => (
            <div key={i} className={cn("h-[10px] w-[10px] rounded-[2px]", c)} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
