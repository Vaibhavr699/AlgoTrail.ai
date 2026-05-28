import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Share Your Progress" };

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
