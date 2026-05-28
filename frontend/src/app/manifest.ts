import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — ${SITE_TAGLINE}`,
    short_name: "AlgoTrail",
    description: SITE_DESCRIPTION,
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#F2F2EE",
    theme_color: "#0E2017",
    categories: ["education", "productivity"],
    icons: [
      {
        src: "/AlgoTrailnobg.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
