import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "API Documentation — CortexPrism REST & WebSocket API",
  description:
    "Interactive OpenAPI documentation for the CortexPrism REST API and WebSocket endpoints. Explore agent management, session control, memory operations, and plugin marketplace APIs.",
  alternates: { canonical: `${SITE_URL}/openapi` },
  openGraph: {
    title: "CortexPrism API Documentation — OpenAPI Specification",
    description:
      "Browse the full OpenAPI specification for the CortexPrism agentic harness REST API. Agent management, sessions, memory, plugins, and more.",
    url: `${SITE_URL}/openapi`,
  },
  robots: {
    index: true,
    follow: true,
  },
  twitter: {
    title: "CortexPrism API Documentation — OpenAPI Specification",
    description:
      "Browse the full OpenAPI specification for the CortexPrism agentic harness REST API. Agent management, sessions, memory, plugins, and more.",
  },
};

export default function OpenApiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
