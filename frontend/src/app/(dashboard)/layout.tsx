import type { Metadata } from "next";
import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { SearchCommand } from "@/components/layout/search-command";
import { OnboardingWrapper } from "@/components/onboarding/onboarding-wrapper";

// Authenticated app surface — keep it out of search indexes.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[rgb(var(--background))]">
      <Sidebar />
      <MobileSidebar />
      <SearchCommand />
      <main className="flex-1 min-w-0 flex flex-col">{children}</main>
      <OnboardingWrapper />
    </div>
  );
}
