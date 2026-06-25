import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params: pp }: { params: Promise<{ id: string }> }) {
  const params = await pp;
  const agent = await prisma.agentConfig.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }], status: "approved" },
  });

  if (!agent) {
    return Response.json({ error: "Agent config not found" }, { status: 404 });
  }

  await prisma.agentConfig.update({
    where: { id: agent.id },
    data: { downloads: { increment: 1 } },
  });

  return Response.json({
    id: agent.id,
    name: agent.name,
    version: agent.version,
    description: agent.description,
    provider: agent.provider,
    model: agent.model,
    temperature: agent.temperature,
    tools: JSON.parse(agent.tools || "[]"),
    tags: typeof agent.tags === 'string' ? JSON.parse(agent.tags || "[]") : (agent.tags || []),
    systemPrompt: agent.systemPrompt,
    author: agent.author,
    createdAt: agent.createdAt,
    updatedAt: agent.updatedAt,
  });
}
