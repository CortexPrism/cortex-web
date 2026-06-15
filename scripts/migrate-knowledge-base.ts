import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL || "file:./prisma/marketplace.db" } },
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractTitleFromMarkdown(content: string): string {
  const match = content.match(/^#\s+(.+)/m);
  return match ? match[1].trim() : "Untitled";
}

function extractDescriptionFromMarkdown(content: string): string | null {
  const paragraphs = content.split("\n\n");
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed.startsWith("#") && trimmed.length > 10 && trimmed.length < 200) {
      return trimmed.replace(/\n/g, " ");
    }
  }
  return null;
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

const sortOrderMap: Record<string, number> = {
  faq: 0,
  troubleshooting: 1,
  "best-practices": 2,
  "provider-guide": 3,
  "sandbox-guide": 4,
  "migration-guide": 5,
  "security-guidelines": 6,
  "performance-tuning": 7,
};

async function main() {
  const kbDir = path.join(process.cwd(), "content", "knowledge-base");
  const files = fs.readdirSync(kbDir).filter((f) => f.endsWith(".mdx"));

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const file of files) {
    const fileSlug = file.replace(/\.mdx$/, "");

    try {
      const existing = await prisma.knowledgeBaseArticle.findUnique({
        where: { slug: fileSlug },
      });
      if (existing) {
        console.log(`  SKIP: ${fileSlug} (already exists)`);
        skipped++;
        continue;
      }

      const { content, frontmatter } = parseMdxFile(path.join(kbDir, file));
      const title = (frontmatter.title as string) || extractTitleFromMarkdown(content);
      const description = (frontmatter.description as string) || extractDescriptionFromMarkdown(content);
      const sortOrder = sortOrderMap[fileSlug] ?? 0;

      await prisma.knowledgeBaseArticle.create({
        data: {
          title,
          slug: fileSlug,
          content,
          description,
          published: true,
          sortOrder,
        },
      });

      console.log(`  CREATE: ${fileSlug} -> "${title}"`);
      created++;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  ERROR: ${fileSlug} - ${message}`);
      errors.push(fileSlug);
    }
  }

  console.log(`\nDone. Created: ${created}, Skipped: ${skipped}, Errors: ${errors.length}`);
  if (errors.length > 0) {
    console.log(`Errors on: ${errors.join(", ")}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
