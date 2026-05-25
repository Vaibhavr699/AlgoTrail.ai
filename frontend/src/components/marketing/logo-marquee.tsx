"use client";

import { Fragment } from "react";

// Pattern names rendered as faux-logo wordmarks — stand in for company logos
// while keeping the same visual rhythm as the Eductix reference.
const PATTERNS = [
  "Sliding Window",
  "Two Pointers",
  "Binary Search",
  "Hash Map",
  "Backtracking",
  "Greedy",
  "Topological",
  "Union Find",
  "Dynamic Programming",
];

export function LogoMarquee() {
  return (
    <div className="relative overflow-hidden">
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-canvas to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-canvas to-transparent z-10" />

      <div className="flex w-max animate-marquee">
        {[0, 1].map((dup) => (
          <Fragment key={dup}>
            {PATTERNS.map((name) => (
              <div
                key={`${dup}-${name}`}
                className="flex items-center gap-2.5 px-10 shrink-0"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-forest-500/10 text-forest-600">
                  <Glyph />
                </span>
                <span className="text-lg sm:text-xl font-bold tracking-tight text-forest-700/70">
                  {name}
                </span>
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function Glyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
      <path
        d="M8 1.5l2 4.5 4.5.5-3.5 3 1 4.5L8 11.5 4 14l1-4.5L1.5 6.5 6 6l2-4.5z"
        fill="currentColor"
      />
    </svg>
  );
}
