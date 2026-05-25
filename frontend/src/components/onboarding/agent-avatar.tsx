"use client";

import { cn } from "@/lib/utils";

export function AgentAvatar({ size = "md", pulse = false, className }: { size?: "sm" | "md" | "lg"; pulse?: boolean; className?: string }) {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-11 w-11",
    lg: "h-16 w-16",
  };

  return (
    <div className={cn("relative shrink-0", className)}>
      {pulse && (
        <span className="absolute inset-0 rounded-full bg-brand-400 animate-ping opacity-20" />
      )}
      <div className={cn("rounded-full overflow-hidden ring-2 ring-brand-200 dark:ring-brand-800", sizes[size])}>
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
          {/* Background */}
          <circle cx="60" cy="60" r="60" fill="url(#agentGrad)" />

          {/* Hair - dark brown, long */}
          <ellipse cx="60" cy="44" rx="32" ry="30" fill="#3D2314" />
          <ellipse cx="35" cy="62" rx="10" ry="22" fill="#3D2314" />
          <ellipse cx="85" cy="62" rx="10" ry="22" fill="#3D2314" />
          <ellipse cx="60" cy="38" rx="28" ry="24" fill="#4A2E1A" />

          {/* Face */}
          <ellipse cx="60" cy="56" rx="24" ry="26" fill="#F5D6B8" />

          {/* Blush */}
          <ellipse cx="42" cy="64" rx="6" ry="3" fill="#F5A6A6" opacity="0.4" />
          <ellipse cx="78" cy="64" rx="6" ry="3" fill="#F5A6A6" opacity="0.4" />

          {/* Eyes */}
          <ellipse cx="48" cy="55" rx="4.5" ry="5" fill="white" />
          <ellipse cx="72" cy="55" rx="4.5" ry="5" fill="white" />
          <ellipse cx="49" cy="55.5" rx="2.5" ry="3" fill="#2D5A3D" />
          <ellipse cx="73" cy="55.5" rx="2.5" ry="3" fill="#2D5A3D" />
          <circle cx="49.5" cy="54.5" r="1" fill="white" />
          <circle cx="73.5" cy="54.5" r="1" fill="white" />

          {/* Eyebrows */}
          <path d="M42 48 Q48 44 54 48" stroke="#3D2314" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M66 48 Q72 44 78 48" stroke="#3D2314" strokeWidth="1.5" strokeLinecap="round" fill="none" />

          {/* Nose */}
          <path d="M58 62 Q60 65 62 62" stroke="#D4A88C" strokeWidth="1.2" strokeLinecap="round" fill="none" />

          {/* Smile */}
          <path d="M50 69 Q60 77 70 69" stroke="#C47A5A" strokeWidth="1.8" strokeLinecap="round" fill="none" />

          {/* Top / shirt */}
          <path d="M30 95 Q35 82 60 80 Q85 82 90 95 L90 120 L30 120 Z" fill="#3A7048" />
          <path d="M50 80 Q60 84 70 80" stroke="#2D5A3D" strokeWidth="1" fill="none" />

          {/* Hair front bangs */}
          <path d="M36 42 Q42 28 58 30 Q50 38 42 44" fill="#3D2314" />
          <path d="M58 30 Q72 27 82 40 Q76 36 68 42 Q64 34 58 30" fill="#4A2E1A" />

          <defs>
            <linearGradient id="agentGrad" x1="0" y1="0" x2="120" y2="120">
              <stop stopColor="#E8F5E9" />
              <stop offset="1" stopColor="#C8E6C9" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
