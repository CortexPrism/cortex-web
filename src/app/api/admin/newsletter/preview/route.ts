import { NextRequest } from "next/server";
import { z } from "zod";
import { getAuthUser, requireAdmin } from "@/lib/auth-middleware";
import { renderNewsletterCampaignEmail } from "@/lib/email";

const PreviewSchema = z.object({
  subject: z.string().min(1).max(200),
  content: z.string().min(1).max(100_000),
});

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!requireAdmin(user)) {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { subject, content } = PreviewSchema.parse(body);

    const rendered = renderNewsletterCampaignEmail(
      subject,
      content,
      "preview-token-placeholder"
    );

    return Response.json({ html: rendered.html });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => `${e.path.join(".")}: ${e.message}`);
      return Response.json({ error: `Validation failed: ${messages.join("; ")}` }, { status: 400 });
    }
    return Response.json({ error: "Failed to render preview" }, { status: 500 });
  }
}
