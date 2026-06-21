import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          backgroundColor: "#0a0a0f",
          padding: 80,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            C
          </div>
          <div style={{ fontSize: 48, fontWeight: 700, color: "#e2e2ea" }}>
            CortexPrism
          </div>
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#e2e2ea",
            lineHeight: 1.1,
            maxWidth: 900,
            marginBottom: 24,
          }}
        >
          <span style={{ color: "#6366f1" }}>Open-Source</span> Agentic
          Harness
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#9090a8",
            maxWidth: 800,
            lineHeight: 1.5,
          }}
        >
          Multi-provider LLM support &middot; 5-tier memory &middot; Parallax
          security &middot; Plugin marketplace &middot; Apache 2.0 licensed
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 80,
            display: "flex",
            gap: 20,
          }}
        >
          <div
            style={{
              fontSize: 24,
              color: "#55556a",
              border: "1px solid #55556a",
              borderRadius: 12,
              padding: "8px 20px",
            }}
          >
            cortexprism.io
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
