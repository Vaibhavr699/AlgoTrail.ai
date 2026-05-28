import type { Metadata } from "next";

/** Canonical production origin — override per-environment with NEXT_PUBLIC_SITE_URL. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://algotrail.ai"
).replace(/\/$/, "");

export const SITE_NAME = "AlgoTrail.ai";

export const SITE_TAGLINE = "Learn the pattern, not the problem";

export const SITE_DESCRIPTION =
  "AlgoTrail.ai is a guided DSA roadmap tracker that tells you the single next problem to solve — pattern-first learning, progress tracking, streaks, and interview-readiness scoring across 14 core patterns and 150+ curated problems.";

export const SITE_KEYWORDS = [
  "DSA roadmap",
  "data structures and algorithms",
  "LeetCode tracker",
  "coding interview preparation",
  "DSA patterns",
  "algorithm practice",
  "sliding window",
  "two pointers",
  "interview readiness",
  "software engineering interviews",
];

const TWITTER_HANDLE = "@algotrail";

/** Default Open Graph image — generated dynamically by src/app/opengraph-image.tsx. */
export const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
};

/**
 * Build page-level metadata that inherits site defaults (canonical, OG, Twitter)
 * while letting callers override the bits that matter per route.
 */
export function buildMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = "/",
  noIndex = false,
  keywords,
}: {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
  keywords?: string[];
} = {}): Metadata {
  const canonical = path === "/" ? "/" : path;
  const ogTitle = title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} — ${SITE_TAGLINE}`;

  return {
    title,
    description,
    keywords: keywords ?? undefined,
    alternates: { canonical },
    robots: noIndex
      ? { index: false, follow: false, nocache: true }
      : undefined,
    openGraph: {
      type: "website",
      url: canonical,
      siteName: SITE_NAME,
      title: ogTitle,
      description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title: ogTitle,
      description,
      images: [OG_IMAGE.url],
    },
  };
}

/** Humanize a URL slug into a Title Cased label, e.g. "sliding-window" -> "Sliding Window". */
export function humanizeSlug(slug: string): string {
  return decodeURIComponent(slug)
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
