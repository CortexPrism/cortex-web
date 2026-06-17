import { NextRequest } from "next/server";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";
import { submitUrls, collectAllSiteUrls, submitUrl } from "@/lib/indexnow";

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const url = body.url as string | undefined;

    if (url) {
      const result = await submitUrl(url);
      return Response.json(result);
    }

    const allUrls = await collectAllSiteUrls();
    const result = await submitUrls(allUrls);
    return Response.json({
      ...result,
      urlCount: allUrls.length,
    });
  } catch (error) {
    return Response.json(
      { success: false, message: `Request failed: ${error}` },
      { status: 500 },
    );
  }
}
