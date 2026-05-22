import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  accent = "brand",
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  accent?: "brand" | "orange" | "emerald" | "amber";
  icon?: ReactNode;
}) {
  const accents = {
    brand: "border-l-brand-500",
    orange: "border-l-orange-500",
    emerald: "border-l-emerald-500",
    amber: "border-l-amber-500",
  } as const;

  return (
    <Card className={cn("p-5 border-l-4", accents[accent])}>
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs uppercase tracking-wider text-[rgb(var(--muted))]">
          {label}
        </div>
        {icon && <div className="text-[rgb(var(--muted))]">{icon}</div>}
      </div>
      <div className="mt-2 text-2xl font-semibold font-mono tracking-tight">
        {value}
      </div>
      {hint && (
        <div className="mt-1 text-xs text-[rgb(var(--muted))]">{hint}</div>
      )}
    </Card>
  );
}
