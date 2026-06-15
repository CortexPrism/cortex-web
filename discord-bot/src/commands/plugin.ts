import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { prisma } from "../index";

export async function handlePlugin(interaction: ChatInputCommandInteraction) {
  const action = interaction.options.get("action")?.value as string;
  const query = interaction.options.get("query")?.value as string;

  if (!query) {
    await interaction.reply({ content: "Please provide a search query.", ephemeral: true });
    return;
  }

  await interaction.deferReply();

  if (action === "search") {
    const plugins = await prisma.plugin.findMany({
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

    if (plugins.length === 0) {
      await interaction.editReply({ content: `No plugins found matching "${query}".` });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`Plugin Search: "${query}"`)
      .setDescription(`Found ${plugins.length} plugin(s)`)
      .addFields(
        plugins.map((p: { id: string; name: string; description: string; downloads: number; rating: number }) => ({
          name: p.name,
          value: `\`${p.id}\` — ${p.description.slice(0, 100)}${p.description.length > 100 ? "..." : ""}\n⬇ ${p.downloads} | ⭐ ${p.rating}`,
          inline: false,
        })),
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } else if (action === "info") {
    const plugin = await prisma.plugin.findFirst({
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

    if (!plugin) {
      await interaction.editReply({ content: `Plugin "${query}" not found.` });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(plugin.name)
      .setDescription(plugin.description)
      .addFields(
        { name: "ID", value: `\`${plugin.id}\``, inline: true },
        { name: "Version", value: plugin.version, inline: true },
        { name: "Kind", value: plugin.kind, inline: true },
        { name: "Author", value: plugin.user?.username || plugin.author || "Unknown", inline: true },
        { name: "Downloads", value: `${plugin.downloads}`, inline: true },
        { name: "Rating", value: `${plugin.rating}`, inline: true },
        { name: "License", value: plugin.license || "N/A", inline: true },
        { name: "Category", value: plugin.categoryId || "Uncategorized", inline: true },
        { name: "Status", value: plugin.status, inline: true },
      )
      .setTimestamp();

    if (plugin.icon) embed.setThumbnail(plugin.icon);
    if (plugin.homepage) embed.setURL(plugin.homepage);

    await interaction.editReply({ embeds: [embed] });
  }
}
