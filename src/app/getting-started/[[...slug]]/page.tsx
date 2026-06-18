import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/Sidebar";
import { MdxContent } from "@/components/docs/MdxContent";
import { getContentBySlug, getContentSlugs, extractH1FromMdx } from "@/lib/markdown";
import { TableOfContents } from "@/components/docs/TableOfContents";
import { StructuredData } from "@/components/seo/StructuredData";
import { generateBreadcrumbSchema, SITE_URL } from "@/lib/seo";

interface Props {
  params: { slug?: string[] };
}

export async function generateStaticParams() {
  const slugs = getContentSlugs("getting-started");
  return slugs.map((slug) => ({ slug: [slug] }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug?.[0] || "index";
  const { content, frontmatter } = getContentBySlug("getting-started", slug);
  const extractedTitle = extractH1FromMdx(content) || slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const rawTitle = (frontmatter.title as string) || extractedTitle || "Getting Started";
  const title = rawTitle.includes("CortexPrism") ? rawTitle : `${rawTitle} — CortexPrism`;
  const desc = (frontmatter.description as string) || `Step-by-step guide for ${extractedTitle.toLowerCase()}. Learn how to get the most out of the CortexPrism agentic harness.`;
  const url = `${SITE_URL}/getting-started/${slug === "index" ? "" : slug}`;
  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} — CortexPrism`,
      description: desc,
      url,
    },
    twitter: {
      title,
      description: desc.slice(0, 200),
    },
  };
}

export default async function GettingStartedPage({ params }: Props) {
  const slug = params.slug?.[0] || "index";
  let content: string;
  try {
    const result = getContentBySlug("getting-started", slug);
    content = result.content;
  } catch {
    notFound();
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Getting Started", url: `${SITE_URL}/getting-started` },
    ...(slug !== "index"
      ? [
          {
            name: slug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
            url: `${SITE_URL}/getting-started/${slug}`,
          },
        ]
      : []),
  ]);

  return (
    <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16 py-12 flex gap-8">
      <StructuredData data={breadcrumbSchema} />
      <Sidebar />
      <article className="flex-1 min-w-0 max-w-page-content">
        <MdxContent content={content} />
      </article>
      <TableOfContents />
    </div>
  );
}
