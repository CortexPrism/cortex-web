import type { Metadata } from "next";
import { generateMetaBase, SITE_URL } from "@/lib/seo";

const base = generateMetaBase();

export const metadata: Metadata = {
  ...base,
  title: "CortexPrism Blog — AI Agent Insights & Tutorials",
  description:
    "Read the CortexPrism blog for AI agent development tutorials, architecture deep-dives, community spotlights, and release updates from the open-source AI Agent Operating System.",
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    ...base.openGraph,
    title: "CortexPrism Blog — AI Agent Insights & Tutorials",
    description:
      "Explore tutorials, architecture deep-dives, community spotlights, and release updates from the open-source AI Agent Operating System.",
    url: `${SITE_URL}/blog`,
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
