import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));
  const importStatus = searchParams.get("importStatus") || "";
  const search = searchParams.get("search") || "";

  const scan = await prisma.gitHubTopicScan.findUnique({ where: { id: params.id } });
  if (!scan) {
    return Response.json({ error: "Scan not found" }, { status: 404 });
  }

  const where: Record<string, unknown> = { scanId: params.id };
  if (importStatus) where.importStatus = importStatus;
  if (search) {
    where.OR = [
      { fullName: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const [results, total] = await Promise.all([
    prisma.discoveredRepo.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ manifestFound: "desc" }, { stars: "desc" }],
    }),
    prisma.discoveredRepo.count({ where }),
  ]);

  return Response.json({
    scan,
    results: results.map(r => ({
      ...r,
      topics: JSON.parse(r.topics),
      manifestData: r.manifestData ? JSON.parse(r.manifestData) : null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
