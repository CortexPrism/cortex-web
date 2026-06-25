import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const AgentUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  version: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  provider: z.string().optional(),
  model: z.string().optional(),
  temperature: z.number().optional(),
  tools: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  systemPrompt: z.string().optional(),
  soulContent: z.string().optional(),
  author: z.string().optional(),
  authorUrl: z.string().optional(),
  repository: z.string().optional(),
  icon: z.string().optional(),
  readme: z.string().optional(),
  categoryId: z.string().optional(),
  published: z.boolean().optional(),
});

export async function GET(request: NextRequest, { params: pp }: { params: Promise<{ id: string }> }) {
  const params = await pp;
  const agent = await prisma.agentConfig.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }] },
    include: { category: true, user: { select: { username: true } } },
  });

  if (!agent) {
    return Response.json({ error: "Agent config not found" }, { status: 404 });
  }

  return Response.json({
    ...agent,
    tools: JSON.parse(agent.tools || "[]"),
    tags: typeof agent.tags === 'string' ? JSON.parse(agent.tags || "[]") : (agent.tags || []),
    category: agent.category?.name || null,
  });
}

export async function PUT(request: NextRequest, { params: pp }: { params: Promise<{ id: string }> }) {
  const params = await pp;
  try {
    const existing = await prisma.agentConfig.findUnique({ where: { id: params.id } });
    if (!existing) {
      return Response.json({ error: "Agent config not found" }, { status: 404 });
    }

    const body = await request.json();
    const data = AgentUpdateSchema.parse(body);

    const updateData: Record<string, unknown> = { ...data };
    if (data.tools) updateData.tools = JSON.stringify(data.tools);
    if (data.tags) updateData.tags = JSON.stringify(data.tags);

    const agent = await prisma.agentConfig.update({
      where: { id: params.id },
      data: updateData,
    });

    return Response.json(agent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params: pp }: { params: Promise<{ id: string }> }) {
  const params = await pp;
  const existing = await prisma.agentConfig.findUnique({ where: { id: params.id } });
  if (!existing) {
    return Response.json({ error: "Agent config not found" }, { status: 404 });
  }

  await prisma.agentConfig.delete({ where: { id: params.id } });
  return new Response(null, { status: 204 });
}
