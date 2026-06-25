import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";
import { syncGitHubRepo } from "@/lib/github-import";

export async function POST(request: NextRequest, { params: pp }: { params: Promise<{ id: string }> }) {
  const params = await pp;
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  const connection = await prisma.gitHubConnection.findUnique({ where: { id: params.id } });
  if (!connection) {
    return Response.json({ error: "Connection not found" }, { status: 404 });
  }

  const result = await syncGitHubRepo(
    connection.owner,
    connection.repo,
    connection.branch,
    connection.manifestPath,
    connection.syncPlugins,
    connection.syncAgents,
    connection.autoApprove,
    user!.userId,
  );

  return Response.json({ result });
}
