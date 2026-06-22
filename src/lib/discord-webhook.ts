export function sendSubmissionWebhook(type: "plugin" | "agent", name: string, author: string, status: string, id: string) {
  const webhookUrl = process.env.DISCORD_SUBMISSION_WEBHOOK_URL;
  if (!webhookUrl) return;

  const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "";
  const isPlugin = type === "plugin";
  const color = isPlugin ? 0x9B59B6 : 0x3498DB;
  const emoji = isPlugin ? "🟣" : "🤖";

  fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [{
        title: `New ${isPlugin ? "Plugin" : "Agent"} Submission`,
        color,
        fields: [
          { name: "Type", value: `${emoji} ${isPlugin ? "Plugin" : "Agent"}`, inline: true },
          { name: "Name", value: name, inline: true },
          { name: "Author", value: author, inline: true },
          { name: "Status", value: status, inline: true },
          { name: "Review", value: `${siteUrl}/admin/reviews?type=${type}&id=${id}`, inline: false },
        ],
        timestamp: new Date().toISOString(),
      }],
    }),
  }).catch(() => {});
}
