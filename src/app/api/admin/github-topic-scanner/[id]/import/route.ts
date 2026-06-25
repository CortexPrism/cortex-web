import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";
import { importDiscoveredRepo } from "@/lib/github-topic-scanner";
import { createAuditLog } from "@/lib/audit";

export async function POST(request: NextRequest, { params: pp }: { params: Promise<{ id: string }> }) {
  const params = await pp;
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { discoveredId, autoApprove } = body;

    if (!discoveredId) {
      return Response.json({ error: "discoveredId is required" }, { status: 400 });
    }

    const result = await importDiscoveredRepo(discoveredId, user!.userId, autoApprove === true);

    if (result.success) {
      await prisma.gitHubTopicScan.update({
        where: { id: params.id },
        data: { importedCount: { increment: 1 } },
      });

      await createAuditLog({
        userId: user!.userId,
        action: "github.import_discovered",
        entity: "discovered_repo",
        entityId: discoveredId,
        metadata: { entityId: result.entityId },
      });
    }

    return Response.json(result);
  } catch (error) {
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : "Import failed",
    }, { status: 500 });
  }
}
