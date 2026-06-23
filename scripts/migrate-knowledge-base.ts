import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL || "file:./prisma/marketplace.db" } },
});

const SECTIONS: Record<string, { label: string; sortOffset: number }> = {
  "knowledge-base": { label: "Knowledge Base", sortOffset: 0 },
  "getting-started": { label: "Getting Started", sortOffset: 100 },
  architecture: { label: "Architecture", sortOffset: 200 },
  "developer-guide": { label: "Developer Guide", sortOffset: 300 },
  cli: { label: "CLI Reference", sortOffset: 400 },
  "design-docs": { label: "Design Docs", sortOffset: 500 },
};

function extractTitleFromMarkdown(content: string): string {
  const match = content.match(/^#\s+(.+)/m);
  return match ? match[1].trim() : "Untitled";
}

function extractDescriptionFromMarkdown(content: string): string | null {
  const paragraphs = content.split("\n\n");
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (
      !trimmed.startsWith("#") &&
      !trimmed.startsWith("|") &&
      !trimmed.startsWith("- [") &&
      trimmed.length > 20 &&
      trimmed.length < 220
    ) {
      return trimmed.replace(/\n/g, " ").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
    }
  }
  return null;
}

function inferTags(title: string, section: string, filename: string): string[] {
  const tags: string[] = [section];
  const combined = `${title} ${filename}`.toLowerCase();

  const keywordMap: Record<string, string[]> = {
    cli: ["cli", "command-line", "terminal"],
    install: ["installation", "setup"],
    config: ["configuration", "settings"],
    api: ["api", "plugin-development"],
    security: ["security", "hardening", "authentication"],
    memory: ["memory", "persistence"],
    agent: ["agents", "ai"],
    plugin: ["plugins", "extensions"],
    mcp: ["mcp", "protocol"],
    git: ["git", "version-control"],
    github: ["github", "ci-cd"],
    daemon: ["daemon", "server"],
    serve: ["server", "http"],
    chat: ["chat", "interactive"],
    sandbox: ["sandbox", "code-execution"],
    best: ["best-practices"],
    troubleshooting: ["troubleshooting", "debugging"],
    faq: ["faq"],
    migration: ["migration", "upgrade"],
    performance: ["performance", "optimization"],
    provider: ["providers", "llm"],
    workflow: ["workflow", "automation"],
    remote: ["remote", "distributed"],
    discord: ["discord", "integrations"],
  };

  for (const [keyword, tagList] of Object.entries(keywordMap)) {
    if (combined.includes(keyword)) {
      tagList.forEach((t) => {
        if (!tags.includes(t)) tags.push(t);
      });
    }
  }

  return tags.slice(0, 5);
}

function parseMdxFile(filePath: string): { content: string; frontmatter: Record<string, unknown> } {
  const raw = fs.readFileSync(filePath, "utf-8");
  const frontmatter: Record<string, unknown> = {};
  let content = raw;
  if (raw.startsWith("---")) {
    const end = raw.indexOf("---", 3);
    if (end !== -1) {
      const fm = raw.slice(3, end).trim();
      for (const line of fm.split("\n")) {
        const colonIdx = line.indexOf(":");
        if (colonIdx !== -1) {
          frontmatter[line.slice(0, colonIdx).trim()] = line.slice(colonIdx + 1).trim();
        }
      }
      content = raw.slice(end + 3).trim();
    }
  }
  return { content, frontmatter };
}

async function main() {
  const contentDir = path.join(process.cwd(), "content");

  let totalCreated = 0;
  let totalSkipped = 0;
  const errors: string[] = [];

  for (const [sectionKey, sectionInfo] of Object.entries(SECTIONS)) {
    const sectionDir = path.join(contentDir, sectionKey);
    if (!fs.existsSync(sectionDir)) {
      console.log(`\n[${sectionInfo.label}] Directory not found, skipping.`);
      continue;
    }

    const files = fs.readdirSync(sectionDir).filter((f) => f.endsWith(".mdx"));
    console.log(`\n[${sectionInfo.label}] ${files.length} files`);

    let sectionCreated = 0;
    let fileIndex = 0;

    for (const file of files) {
      const fileSlug = file.replace(/\.mdx$/, "");
      const slug = sectionKey === "knowledge-base"
        ? (fileSlug === "index" ? sectionKey : fileSlug)
        : `${sectionKey}/${fileSlug === "index" ? sectionKey : fileSlug}`;

      try {
        const existing = await prisma.knowledgeBaseArticle.findUnique({
          where: { slug },
        });
        if (existing) {
          console.log(`  SKIP: ${slug} (already exists)`);
          totalSkipped++;
          continue;
        }

        const { content, frontmatter } = parseMdxFile(path.join(sectionDir, file));
        const title = (frontmatter.title as string) || extractTitleFromMarkdown(content);
        const description =
          (frontmatter.description as string) || extractDescriptionFromMarkdown(content);
        const tags = (
          frontmatter.tags
            ? String(frontmatter.tags).split(",").map((t) => t.trim())
            : inferTags(title, sectionKey, fileSlug)
        );

        await prisma.knowledgeBaseArticle.create({
          data: {
            title,
            slug,
            section: sectionKey,
            content,
            description,
            tags: JSON.stringify(tags),
            published: true,
            sortOrder: sectionInfo.sortOffset + fileIndex,
          },
        });

        console.log(`  CREATE: ${slug} -> "${title}"`);
        sectionCreated++;
        totalCreated++;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`  ERROR: ${slug} - ${message}`);
        errors.push(`${sectionKey}/${slug}`);
      }
      fileIndex++;
    }

    console.log(`  ${sectionInfo.label} done. Created: ${sectionCreated}`);
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Created: ${totalCreated}, Skipped: ${totalSkipped}, Errors: ${errors.length}`);
  if (errors.length > 0) {
    console.log(`Errors on: ${errors.join(", ")}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
