import { NextResponse } from "next/server";
import { getAllKbArticles } from "@/lib/knowledge-base";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "100");
  const search = searchParams.get("search") || undefined;

  const result = await getAllKbArticles({ publishedOnly: true, page, limit, search });
  return NextResponse.json(result);
}
