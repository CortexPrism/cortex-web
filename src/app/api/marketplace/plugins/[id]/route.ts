import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const PluginUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  version: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  kind: z.enum(["esm", "mcp", "wasm"]).optional(),
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
  published: z.boolean().optional(),
});

export async function GET(request: NextRequest, { params: pp }: { params: Promise<{ id: string }> }) {
  const params = await pp;
  const plugin = await prisma.plugin.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }] },
    include: { category: true, user: { select: { username: true } } },
  });

  if (!plugin) {
    return Response.json({ error: "Plugin not found" }, { status: 404 });
  }

  return Response.json({
    ...plugin,
    capabilities: JSON.parse(plugin.capabilities || "[]"),
    tags: typeof plugin.tags === 'string' ? JSON.parse(plugin.tags || "[]") : (plugin.tags || []),
    category: plugin.category?.name || null,
  });
}

export async function PUT(request: NextRequest, { params: pp }: { params: Promise<{ id: string }> }) {
  const params = await pp;
  try {
    const existing = await prisma.plugin.findUnique({ where: { id: params.id } });
    if (!existing) {
      return Response.json({ error: "Plugin not found" }, { status: 404 });
    }

    const body = await request.json();
    const data = PluginUpdateSchema.parse(body);

    const updateData: Record<string, unknown> = { ...data };
    if (data.capabilities) {
      updateData.capabilities = JSON.stringify(data.capabilities);
    }
    if (data.tags) {
      updateData.tags = JSON.stringify(data.tags);
    }

    const plugin = await prisma.plugin.update({
      where: { id: params.id },
      data: updateData,
    });

    return Response.json(plugin);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params: pp }: { params: Promise<{ id: string }> }) {
  const params = await pp;
  const existing = await prisma.plugin.findUnique({ where: { id: params.id } });
  if (!existing) {
    return Response.json({ error: "Plugin not found" }, { status: 404 });
  }

  await prisma.plugin.delete({ where: { id: params.id } });
  return new Response(null, { status: 204 });
}
