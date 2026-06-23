import type { Metadata } from "next";
import { generateAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Publish an Agent — CortexPrism Marketplace",
  description:
    "Share your pre-configured agent profile with the CortexPrism community. Submit agent configurations for review and publication in the marketplace.",
  alternates: generateAlternates("/marketplace/publish/agent"),
  keywords: [
    "publish AI agent",
    "submit agent profile",
    "share AI agent config",
    "AI agent configuration publish",
    "CortexPrism agent publish",
    "pre-configured agent submission",
    "open source agent marketplace",
    "LLM agent profile publish",
  ],
  openGraph: {
    title: "Publish an Agent — CortexPrism Marketplace",
    description:
      "Submit your pre-configured AI agent profile to the CortexPrism marketplace. Community-reviewed, open-source publication.",
    url: "https://cortexprism.io/marketplace/publish/agent",
  },
  twitter: {
    title: "Publish an Agent — CortexPrism Marketplace",
    description:
      "Share your pre-configured AI agent profile with the CortexPrism community. Community-reviewed and open-source.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PublishAgentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
