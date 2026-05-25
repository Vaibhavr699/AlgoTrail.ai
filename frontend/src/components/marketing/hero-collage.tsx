"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  CheckCircle2,
  Flame,
  Layers,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";

const HEAT_DATA = [
  { v: 0, d: "Mon, May 5" }, { v: 1, d: "Tue, May 6" }, { v: 0, d: "Wed, May 7" },
  { v: 2, d: "Thu, May 8" }, { v: 3, d: "Fri, May 9" }, { v: 1, d: "Sat, May 10" },
  { v: 0, d: "Sun, May 11" }, { v: 2, d: "Mon, May 12" },
  { v: 2, d: "Tue, May 13" }, { v: 4, d: "Wed, May 14" }, { v: 3, d: "Thu, May 15" },
  { v: 1, d: "Fri, May 16" }, { v: 0, d: "Sat, May 17" }, { v: 2, d: "Sun, May 18" },
  { v: 3, d: "Mon, May 19" }, { v: 4, d: "Tue, May 20" },
  { v: 4, d: "Wed, May 21" }, { v: 4, d: "Thu, May 22" }, { v: 2, d: "Fri, May 23" },
  { v: 3, d: "Sat, May 24" }, { v: 4, d: "Sun, May 25" }, { v: 1, d: "Mon, May 26" },
  { v: 0, d: "Tue, May 27" }, { v: 2, d: "Wed, May 28" },
];

const HEAT_COLOR = [
  "bg-forest-900/10",
  "bg-forest-300",
  "bg-forest-400",
  "bg-forest-500",
  "bg-forest-600",
];

const PLAYLISTS = [
  { name: "Sliding Window", count: "6 / 8", slug: "sliding-window" },
  { name: "Two Pointers", count: "4 / 9", slug: "two-pointers" },
  { name: "Binary Search", count: "2 / 10", slug: "binary-search" },
];

const NOTE_SOURCE = `# trick: complement lookup in a hash map
seen = {}
for i, n in enumerate(nums):
    if (target - n) in seen:
        return [seen[target - n], i]
    seen[n] = i`;

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

