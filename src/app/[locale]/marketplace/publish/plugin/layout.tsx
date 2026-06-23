import type { Metadata } from "next";
import { generateAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Publish a Plugin — CortexPrism Marketplace",
  description:
    "Share your plugin with the CortexPrism community. Submit ESM modules, MCP servers, or WASM plugins to the marketplace for review and publication.",
  alternates: generateAlternates("/marketplace/publish/plugin"),
  keywords: [
    "publish AI plugin",
    "submit AI plugin",
    "share AI extension",
    "AI plugin submission",
    "CortexPrism plugin publish",
    "ESM plugin submission",
    "MCP server submission",
    "WASM plugin publish",
    "open source plugin marketplace",
  ],
  openGraph: {
    title: "Publish a Plugin — CortexPrism Marketplace",
    description:
      "Submit your ESM, MCP, or WASM plugin to the CortexPrism marketplace. Community-reviewed, open-source publication.",
    url: "https://cortexprism.io/marketplace/publish/plugin",
  },
  twitter: {
    title: "Publish a Plugin — CortexPrism Marketplace",
    description:
      "Share your ESM, MCP, or WASM plugin with the CortexPrism community. Open-source, community-reviewed.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PublishPluginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
