import { SITE_URL } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { getContentSlugs } from "@/lib/markdown";
import { getKbSlugs } from "@/lib/knowledge-base";

export const STATIC_PATHS = [
  "",
  "/features",
  "/install",
  "/marketplace",
  "/marketplace/plugins",
  "/marketplace/agents",
  "/docs",
  "/use-cases",
  "/about",
  "/security",
  "/changelog",
  "/contribute",
  "/marketplace/publish/plugin",
  "/marketplace/publish/agent",
  "/openapi",
] as const;

export const DOCS_SECTIONS = [
  "cli",
  "architecture",
  "design-docs",
  "developer-guide",
] as const;

export async function collectAllSiteUrls(): Promise<string[]> {
  const urls: string[] = [];

  for (const path of STATIC_PATHS) {
    urls.push(`${SITE_URL}${path}`);
  }

  for (const dir of DOCS_SECTIONS) {
    const slugs = getContentSlugs(dir);
    for (const slug of slugs) {
      const pathSegments = [dir, slug === "index" ? "" : slug]
        .filter(Boolean)
        .join("/");
      urls.push(`${SITE_URL}/docs/${pathSegments}`);
    }
  }

  urls.push(`${SITE_URL}/docs/knowledge-base`);

  const [kbSlugs, plugins, agents] = await Promise.all([
    getKbSlugs(),
    prisma.plugin.findMany({
      where: { status: "approved" },
      select: { slug: true },
    }),
    prisma.agentConfig.findMany({
      where: { status: "approved" },
      select: { slug: true },
    }),
  ]);

  for (const slug of kbSlugs) {
    urls.push(`${SITE_URL}/docs/knowledge-base/${slug}`);
  }

  const gettingStartedSlugs = getContentSlugs("getting-started");
  for (const slug of gettingStartedSlugs) {
    urls.push(
      `${SITE_URL}/getting-started/${slug === "index" ? "" : slug}`,
    );
  }

  for (const plugin of plugins) {
    urls.push(`${SITE_URL}/marketplace/plugins/${plugin.slug}`);
  }

  for (const agent of agents) {
    urls.push(`${SITE_URL}/marketplace/agents/${agent.slug}`);
  }

  return urls;
}
