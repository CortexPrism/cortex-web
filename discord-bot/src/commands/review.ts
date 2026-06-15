import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { prisma } from "../index";

const ADMIN_IDS = (process.env.DISCORD_ADMIN_IDS || "").split(",").filter(Boolean);

async function getWebsiteUser(discordId: string) {
  return prisma.user.findUnique({
    where: { discordId },
    select: { id: true, role: true, username: true },
  });
}

export async function handleReview(interaction: ChatInputCommandInteraction) {
  const websiteUser = await getWebsiteUser(interaction.user.id);
  const isAdminUser = ADMIN_IDS.includes(interaction.user.id) || websiteUser?.role === "admin";

  if (!isAdminUser) {
    await interaction.reply({ content: "You do not have permission to use this command.", ephemeral: true });
    return;
  }

  const action = interaction.options.get("action")?.value as string;

  await interaction.deferReply({ ephemeral: true });

  if (action === "list") {
    const [pendingPlugins, pendingAgents] = await Promise.all([
      prisma.plugin.findMany({
        where: { status: "pending" },
        include: { user: { select: { username: true, discordUsername: true } } },
        orderBy: { createdAt: "desc" },
        take: 25,
      }),
      prisma.agentConfig.findMany({
        where: { status: "pending" },
        include: { user: { select: { username: true, discordUsername: true } } },
        orderBy: { createdAt: "desc" },
        take: 25,
      }),
    ]);

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle("Pending Submissions")
      .setDescription(`Plugins: ${pendingPlugins.length} | Agents: ${pendingAgents.length}`)
      .setTimestamp();

    if (pendingPlugins.length > 0) {
      embed.addFields({
        name: "🟣 Plugins",
        value: pendingPlugins.map((p: { id: string; name: string; user: { username: string | null; discordUsername: string | null } | null }) =>
          `\`${p.id}\` **${p.name}** by ${p.user?.username || "Unknown"}${p.user?.discordUsername ? ` (${p.user.discordUsername})` : ""}`,
        ).join("\n") || "None",
      });
    }

    if (pendingAgents.length > 0) {
      embed.addFields({
        name: "🤖 Agents",
        value: pendingAgents.map((a: { id: string; name: string; user: { username: string | null; discordUsername: string | null } | null }) =>
          `\`${a.id}\` **${a.name}** by ${a.user?.username || "Unknown"}${a.user?.discordUsername ? ` (${a.user.discordUsername})` : ""}`,
        ).join("\n") || "None",
      });
    }

    if (pendingPlugins.length === 0 && pendingAgents.length === 0) {
      embed.setDescription("No pending submissions.");
    }

    await interaction.editReply({ embeds: [embed] });
    return;
  }

  if (action === "approve" || action === "reject") {
    const id = interaction.options.get("id")?.value as string;
    if (!id) {
      await interaction.editReply({ content: "Please provide a submission ID." });
      return;
    }

    const plugin = await prisma.plugin.findUnique({ where: { id } });
    const agent = plugin ? null : await prisma.agentConfig.findUnique({ where: { id } });

    const submission = plugin || agent;
    if (!submission) {
      await interaction.editReply({ content: `Submission with ID "${id}" not found.` });
      return;
    }

    if (submission.status !== "pending") {
      await interaction.editReply({ content: `Submission "${id}" has already been ${submission.status}.` });
      return;
    }

    const reviewerId = websiteUser?.id || interaction.user.id;

    if (action === "approve") {
      const model = plugin ? prisma.plugin : prisma.agentConfig;
      const type = plugin ? "plugin" : "agent";
      await model.update({
        where: { id },
        data: { status: "approved" },
      });

      await prisma.submissionReview.create({
        data: {
          pluginId: plugin ? id : null,
          agentId: agent ? id : null,
          reviewerId,
          action: "approved",
        },
      });

      await interaction.editReply({ content: `✅ ${type === "plugin" ? "Plugin" : "Agent"} \`${submission.name}\` has been approved.` });
    } else {
      const reason = interaction.options.get("reason")?.value as string;
      if (!reason) {
        await interaction.editReply({ content: "Please provide a reason for rejection." });
        return;
      }

      const model = plugin ? prisma.plugin : prisma.agentConfig;
      const type = plugin ? "plugin" : "agent";
      await model.update({
        where: { id },
        data: { status: "rejected" },
      });

      await prisma.submissionReview.create({
        data: {
          pluginId: plugin ? id : null,
          agentId: agent ? id : null,
          reviewerId,
          action: "rejected",
          notes: reason,
        },
      });

      await interaction.editReply({ content: `❌ ${type === "plugin" ? "Plugin" : "Agent"} \`${submission.name}\` has been rejected.\nReason: ${reason}` });
    }
  }
}
