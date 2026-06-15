import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  const [
    totalUsers,
    activeUsers,
    totalPlugins,
    totalAgents,
    pendingPlugins,
    pendingAgents,
    approvedPlugins,
    approvedAgents,
    totalDownloads,
    totalCategories,
    totalRoles,
    totalGitHubConnections,
    recentLogs,
    recentPlugins,
    recentAgents,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.plugin.count(),
    prisma.agentConfig.count(),
    prisma.plugin.count({ where: { status: "pending" } }),
    prisma.agentConfig.count({ where: { status: "pending" } }),
    prisma.plugin.count({ where: { status: "approved" } }),
    prisma.agentConfig.count({ where: { status: "approved" } }),
    prisma.plugin.aggregate({ _sum: { downloads: true } }).then(r => r._sum.downloads || 0),
    prisma.category.count(),
    prisma.role.count(),
    prisma.gitHubConnection.count(),
    prisma.auditLog.findMany({ take: 10, orderBy: { createdAt: "desc" }, include: { user: { select: { username: true } } } }),
    prisma.plugin.findMany({ take: 5, orderBy: { createdAt: "desc" }, select: { id: true, name: true, slug: true, status: true, createdAt: true, user: { select: { username: true } } } }),
    prisma.agentConfig.findMany({ take: 5, orderBy: { createdAt: "desc" }, select: { id: true, name: true, slug: true, status: true, createdAt: true, user: { select: { username: true } } } }),
  ]);

  return Response.json({
    stats: {
      users: { total: totalUsers, active: activeUsers },
      plugins: { total: totalPlugins, pending: pendingPlugins, approved: approvedPlugins },
      agents: { total: totalAgents, pending: pendingAgents, approved: approvedAgents },
      downloads: totalDownloads,
      categories: totalCategories,
      roles: totalRoles,
      githubConnections: totalGitHubConnections,
    },
    recentActivity: {
      logs: recentLogs.map(l => ({
        id: l.id, action: l.action, entity: l.entity,
        user: l.user?.username || null,
        createdAt: l.createdAt.toISOString(),
      })),
      recentPlugins,
      recentAgents,
    },
  });
}
