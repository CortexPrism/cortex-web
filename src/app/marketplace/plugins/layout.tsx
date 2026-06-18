import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "CortexPrism Plugins — ESM, MCP & WASM Extensions",
  description:
    "Browse and search the CortexPrism plugin marketplace. Discover ESM modules, MCP servers, and WASM plugins to extend your agentic harness. Filter by category and plugin type.",
  alternates: { canonical: `${SITE_URL}/marketplace/plugins` },
  openGraph: {
    title: "CortexPrism Plugins — ESM, MCP & WASM Extensions",
    description:
      "Discover plugins for CortexPrism: ESM modules, MCP servers, and WASM runtimes. Filter by category and plugin type to find the perfect extension.",
    url: `${SITE_URL}/marketplace/plugins`,
  },
  robots: {
    index: true,
    follow: true,
  },
  twitter: {
    title: "CortexPrism Plugins — ESM, MCP & WASM Extensions",
    description:
      "Discover plugins for CortexPrism: ESM modules, MCP servers, and WASM runtimes. Filter by category and plugin type.",
  },
};

export default function PluginsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
