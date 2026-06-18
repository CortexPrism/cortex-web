import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "CortexPrism Agents — Pre-Configured AI Agent Profiles",
  description:
    "Browse and discover pre-configured agent profiles for the CortexPrism agentic harness. Filter by category and provider to find specialized AI agents for coding, analysis, and more.",
  alternates: { canonical: `${SITE_URL}/marketplace/agents` },
  openGraph: {
    title: "CortexPrism Agents — Pre-Configured AI Agent Profiles",
    description:
      "Find pre-configured agent profiles for CortexPrism. Specialized agents for coding, data analysis, research, and more. Filter by provider and category.",
    url: `${SITE_URL}/marketplace/agents`,
  },
  robots: {
    index: true,
    follow: true,
  },
  twitter: {
    title: "CortexPrism Agents — Pre-Configured AI Agent Profiles",
    description:
      "Find pre-configured agent profiles for CortexPrism. Specialized agents for coding, data analysis, research, and more.",
  },
};

export default function AgentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
