import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { InterviewCategoryOut } from "@/types";

export function CategoryCard({
  category,
  reviewedCount,
}: {
  category: InterviewCategoryOut;
  reviewedCount: number;
}) {
  const pct = category.question_count
    ? Math.round((reviewedCount / category.question_count) * 100)
    : 0;

  return (
    <Link href={`/interview-prep/${category.slug}`} className="group block">
      <Card className="relative h-full overflow-hidden p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-brand-300">
        {/* Category color accent bar */}
        <span
          className="absolute inset-x-0 top-0 h-1 opacity-80"
          style={{ backgroundColor: category.color }}
          aria-hidden
        />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl"
              style={{ backgroundColor: `${category.color}1A` }}
              aria-hidden
            >
              {category.icon}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold">{category.title}</h2>
              <p className="text-xs text-[rgb(var(--muted))]">
                {category.question_count} questions
              </p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-[rgb(var(--muted))] transition-colors group-hover:text-brand-500" />
        </div>

        <p className="mt-3 line-clamp-2 text-sm text-[rgb(var(--muted))]">
          {category.description}
        </p>

        {reviewedCount > 0 && (
          <div className="mt-4">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-full rounded-full bg-brand-500 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-[rgb(var(--muted))]">
              {reviewedCount}/{category.question_count} reviewed
            </p>
          </div>
        )}
      </Card>
    </Link>
  );
}
