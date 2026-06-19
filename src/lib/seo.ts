export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://cortexprism.io";

export const SITE_NAME = "CortexPrism";

export const SITE_DESCRIPTION =
  "The open-source AI agent harness with persistent memory, 60+ built-in tools, a full-featured web UI, and layered security — powered by Deno. Self-host your AI agents with confidence.";

const SITE_TAGLINE = "Open-Source AI Agent Harness — Powered by Deno";

/**
 * Primary and secondary keyword targets for CortexPrism.
 *
 * Primary (high-volume, competitive):
 *   "open source AI agent", "AI agent framework", "LLM orchestration",
 *   "self-hosted AI", "agent runtime", "autonomous AI agents"
 *
 * Secondary (medium-volume, more specific):
 *   "agentic harness", "multi-agent system", "MCP plugin", "Model Context Protocol",
 *   "AI memory system", "AI plugin marketplace", "vector memory",
 *   "sandboxed code execution", "LLM agent tools"
 *
 * Long-tail (low-volume, high intent):
 *   "TypeScript AI agent framework", "Deno AI runtime",
 *   "open source LangChain alternative", "self-hosted LLM platform",
 *   "AI agent workflow automation", "agentic AI platform MIT license"
 */
export const SITE_KEYWORDS = [
  // Primary
  "open source AI agent",
  "AI agent framework",
  "LLM orchestration",
  "self-hosted AI",
  "agent runtime",
  "autonomous AI agents",
  // Secondary
  "agentic harness",
  "agentic AI platform",
  "multi-agent system",
  "MCP plugin",
  "Model Context Protocol",
  "AI memory system",
  "AI plugin marketplace",
  "vector memory AI",
  "sandboxed code execution",
  "LLM agent tools",
  "multi-provider LLM",
  "open-source AI",
  "AI security",
  // Long-tail
  "TypeScript AI agent",
  "Deno AI runtime",
  "open source LangChain alternative",
  "self-hosted LLM platform",
  "AI agent workflow automation",
  "agent orchestration framework",
];

export const OG_IMAGE_URL = `${SITE_URL}/og-image.png`;

export const TWITTER_HANDLE = "@CortexPrism";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
    sameAs: [
      "https://github.com/CortexPrism/cortex",
      "https://discord.gg/y7DkaEbPQC",
    ],
    description: SITE_DESCRIPTION,
  };
}

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/marketplace/plugins?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateSoftwareAppSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Linux, macOS, Windows",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    license: "https://opensource.org/licenses/MIT",
    keywords:
      "open source AI agent, AI agent framework, LLM orchestration, self-hosted AI, agent runtime, MCP plugin marketplace",
  };
}

export function generateHowToSchema({
  name,
  description,
  url,
  steps,
  totalTime,
}: {
  name: string;
  description: string;
  url: string;
  steps: { name: string; text: string }[];
  totalTime?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    url,
    ...(totalTime ? { totalTime } : {}),
    step: steps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateSoftwareApplicationSchema({
  name,
  description,
  url,
  image,
  version,
  applicationCategory = "DeveloperApplication",
  operatingSystem = "Linux, macOS, Windows",
  authorName,
  offers = { price: "0", priceCurrency: "USD" },
}: {
  name: string;
  description: string;
  url: string;
  image?: string | null;
  version: string;
  applicationCategory?: string;
  operatingSystem?: string;
  authorName?: string | null;
  offers?: { price: string; priceCurrency: string };
}) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    url,
    applicationCategory,
    operatingSystem,
    version,
    offers: {
      "@type": "Offer",
      price: offers.price,
      priceCurrency: offers.priceCurrency,
    },
  };

  if (image) schema.image = image;
  if (authorName) schema.author = { "@type": "Person", name: authorName };

  return schema;
}

export function generateArticleSchema({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  authorName,
}: {
  title: string;
  description: string;
  url: string;
  image?: string | null;
  datePublished: string;
  dateModified?: string;
  authorName?: string | null;
}) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Person",
      name: authorName || "CortexPrism",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  if (image) schema.image = image;

  return schema;
}

export function generateMetaBase(): {
  metadataBase: URL;
  alternates: { canonical: string };
  openGraph: {
    siteName: string;
    locale: string;
    images: { url: string; width: number; height: number; alt: string }[];
  };
  twitter: {
    card: "summary_large_image";
    site: string;
    creator: string;
    images: string[];
  };
  robots: {
    index: boolean;
    follow: boolean;
    googleBot: {
      index: boolean;
      follow: boolean;
      "max-video-preview": number;
      "max-image-preview": "large";
      "max-snippet": number;
    };
  };
} {
  const baseUrl = new URL(SITE_URL);
  return {
    metadataBase: baseUrl,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      siteName: SITE_NAME,
      locale: "en_US",
      images: [
        {
          url: OG_IMAGE_URL,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} - ${SITE_TAGLINE}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      images: [OG_IMAGE_URL],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}
