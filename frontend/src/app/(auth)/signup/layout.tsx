import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Sign up",
  description:
    "Create your free AlgoTrail.ai account and start a guided, pattern-first DSA roadmap built for coding interviews.",
  path: "/signup",
});

export default function SignupLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
