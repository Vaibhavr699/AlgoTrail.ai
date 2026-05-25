import { ReactNode } from "react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col bg-canvas overflow-x-hidden">
      {/* Global grid backdrop — sits behind everything on the marketing site */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-grid"
      />
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
