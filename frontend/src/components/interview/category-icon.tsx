import {
  siPython,
  siJavascript,
  siTypescript,
  siFastapi,
  siReact,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siDocker,
  type SimpleIcon,
} from "simple-icons";
import { Network } from "lucide-react";

// Map each interview category slug to its real brand logo (Simple Icons, CC0).
// System Design has no product logo, so it falls back to a neutral glyph.
const ICONS: Record<string, SimpleIcon> = {
  python: siPython,
  javascript: siJavascript,
  typescript: siTypescript,
  fastapi: siFastapi,
  react: siReact,
  nextjs: siNextdotjs,
  nodejs: siNodedotjs,
  sql: siPostgresql,
  "docker-devops": siDocker,
};

export function CategoryIcon({
  slug,
  className = "h-6 w-6",
}: {
  slug: string;
  className?: string;
}) {
  const icon = ICONS[slug];

  if (!icon) {
    // System Design (and any future logo-less category)
    return <Network className={className} style={{ color: "#6366F1" }} aria-hidden />;
  }

  return (
    <svg
      role="img"
      aria-hidden
      viewBox="0 0 24 24"
      className={className}
      fill={`#${icon.hex}`}
    >
      <path d={icon.path} />
    </svg>
  );
}

/** The brand color for a category, for tinting backgrounds. */
export function categoryBrandColor(slug: string): string {
  const icon = ICONS[slug];
  return icon ? `#${icon.hex}` : "#6366F1";
}
