import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300",
        outline: "border border-[rgb(var(--border))] text-[rgb(var(--foreground))]",
        easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
        medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
        hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
        muted: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
