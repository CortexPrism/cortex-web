import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth-middleware";
import { getKbArticleComments, createKbArticleComment } from "@/lib/knowledge-base";

const commentSchema = z.object({
  content: z.string().min(1, "Comment is required").max(5000, "Comment is too long"),
});

export async function GET(
  _request: NextRequest,
  { params: pp }: { params: Promise<{ slug: string }> }
) {
  const params = await pp;
  try {
    const comments = await getKbArticleComments(params.slug);
    return NextResponse.json(comments);
  } catch {
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params: pp }: { params: Promise<{ slug: string }> }
) {
  const params = await pp;
  const user = getAuthUser(request);
  const body = await request.json();
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const comment = await createKbArticleComment({
      slug: params.slug,
      userId: user?.userId,
      content: parsed.data.content,
    });
    return NextResponse.json(comment, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === "Article not found") {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