export function HeroCollage() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="relative grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 lg:h-[560px]"
    >
      {/* TOP-LEFT — Dashboard mockup card (clickable into /dashboard) */}
      <motion.div
        variants={item}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="sm:col-span-7 sm:row-span-2"
      >
        <Link
          href="/dashboard"
          className="group block h-full rounded-3xl bg-white border border-forest-900/8 shadow-[0_18px_60px_-30px_rgba(13,31,18,0.35)] p-5 flex flex-col gap-4 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-forest-500/40 hover:shadow-[0_24px_70px_-30px_rgba(13,31,18,0.45)]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
            </div>
            <span className="text-[10px] font-mono text-forest-700/60">
              algotrail.ai
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <Mini icon={<CheckCircle2 className="h-3 w-3" />} label="SOLVED" value="73 / 150" />
            <Mini icon={<Flame className="h-3 w-3" />} label="STREAK" value="12d" />
            <Mini icon={<Layers className="h-3 w-3" />} label="TOPICS" value="9 / 14" />
          </div>
          <div className="rounded-2xl border border-forest-900/10 p-3.5 group-hover:border-forest-500/30 transition-colors">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-semibold tracking-wider text-forest-600">
                NEXT UP
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-forest-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Open <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold text-forest-ink">
              Longest Substring Without Repeating Characters
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-[10px]">
              <span className="font-mono text-forest-700/70">Sliding Window</span>
              <span className="text-forest-700/40">·</span>
              <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700">
                MEDIUM
              </span>
            </div>
          </div>
          <Heatmap />
        </Link>
      </motion.div>

      {/* TOP-RIGHT — Pattern Playlists (each item is a real link) */}
      <motion.div
        variants={item}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="sm:col-span-5 sm:row-span-2 rounded-3xl bg-forest-ink p-5 flex flex-col justify-between relative overflow-hidden min-h-[240px]"
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative flex items-center gap-2 text-white/70 text-[10px] font-semibold tracking-wider">
          <Sparkles className="h-3 w-3" />
          PATTERN PLAYLISTS
        </div>
        <div className="relative space-y-2">
          {PLAYLISTS.map((p, i) => (
            <Link
              key={p.slug}
              href={`/roadmap#${p.slug}`}
              className="group flex items-center justify-between rounded-xl bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur px-3 py-2 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-[10px] text-white/50">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-medium text-white truncate">{p.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-[11px] text-white/60">{p.count}</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-white/0 group-hover:text-white/80 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
        <div className="relative">
          <p className="text-xl font-semibold text-white leading-tight">
            Interactive
            <br />
            Roadmap
          </p>
        </div>
      </motion.div>

      {/* MIDDLE-LEFT — Notes card with a real Copy button */}
      <motion.div
        variants={item}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="sm:col-span-7 rounded-3xl bg-forest-500 p-5 text-white relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold tracking-wider text-white/70">
            YOUR NOTE · TWO SUM
          </p>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/15 text-white text-[10px] font-semibold px-2.5 py-0.5">
              saved
            </span>
            <CopyButton text={NOTE_SOURCE} />
          </div>
        </div>
        <pre className="mt-4 font-mono text-[11px] leading-snug text-white/90 whitespace-pre-wrap">
{NOTE_SOURCE}
        </pre>
      </motion.div>

      {/* MIDDLE-RIGHT — Stat card "150+" */}
      <motion.div
        variants={item}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="sm:col-span-5 rounded-3xl bg-forest-ink p-5 text-white flex flex-col justify-between gap-4"
      >
        <p className="text-4xl sm:text-5xl font-bold tracking-tight">150+</p>
        <p className="text-sm text-white/80 leading-snug">
          Hand-picked problems built around real interview patterns.
        </p>
      </motion.div>

      {/* BOTTOM — "Built for the next pattern" pill card → real link */}
      <motion.div
        variants={item}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="sm:col-span-7"
      >
        <Link
          href="/roadmap"
          className="group flex items-center gap-4 rounded-3xl bg-forest-50 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-forest-100"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-forest-500 text-white shrink-0">
            <Layers className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-forest-ink">
              Built for the next pattern.
            </p>
            <p className="text-xs text-forest-700/70">
              Follow guided playlists from arrays to graphs to DP.
            </p>
          </div>
          <ArrowUpRight className="ml-auto h-5 w-5 text-forest-700/60 shrink-0 transition-transform duration-200 group-hover:rotate-45 group-hover:text-forest-700" />
        </Link>
      </motion.div>

      {/* BOTTOM-RIGHT — Small weekly progress card */}
      <motion.div
        variants={item}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="hidden sm:flex col-span-5 rounded-3xl bg-white border border-forest-900/8 p-5 flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold tracking-wider text-forest-700/60">
            THIS WEEK
          </p>
          <TrendingUp className="h-3.5 w-3.5 text-forest-500" />
        </div>
        <p className="text-3xl font-bold text-forest-ink tracking-tight">
          +11 <span className="text-sm font-medium text-forest-700/60">solved</span>
        </p>
      </motion.div>
    </motion.div>
  );
}

function Mini({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-forest-900/8 p-2 group-hover:border-forest-500/20 transition-colors">
      <div className="flex items-center justify-between text-[8px] font-semibold tracking-wider text-forest-700/60">
        <span>{label}</span>
        <span>{icon}</span>
      </div>
      <p className="mt-0.5 font-mono text-xs font-bold tabular-nums text-forest-ink">
        {value}
      </p>
    </div>
  );
}

function Heatmap() {
  return (
    <div className="grid grid-cols-8 gap-1 mt-auto">
      {HEAT_DATA.map((d, i) => (
        <span
          key={i}
          title={`${d.d} · ${d.v} solved`}
          className={`aspect-square rounded-[3px] cursor-help transition-transform hover:scale-125 ${HEAT_COLOR[d.v]}`}
        />
      ))}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable — fail silently in this preview surface
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={copied ? "Copied" : "Copy snippet"}
      className="inline-flex items-center gap-1 rounded-full bg-white/15 hover:bg-white/25 text-white text-[10px] font-semibold px-2.5 py-1 transition-colors"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3" /> Copied
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" /> Copy
        </>
      )}
    </button>
  );
}
