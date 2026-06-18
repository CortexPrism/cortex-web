import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Publish a Plugin — CortexPrism Marketplace",
  description:
    "Share your plugin with the CortexPrism community. Submit ESM modules, MCP servers, or WASM plugins to the marketplace for review and publication.",
  alternates: { canonical: `${SITE_URL}/marketplace/publish/plugin` },
  openGraph: {
    title: "Publish a Plugin — CortexPrism Marketplace",
    description:
      "Submit your ESM, MCP, or WASM plugin to the CortexPrism marketplace. Community-reviewed, open-source publication.",
    url: `${SITE_URL}/marketplace/publish/plugin`,
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
