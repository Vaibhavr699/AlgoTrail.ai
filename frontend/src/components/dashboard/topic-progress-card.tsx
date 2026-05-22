import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { pct } from "@/lib/utils";
import type { TopicOut } from "@/types";

export function TopicProgressCard({
  topic,
  solved,
  total,
}: {
  topic: TopicOut;
  solved: number;
  total: number;
}) {
  const p = pct(solved, total);
  return (
    <Link href={`/topic/${topic.slug}`}>
      <Card className="p-4 hover:border-brand-300 transition-colors h-full">
        <div className="flex items-start gap-3">
          <div className="text-2xl">{topic.icon}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{topic.title}</p>
            <p className="text-xs text-[rgb(var(--muted))] font-mono">
              {solved} / {total} solved
            </p>
          </div>
        </div>
        <Progress value={p} className="mt-3" />
        <p className="mt-2 text-xs text-right font-mono text-[rgb(var(--muted))]">
          {p}%
        </p>
      </Card>
    </Link>
  );
}
