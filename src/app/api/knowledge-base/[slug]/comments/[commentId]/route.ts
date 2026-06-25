import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";
import { deleteKbArticleComment } from "@/lib/knowledge-base";

export async function DELETE(
  request: NextRequest,
  { params: pp }: { params: Promise<{ slug: string; commentId: string }> }
) {
  const params = await pp;
  const user = getAuthUser(request);
  if (!requireAdmin(user) && user?.userId) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    await deleteKbArticleComment(params.commentId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
