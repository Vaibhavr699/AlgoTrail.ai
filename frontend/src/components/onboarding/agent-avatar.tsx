"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export function AgentAvatar({ size = "md", pulse = false, className }: { size?: "sm" | "md" | "lg"; pulse?: boolean; className?: string }) {
  const sizes = {
    sm: { container: "h-8 w-8", px: 32 },
    md: { container: "h-11 w-11", px: 44 },
    lg: { container: "h-16 w-16", px: 64 },
  };

  const s = sizes[size];

  return (
    <div className={cn("relative shrink-0", className)}>
      {pulse && (
        <span className="absolute inset-0 rounded-full bg-brand-400 animate-ping opacity-20" />
      )}
      <div className={cn("rounded-full overflow-hidden ring-2 ring-brand-200 dark:ring-brand-800", s.container)}>
        <Image
          src="/sage.png"
          alt="Sage"
          width={s.px}
          height={s.px}
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
