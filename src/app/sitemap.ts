import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getContentSlugs } from "@/lib/markdown";
import { getKbSlugs } from "@/lib/knowledge-base";
import { STATIC_PATHS, DOCS_SECTIONS } from "@/lib/site-urls";
import { routing } from "@/i18n/routing";

const SITE_URL =
  process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://cortexprism.io";

interface StaticRoute {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}

const pathMeta: Record<string, { priority: number; changeFrequency: StaticRoute["changeFrequency"] }> = {
  "": { priority: 1.0, changeFrequency: "weekly" },
  "/features": { priority: 0.95, changeFrequency: "monthly" },
  "/install": { priority: 0.9, changeFrequency: "monthly" },
  "/marketplace": { priority: 0.9, changeFrequency: "daily" },
  "/marketplace/plugins": { priority: 0.9, changeFrequency: "daily" },
  "/marketplace/agents": { priority: 0.9, changeFrequency: "daily" },
  "/docs": { priority: 0.85, changeFrequency: "weekly" },
  "/use-cases": { priority: 0.85, changeFrequency: "monthly" },
  "/about": { priority: 0.8, changeFrequency: "monthly" },
  "/security": { priority: 0.8, changeFrequency: "monthly" },
  "/changelog": { priority: 0.75, changeFrequency: "weekly" },
  "/contribute": { priority: 0.7, changeFrequency: "monthly" },
  "/marketplace/publish/plugin": { priority: 0.6, changeFrequency: "monthly" },
  "/marketplace/publish/agent": { priority: 0.6, changeFrequency: "monthly" },
  "/openapi": { priority: 0.55, changeFrequency: "monthly" },
};

const staticRoutes: StaticRoute[] = STATIC_PATHS.map((path) => {
  const meta = pathMeta[path] || { priority: 0.5, changeFrequency: "monthly" as const };
  return { path, priority: meta.priority, changeFrequency: meta.changeFrequency };
});

function localeUrl(path: string, locale: string) {
  if (locale === routing.defaultLocale) {
    return `${SITE_URL}${path}`;
  }
  return `${SITE_URL}/${locale}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const route of staticRoutes) {
      entries.push({
        url: localeUrl(route.path, locale),
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      });
    }

    for (const dir of DOCS_SECTIONS) {
      const slugs = getContentSlugs(dir);
      for (const slug of slugs) {
        const pathSegments = [dir, slug === "index" ? "" : slug]
          .filter(Boolean)
          .join("/");
        entries.push({
          url: localeUrl(`/docs/${pathSegments}`, locale),
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: slug === "index" ? 0.7 : 0.6,
        });
      }
    }

    entries.push({
      url: localeUrl("/docs/knowledge-base", locale),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    });

    const kbSlugs = await getKbSlugs();
    for (const slug of kbSlugs) {
      entries.push({
        url: localeUrl(`/docs/knowledge-base/${slug}`, locale),
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: slug === "faq" ? 0.8 : 0.7,
      });
    }

    const gettingStartedSlugs = getContentSlugs("getting-started");
    for (const slug of gettingStartedSlugs) {
      entries.push({
        url: localeUrl(`/getting-started/${slug === "index" ? "" : slug}`, locale),
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: slug === "index" ? 0.95 : 0.7,
      });
    }
  }

  const plugins = await prisma.plugin.findMany({
    where: { status: "approved" },
    select: { slug: true, updatedAt: true },
  });
  for (const plugin of plugins) {
    for (const locale of routing.locales) {
      entries.push({
        url: localeUrl(`/marketplace/plugins/${plugin.slug}`, locale),
        lastModified: plugin.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  const agents = await prisma.agentConfig.findMany({
    where: { status: "approved" },
    select: { slug: true, updatedAt: true },
  });
  for (const agent of agents) {
    for (const locale of routing.locales) {
      entries.push({
        url: localeUrl(`/marketplace/agents/${agent.slug}`, locale),
        lastModified: agent.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  return entries;
}
