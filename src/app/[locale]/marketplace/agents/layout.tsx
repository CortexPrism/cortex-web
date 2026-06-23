import type { Metadata } from "next";
import { generateAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "CortexPrism Agents — Pre-Configured AI Agent Profiles for Your Agent Operating System",
  description:
    "Browse and discover pre-configured agent profiles for the CortexPrism Agent Operating System. Filter by category and provider to find specialized AI agents for coding, analysis, and more.",
  alternates: generateAlternates("/marketplace/agents"),
  keywords: [
    "AI agent profiles",
    "pre-configured AI agents",
    "AI agent configurations",
    "LLM agent profiles",
    "CortexPrism agents",
    "specialized AI agents",
    "open source agent configs",
    "AI coding agent",
    "agent operating system profiles",
  ],
  openGraph: {
    title: "CortexPrism Agents — Pre-Configured AI Agent Profiles for Your Agent Operating System",
    description:
      "Find pre-configured agent profiles for CortexPrism. Specialized agents for coding, data analysis, research, and more. Filter by provider and category.",
    url: "https://cortexprism.io/marketplace/agents",
  },
  robots: {
    index: true,
    follow: true,
  },
  twitter: {
    title: "CortexPrism Agents — Pre-Configured AI Agent Profiles for Your Agent Operating System",
    description:
      "Find pre-configured agent profiles for CortexPrism. Specialized agents for coding, data analysis, research, and more.",
  },
};

export default function AgentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
