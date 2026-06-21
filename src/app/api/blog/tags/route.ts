import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      select: { tags: true },
    });

    const tagSet = new Set<string>();
    for (const post of posts) {
      try {
        const tags = JSON.parse(post.tags) as string[];
        tags.forEach((t) => tagSet.add(t));
      } catch {
        // skip malformed tags
      }
    }

    const sortedTags = Array.from(tagSet).sort();

    return Response.json({ tags: sortedTags });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
