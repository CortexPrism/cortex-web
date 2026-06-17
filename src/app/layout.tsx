import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/lib/AuthContext";
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateMetaBase,
  SITE_URL,
  SITE_KEYWORDS,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    default: "CortexPrism — Open-Source AI Agent Runtime",
    template: "%s | CortexPrism",
  },
  description:
    "CortexPrism is an open-source AI agent runtime with 24 LLM providers, 5-tier memory, MCP plugin marketplace, sandboxed code execution, and enterprise-grade security. Self-host your autonomous agents — MIT licensed.",
  keywords: SITE_KEYWORDS,
  authors: [{ name: "CortexPrism", url: SITE_URL }],
  creator: "CortexPrism",
  publisher: "CortexPrism",
  category: "technology",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  ...generateMetaBase(),
  openGraph: {
    title: "CortexPrism — Open-Source AI Agent Runtime",
    description:
      "Open-source AI agent runtime: 24 LLM providers, 5-tier memory, MCP plugins, sandboxed code execution, and parallax security. Self-host autonomous agents. MIT licensed.",
    type: "website",
    siteName: "CortexPrism",
    locale: "en_US",
    url: SITE_URL,
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "CortexPrism — Open-Source AI Agent Runtime & Plugin Marketplace",
      },
    ],
  } as Metadata["openGraph"],
  twitter: {
    card: "summary_large_image",
    site: "@CortexPrism",
    creator: "@CortexPrism",
    title: "CortexPrism — Open-Source AI Agent Runtime",
    description:
      "Open-source AI agent runtime: 24 LLM providers, 5-tier memory, MCP plugins, sandboxed code execution, and parallax security. MIT licensed.",
    images: [`${SITE_URL}/og-image.png`],
  } as Metadata["twitter"],
  alternates: {
    canonical: SITE_URL,
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

const matomoScript = `
var _mtm = window._mtm = window._mtm || [];
_mtm.push({'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start'});
(function() {
  var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
  g.async=true; g.src='https://analytics.thecorehosting.net/js/container_1UvEV4Z1.js'; s.parentNode.insertBefore(g,s);
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgSchema = generateOrganizationSchema();
  const webSiteSchema = generateWebSiteSchema();

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col">
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
          <Navbar />
          <main className="flex-1 pt-16">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
