import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Compass, Sparkles, Flame } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-canvas">
      {/* LEFT — form column */}
      <div className="relative flex flex-col px-6 sm:px-12 py-8">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-grid bg-grid-fade opacity-70"
        />
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-forest-ink">
            <Image src="/AlgoTrailnobg.png" alt="AlgoTrail.ai" width={28} height={28} className="h-7 w-7" />
            AlgoTrail.ai
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-forest-ink/60 hover:text-forest-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back home</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-sm py-10">{children}</div>
        </div>

        <p className="text-center text-xs text-forest-ink/50">
          © {new Date().getFullYear()} AlgoTrail.ai
        </p>
      </div>

      {/* RIGHT — marketing column (forest ink) */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-forest-ink p-14 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(60% 60% at 80% 0%, rgba(58,112,72,0.55) 0%, rgba(58,112,72,0) 70%)",
          }}
        />

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur px-3 py-1 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
            150 problems · 14 patterns
          </span>
          <h2 className="mt-7 text-4xl xl:text-5xl font-extrabold tracking-[-0.03em] leading-[1.04]">
            One problem a day,
            <br /> in the right order.
          </h2>
          <p className="mt-5 max-w-md text-white/75 leading-relaxed">
            AlgoTrail.ai tells you which question to solve next so prep stops
            being a guessing game. Sign in to pick up where you left off.
          </p>
        </div>

        <ul className="relative space-y-5 max-w-md">
          <Bullet
            icon={<Compass className="h-4 w-4" />}
            title="A roadmap, not a list"
            body="Patterns ordered the way they actually build on each other."
          />
          <Bullet
            icon={<Sparkles className="h-4 w-4" />}
            title="One next question"
            body="Today is never a 200-row table. Just the one to solve."
          />
          <Bullet
            icon={<Flame className="h-4 w-4" />}
            title="Streaks you can trust"
            body="Only solved problems on your roadmap move the streak."
          />
        </ul>

        <p className="relative text-xs text-white/55">
          &ldquo;The fastest way to get better isn&apos;t more problems — it&apos;s the next right problem.&rdquo;
        </p>
      </aside>
    </div>
  );
}

function Bullet({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur ring-1 ring-white/20">
        {icon}
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-white/70">{body}</p>
      </div>
    </li>
  );
}
