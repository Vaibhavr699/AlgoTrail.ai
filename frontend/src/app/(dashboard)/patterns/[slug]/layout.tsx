import type { Metadata } from "next";
import type { ReactNode } from "react";
import { humanizeSlug } from "@/lib/seo";

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  return { title: `${humanizeSlug(params.slug)} Pattern` };
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
