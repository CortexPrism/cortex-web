import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { MdxContent } from "@/components/docs/MdxContent";
import { getContentBySlug, getContentSlugs } from "@/lib/markdown";
import { getAllKbArticles, getKbArticleBySlug, getKbSlugs } from "@/lib/knowledge-base";
import { TableOfContents } from "@/components/docs/TableOfContents";
import { StructuredData } from "@/components/seo/StructuredData";
import { generateBreadcrumbSchema, SITE_URL } from "@/lib/seo";

interface Props {
  params: { slug?: string[] };
}

const sectionMap: Record<string, string> = {
  cli: "cli",
  architecture: "architecture",
  "knowledge-base": "knowledge-base",
  "design-docs": "design-docs",
  "developer-guide": "developer-guide",
};

const sectionLabels: Record<string, string> = {
  cli: "CLI Reference",
  architecture: "Architecture",
  "knowledge-base": "Knowledge Base",
  "design-docs": "Design Docs",
  "developer-guide": "Developer Guide",
};

export async function generateStaticParams() {
  const params: { slug: string[] }[] = [];
  for (const [dir, section] of Object.entries(sectionMap)) {
    if (dir === "knowledge-base") {
      params.push({ slug: [dir] });
      const slugs = await getKbSlugs();
      params.push(...slugs.map((s) => ({ slug: [dir, s] })));
    } else {
      const slugs = getContentSlugs(section);
      params.push(
        ...slugs.map((s) => ({ slug: [dir, s === "index" ? "" : s].filter(Boolean) }))
      );
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!params.slug?.length) {
    return {
      title: "CortexPrism Documentation — Guides, CLI & Architecture",
      description:
        "Comprehensive documentation for CortexPrism: CLI reference, architecture deep-dives, knowledge base, design docs, and developer guides for building agentic AI applications.",
      alternates: { canonical: `${SITE_URL}/docs` },
      openGraph: {
        title: "CortexPrism Documentation — Guides, CLI & Architecture",
        description:
          "CLI reference, architecture deep-dives, knowledge base, design docs, and developer guides. Everything you need to build with the CortexPrism agentic harness.",
        url: `${SITE_URL}/docs`,
      },
    };
  }
  return { title: `Docs: ${params.slug.join(" / ")}` };
}

export default async function DocsPage({ params }: Props) {
  if (!params.slug?.length) {
    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: "Home", url: SITE_URL },
      { name: "Documentation", url: `${SITE_URL}/docs` },
    ]);

    return (
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16 py-12 flex gap-8">
        <StructuredData data={breadcrumbSchema} />
        <Sidebar />
        <article className="flex-1 min-w-0 max-w-page-content">
          <h1 className="text-3xl font-bold text-[#e2e2ea] mb-6">Documentation</h1>
          <p className="text-[#9090a8]">
            Browse the documentation using the sidebar. Select a topic to get started.
          </p>
        </article>
      </div>
    );
  }

  const section = sectionMap[params.slug[0]];
  if (!section) notFound();

  const sectionLabel = sectionLabels[params.slug[0]] || params.slug[0];

  if (params.slug[0] === "knowledge-base") {
    const fileSlug = params.slug[1];

    if (!fileSlug) {
      const { articles } = await getAllKbArticles({ publishedOnly: true, limit: 100 });
      const breadcrumbSchema = generateBreadcrumbSchema([
        { name: "Home", url: SITE_URL },
        { name: "Documentation", url: `${SITE_URL}/docs` },
        { name: sectionLabel, url: `${SITE_URL}/docs/knowledge-base` },
      ]);

      return (
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16 py-12 flex gap-8">
          <StructuredData data={breadcrumbSchema} />
          <Sidebar />
          <article className="flex-1 min-w-0 max-w-page-content">
            <h1 className="text-3xl font-bold text-[#e2e2ea] mb-6">Knowledge Base</h1>
            <p className="text-[#9090a8] mb-8">
              Guides, best practices, troubleshooting, and reference materials for CortexPrism.
            </p>
            {articles.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <p className="text-[#9090a8]">No articles published yet.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {articles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/docs/knowledge-base/${article.slug}`}
                    className="glass-card p-5 hover:border-indigo-500/20 transition-colors group"
                  >
                    <h3 className="font-semibold text-[#e2e2ea] group-hover:text-indigo-400 transition-colors mb-1">
                      {article.title}
                    </h3>
                    {article.description && (
                      <p className="text-sm text-[#55556a] line-clamp-2">{article.description}</p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </article>
        </div>
      );
    }

    const article = await getKbArticleBySlug(fileSlug);
    if (!article || !article.published) notFound();

    const breadcrumbItems = [
      { name: "Home", url: SITE_URL },
      { name: "Documentation", url: `${SITE_URL}/docs` },
      { name: sectionLabel, url: `${SITE_URL}/docs/knowledge-base` },
      { name: article.title, url: `${SITE_URL}/docs/knowledge-base/${article.slug}` },
    ];
    const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

    return (
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16 py-12 flex gap-8">
        <StructuredData data={breadcrumbSchema} />
        <Sidebar />
        <article className="flex-1 min-w-0 max-w-page-content">
          <MdxContent content={article.content} />
        </article>
        <TableOfContents />
      </div>
    );
  }

  const fileSlug = params.slug[1] || "index";
  let content: string;
  try {
    const result = getContentBySlug(section, fileSlug);
    content = result.content;
  } catch {
    notFound();
  }

  const breadcrumbItems = [
    { name: "Home", url: SITE_URL },
    { name: "Documentation", url: `${SITE_URL}/docs` },
    { name: sectionLabel, url: `${SITE_URL}/docs/${params.slug[0]}` },
  ];
  if (params.slug[1] && params.slug[1] !== "index") {
    const title = params.slug[1].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    breadcrumbItems.push({
      name: title,
      url: `${SITE_URL}/docs/${params.slug.join("/")}`,
    });
  }
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

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
