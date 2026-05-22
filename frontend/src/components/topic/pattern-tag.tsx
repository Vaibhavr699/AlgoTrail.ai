import { Badge } from "@/components/ui/badge";

export function PatternTag({ pattern }: { pattern: string }) {
  return (
    <Badge variant="outline" className="font-mono text-[11px]">
      {pattern}
    </Badge>
  );
}
