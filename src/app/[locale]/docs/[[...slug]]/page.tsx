import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { MdxContent } from "@/components/docs/MdxContent";
import { getContentBySlug, extractH1FromMdx } from "@/lib/markdown";
import { getAllKbArticles, getKbArticleBySlug, getKbSlugs } from "@/lib/knowledge-base";
import { TableOfContents } from "@/components/docs/TableOfContents";
import { StructuredData } from "@/components/seo/StructuredData";
import { KbArticleComments } from "@/components/docs/KbArticleComments";
import { KbViewTracker } from "@/components/docs/KbViewTracker";
import { generateBreadcrumbSchema, generateArticleSchema, generateAlternates, SITE_URL } from "@/lib/seo";

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
  for (const dir of Object.keys(sectionMap)) {
    params.push({ slug: [dir] });
  }
  const kbSlugs = await getKbSlugs();
  for (const slug of kbSlugs) {
    params.push({ slug: ["knowledge-base", slug] });
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!params.slug?.length) {
    return {
      title: "CortexPrism Documentation — Guides, CLI & Architecture",
      description:
        "Comprehensive documentation for CortexPrism: CLI reference, architecture deep-dives, knowledge base, design docs, and developer guides for building AI agent applications.",
      alternates: generateAlternates("/docs"),
      openGraph: {
        title: "CortexPrism Documentation — Guides, CLI & Architecture",
        description:
          "CLI reference, architecture deep-dives, knowledge base, design docs, and developer guides. Everything you need to build with the CortexPrism AI Agent Operating System.",
        url: `${SITE_URL}/docs`,
      },
      twitter: {
        title: "CortexPrism Documentation — Guides, CLI & Architecture",
        description:
          "CLI reference, architecture deep-dives, knowledge base, design docs, and developer guides.",
      },
    };
  }

  const [section, fileSlug] = params.slug;
  const sectionLabel = sectionLabels[section] || section;

  if (section === "knowledge-base") {
    if (!fileSlug) {
      return {
        title: "Knowledge Base — CortexPrism",
        description:
          "Guides, best practices, troubleshooting, and reference materials for CortexPrism. Browse articles on configuration, plugins, agents, and more.",
        alternates: generateAlternates("/docs/knowledge-base"),
        openGraph: {
          title: "CortexPrism Knowledge Base — Guides & Troubleshooting",
          description:
            "Browse CortexPrism knowledge base articles: FAQ, troubleshooting, migration guides, performance tuning, and security guidelines.",
          url: `${SITE_URL}/docs/knowledge-base`,
        },
        twitter: {
          title: "CortexPrism Knowledge Base — Guides & Troubleshooting",
          description:
            "Browse knowledge base articles: FAQ, troubleshooting, migration guides, and security guidelines.",
        },
      };
    }

    const article = await getKbArticleBySlug(fileSlug);
    if (!article || !article.published) {
      return { title: "Article Not Found" };
    }

    const desc = article.description || article.title;
    const truncatedDesc = desc.length > 160 ? desc.slice(0, 157) + "..." : desc;
    return {
      title: `${article.title} — CortexPrism Knowledge Base`,
      description: truncatedDesc,
      alternates: generateAlternates(`/docs/knowledge-base/${article.slug}`),
      openGraph: {
        title: `${article.title} — CortexPrism Knowledge Base`,
        description: desc,
        url: `${SITE_URL}/docs/knowledge-base/${article.slug}`,
        type: "article",
      },
      twitter: {
        title: article.title,
        description: truncatedDesc,
      },
    };
  }

  if (!sectionMap[section]) {
    return { title: `Docs: ${params.slug.join(" / ")}` };
  }

  try {
    const slug = fileSlug || "index";
    const { content } = getContentBySlug(sectionMap[section], slug);
    const h1 = extractH1FromMdx(content) || slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const docPath = `/docs/${section}${slug === "index" ? "" : `/${slug}`}`;
    return {
      title: `${h1} — ${sectionLabel} | CortexPrism`,
      alternates: generateAlternates(docPath),
      openGraph: {
        title: `${h1} — CortexPrism ${sectionLabel}`,
        url: `${SITE_URL}${docPath}`,
        type: "article",
      },
      twitter: {
        title: `${h1} — ${sectionLabel}`,
        description: `CortexPrism ${sectionLabel.toLowerCase()}: ${h1}. Part of the open-source AI Agent Operating System documentation.`,
      },
    };
  } catch {
    return { title: `Docs: ${params.slug.join(" / ")}` };
  }
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
                {articles.map((article) => {
                  const articleTags = (article.tags as string[]) || [];
                  return (
                    <Link
                      key={article.id}
                      href={`/docs/knowledge-base/${article.slug}`}
                      className="glass-card p-5 hover:border-indigo-500/20 transition-colors group"
                    >
                      <h2 className="font-semibold text-[#e2e2ea] group-hover:text-indigo-400 transition-colors mb-1">
                        {article.title}
                      </h2>
                      {article.description && (
                        <p className="text-sm text-[#55556a] line-clamp-2 mb-2">{article.description}</p>
                      )}
                      {articleTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {articleTags.slice(0, 3).map((tag) => (
                            <span key={tag} className="inline-flex items-center px-2 py-0.5 text-[10px] rounded-full bg-[#18181f] text-[#55556a] border border-[rgba(255,255,255,0.05)]">
                              {tag}
                            </span>
                          ))}
                          {articleTags.length > 3 && (
                            <span className="text-[10px] text-[#55556a]">+{articleTags.length - 3}</span>
                          )}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </article>
        </div>
      );
    }

    const article = await getKbArticleBySlug(fileSlug);
    if (!article || !article.published) notFound();

    const tags = article.tags as string[];

    const breadcrumbItems = [
      { name: "Home", url: SITE_URL },
      { name: "Documentation", url: `${SITE_URL}/docs` },
      { name: sectionLabel, url: `${SITE_URL}/docs/knowledge-base` },
      { name: article.title, url: `${SITE_URL}/docs/knowledge-base/${article.slug}` },
    ];
    const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);
    const articleSchema = generateArticleSchema({
      title: article.title,
      description: article.description || article.title,
      url: `${SITE_URL}/docs/knowledge-base/${article.slug}`,
      datePublished: article.createdAt.toISOString(),
      dateModified: article.updatedAt.toISOString(),
      authorName: undefined,
    });

    return (
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16 py-12 flex gap-8">
        <StructuredData data={breadcrumbSchema} />
        <StructuredData data={articleSchema} />
        <KbViewTracker slug={article.slug} />
        <Sidebar />
        <article className="flex-1 min-w-0 max-w-page-content">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center px-2.5 py-1 text-xs rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-4 text-xs text-[#55556a] mb-6 pb-6 border-b border-[rgba(255,255,255,0.07)]">
            <span>{new Date(article.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
            <span>{article.viewCount.toLocaleString()} views</span>
          </div>
          <MdxContent content={article.content} />
          <KbArticleComments slug={article.slug} />
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
