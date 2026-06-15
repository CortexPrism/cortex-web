import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";
import { createAuditLog } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  const connections = await prisma.gitHubConnection.findMany({
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { id: true, username: true } } },
  });

  return Response.json({ connections });
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { owner, repo, branch, manifestPath, syncPlugins, syncAgents, autoApprove } = body;

    if (!owner || !repo) {
      return Response.json({ error: "Owner and repo are required" }, { status: 400 });
    }

    const existing = await prisma.gitHubConnection.findUnique({
      where: { owner_repo: { owner, repo } },
    });

    if (existing) {
      return Response.json({ error: "Connection already exists" }, { status: 409 });
    }

    const connection = await prisma.gitHubConnection.create({
      data: {
        owner,
        repo,
        branch: branch || "main",
        manifestPath: manifestPath || "cortex.json",
        syncPlugins: syncPlugins !== false,
        syncAgents: syncAgents === true,
        autoApprove: autoApprove === true,
        createdById: user!.userId,
      },
    });

    await createAuditLog({
      userId: user!.userId,
      action: "github.connect",
      entity: "github_connection",
      entityId: connection.id,
      metadata: { owner, repo },
    });

    return Response.json({ connection }, { status: 201 });
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === "P2002") {
      return Response.json({ error: "Connection already exists" }, { status: 409 });
    }
    return Response.json({ error: "Failed to create connection" }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    const connection = await prisma.gitHubConnection.findUnique({ where: { id } });
    if (!connection) {
      return Response.json({ error: "Connection not found" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (updateData.branch !== undefined) data.branch = updateData.branch;
    if (updateData.manifestPath !== undefined) data.manifestPath = updateData.manifestPath;
    if (updateData.syncPlugins !== undefined) data.syncPlugins = updateData.syncPlugins;
    if (updateData.syncAgents !== undefined) data.syncAgents = updateData.syncAgents;
    if (updateData.autoApprove !== undefined) data.autoApprove = updateData.autoApprove;
    if (updateData.isActive !== undefined) data.isActive = updateData.isActive;

    const updated = await prisma.gitHubConnection.update({ where: { id }, data });

    return Response.json({ connection: updated });
  } catch {
    return Response.json({ error: "Failed to update connection" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id } = body;

    await prisma.gitHubConnection.delete({ where: { id } });

    await createAuditLog({
      userId: user!.userId,
      action: "github.disconnect",
      entity: "github_connection",
      entityId: id,
    });

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Connection not found" }, { status: 404 });
  }
}
