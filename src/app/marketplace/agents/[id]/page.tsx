import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getRepoMetadata, getRepoReadme } from "@/lib/github";
import { AgentDetailView } from "@/components/marketplace/AgentDetail";
import { StructuredData } from "@/components/seo/StructuredData";
import { generateBreadcrumbSchema, generateSoftwareApplicationSchema, SITE_URL } from "@/lib/seo";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const agent = await prisma.agentConfig.findFirst({
    where: { status: "approved", OR: [{ id: params.id }, { slug: params.id }] },
  });
  if (!agent) return { title: "Agent Not Found" };
  const desc = agent.description?.length
    ? agent.description.length > 160
      ? agent.description.slice(0, 157) + "..."
      : agent.description
    : `Use ${agent.name} — a pre-configured agent profile for the CortexPrism agentic harness`;
  return {
    title: `${agent.name} — CortexPrism Agent`,
    description: desc,
    alternates: { canonical: `${SITE_URL}/marketplace/agents/${agent.slug}` },
    openGraph: {
      title: `${agent.name} — CortexPrism Agent`,
      description: desc,
      url: `${SITE_URL}/marketplace/agents/${agent.slug}`,
      type: "article",
      images: [
        {
          url: `${SITE_URL}/marketplace/agents/${agent.slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${agent.name} agent on CortexPrism`,
        },
      ],
    },
    twitter: {
      title: `${agent.name} — CortexPrism Agent`,
      description: desc,
    },
  };
}

export default async function AgentDetailPage({ params }: Props) {
  const agent = await prisma.agentConfig.findFirst({
    where: { status: "approved", OR: [{ id: params.id }, { slug: params.id }] },
    include: { category: true, screenshots: { orderBy: { order: "asc" } }, versions: { orderBy: { createdAt: "desc" }, take: 10 } },
  });

  if (!agent) notFound();

  const [githubMeta, fetchedReadme] = await Promise.all([
    agent.repository ? getRepoMetadata(agent.repository) : null,
    agent.repository && !agent.readme ? getRepoReadme(agent.repository) : null,
  ]);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Marketplace", url: `${SITE_URL}/marketplace` },
    { name: "Agents", url: `${SITE_URL}/marketplace/agents` },
    { name: agent.name, url: `${SITE_URL}/marketplace/agents/${agent.slug}` },
  ]);

  const softwareSchema = generateSoftwareApplicationSchema({
    name: agent.name,
    description: agent.description || `${agent.name} v${agent.version} — a pre-configured agent profile`,
    url: `${SITE_URL}/marketplace/agents/${agent.slug}`,
    image: agent.icon,
    version: agent.version,
    authorName: agent.author,
  });

  return (
    <div className="max-w-page-narrow mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16 py-12">
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={softwareSchema} />
      <AgentDetailView
        agent={{
          id: agent.id,
          name: agent.name,
          slug: agent.slug,
          version: agent.version,
          description: agent.description,
          provider: agent.provider,
          model: agent.model,
          temperature: agent.temperature,
          tools: JSON.parse(agent.tools || "[]"),
          tags: typeof agent.tags === 'string' ? JSON.parse(agent.tags || "[]") : (agent.tags || []),
          systemPrompt: agent.systemPrompt,
          soulContent: agent.soulContent,
          author: agent.author,
          authorUrl: agent.authorUrl,
          homepage: agent.homepage,
          repository: agent.repository,
          license: agent.license,
          icon: agent.icon,
          readme: agent.readme || fetchedReadme,
          downloads: agent.downloads,
          rating: agent.rating,
          githubStars: agent.githubStars || githubMeta?.stars || 0,
          githubForks: agent.githubForks || githubMeta?.forks || 0,
          githubTopics: githubMeta?.topics || [],
          category: agent.category?.name || null,
          screenshots: agent.screenshots.map(s => ({ url: s.url, alt: s.alt })),
          createdAt: agent.createdAt.toISOString(),
          updatedAt: agent.updatedAt.toISOString(),
        }}
      />
    </div>
  );
}
