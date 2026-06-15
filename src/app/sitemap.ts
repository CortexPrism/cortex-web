import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getContentSlugs } from "@/lib/markdown";
import { getKbSlugs } from "@/lib/knowledge-base";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://cortexprism.io";

const sectionMap: Record<string, string> = {
  cli: "cli",
  architecture: "architecture",
  "knowledge-base": "knowledge-base",
  "design-docs": "design-docs",
  "developer-guide": "developer-guide",
};

const staticRoutes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1.0, changeFrequency: "weekly" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/features", priority: 0.9, changeFrequency: "monthly" },
  { path: "/use-cases", priority: 0.8, changeFrequency: "monthly" },
  { path: "/security", priority: 0.8, changeFrequency: "monthly" },
  { path: "/install", priority: 0.9, changeFrequency: "monthly" },
  { path: "/changelog", priority: 0.7, changeFrequency: "daily" },
  { path: "/contribute", priority: 0.7, changeFrequency: "monthly" },
  { path: "/marketplace", priority: 0.9, changeFrequency: "daily" },
  { path: "/marketplace/plugins", priority: 0.9, changeFrequency: "daily" },
  { path: "/marketplace/agents", priority: 0.9, changeFrequency: "daily" },
  { path: "/marketplace/publish/plugin", priority: 0.6, changeFrequency: "monthly" },
  { path: "/marketplace/publish/agent", priority: 0.6, changeFrequency: "monthly" },
  { path: "/openapi", priority: 0.6, changeFrequency: "monthly" },
];

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
  for (const [dir, section] of Object.entries(sectionMap)) {
    if (dir === "knowledge-base") {
      docsEntries.push({
        url: `${SITE_URL}/docs/${dir}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
      const slugs = await getKbSlugs();
      for (const slug of slugs) {
        docsEntries.push({
          url: `${SITE_URL}/docs/${dir}/${slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    } else {
      const slugs = getContentSlugs(section);
      for (const slug of slugs) {
        const pathSegments = [dir, slug === "index" ? "" : slug]
          .filter(Boolean)
          .join("/");
        docsEntries.push({
          url: `${SITE_URL}/docs/${pathSegments}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    }
  }

  const gettingStartedSlugs = getContentSlugs("getting-started");
  for (const slug of gettingStartedSlugs) {
    docsEntries.push({
      url: `${SITE_URL}/getting-started/${slug === "index" ? "" : slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: slug === "index" ? 0.8 : 0.7,
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
