import { prisma } from "@/lib/prisma";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const FEED_TITLE = `${SITE_NAME} Blog`;
const FEED_DESCRIPTION =
  "Tutorials, architecture deep-dives, community spotlights, and release updates from the open-source Agent Operating System.";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    select: {
      title: true,
      slug: true,
      excerpt: true,
      tags: true,
      publishedAt: true,
      author: { select: { username: true, displayName: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });

  const mostRecentDate =
    posts.length > 0 && posts[0].publishedAt
      ? posts[0].publishedAt.toUTCString()
      : new Date().toUTCString();

  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`;
      const pubDate = post.publishedAt
        ? post.publishedAt.toUTCString()
        : "";
      const authorName =
        post.author?.displayName || post.author?.username || SITE_NAME;
      const description = post.excerpt
        ? escapeXml(post.excerpt)
        : `Read "${escapeXml(post.title)}" on the ${SITE_NAME} Blog.`;

      let tagsXml = "";
      try {
        const tags: string[] = JSON.parse(post.tags);
        tagsXml = tags
          .map((t) => `      <category>${escapeXml(t)}</category>`)
          .join("\n");
      } catch {
        // tags are not valid JSON, skip
      }

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <description>${description}</description>
      <author>${escapeXml(authorName)}</author>
      <pubDate>${pubDate}</pubDate>
${tagsXml}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${escapeXml(SITE_URL)}/blog</link>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${mostRecentDate}</lastBuildDate>
    <atom:link href="${escapeXml(SITE_URL)}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
