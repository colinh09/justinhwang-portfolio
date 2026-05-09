import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Justin Hwang — Senior Project Controls Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
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
          background: "#EFEAE0",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 10,
              background: "#1F4E3C",
              color: "#EFEAE0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 500,
              letterSpacing: "-0.02em",
            }}
          >
            JH
          </div>
          <div
            style={{
              fontSize: 22,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#6b6660",
            }}
          >
            Portfolio · 2026
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              fontSize: 124,
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
              color: "#111111",
              fontWeight: 500,
            }}
          >
            Justin Hwang
          </div>
          <div
            style={{
              fontSize: 36,
              lineHeight: 1.25,
              fontStyle: "italic",
              color: "#2a2a28",
              maxWidth: 920,
            }}
          >
            Senior Project Controls Engineer · PMP
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            paddingTop: 28,
            borderTop: "1px solid #d6cfc2",
            fontSize: 20,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#6b6660",
          }}
        >
          <span>New York · Seattle</span>
          <span>JKH.Build@gmail.com</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
