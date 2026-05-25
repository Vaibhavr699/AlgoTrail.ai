import Link from "next/link";
import { Check, Star, Plus, ArrowUpRight } from "lucide-react";
import { PillLink } from "@/components/marketing/pill-button";
import { HeroCollage } from "@/components/marketing/hero-collage";
import { LogoMarquee } from "@/components/marketing/logo-marquee";
import { Reveal, RevealGroup, RevealItem } from "@/components/marketing/reveal";

export default function LandingPage() {
  return (
    <>
      {/* ─── HERO ──────────────────────────────────────────────── */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-10 lg:pt-16 pb-20 lg:pb-28 grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <Reveal className="lg:col-span-6" as="div">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-forest-ink leading-[0.98] tracking-[-0.035em]">
              Learn The Pattern
              <br />
              Not The Problem
            </h1>
            <p className="mt-7 max-w-md text-base sm:text-lg text-forest-ink/70 leading-relaxed">
              A guided DSA roadmap that tells you the single next problem to
              solve — so you stop bouncing between random tabs and actually
              finish the topic in front of you.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <PillLink href="/signup">Start your roadmap</PillLink>
              <PillLink href="/dashboard" variant="outline" arrow={false}>
                See the dashboard
              </PillLink>
            </div>
          </Reveal>

          <div className="lg:col-span-6">
            <HeroCollage />
          </div>
        </div>
      </section>

      {/* ─── TRUSTED LOGO MARQUEE ─────────────────────────────── */}
      <section className="border-y border-forest-900/8 bg-canvas">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-10">
          <Reveal>
            <p className="text-center text-sm font-medium text-forest-ink/60">
              The patterns waiting in your roadmap
            </p>
          </Reveal>
          <div className="mt-6">
            <LogoMarquee />
          </div>
        </div>
      </section>

      {/* ─── "BUILT FOR REAL INTERVIEWS" + STATS ─────────────── */}
      <section id="about" className="mx-auto max-w-7xl px-6 lg:px-10 py-24 lg:py-32">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <Reveal className="lg:col-span-6">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-forest-ink leading-[1.02] tracking-[-0.03em]">
              Learning Built
              <br />
              For Real Interviews
            </h2>
            <p className="mt-6 max-w-md text-lg text-forest-ink/70 leading-relaxed">
              AlgoTrail.ai is a modern roadmap focused on the 14 patterns that
              actually show up — not 500 problems you&apos;ll forget.
            </p>
            <div className="mt-8">
              <PillLink href="/#roadmap">Explore the roadmap</PillLink>
            </div>
          </Reveal>

          <Reveal className="lg:col-span-6" delay={0.1}>
            <PortraitCard />
          </Reveal>
        </div>
      </section>

      {/* ─── COURSE / TOPIC CARDS ─────────────────────────────── */}
      <section id="roadmap" className="bg-forest-50/40 border-y border-forest-900/8">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 lg:py-32">
          <Reveal className="max-w-2xl">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-forest-ink tracking-[-0.03em]">
              Explore Our Pattern-Focused Topics
            </h2>
            <p className="mt-5 text-lg text-forest-ink/70 leading-relaxed">
              Each topic is an ordered playlist of 6–12 problems chosen to make
              one pattern feel obvious.
            </p>
          </Reveal>

          <RevealGroup className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TOPICS.map((t) => (
              <RevealItem key={t.title}>
                <TopicCard {...t} />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ─── OUTCOMES: TWO-COLUMN CHECKLIST ───────────────────── */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-24 lg:py-32">
        <Reveal className="max-w-2xl">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-forest-ink tracking-[-0.03em]">
            Skills That Stick After You Close The Tab
          </h2>
          <p className="mt-5 text-lg text-forest-ink/70 leading-relaxed">
            The point isn&apos;t the count — it&apos;s walking into the next
            interview knowing what shape the problem is.
          </p>
        </Reveal>

        <div className="mt-14 grid md:grid-cols-2 gap-x-12 gap-y-6">
          {OUTCOMES.map((line, i) => (
            <Reveal key={line} delay={(i % 6) * 0.04}>
              <div className="flex items-start gap-3 border-b border-forest-900/10 pb-5">
                <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-forest-500 text-white shrink-0">
                  <Check className="h-4 w-4" strokeWidth={3} />
                </span>
                <p className="text-[15px] font-medium text-forest-ink">{line}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── PRICING ──────────────────────────────────────────── */}
      <section id="pricing" className="mx-auto max-w-7xl px-6 lg:px-10 py-24 lg:py-32">
        <Reveal className="max-w-2xl">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-forest-ink tracking-[-0.03em]">
            Flexible Plans For Every Learner
          </h2>
          <p className="mt-5 text-lg text-forest-ink/70 leading-relaxed">
            Start free. Upgrade when you&apos;d genuinely miss what&apos;s on the
            other side.
          </p>
        </Reveal>

        <RevealGroup className="mt-14 grid lg:grid-cols-3 gap-5">
          {PRICING.map((p) => (
            <RevealItem key={p.name}>
              <PricingCard {...p} />
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────── */}
      <section className="bg-forest-50/40 border-y border-forest-900/8">
        <div className="mx-auto max-w-3xl px-6 lg:px-10 py-24 lg:py-32">
          <Reveal>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-forest-ink tracking-[-0.03em]">
              Frequently Asked Questions
            </h2>
            <p className="mt-5 text-lg text-forest-ink/70 leading-relaxed">
              Quick answers before you commit a single solve to the streak.
            </p>
          </Reveal>

          <div className="mt-12 space-y-3">
            {FAQ.map((q, i) => (
              <Reveal key={q.q} delay={i * 0.04}>
                <details className="group rounded-2xl border border-forest-900/10 bg-white open:bg-white px-6 py-5">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 text-[17px] font-semibold text-forest-ink">
                    {q.q}
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-forest-900/15 text-forest-700 transition-transform duration-200 group-open:rotate-45">
                      <Plus className="h-4 w-4" />
                    </span>
                  </summary>
                  <p className="mt-3 text-sm text-forest-ink/70 leading-relaxed">
                    {q.a}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-[40px] bg-forest-ink px-8 sm:px-14 py-16 sm:py-20 text-white">
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
                backgroundSize: "44px 44px",
              }}
            />
            <div className="relative grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] leading-[1.05]">
                  Start Your Learning Journey Today
                </h2>
                <p className="mt-5 text-white/75 text-lg leading-relaxed max-w-xl">
                  Join engineers building real interview-ready skills, one
                  pattern at a time.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <PillLink href="/signup" variant="white">
                  Create my account
                </PillLink>
                <PillLink href="/login" variant="ghost" arrow={false} className="text-white hover:bg-white/10">
                  I already have one
                </PillLink>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

/* ─── PIECES ───────────────────────────────────────────────── */

function PortraitCard() {
  const playlist = [
    { num: "01", name: "Maximum Sum Subarray of Size K", state: "solved", slug: "max-sum-subarray-k" },
    { num: "02", name: "Smallest Subarray with Given Sum", state: "solved", slug: "smallest-subarray-sum" },
    { num: "03", name: "Longest Substring Without Repeating", state: "current", slug: "longest-substring-no-repeat" },
    { num: "04", name: "Longest Substring with K Distinct", state: "todo", slug: "longest-substring-k-distinct" },
    { num: "05", name: "Fruits Into Baskets", state: "todo", slug: "fruits-into-baskets" },
    { num: "06", name: "Permutation in String", state: "todo", slug: "permutation-in-string" },
  ];

  return (
    <div className="relative rounded-[36px] bg-forest-ink overflow-hidden p-7 sm:p-9">
      {/* faint grid wash inside the dark card */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Header */}
      <div className="relative flex items-center justify-between text-white/70">
        <PillLink href="/roadmap#sliding-window" variant="ghost" arrow={false} className="p-0 h-auto text-white/70 hover:bg-transparent hover:text-white">
          <span className="flex flex-col items-start">
            <span className="text-[10px] font-semibold tracking-wider">
              PATTERN PLAYLIST
            </span>
            <span className="mt-1 text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Sliding Window
            </span>
          </span>
        </PillLink>
        <span className="font-mono text-xs text-white/55">2 / 8</span>
      </div>

      {/* Progress bar */}
      <div className="relative mt-4 h-1 w-full rounded-full bg-white/10 overflow-hidden">
        <div className="h-full w-[25%] rounded-full bg-forest-400" />
      </div>

      {/* Playlist — every item is a real link */}
      <ul className="relative mt-6 space-y-2">
        {playlist.map((p) => {
          const isCurrent = p.state === "current";
          const isSolved = p.state === "solved";
          return (
            <li key={p.slug}>
              <Link
                href={`/topic/sliding-window#${p.slug}`}
                className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 transition-all ${
                  isCurrent
                    ? "bg-white text-forest-ink shadow-[0_8px_30px_-12px_rgba(0,0,0,0.4)] hover:-translate-y-0.5"
                    : "bg-white/[0.04] hover:bg-white/[0.10]"
                }`}
              >
                <span
                  className={`font-mono text-[11px] ${
                    isCurrent ? "text-forest-ink/50" : "text-white/45"
                  }`}
                >
                  {p.num}
                </span>
                <span
                  className={`flex-1 text-sm font-medium truncate ${
                    isCurrent
                      ? "text-forest-ink"
                      : isSolved
                      ? "text-white/55 line-through"
                      : "text-white/85"
                  }`}
                >
                  {p.name}
                </span>
                {isCurrent && (
                  <span className="rounded-full bg-forest-500 text-white text-[10px] font-bold px-2 py-0.5 tracking-wider">
                    NOW
                  </span>
                )}
                {isSolved && (
                  <Check className="h-4 w-4 text-forest-300" strokeWidth={3} />
                )}
                {!isCurrent && !isSolved && (
                  <span className="text-[10px] text-white/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    open →
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Rating chip — overlaps top-right of card (static, no float) */}
      <div className="absolute -top-3 -right-3 sm:top-6 sm:right-6 rounded-2xl bg-white px-3.5 py-2.5 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < 4
                    ? "fill-forest-500 text-forest-500"
                    : "fill-forest-500/40 text-forest-500/40"
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] text-forest-ink">
            <span className="font-bold">4.9</span>
            <span className="text-forest-ink/60"> avg solve</span>
          </span>
        </div>
      </div>

      {/* Streak chip — real link to the dashboard */}
      <Link
        href="/dashboard"
        className="group absolute -bottom-4 -left-4 sm:bottom-6 sm:left-6 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-forest-ink shadow-xl flex items-center gap-2 transition-transform hover:-translate-y-0.5"
      >
        <span className="inline-flex h-2 w-2 rounded-full bg-forest-500" />
        12-day streak
        <ArrowUpRight className="h-3.5 w-3.5 text-forest-700/60 transition-transform group-hover:rotate-45 group-hover:text-forest-700" />
      </Link>
    </div>
  );
}

function TopicCard({
  title,
  body,
  solved,
  total,
}: {
  title: string;
  body: string;
  solved: number;
  total: number;
}) {
  const pct = Math.round((solved / total) * 100);
  return (
    <div className="group h-full rounded-3xl bg-white border border-forest-900/8 p-6 hover:border-forest-500/40 hover:shadow-[0_18px_50px_-30px_rgba(13,31,18,0.3)] transition-all duration-300">
      <div className="flex items-center justify-between">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-forest-50 text-forest-600 text-base font-bold">
          {title.charAt(0)}
        </span>
        <span className="text-xs font-mono text-forest-ink/50">
          {solved}/{total}
        </span>
      </div>
      <h3 className="mt-6 text-xl font-bold text-forest-ink tracking-tight">
        {title}
      </h3>
      <p className="mt-2 text-sm text-forest-ink/65 leading-relaxed">{body}</p>
      <div className="mt-6 h-1.5 w-full rounded-full bg-forest-900/8 overflow-hidden">
        <div
          className="h-full rounded-full bg-forest-500 transition-all duration-700 group-hover:bg-forest-600"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function PricingCard({
  name,
  price,
  cadence,
  blurb,
  features,
  featured,
}: {
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  features: string[];
  featured?: boolean;
}) {
  return (
    <div
      className={`relative h-full rounded-3xl p-8 flex flex-col ${
        featured
          ? "bg-forest-ink text-white"
          : "bg-white border border-forest-900/8 text-forest-ink"
      }`}
    >
      {featured && (
        <span className="absolute -top-3 left-8 rounded-full bg-white text-forest-ink text-[10px] font-semibold tracking-wider uppercase px-3 py-1">
          Most popular
        </span>
      )}
      <p className={`text-xs font-semibold tracking-wider uppercase ${featured ? "text-white/60" : "text-forest-ink/60"}`}>
        {name}
      </p>
      <div className="mt-4 flex items-baseline gap-1">
        <p className="text-5xl font-extrabold tracking-tight">{price}</p>
        <span className={featured ? "text-white/60 text-sm" : "text-forest-ink/60 text-sm"}>
          /{cadence}
        </span>
      </div>
      <p className={`mt-3 text-sm leading-relaxed ${featured ? "text-white/75" : "text-forest-ink/65"}`}>
        {blurb}
      </p>

      <ul className="mt-7 space-y-3 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm">
            <Check
              className={`h-4 w-4 mt-0.5 shrink-0 ${featured ? "text-white" : "text-forest-500"}`}
              strokeWidth={3}
            />
            <span className={featured ? "text-white/90" : "text-forest-ink/80"}>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <PillLink
          href="/signup"
          variant={featured ? "white" : "filled"}
          size="md"
          className="w-full justify-between"
        >
          Choose {name}
        </PillLink>
      </div>
    </div>
  );
}

/* ─── DATA ─────────────────────────────────────────────────── */

const TOPICS = [
  {
    title: "Arrays & Hashing",
    body: "The foundation — prefix sums, frequency counting, in-place tricks.",
    solved: 8,
    total: 12,
  },
  {
    title: "Two Pointers",
    body: "Opposing pointers, fast/slow pointers, and the classic partition shapes.",
    solved: 5,
    total: 9,
  },
  {
    title: "Sliding Window",
    body: "Fixed and dynamic windows — when to grow, when to shrink, when to reset.",
    solved: 4,
    total: 8,
  },
  {
    title: "Binary Search",
    body: "Not just on arrays — binary search on the answer is half the unlock.",
    solved: 3,
    total: 10,
  },
  {
    title: "Trees & Graphs",
    body: "BFS, DFS, level-order, topological sort, union-find — in that order.",
    solved: 2,
    total: 18,
  },
  {
    title: "Dynamic Programming",
    body: "From 1-D memoization to grids to bitmask — the pattern, not the trick.",
    solved: 1,
    total: 16,
  },
];

const OUTCOMES = [
  "Pattern-first sequencing across topics",
  "Daily next-up suggestion, always one click away",
  "Three honest statuses — New, Attempted, Solved",
  "Notes attached to the problem, exported as markdown",
  "Activity heatmap built from real solves",
  "Free to start — no credit card to play",
];

const PRICING = [
  {
    name: "Basic",
    price: "$0",
    cadence: "forever",
    blurb: "Perfect for trying the roadmap on a single topic.",
    features: [
      "Access to first 3 topics",
      "Daily next-up suggestion",
      "Activity heatmap",
      "Streak tracking",
    ],
  },
  {
    name: "Pro",
    price: "$9",
    cadence: "month",
    blurb: "The full 150-problem roadmap, all 14 patterns, every feature.",
    features: [
      "All 14 pattern topics",
      "Notes attached to every problem",
      "Markdown export of all notes",
      "Spaced-repetition queue",
      "Priority support",
    ],
    featured: true,
  },
  {
    name: "Team",
    price: "$29",
    cadence: "month",
    blurb: "Small bootcamps and study groups going through prep together.",
    features: [
      "Everything in Pro",
      "Up to 10 seats included",
      "Shared topic dashboard",
      "Anonymous group leaderboard",
      "Custom problem playlists",
    ],
  },
];

const FAQ = [
  {
    q: "Do I solve the problems inside the app?",
    a: "No. You solve them where you already do — LeetCode, your editor, a notebook. AlgoTrail.ai is the layer on top: what to do next, what you finished, what to revisit. We will never become another in-browser code editor.",
  },
  {
    q: "Where does the question list come from?",
    a: "It's hand-curated, not scraped. Each pattern has the smallest set of problems we think actually teach it — usually 6 to 12 — drawn from problems most engineers eventually see in interviews.",
  },
  {
    q: "Do I really get lifetime access on the free tier?",
    a: "Yes — the first three topics stay free forever. Pro unlocks the rest of the roadmap and every premium feature, no time limits attached.",
  },
  {
    q: "Are the courses beginner friendly?",
    a: "Arrays & Hashing assumes you can write a for-loop; that's the bar. Each topic ramps from one-liner warmups to interview-level problems, so you build confidence inside the topic before moving on.",
  },
  {
    q: "Will my notes leave the platform if I want them to?",
    a: "Yes. Notes export as plain markdown, one file per question, whenever you ask. Your prep is yours.",
  },
];
