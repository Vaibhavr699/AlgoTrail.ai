import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { InterviewCategoryOut } from "@/types";

export function CategoryCard({
  category,
  reviewedCount,
}: {
  category: InterviewCategoryOut;
  reviewedCount: number;
}) {
  return (
    <Link href={`/interview-prep/${category.slug}`}>
      <Card className="p-5 h-full hover:border-brand-400 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden>
            {category.icon}
          </span>
          <h2 className="text-sm font-semibold">{category.title}</h2>
        </div>
        <p className="mt-2 text-sm text-[rgb(var(--muted))]">{category.description}</p>
        <p className="mt-3 text-xs text-[rgb(var(--muted))]">
          {reviewedCount}/{category.question_count} reviewed
        </p>
      </Card>
    </Link>
  );
}
