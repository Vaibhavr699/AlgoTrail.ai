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
            { href: "/#roadmap", label: "Roadmap" },
            { href: "/#pricing", label: "Pricing" },
            { href: "/#about", label: "About" },
            { href: "/dashboard", label: "Dashboard" },
          ]}
        />
        <FooterColumn
          title="Account"
          links={[
            { href: "/login", label: "Sign in" },
            { href: "/signup", label: "Create account" },
            { href: "/forgot-password", label: "Forgot password" },
          ]}
        />
        <FooterColumn
          title="Resources"
          links={[
            { href: "/#faq", label: "FAQ" },
            { href: "/contact", label: "Contact" },
            { href: "/changelog", label: "Changelog" },
          ]}
        />
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/55">
          <p>© {year} AlgoTrail.ai. Built for people who&apos;d rather learn the pattern than grind the count.</p>
          <p className="font-mono">v0.1</p>
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
