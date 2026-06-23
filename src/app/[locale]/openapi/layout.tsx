import type { Metadata } from "next";
import { generateAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "API Documentation — CortexPrism Agent Operating System REST & WebSocket API",
  description:
    "Interactive OpenAPI documentation for the CortexPrism Agent Operating System REST API and WebSocket endpoints. Explore agent management, session control, memory operations, and plugin marketplace APIs.",
  alternates: generateAlternates("/openapi"),
  keywords: [
    "AI agent API",
    "REST API documentation",
    "OpenAPI specification",
    "CortexPrism API docs",
    "Agent Operating System API",
    "Agent OS API",
    "AI agent REST endpoints",
    "WebSocket AI API",
    "plugin marketplace API",
    "memory API agent operating system",
  ],
  openGraph: {
    title: "CortexPrism API Documentation — Agent Operating System OpenAPI Spec",
    description:
      "Browse the full OpenAPI specification for the CortexPrism Agent Operating System REST API. Agent management, sessions, memory, plugins, and more.",
    url: "https://cortexprism.io/openapi",
  },
  robots: {
    index: true,
    follow: true,
  },
  twitter: {
    title: "CortexPrism API Documentation — Agent Operating System OpenAPI Spec",
    description:
      "Browse the full OpenAPI specification for the CortexPrism Agent Operating System REST API. Agent management, sessions, memory, plugins, and more.",
  },
};

export default function OpenApiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
