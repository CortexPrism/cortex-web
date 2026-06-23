import type { Metadata } from "next";
import { generateMetaBase, generateAlternates } from "@/lib/seo";

const base = generateMetaBase("/blog");

export const metadata: Metadata = {
  ...base,
  title: "CortexPrism Blog — AI Agent Insights & Tutorials",
  description:
    "Read the CortexPrism blog for AI agent development tutorials, architecture deep-dives, community spotlights, and release updates from the open-source AI Agent Operating System.",
  keywords: [
    "AI agent blog",
    "AI agent tutorials",
    "Agent OS blog",
    "open source AI agent insights",
    "LLM agent development",
    "AI agent architecture",
    "CortexPrism updates",
    "AI agent community",
    "agent operating system tutorials",
    "AI agent deep-dives",
  ],
  alternates: generateAlternates("/blog"),
  openGraph: {
    ...base.openGraph,
    title: "CortexPrism Blog — AI Agent Insights & Tutorials",
    description:
      "Explore tutorials, architecture deep-dives, community spotlights, and release updates from the open-source AI Agent Operating System.",
    url: "https://cortexprism.io/blog",
    type: "website",
  },
  robots: { index: true, follow: true },
  twitter: {
    ...base.twitter,
    title: "CortexPrism Blog — AI Agent Insights & Tutorials",
    description:
      "Explore tutorials, architecture deep-dives, community spotlights, and release notes from the CortexPrism AI Agent OS team.",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
