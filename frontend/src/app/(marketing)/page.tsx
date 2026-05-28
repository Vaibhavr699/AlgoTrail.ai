import type { Metadata } from "next";
import { Compass, Sparkles, Flame, Trophy, BarChart3, Brain } from "lucide-react";
import { PillLink } from "@/components/marketing/pill-button";
import { HeroLottie } from "@/components/marketing/hero-lottie";
import { SectionLottie } from "@/components/marketing/section-lottie";
import { LogoMarquee } from "@/components/marketing/logo-marquee";
import { Reveal, RevealGroup, RevealItem } from "@/components/marketing/reveal";
import {
  SITE_URL,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_DESCRIPTION,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: `${SITE_NAME} — ${SITE_TAGLINE}`,
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/AlgoTrailnobg.png`,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-US",
    },
    {
      "@type": "SoftwareApplication",
      name: SITE_NAME,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  ],
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ─── HERO ──────────────────────────────────────────────── */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-20 lg:pt-32 pb-20 lg:pb-32 grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <Reveal className="lg:col-span-6" as="div">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-forest-ink leading-[0.98] tracking-[-0.035em]">
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
            </div>
          </Reveal>

          <Reveal className="lg:col-span-6" delay={0.2}>
            <HeroLottie />
          </Reveal>
        </div>
      </section>

      {/* ─── PATTERN MARQUEE ──────────────────────────────────── */}
      <section className="border-y border-forest-900/8 bg-canvas">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-3">
          <Reveal>
            <p className="text-center text-xs font-medium text-forest-ink/50">
              The patterns waiting in your roadmap
            </p>
          </Reveal>
          <div className="mt-3">
            <LogoMarquee />
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ───────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-24 lg:py-32">
        <Reveal>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-forest-ink tracking-[-0.03em]">
            How It Works
          </h2>
        </Reveal>

        <RevealGroup className="mt-14 grid md:grid-cols-3 gap-5">
          <RevealItem>
            <div className="h-full rounded-2xl border border-forest-900/8 bg-white overflow-hidden">
              {/* Visual — topic picker mockup */}
              <div className="relative h-52 bg-gradient-to-br from-forest-600 to-emerald-500 p-5 flex items-end overflow-hidden">
                <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Compass className="h-4 w-4 text-white" />
                </div>
                <div className="w-full space-y-2">
                  {["Arrays & Hashing", "Two Pointers", "Sliding Window"].map((t, i) => (
                    <div key={t} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${i === 0 ? "bg-white text-forest-ink shadow-lg" : "bg-white/15 text-white/90"}`}>
                      <span className="h-1.5 w-1.5 rounded-full ${i === 0 ? 'bg-forest-500' : 'bg-white/40'}" />
                      {t}
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6">
                <p className="text-xs font-bold tracking-widest text-forest-ink/40">STEP 1</p>
                <h3 className="mt-1 text-lg font-bold text-forest-ink">Pick Your Topic</h3>
                <p className="mt-2 text-sm text-forest-ink/55 leading-relaxed">
                  Start with Arrays & Hashing or jump to any topic. The roadmap is ordered but flexible.
                </p>
              </div>
            </div>
          </RevealItem>

          <RevealItem>
            <div className="h-full rounded-2xl border border-forest-900/8 bg-white overflow-hidden">
              {/* Visual — problem card with cursor */}
              <div className="relative h-52 bg-gradient-to-br from-forest-800 to-forest-950 p-5 flex items-center justify-center overflow-hidden">
                <div className="w-full rounded-xl bg-white/10 backdrop-blur border border-white/10 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-white/50 tracking-wider">NEXT UP</span>
                    <span className="rounded-full bg-amber-400/20 text-amber-300 text-[9px] font-bold px-2 py-0.5">MEDIUM</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-white">Longest Substring Without Repeating</p>
                  <p className="mt-1 text-[10px] text-white/40">Sliding Window</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="rounded-lg bg-forest-500 text-white text-[10px] font-semibold px-3 py-1.5">Solve now</span>
                  </div>
                </div>
                <Sparkles className="absolute top-4 right-4 h-5 w-5 text-white/30" />
              </div>
              <div className="p-6">
                <p className="text-xs font-bold tracking-widest text-forest-ink/40">STEP 2</p>
                <h3 className="mt-1 text-lg font-bold text-forest-ink">Solve the Next Problem</h3>
                <p className="mt-2 text-sm text-forest-ink/55 leading-relaxed">
                  We tell you exactly which problem to solve next. No decision fatigue, just focused practice.
                </p>
              </div>
            </div>
          </RevealItem>

          <RevealItem>
            <div className="h-full rounded-2xl border border-forest-900/8 bg-white overflow-hidden">
              {/* Visual — streak/progress mockup */}
              <div className="relative h-52 bg-gradient-to-br from-amber-500 to-orange-500 p-5 flex items-end overflow-hidden">
                <Flame className="absolute top-4 right-4 h-6 w-6 text-white/30" />
                <div className="w-full">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-extrabold text-white">12</span>
                    <span className="text-lg font-bold text-white/70">day streak</span>
                  </div>
                  <div className="mt-3 flex gap-1">
                    {[4, 3, 2, 4, 3, 1, 2, 3, 4, 4, 2, 3].map((v, i) => (
                      <div key={i} className="flex-1 rounded-sm bg-white/20 overflow-hidden" style={{ height: 32 }}>
                        <div className="w-full rounded-sm bg-white/90" style={{ height: `${v * 25}%`, marginTop: `${100 - v * 25}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-xs font-bold tracking-widest text-forest-ink/40">STEP 3</p>
                <h3 className="mt-1 text-lg font-bold text-forest-ink">Build Your Streak</h3>
                <p className="mt-2 text-sm text-forest-ink/55 leading-relaxed">
                  Track progress, maintain your streak, and watch your interview readiness climb.
                </p>
              </div>
            </div>
          </RevealItem>
        </RevealGroup>
      </section>

      {/* ─── TRACK PROGRESS — Lottie left ────────────────────── */}
      <section className="bg-forest-50/40 border-y border-forest-900/8">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 lg:py-32 grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <SectionLottie src="/progress-lottie.json" className="w-full max-w-sm mx-auto" />
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-forest-ink tracking-[-0.03em] leading-tight">
              Track Every
              <br />
              Step Forward
            </h2>
            <p className="mt-5 text-lg text-forest-ink/70 leading-relaxed max-w-md">
              Activity heatmaps, streak counters, and topic progress bars
              that make your effort visible. Watch your readiness grow
              problem by problem.
            </p>
            <ul className="mt-8 space-y-3">
              {TRACK_FEATURES.map((f) => (
                <li key={f.label} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-100 text-forest-600 shrink-0">
                    {f.icon}
                  </span>
                  <span className="text-sm font-medium text-forest-ink">{f.label}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ─── INTERVIEW READY — Lottie right ──────────────────── */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-24 lg:py-32 grid lg:grid-cols-2 gap-12 items-center">
        <Reveal>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-forest-ink tracking-[-0.03em] leading-tight">
            Walk Into Interviews
            <br />
            With Confidence
          </h2>
          <p className="mt-5 text-lg text-forest-ink/70 leading-relaxed max-w-md">
            Our readiness score tells you exactly where you stand across
            4 key categories. No more wondering if you&apos;ve practiced enough.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-2xl border border-forest-900/8 bg-white p-4">
                <p className="text-3xl font-extrabold text-forest-ink tracking-tight">{s.value}</p>
                <p className="mt-1 text-xs text-forest-ink/50 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <SectionLottie src="/winning.json" className="w-full max-w-xs mx-auto" />
        </Reveal>
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
                <PillLink href="/login" variant="ghost" arrow={false} className="text-white border border-white/30 hover:bg-white/10">
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

/* ─── DATA ─────────────────────────────────────────────────── */

const TRACK_FEATURES = [
  { label: "Activity heatmap built from real solves", icon: <BarChart3 className="h-4 w-4" /> },
  { label: "Streak tracking with daily reminders", icon: <Flame className="h-4 w-4" /> },
  { label: "Per-topic progress bars", icon: <Brain className="h-4 w-4" /> },
  { label: "Interview readiness scoring", icon: <Trophy className="h-4 w-4" /> },
];

const STATS = [
  { value: "150+", label: "Curated problems" },
  { value: "14", label: "Core patterns" },
  { value: "4", label: "Readiness categories" },
  { value: "∞", label: "Streak potential" },
];
