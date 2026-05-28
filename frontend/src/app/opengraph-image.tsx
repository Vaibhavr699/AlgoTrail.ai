import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "linear-gradient(135deg, #0D1F12 0%, #152E1B 55%, #1D3F26 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #5E9069, #3A7048)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "36px",
              fontWeight: 800,
              color: "#0D1F12",
            }}
          >
            A
          </div>
          <span style={{ fontSize: "34px", fontWeight: 700, color: "#DDEADF" }}>
            {SITE_NAME}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              fontSize: "84px",
              fontWeight: 800,
              color: "#FFFFFF",
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
              maxWidth: "920px",
            }}
          >
            Learn the pattern, not the problem.
          </div>
          <div
            style={{
              fontSize: "32px",
              color: "#8AB494",
              lineHeight: 1.3,
              maxWidth: "820px",
            }}
          >
            A guided DSA roadmap that tells you exactly what to solve next.
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px" }}>
          {["14 core patterns", "150+ problems", "Interview-ready"].map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                fontSize: "24px",
                fontWeight: 600,
                color: "#DDEADF",
                background: "rgba(94,144,105,0.18)",
                border: "1px solid rgba(138,180,148,0.35)",
                borderRadius: "999px",
                padding: "10px 26px",
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
