import Image from "next/image";
import Link from "next/link";

export function MarketingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-forest-ink text-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16 grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5 space-y-4">
          <Link href="/" className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
            <Image src="/AlgoTrailnobg.png" alt="AlgoTrail.ai" width={32} height={32} className="h-8 w-8 brightness-0 invert" />
            AlgoTrail.ai
          </Link>
          <p className="text-sm text-white/65 max-w-sm leading-relaxed">
            A guided DSA roadmap that tells you the single next problem to
            solve — built around patterns, not problem counts.
          </p>
        </div>

        <FooterColumn
          title="Product"
          links={[
            { href: "/", label: "Home" },
            { href: "/roadmap", label: "Roadmap" },
            { href: "/dashboard", label: "Dashboard" },
            { href: "/stats", label: "Stats" },
          ]}
        />
        <FooterColumn
          title="Account"
          links={[
            { href: "/login", label: "Sign in" },
            { href: "/signup", label: "Create account" },
            { href: "/settings", label: "Settings" },
          ]}
        />
        <FooterColumn
          title="Legal"
          links={[
            { href: "/terms", label: "Terms of Service" },
            { href: "/privacy", label: "Privacy Policy" },
          ]}
        />
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/55">
          <p>&copy; {year} AlgoTrail.ai. Built for people who&apos;d rather learn the pattern than grind the count.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-white/80 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white/80 transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div className="md:col-span-2">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">
        {title}
      </h4>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link
              href={l.href}
              className="text-white/80 hover:text-white transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
