"use client";

import { cn } from "@/lib/utils";

interface Cell {
  date: string;
  count: number;
}

export function ActivityHeatmap({ activity }: { activity: Cell[] }) {
  // Show last 12 weeks (84 days) for compact dashboard view
  const days = activity.slice(-84);

  // Group into 12 columns of 7
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

  return (
    <div>
      <div className="flex gap-1">
        {cols.map((week, i) => (
          <div key={i} className="flex flex-col gap-1">
            {week.map((d) => (
              <div
                key={d.date}
                title={`${d.date}: ${d.count}`}
                className={cn("h-3 w-3 rounded-sm", cls[level(d.count)])}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-[rgb(var(--muted))]">
        <span>Less</span>
        {cls.map((c, i) => (
          <div key={i} className={cn("h-3 w-3 rounded-sm", c)} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
