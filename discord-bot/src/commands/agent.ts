import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { prisma } from "../index";

export async function handleAgent(interaction: ChatInputCommandInteraction) {
  const action = interaction.options.get("action")?.value as string;
  const query = interaction.options.get("query")?.value as string;

  if (!query) {
    await interaction.reply({ content: "Please provide a search query.", ephemeral: true });
    return;
  }

  await interaction.deferReply();

  if (action === "search") {
    const agents = await prisma.agentConfig.findMany({
      where: {
        status: "approved",
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
        ],
      },
      take: 10,
      orderBy: { downloads: "desc" },
    });

    if (agents.length === 0) {
      await interaction.editReply({ content: `No agents found matching "${query}".` });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`Agent Search: "${query}"`)
      .setDescription(`Found ${agents.length} agent(s)`)
      .addFields(
        agents.map((a: { id: string; name: string; description: string; provider: string | null; downloads: number; rating: number }) => ({
          name: a.name,
          value: `\`${a.id}\` — ${a.description.slice(0, 100)}${a.description.length > 100 ? "..." : ""}\nProvider: ${a.provider || "N/A"} | ⬇ ${a.downloads} | ⭐ ${a.rating}`,
          inline: false,
        })),
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } else if (action === "info") {
    const agent = await prisma.agentConfig.findFirst({
      where: {
        status: "approved",
        OR: [
          { name: { equals: query } },
          { id: { equals: query } },
          { slug: { equals: query } },
        ],
      },
      include: { user: { select: { username: true } } },
    });

    if (!agent) {
      await interaction.editReply({ content: `Agent "${query}" not found.` });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(agent.name)
      .setDescription(agent.description)
      .addFields(
        { name: "ID", value: `\`${agent.id}\``, inline: true },
        { name: "Version", value: agent.version, inline: true },
        { name: "Provider", value: agent.provider || "N/A", inline: true },
        { name: "Model", value: agent.model || "N/A", inline: true },
        { name: "Author", value: agent.user?.username || agent.author || "Unknown", inline: true },
        { name: "Downloads", value: `${agent.downloads}`, inline: true },
        { name: "Rating", value: `${agent.rating}`, inline: true },
        { name: "License", value: agent.license || "N/A", inline: true },
        { name: "Category", value: agent.categoryId || "Uncategorized", inline: true },
        { name: "Status", value: agent.status, inline: true },
      )
      .setTimestamp();

    if (agent.icon) embed.setThumbnail(agent.icon);
    if (agent.homepage) embed.setURL(agent.homepage);

    await interaction.editReply({ embeds: [embed] });
  }
}
