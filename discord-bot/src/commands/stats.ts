import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { prisma } from "../index";

export async function handleStats(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const [pluginCount, agentCount, approvedPlugins, approvedAgents] = await Promise.all([
    prisma.plugin.count(),
    prisma.agentConfig.count(),
    prisma.plugin.count({ where: { status: "approved" } }),
    prisma.agentConfig.count({ where: { status: "approved" } }),
  ]);

  const pendingPlugins = await prisma.plugin.count({ where: { status: "pending" } });
  const pendingAgents = await prisma.agentConfig.count({ where: { status: "pending" } });

  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle("Marketplace Statistics")
    .setDescription("Current marketplace overview")
    .addFields(
      { name: "🟣 Plugins", value: `Total: ${pluginCount}\nApproved: ${approvedPlugins}\nPending: ${pendingPlugins}`, inline: true },
      { name: "🤖 Agents", value: `Total: ${agentCount}\nApproved: ${approvedAgents}\nPending: ${pendingAgents}`, inline: true },
    )
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}
