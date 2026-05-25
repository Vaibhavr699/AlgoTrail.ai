"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PillLink } from "@/components/marketing/pill-button";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/#roadmap", label: "Roadmap" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#about", label: "About" },
];

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "border-b border-forest-900/8 bg-canvas/85 backdrop-blur"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link
          href="/"
          className="flex items-center text-2xl font-extrabold tracking-tight text-forest-ink"
        >
          <Image src="/AlgoTrailnobg.png" alt="AlgoTrail.ai" width={38} height={38} className="h-12 w-12" />
          AlgoTrail.ai
        </Link>

        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="px-4 py-2 text-[15px] font-medium text-forest-ink hover:text-forest-600 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex">
          <PillLink href="/signup" size="md">
            Get started
          </PillLink>
        </div>

        <button
          aria-label="Toggle menu"
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-forest-50"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-forest-900/8 bg-canvas">
          <div className="px-6 py-4 space-y-1">
            {LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-2.5 text-[15px] font-medium text-forest-ink hover:bg-forest-50"
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block rounded-full border border-forest-900/15 px-5 py-2.5 text-center text-sm font-medium text-forest-700 hover:bg-forest-50"
              >
                Sign in
              </Link>
              <PillLink href="/signup" size="md" className="justify-center">
                Get started
              </PillLink>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
