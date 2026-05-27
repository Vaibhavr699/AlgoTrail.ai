"use client";

import { cn } from "@/lib/utils";

interface DotsLoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-1 w-1",
  md: "h-1.5 w-1.5",
  lg: "h-2 w-2",
};

const gapMap = {
  sm: "gap-0.5",
  md: "gap-1",
  lg: "gap-1.5",
};

export function DotsLoader({ size = "md", className }: DotsLoaderProps) {
  return (
    <span className={cn("inline-flex items-center", gapMap[size], className)}>
      <span
        className={cn("rounded-full bg-current animate-bounce", sizeMap[size])}
        style={{ animationDelay: "0ms" }}
      />
      <span
        className={cn("rounded-full bg-current animate-bounce", sizeMap[size])}
        style={{ animationDelay: "150ms" }}
      />
      <span
        className={cn("rounded-full bg-current animate-bounce", sizeMap[size])}
        style={{ animationDelay: "300ms" }}
      />
    </span>
  );
}
