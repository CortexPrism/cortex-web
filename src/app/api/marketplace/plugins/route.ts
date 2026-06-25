import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth-middleware";
import { sendSubmissionWebhook } from "@/lib/discord-webhook";

const PluginInputSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
  description: z.string().min(1),
  kind: z.enum(["esm", "mcp", "wasm"]),
  entryPoint: z.string().min(1).optional(),
  capabilities: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  author: z.string().optional(),
  authorUrl: z.string().optional(),
  homepage: z.string().optional(),
  repository: z.string().optional(),
  license: z.string().optional(),
  icon: z.string().optional(),
  readme: z.string().optional(),
  categoryId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const kind = searchParams.get("kind") || "";
  const sort = searchParams.get("sort") || "downloads";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));

  const where: Record<string, unknown> = { status: "approved" };
  if (search) where.OR = [
    { name: { contains: search } },
    { description: { contains: search } },
  ];
  if (category) where.category = { slug: category };
  if (kind) where.kind = kind;

  const sortMap: Record<string, Record<string, string>> = {
    downloads: { downloads: "desc" },
    rating: { rating: "desc" },
    newest: { createdAt: "desc" },
    name: { name: "asc" },
  };
  const orderBy = sortMap[sort] || sortMap.downloads;

  const [plugins, total] = await Promise.all([
    prisma.plugin.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: { category: true, user: { select: { username: true } } },
      orderBy,
    }),
    prisma.plugin.count({ where }),
  ]);

  return Response.json({
    plugins: plugins.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      version: p.version,
      description: p.description,
      kind: p.kind,
      author: p.user?.username || p.author,
      icon: p.icon,
      downloads: p.downloads,
      rating: p.rating,
      category: p.category?.name || null,
      license: p.license,
      repository: p.repository,
      githubStars: p.githubStars,
      createdAt: p.createdAt,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = PluginInputSchema.parse(body);
    const slug = data.name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

    const user = getAuthUser(request);
    const plugin = await prisma.plugin.create({
      data: {
        ...data,
        slug,
        entryPoint: data.entryPoint || `plugins/${slug}/mod.ts`,
        capabilities: JSON.stringify(data.capabilities || []),
        tags: JSON.stringify(data.tags || []),
        status: "pending",
        userId: user?.userId || null,
      },
    });

    sendSubmissionWebhook("plugin", plugin.name, user?.userId || "anonymous", plugin.status, plugin.id);

    return Response.json(plugin, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
