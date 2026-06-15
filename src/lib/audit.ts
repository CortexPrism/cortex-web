import { prisma } from "@/lib/prisma";

export async function createAuditLog(params: {
  userId?: string;
  action: string;
  entity?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        action: params.action,
        entity: params.entity || null,
        entityId: params.entityId || null,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
        ip: params.ip || null,
      },
    });
  } catch {
    // silently fail - audit should never break the main flow
  }
}
