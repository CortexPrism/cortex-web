import { NextResponse } from "next/server";
import { getKbArticleBySlug } from "@/lib/knowledge-base";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const article = await getKbArticleBySlug(params.slug);
  if (!article || !article.published) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(article);
}
