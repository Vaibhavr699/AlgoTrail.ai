import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Log in",
  description:
    "Log in to AlgoTrail.ai to continue your DSA roadmap, track your streak, and pick up the next problem to solve.",
  path: "/login",
});

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
