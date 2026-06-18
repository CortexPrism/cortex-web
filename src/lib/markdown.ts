import fs from "fs";
import path from "path";

const contentDir = path.join(process.cwd(), "content");

export function getContentSlugs(section: string): string[] {
  const dir = path.join(contentDir, section);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".mdx")).map((f) => f.replace(/\.mdx$/, ""));
}

export function getContentBySlug(section: string, slug: string): { content: string; frontmatter: Record<string, unknown> } {
  const filePath = path.join(contentDir, section, `${slug}.mdx`);
  const raw = fs.readFileSync(filePath, "utf-8");
  const frontmatter: Record<string, unknown> = {};
  let content = raw;
  if (raw.startsWith("---")) {
    const end = raw.indexOf("---", 3);
    if (end !== -1) {
      const fm = raw.slice(3, end).trim();
      for (const line of fm.split("\n")) {
        const [k, ...v] = line.split(":");
        if (k && v.length) frontmatter[k.trim()] = v.join(":").trim();
      }
      content = raw.slice(end + 3).trim();
    }
  }
  return { content, frontmatter };
}

export function extractH1FromMdx(content: string): string {
  const match = content.match(/^# (.+)$/m);
  return match ? match[1] : "";
}

export function getAllContent(section: string) {
  return getContentSlugs(section).map((slug) => ({
    slug,
    ...getContentBySlug(section, slug),
  }));
}
