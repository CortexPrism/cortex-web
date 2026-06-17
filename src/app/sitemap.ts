import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getContentSlugs } from "@/lib/markdown";
import { getKbSlugs } from "@/lib/knowledge-base";
import { STATIC_PATHS, DOCS_SECTIONS } from "@/lib/site-urls";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://cortexprism.io";

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const route of staticRoutes) {
    entries.push({
      url: `${SITE_URL}${route.path}`,
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    });
  }

  const docsEntries: MetadataRoute.Sitemap = [];

  for (const dir of DOCS_SECTIONS) {
    const slugs = getContentSlugs(dir);
    for (const slug of slugs) {
      const pathSegments = [dir, slug === "index" ? "" : slug]
        .filter(Boolean)
        .join("/");
      docsEntries.push({
        url: `${SITE_URL}/docs/${pathSegments}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: slug === "index" ? 0.7 : 0.6,
      });
    }
  }

  docsEntries.push({
    url: `${SITE_URL}/docs/knowledge-base`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  });
  const kbSlugs = await getKbSlugs();
  for (const slug of kbSlugs) {
    docsEntries.push({
      url: `${SITE_URL}/docs/knowledge-base/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: slug === "faq" ? 0.8 : 0.7,
    });
  }

  const gettingStartedSlugs = getContentSlugs("getting-started");
  for (const slug of gettingStartedSlugs) {
    docsEntries.push({
      url: `${SITE_URL}/getting-started/${slug === "index" ? "" : slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: slug === "index" ? 0.95 : 0.7,
    });
  }

  const plugins = await prisma.plugin.findMany({
    where: { status: "approved" },
    select: { slug: true, updatedAt: true },
  });
  for (const plugin of plugins) {
    entries.push({
      url: `${SITE_URL}/marketplace/plugins/${plugin.slug}`,
      lastModified: plugin.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  const agents = await prisma.agentConfig.findMany({
    where: { status: "approved" },
    select: { slug: true, updatedAt: true },
  });
  for (const agent of agents) {
    entries.push({
      url: `${SITE_URL}/marketplace/agents/${agent.slug}`,
      lastModified: agent.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  return [...entries, ...docsEntries];
}
