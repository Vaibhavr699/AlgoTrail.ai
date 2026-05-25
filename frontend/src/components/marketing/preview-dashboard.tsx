import { CheckCircle2, Flame, Layers, TrendingUp, ArrowRight } from "lucide-react";

const HEAT = [
  0, 1, 0, 2, 3, 1, 0,
  2, 4, 3, 1, 0, 2, 3,
  4, 4, 2, 3, 4, 1, 0,
  0, 2, 3, 4, 3, 2, 1,
  1, 3, 4, 2, 1, 0, 2,
  3, 4, 3, 2, 1, 1, 3,
];

const COLOR = [
  "bg-gray-100 dark:bg-gray-800",
  "bg-emerald-200/70 dark:bg-emerald-900/40",
  "bg-emerald-300 dark:bg-emerald-700/60",
  "bg-emerald-400 dark:bg-emerald-600/70",
  "bg-emerald-500 dark:bg-emerald-500",
];

export function PreviewDashboard() {
  return (
    <div className="relative">
      {/* Window chrome */}
      <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-2xl shadow-brand-900/10 overflow-hidden">
        <div className="flex items-center gap-1.5 border-b border-[rgb(var(--border))] px-4 py-2.5 bg-gray-50 dark:bg-gray-900/40">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
          <span className="ml-3 text-xs font-mono text-[rgb(var(--muted))]">algotrail.ai/dashboard</span>
        </div>

        <div className="p-5 space-y-5">
          {/* Stat row */}
          <div className="grid grid-cols-4 gap-3">
            <StatTile color="brand" icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="SOLVED" value="73 / 150" />
            <StatTile color="orange" icon={<Flame className="h-3.5 w-3.5" />} label="STREAK" value="12 days" />
            <StatTile color="emerald" icon={<Layers className="h-3.5 w-3.5" />} label="TOPICS" value="9 / 14" />
            <StatTile color="amber" icon={<TrendingUp className="h-3.5 w-3.5" />} label="THIS WEEK" value="+11" />
          </div>

          {/* Next-up callout */}
          <div className="rounded-xl border border-brand-200 dark:border-brand-900/60 bg-gradient-to-br from-brand-50 to-white dark:from-brand-900/20 dark:to-transparent p-4">
            <p className="text-[10px] font-semibold tracking-wider text-brand-600 dark:text-brand-300">NEXT UP</p>
            <p className="mt-1 text-sm font-semibold text-[rgb(var(--foreground))]">
              Longest Substring Without Repeating Characters
            </p>
            <div className="mt-1.5 flex items-center gap-2 text-xs text-[rgb(var(--muted))]">
              <span className="font-mono">Sliding Window</span>
              <span>·</span>
              <span className="rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 text-[10px] font-semibold">MEDIUM</span>
              <span className="ml-auto inline-flex items-center gap-1 text-brand-600 dark:text-brand-300 font-medium">
                Start <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </div>

          {/* Heatmap */}
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <p className="text-xs font-semibold text-[rgb(var(--foreground))]">Activity</p>
              <p className="text-[10px] text-[rgb(var(--muted))]">Last 6 weeks</p>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {HEAT.map((v, i) => (
                <span
                  key={i}
                  className={`aspect-square w-full rounded-[3px] ${COLOR[v]}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Soft glow */}
      <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-tr from-brand-400/20 via-transparent to-emerald-400/20 blur-2xl" />
    </div>
  );
}

function StatTile({
  color,
  icon,
  label,
  value,
}: {
  color: "brand" | "orange" | "emerald" | "amber";
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  const stripe = {
    brand: "bg-brand-500",
    orange: "bg-orange-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
  }[color];
  return (
    <div className="relative rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-2.5 overflow-hidden">
      <span className={`absolute left-0 top-0 h-full w-1 ${stripe}`} />
      <div className="flex items-center justify-between text-[9px] font-semibold tracking-wider text-[rgb(var(--muted))]">
        <span>{label}</span>
        <span className="text-[rgb(var(--muted))]">{icon}</span>
      </div>
      <p className="mt-1 font-mono text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}
