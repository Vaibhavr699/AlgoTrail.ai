"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Download, Link2, Check, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { TopNav } from "@/components/layout/top-nav";
import { Button } from "@/components/ui/button";
import { useStats } from "@/hooks/use-dsa";
import { cn } from "@/lib/utils";

export default function SharePage() {
  const { data: session } = useSession();
  const stats = useStats();
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const user = session?.user;
  const userName = user?.name || "Learner";

  const overallReadiness = useMemo(() => {
    if (!stats.data) return 0;
    const r = stats.data.readiness;
    return Math.round(
      (r.arrays_and_strings + r.core_data_structures + r.search_and_optimization + r.advanced) / 4
    );
  }, [stats.data]);

  const totalSolved = stats.data?.total_solved ?? 0;
  const easy = stats.data?.by_difficulty.EASY ?? 0;
  const medium = stats.data?.by_difficulty.MEDIUM ?? 0;
  const hard = stats.data?.by_difficulty.HARD ?? 0;
  const streak = stats.data?.streak ?? 0;
  const longestStreak = stats.data?.longest_streak ?? 0;
  const topicsCompleted = (stats.data?.by_topic ?? []).filter((t) => t.solved === t.total && t.total > 0).length;
  const totalTopics = (stats.data?.by_topic ?? []).length;

  async function handleDownload() {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `algotrail-${userName.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      // silently fail
    } finally {
      setDownloading(false);
    }
  }

  function handleCopyLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (!stats.data) {
    return (
      <>
        <TopNav title="Share Progress" />
        <div className="flex-1 p-6 max-w-4xl mx-auto">
          <div className="h-96 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" />
        </div>
      </>
    );
  }

  return (
    <>
      <TopNav title="Share Progress" />
      <div className="flex-1 p-4 sm:p-6 max-w-4xl w-full mx-auto space-y-6">
        <Link
          href="/stats"
          className="inline-flex items-center gap-1.5 text-sm text-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Stats
        </Link>

        {/* The progress card */}
        <div className="flex justify-center">
          <div
            ref={cardRef}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 shadow-2xl"
            style={{
              background: "linear-gradient(145deg, #1a1a1e 0%, #222226 50%, #1a1a1e 100%)",
            }}
          >
            {/* Accent glow */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] opacity-30 blur-[80px]"
              style={{ background: "radial-gradient(circle, #3A7048, transparent 70%)" }}
            />

            <div className="relative z-10 p-7">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {user?.image ? (
                    <Image
                      src={user.image}
                      alt={userName}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-white/10"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-white/10">
                      {userName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-white font-semibold text-sm">{userName}</p>
                    <p className="text-white/40 text-xs">algotrail.ai</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/30">
                    {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>

              {/* Central ring + solved count */}
              <div className="flex flex-col items-center mt-8 mb-6">
                <div className="relative">
                  <svg width="140" height="140" viewBox="0 0 140 140">
                    {/* Background ring */}
                    <circle cx="70" cy="70" r="58" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                    {/* Easy arc */}
                    <circle
                      cx="70" cy="70" r="58"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(easy / Math.max(totalSolved, 1)) * 364} 364`}
                      strokeDashoffset="0"
                      transform="rotate(-90 70 70)"
                    />
                    {/* Medium arc */}
                    <circle
                      cx="70" cy="70" r="58"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(medium / Math.max(totalSolved, 1)) * 364} 364`}
                      strokeDashoffset={`${-((easy / Math.max(totalSolved, 1)) * 364)}`}
                      transform="rotate(-90 70 70)"
                    />
                    {/* Hard arc */}
                    <circle
                      cx="70" cy="70" r="58"
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(hard / Math.max(totalSolved, 1)) * 364} 364`}
                      strokeDashoffset={`${-(((easy + medium) / Math.max(totalSolved, 1)) * 364)}`}
                      transform="rotate(-90 70 70)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-white font-mono">{totalSolved}</span>
                    <span className="text-[10px] text-white/40 tracking-wider">SOLVED</span>
                  </div>
                </div>
              </div>

              {/* Difficulty breakdown */}
              <div className="flex items-center justify-center gap-6 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-white/50">Easy</span>
                  <span className="text-emerald-400 font-mono font-semibold">{easy}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-white/50">Medium</span>
                  <span className="text-amber-400 font-mono font-semibold">{medium}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-white/50">Hard</span>
                  <span className="text-red-400 font-mono font-semibold">{hard}</span>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-2.5 mt-6">
                <StatBlock label="Streak" value={`${streak}d`} />
                <StatBlock label="Longest" value={`${longestStreak}d`} />
                <StatBlock
                  label="Readiness"
                  value={`${overallReadiness}%`}
                  valueClass={
                    overallReadiness >= 70 ? "text-emerald-400" : overallReadiness >= 40 ? "text-amber-400" : "text-red-400"
                  }
                />
              </div>

              {/* Topics progress bar */}
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-white/40">Topics completed</span>
                  <span className="text-white/60 font-mono">{topicsCompleted}/{totalTopics}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-400"
                    style={{ width: `${totalTopics > 0 ? (topicsCompleted / totalTopics) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Image
                    src="/AlgoTrailnobg.png"
                    alt="AlgoTrail.ai"
                    width={20}
                    height={20}
                    className="h-5 w-5 brightness-0 invert opacity-60"
                  />
                  <span className="text-xs font-semibold text-white/50">AlgoTrail.ai</span>
                </div>
                <span className="text-[10px] text-white/25 font-mono">Learn the pattern, not the problem</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-3">
          <Button onClick={handleDownload} disabled={downloading} className="gap-2">
            <Download className="h-4 w-4" />
            {downloading ? "Generating..." : "Download as Image"}
          </Button>
          <Button variant="secondary" onClick={handleCopyLink} className="gap-2">
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-500" />
                Copied!
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4" />
                Copy Link
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}

function StatBlock({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3 text-center">
      <p className="text-[10px] text-white/35 tracking-wider uppercase">{label}</p>
      <p className={cn("text-lg font-bold font-mono text-white mt-0.5", valueClass)}>{value}</p>
    </div>
  );
}
