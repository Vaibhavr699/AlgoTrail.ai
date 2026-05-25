"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { forwardRef, ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "filled" | "outline" | "ghost" | "white";
type Size = "md" | "lg";

const baseClasses =
  "group inline-flex items-center gap-2 rounded-full font-medium tracking-tight transition-all duration-200 hover:scale-[1.015] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:opacity-50 disabled:pointer-events-none";

const variantClasses: Record<Variant, string> = {
  filled:
    "bg-forest-500 text-white hover:bg-forest-600 shadow-sm shadow-forest-900/10",
  outline:
    "border border-forest-700/15 text-forest-700 hover:bg-forest-50",
  ghost:
    "text-forest-700 hover:bg-forest-50",
  white:
    "bg-white text-forest-700 hover:bg-white/95 shadow-sm",
};

const sizeClasses: Record<Size, { wrap: string; circle: string; icon: string }> = {
  md: {
    wrap: "h-11 pl-5 pr-1.5 text-sm",
    circle: "h-8 w-8",
    icon: "h-4 w-4",
  },
  lg: {
    wrap: "h-14 pl-7 pr-2 text-[15px]",
    circle: "h-10 w-10",
    icon: "h-[18px] w-[18px]",
  },
};

interface PillCommon {
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  className?: string;
}

interface PillLinkProps
  extends PillCommon,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "color"> {
  href: string;
  children: React.ReactNode;
}

export function PillLink({
  href,
  variant = "filled",
  size = "lg",
  arrow = true,
  className,
  children,
  ...rest
}: PillLinkProps) {
  const s = sizeClasses[size];
  return (
    <Link
      href={href}
      className={cn(baseClasses, variantClasses[variant], s.wrap, className)}
      {...rest}
    >
      <span className="pr-1">{children}</span>
      {arrow && (
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-full transition-transform duration-200 group-hover:rotate-45",
            s.circle,
            variant === "filled" || variant === "white"
              ? "bg-white/95 text-forest-700"
              : "bg-forest-700 text-white"
          )}
        >
          <ArrowUpRight className={s.icon} strokeWidth={2.4} />
        </span>
      )}
    </Link>
  );
}

interface PillButtonProps
  extends PillCommon,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  children: React.ReactNode;
}

export const PillButton = forwardRef<HTMLButtonElement, PillButtonProps>(
  function PillButton(
    { variant = "filled", size = "lg", arrow = true, className, children, ...rest },
    ref
  ) {
    const s = sizeClasses[size];
    return (
      <button
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], s.wrap, className)}
        {...rest}
      >
        <span className="pr-1">{children}</span>
        {arrow && (
          <span
            className={cn(
              "inline-flex items-center justify-center rounded-full transition-transform duration-200 group-hover:rotate-45",
              s.circle,
              variant === "filled" || variant === "white"
                ? "bg-white/95 text-forest-700"
                : "bg-forest-700 text-white"
            )}
          >
            <ArrowUpRight className={s.icon} strokeWidth={2.4} />
          </span>
        )}
      </button>
    );
  }
);
