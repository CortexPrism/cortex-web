import { NextRequest, NextResponse } from "next/server";
import { incrementKbViewCount } from "@/lib/knowledge-base";

export async function POST(
  _request: NextRequest,
  { params: pp }: { params: Promise<{ slug: string }> }
) {
  const params = await pp;
  await incrementKbViewCount(params.slug);
  return NextResponse.json({ success: true });
}
