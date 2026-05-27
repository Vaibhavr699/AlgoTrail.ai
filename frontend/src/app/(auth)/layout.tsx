import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[60fr_40fr]">
      {/* LEFT — globe video panel */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[#080c0a]">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/5925-187109675.mp4" type="video/mp4" />
        </video>

        {/* Subtle overlay for text readability */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

        {/* Centered logo + text */}
        {/* Logo at top */}
        <div className="relative z-10 pl-[15%] pr-14 pt-12">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-white"
          >
            <Image
              src="/AlgoTrailnobg.png"
              alt="AlgoTrail.ai"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            AlgoTrail.ai
          </Link>
        </div>

        {/* Text at bottom */}
        <div className="relative z-10 pl-[15%] pr-14 pb-14 mt-auto">
          <h2 className="text-4xl xl:text-5xl font-extrabold tracking-[-0.03em] leading-[1.08] text-white">
            Welcome to
            <br />
            AlgoTrail Community
          </h2>
          <p className="mt-5 max-w-sm text-white/50 leading-relaxed text-sm">
            Join thousands of developers mastering DSA patterns the smart way.
          </p>
        </div>
      </aside>

      {/* RIGHT — form column */}
      <div className="relative flex flex-col bg-white">
        {/* Mobile-only logo */}
        <div className="px-6 sm:px-10 pt-8 lg:pt-10">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-forest-ink lg:invisible"
          >
            <Image
              src="/AlgoTrailnobg.png"
              alt="AlgoTrail.ai"
              width={24}
              height={24}
              className="h-6 w-6"
            />
            AlgoTrail.ai
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 sm:px-10">
          <div className="w-full max-w-sm py-10">{children}</div>
        </div>

        <p className="text-center text-xs text-forest-ink/40 pb-6">
          &copy; {new Date().getFullYear()} AlgoTrail.ai &mdash; All rights reserved
        </p>
      </div>
    </div>
  );
}
