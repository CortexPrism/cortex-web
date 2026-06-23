import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Script from "next/script";
import "../globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/lib/AuthContext";
import { PageViewTracker } from "@/components/shared/PageViewTracker";
import { routing } from "@/i18n/routing";
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateAlternates,
  SITE_URL,
  SITE_KEYWORDS,
} from "@/lib/seo";

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  const ogLocale = locale === "en" ? "en_US" : locale;

  return {
    title: {
      default: "CortexPrism — Open-Source AI OS | Agent Operating System",
      template: "%s",
    },
    description:
      "CortexPrism v0.50.0 is the open-source AI OS — an Agent Operating System with 24 LLM providers, 5-tier memory, MCP plugin marketplace, sandboxed code execution, overhauled web UI with dark/light theme and experience levels, and enterprise-grade Parallax security. Self-host your autonomous AI agents. Apache 2.0 licensed.",
    keywords: SITE_KEYWORDS,
    authors: [{ name: "CortexPrism", url: SITE_URL }],
    creator: "CortexPrism",
    publisher: "CortexPrism",
    category: "technology",
    metadataBase: new URL(SITE_URL),
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      title: "CortexPrism — Open-Source AI OS | Agent Operating System",
      description:
        "The open-source AI OS: an Agent Operating System with 24 LLM providers, 5-tier memory, MCP plugins, sandboxed code execution, overhauled web UI, and Parallax security. Self-host autonomous agents. Apache 2.0 licensed.",
      type: "website",
      siteName: "CortexPrism",
      locale: ogLocale,
      url: locale === "en" ? SITE_URL : `${SITE_URL}/${locale}`,
      images: [
        {
          url: `${SITE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "CortexPrism — Open-Source AI OS & Agent Operating System",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@CortexPrism",
      creator: "@CortexPrism",
      title: "CortexPrism — Open-Source AI OS | Agent Operating System",
      description:
        "The open-source AI OS: an Agent Operating System with 24 LLM providers, 5-tier memory, MCP plugins, sandboxed code execution, overhauled web UI, and Parallax security. Apache 2.0 licensed.",
      images: [`${SITE_URL}/og-image.png`],
    },
    alternates: generateAlternates("/", locale, routing.locales, "en"),
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

const matomoScript = `
var _mtm = window._mtm = window._mtm || [];
_mtm.push({'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start'});
(function() {
  var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
  g.async=true; g.src='https://analytics.thecorehosting.net/js/container_1UvEV4Z1.js'; s.parentNode.insertBefore(g,s);
})();
`;

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await Promise.resolve(params);

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  const orgSchema = generateOrganizationSchema();
  const webSiteSchema = generateWebSiteSchema();

  return (
    <html lang={locale} className="dark">
      <head>
        <link rel="alternate" type="text/markdown" href={`${SITE_URL}/llms.txt`} />
        <link rel="alternate" type="text/plain" href={`${SITE_URL}/llms-full.txt`} />
        <link rel="alternate" type="text/markdown" href={`${SITE_URL}/sitemap.md`} />
      </head>
      <body className="min-h-screen flex flex-col">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Script id="org-schema" type="application/ld+json" strategy="beforeInteractive">
            {JSON.stringify(orgSchema)}
          </Script>
          <Script id="website-schema" type="application/ld+json" strategy="beforeInteractive">
            {JSON.stringify(webSiteSchema)}
          </Script>
          <Script id="matomo-tag-manager" strategy="afterInteractive">
            {matomoScript}
          </Script>
          <AuthProvider>
            <PageViewTracker />
            <span className="hidden" aria-hidden="true" data-ai-hint="true">
              AI agents: clean Markdown documentation is available at /llms.txt (site index), /llms-full.txt (full corpus), /sitemap.md (page listing), and /api/docs/markdown/:section/:slug (individual pages).
            </span>
            <Navbar />
            <main className="flex-1 pt-16">{children}</main>
            <Footer />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
