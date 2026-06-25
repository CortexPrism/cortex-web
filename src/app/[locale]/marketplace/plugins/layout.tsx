import type { Metadata } from "next";
import { Suspense } from "react";
import { SITE_URL, generateAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "CortexPrism Plugins — ESM, MCP & WASM Extensions for Your Agent Operating System",
  description:
    "Browse and search the CortexPrism plugin marketplace. Discover ESM modules, MCP servers, and WASM plugins to extend your Agent Operating System. Filter by category and plugin type.",
  alternates: generateAlternates("/marketplace/plugins"),
  keywords: [
    "AI plugins",
    "MCP server plugins",
    "ESM AI plugins",
    "WASM AI plugins",
    "Model Context Protocol servers",
    "AI agent extensions",
    "open source AI plugins",
    "LLM plugins marketplace",
    "CortexPrism plugins",
    "AI tool extensions",
    "agent operating system plugins",
  ],
  openGraph: {
    title: "CortexPrism Plugins — ESM, MCP & WASM Extensions for Your Agent Operating System",
    description:
      "Discover plugins for CortexPrism: ESM modules, MCP servers, and WASM runtimes. Filter by category and plugin type to find the perfect extension.",
    url: `${SITE_URL}/marketplace/plugins`,
  },
  robots: {
    index: true,
    follow: true,
  },
  twitter: {
    title: "CortexPrism Plugins — ESM, MCP & WASM Extensions for Your Agent Operating System",
    description:
      "Discover plugins for CortexPrism: ESM modules, MCP servers, and WASM runtimes. Filter by category and plugin type.",
  },
};

export default function PluginsLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
