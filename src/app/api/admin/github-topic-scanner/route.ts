import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";
import { scanTopic } from "@/lib/github-topic-scanner";

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const topic = searchParams.get("topic") || "";

  const where: Record<string, unknown> = {};
  if (topic) where.topic = topic;

  const [scans, total] = await Promise.all([
    prisma.gitHubTopicScan.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        createdBy: { select: { username: true } },
        _count: { select: { results: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.gitHubTopicScan.count({ where }),
  ]);

  return Response.json({ scans, total, page, limit, totalPages: Math.ceil(total / limit) });
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { topic } = body;

    if (!topic) {
      return Response.json({ error: "Topic is required" }, { status: 400 });
    }

    const result = await scanTopic(topic, user!.userId);
    return Response.json(result, { status: 201 });
  } catch (error) {
    return Response.json({
      error: error instanceof Error ? error.message : "Scan failed",
    }, { status: 500 });
  }
}
