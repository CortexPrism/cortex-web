export const SITE_URL =
  process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://cortexprism.io";

export const SITE_NAME = "CortexPrism";

export const SITE_DESCRIPTION =
  "CortexPrism v0.51.0 — the open-source Agent Operating System: an AI OS with 5-tier persistent memory, 60+ built-in tools, 24 LLM providers, MCP plugin marketplace, overhauled web UI with dark/light theme and experience levels, and enterprise-grade Parallax security with LLM supervisor — powered by Deno. Self-host your autonomous AI agents with confidence. Apache 2.0 licensed.";

const SITE_TAGLINE = "Open-Source AI Agent Operating System — Powered by Deno";

/**
 * Comprehensive keyword targets for CortexPrism across all tiers.
 *
 * Tier 1 — Primary category ownership (high-volume, competitive):
 *   "agent operating system", "AI agent operating system", "autonomous agent operating system",
 *   "open source agent operating system", "self-hosted AI", "agent OS"
 *
 * Tier 2 — Feature-led (high-intent, medium-volume):
 *   "AI agent with memory", "AI agent memory system", "AI agent sandbox",
 *   "AI agent security", "multi-agent orchestration", "MCP plugin marketplace",
 *   "self-hosted AI agents", "private AI agent", "enterprise AI agent",
 *   "agent deployment platform", "agent orchestration platform"
 *
 * Tier 3 — "Vs" / Alternative keywords (comparison intent):
 *   "open source LangChain alternative", "OpenClaw alternative",
 *   "CrewAI alternative", "open source Claude Code alternative",
 *   "self-hosted ChatGPT alternative", "OpenFang alternative",
 *   "agent operating system vs agent framework"
 *
 * Tier 4 — Stack-specific niches (CortexPrism unique):
 *   "Deno AI operating system", "TypeScript AI agent",
 *   "AI OS powered by Deno", "Apache 2.0 AI agent OS",
 *   "LLM agent operating system", "TypeScript agent operating system"
 *
 * Tier 5 — Answer Engine Optimization (AEO) / question-based:
 *   "how to self host an AI agent", "what is an AI agent operating system",
 *   "best open source AI agent platform", "AI agent security best practices",
 *   "difference between AI agent framework and operating system",
 *   "best agent operating system", "agent operating system comparison",
 *   "how to build an agent operating system"
 */
export const SITE_KEYWORDS = [
  // Tier 1 — Primary category ownership
  "agent operating system",
  "AI agent operating system",
  "autonomous agent operating system",
  "open source agent operating system",
  "AI agent operating system platform",
  "agentic operating system",
  "self-hosted agent operating system",
  "agent OS",
  "AI OS",
  "open source AI OS",
  "open source AI agent",
  "autonomous AI agents",
  "self-hosted AI",
  "self-hosted AI agent",
  "AI agent platform",
  "AI agent runtime",
  // Tier 2 — Feature-led
  "AI agent with memory",
  "AI agent memory system",
  "AI memory platform",
  "multi-agent orchestration",
  "multi-agent system",
  "multi-agent orchestration platform",
  "MCP plugin",
  "MCP plugin marketplace",
  "Model Context Protocol",
  "AI plugin marketplace",
  "AI agent sandbox",
  "sandboxed code execution",
  "AI agent security",
  "enterprise AI agent security",
  "AI agent framework",
  "LLM orchestration",
  "LLM agent tools",
  "multi-provider LLM",
  "AI agent marketplace",
  "private AI agent",
  "local AI agent",
  "offline AI agent",
  "self-hosted LLM agent",
  "AI agent for developers",
  "AI coding agent self-hosted",
  "autonomous agent platform",
  "enterprise AI agent deployment",
  "secure AI agent operating system",
  "AI agent with tools",
  "vector memory AI",
  "open-source AI",
  "AI security",
  "agent deployment platform",
  "agent orchestration platform",
  "agent management platform",
  "LLM agent operating system",
  "AI agent orchestration framework",
  // Tier 3 — Comparison / alternative keywords
  "open source LangChain alternative",
  "open source CrewAI alternative",
  "OpenClaw alternative",
  "OpenFang alternative",
  "self-hosted ChatGPT alternative",
  "open source Claude Code alternative",
  "agent framework alternative",
  "AI agent framework comparison",
  // Tier 4 — Stack-specific niches
  "Deno AI operating system",
  "AI OS powered by Deno",
  "TypeScript AI agent",
  "TypeScript AI agent framework",
  "TypeScript agent operating system",
  "Apache 2.0 AI agent OS",
  "TypeScript LLM orchestration",
  // Tier 5 — AEO / question-based
  "what is an AI agent operating system",
  "how to self host an AI agent",
  "best open source AI agent platform",
  "best agent operating system",
  "AI agent security best practices",
  "difference between AI agent framework and operating system",
  "how to build autonomous AI agents",
  "agent OS vs agent framework",
  "agent operating system comparison",
  "how to build an agent operating system",
  "why use an agent operating system",
  // Long-tail
  "AI agent workflow automation",
  "agent orchestration framework",
  "AI operating system for agents",
  "self-hosted LLM platform",
  "personal AI assistant with memory",
  "autonomous agent examples",
  "AI agent use cases",
  "open-source Agent OS",
  "enterprise agent operating system",
  "self-hosted autonomous AI agents",
];

export const OG_IMAGE_URL = `${SITE_URL}/og-image.png`;

export const TWITTER_HANDLE = "@CortexPrism";

export function generateAlternates(
  path: string,
  locale?: string,
  locales?: readonly string[],
  defaultLocale?: string
): {
  canonical: string;
  languages: Record<string, string>;
} {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const defLocale = defaultLocale || "en";
  const canonical =
    locale && locale !== defLocale
      ? `${SITE_URL}/${locale}${normalizedPath}`
      : `${SITE_URL}${normalizedPath}`;

  const languages: Record<string, string> = {};
  const locs = locales || ["en"];
  for (const l of locs) {
    languages[l] =
      l === defLocale
        ? `${SITE_URL}${normalizedPath}`
        : `${SITE_URL}/${l}${normalizedPath}`;
  }
  languages["x-default"] = `${SITE_URL}${normalizedPath}`;

  return { canonical, languages };
}

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
      "https://discord.gg/wYxbmQeWY3",
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
    license: "https://www.apache.org/licenses/LICENSE-2.0",
    keywords:
      "agent operating system, AI agent operating system, autonomous agent operating system, open source agent operating system, self-hosted AI agent, AI agent memory system, multi-agent orchestration, MCP plugin marketplace, autonomous AI agents, AI agent security, enterprise AI agent deployment, Deno AI operating system, TypeScript AI agent, agent orchestration platform, LLM agent operating system",
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

export function generateMetaBase(
  path = "/",
  locale?: string,
  locales?: readonly string[],
  defaultLocale?: string
): {
  metadataBase: URL;
  alternates: { canonical: string; languages: Record<string, string> };
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
    alternates: generateAlternates(path, locale, locales, defaultLocale),
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
