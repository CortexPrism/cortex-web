import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params: pp }: { params: Promise<{ id: string }> }) {
  const params = await pp;
  const plugin = await prisma.plugin.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }], status: "approved" },
  });

  if (!plugin) {
    return Response.json({ error: "Plugin not found" }, { status: 404 });
  }

  await prisma.plugin.update({
    where: { id: plugin.id },
    data: { downloads: { increment: 1 } },
  });

  const manifest = {
    id: plugin.id,
    name: plugin.name,
    version: plugin.version,
    description: plugin.description,
    kind: plugin.kind,
    entryPoint: plugin.entryPoint,
    capabilities: JSON.parse(plugin.capabilities || "[]"),
    author: plugin.author,
    homepage: plugin.homepage,
  };

  return Response.json(manifest);
}
