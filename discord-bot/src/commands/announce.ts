import { ChatInputCommandInteraction, EmbedBuilder, TextChannel } from "discord.js";
import { isModerator } from "../lib/moderation";

export async function handleAnnounce(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: "Server only.", ephemeral: true });
    return;
  }
  const { authorized } = await isModerator(interaction, interaction.guild);
  if (!authorized) {
    await interaction.reply({ content: "No permission.", ephemeral: true });
    return;
  }

  const channel = interaction.options.getChannel("channel", true) as TextChannel;
  const message = interaction.options.get("message")?.value as string;
  const title = interaction.options.get("title")?.value as string | undefined;
  const colorStr = interaction.options.get("color")?.value as string | undefined;
  const ping = interaction.options.get("ping")?.value as string | undefined;
  const imageUrl = interaction.options.get("image")?.value as string | undefined;
  const footer = interaction.options.get("footer")?.value as string | undefined;

  if (!message && !title) {
    await interaction.reply({ content: "Provide at least a message or title.", ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const embed = new EmbedBuilder()
      .setColor(colorStr ? parseInt(colorStr.replace("#", ""), 16) || 0x5865F2 : 0x5865F2)
      .setTimestamp();

    if (title) embed.setTitle(title);
    if (message) embed.setDescription(message);
    if (imageUrl) embed.setImage(imageUrl);
    if (footer) embed.setFooter({ text: footer });
    embed.setAuthor({ name: `Announcement from ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

    const content = ping === "everyone" ? "@everyone" : ping === "here" ? "@here" : undefined;
    await channel.send({ content: content || undefined, embeds: [embed] });

    await interaction.editReply({ content: `✅ Announcement sent in ${channel}` });
  } catch (e) {
    await interaction.editReply({ content: `Failed: ${(e as Error).message}` });
  }
}

export async function handleSay(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: "Server only.", ephemeral: true });
    return;
  }
  const { authorized } = await isModerator(interaction, interaction.guild);
  if (!authorized) {
    await interaction.reply({ content: "No permission.", ephemeral: true });
    return;
  }

  const channel = interaction.options.getChannel("channel") as TextChannel | null;
  const message = interaction.options.get("message")?.value as string;

  if (!message) {
    await interaction.reply({ content: "Message required.", ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const targetChannel = channel || (interaction.channel as TextChannel);
    await targetChannel.send(message);
    await interaction.editReply({ content: `✅ Message sent in ${targetChannel}` });
  } catch (e) {
    await interaction.editReply({ content: `Failed: ${(e as Error).message}` });
  }
}

export async function handleEmbed(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: "Server only.", ephemeral: true });
    return;
  }
  const { authorized } = await isModerator(interaction, interaction.guild);
  if (!authorized) {
    await interaction.reply({ content: "No permission.", ephemeral: true });
    return;
  }

  const channel = interaction.options.getChannel("channel", true) as TextChannel;
  const title = interaction.options.get("title")?.value as string | undefined;
  const description = interaction.options.get("description")?.value as string | undefined;
  const colorStr = interaction.options.get("color")?.value as string | undefined;
  const footer = interaction.options.get("footer")?.value as string | undefined;
  const imageUrl = interaction.options.get("image")?.value as string | undefined;
  const thumbnailUrl = interaction.options.get("thumbnail")?.value as string | undefined;
  const authorName = interaction.options.get("author")?.value as string | undefined;
  const authorIcon = interaction.options.get("author_icon")?.value as string | undefined;

  if (!title && !description) {
    await interaction.reply({ content: "Provide at least a title or description.", ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const embed = new EmbedBuilder()
      .setColor(colorStr ? parseInt(colorStr.replace("#", ""), 16) || 0x5865F2 : 0x5865F2)
      .setTimestamp();

    if (title) embed.setTitle(title);
    if (description) embed.setDescription(description);
    if (imageUrl) embed.setImage(imageUrl);
    if (thumbnailUrl) embed.setThumbnail(thumbnailUrl);
    if (footer) embed.setFooter({ text: footer });
    if (authorName) embed.setAuthor({ name: authorName, iconURL: authorIcon || undefined });

    await channel.send({ embeds: [embed] });
    await interaction.editReply({ content: `✅ Embed sent in ${channel}` });
  } catch (e) {
    await interaction.editReply({ content: `Failed: ${(e as Error).message}` });
  }
}
