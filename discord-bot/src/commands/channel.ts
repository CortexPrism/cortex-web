import { ChatInputCommandInteraction, EmbedBuilder, ChannelType, PermissionFlagsBits, GuildChannel } from "discord.js";
import { isModerator, logModerationAction } from "../lib/moderation";

export async function handleChannelCreate(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: "Server only.", ephemeral: true });
    return;
  }
  const { authorized } = await isModerator(interaction, interaction.guild);
  if (!authorized) {
    await interaction.reply({ content: "No permission.", ephemeral: true });
    return;
  }

  const name = interaction.options.get("name")?.value as string;
  const typeStr = (interaction.options.get("type")?.value as string) || "text";
  const category = interaction.options.getChannel("category");

  if (!name) {
    await interaction.reply({ content: "Channel name required.", ephemeral: true });
    return;
  }

  await interaction.deferReply();

  try {
    const typeMap: Record<string, ChannelType> = {
      text: ChannelType.GuildText,
      voice: ChannelType.GuildVoice,
      announcement: ChannelType.GuildAnnouncement,
      forum: ChannelType.GuildForum,
      stage: ChannelType.GuildStageVoice,
    };
    const type = typeMap[typeStr] || ChannelType.GuildText;

    const channel = await interaction.guild.channels.create({
      name: name.toLowerCase().replace(/\s+/g, "-"),
      type,
      parent: category?.id || undefined,
      reason: `Created by ${interaction.user.tag}`,
    });

    await logModerationAction({
      guildId: interaction.guildId!,
      actionType: "channel_create",
      moderatorId: interaction.user.id,
      moderatorTag: interaction.user.tag,
      targetId: channel.id,
      targetTag: `#${(channel as GuildChannel).name}`,
      metadata: { type: typeStr, categoryId: category?.id },
    });

    await interaction.editReply({
      embeds: [new EmbedBuilder().setColor(0x10B981).setDescription(`✅ Created ${typeStr} channel ${channel}`)]
    });
  } catch (e) {
    await interaction.editReply({ content: `Failed: ${(e as Error).message}` });
  }
}

export async function handleChannelDelete(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: "Server only.", ephemeral: true });
    return;
  }
  const { authorized } = await isModerator(interaction, interaction.guild);
  if (!authorized) {
    await interaction.reply({ content: "No permission.", ephemeral: true });
    return;
  }

  const channel = interaction.options.getChannel("channel", true);
  await interaction.deferReply();

  try {
    const chName = (channel as GuildChannel).name;
    await channel.delete(`Deleted by ${interaction.user.tag}`);

    await logModerationAction({
      guildId: interaction.guildId!,
      actionType: "channel_delete",
      moderatorId: interaction.user.id,
      moderatorTag: interaction.user.tag,
      targetId: channel.id,
      targetTag: `#${chName}`,
    });

    await interaction.editReply({
      embeds: [new EmbedBuilder().setColor(0xEF4444).setDescription(`🗑️ Deleted channel **#${chName}**`)]
    });
  } catch (e) {
    await interaction.editReply({ content: `Failed: ${(e as Error).message}` });
  }
}

export async function handleChannelEdit(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: "Server only.", ephemeral: true });
    return;
  }
  const { authorized } = await isModerator(interaction, interaction.guild);
  if (!authorized) {
    await interaction.reply({ content: "No permission.", ephemeral: true });
    return;
  }

  const channel = interaction.options.getChannel("channel", true);
  const newName = interaction.options.get("name")?.value as string | undefined;
  const topic = interaction.options.get("topic")?.value as string | undefined;
  const nsfw = interaction.options.get("nsfw")?.value as boolean | undefined;
  const slowmode = interaction.options.get("slowmode")?.value as number | undefined;
  const category = interaction.options.getChannel("category");

  if (!newName && !topic && nsfw === undefined && slowmode === undefined && !category) {
    await interaction.reply({ content: "Provide at least one property to edit.", ephemeral: true });
    return;
  }

  await interaction.deferReply();

  try {
    const options: Record<string, unknown> = {};
    if (newName) options.name = newName.toLowerCase().replace(/\s+/g, "-");
    if (topic !== undefined) options.topic = topic || null;
    if (nsfw !== undefined) options.nsfw = nsfw;
    if (slowmode !== undefined) options.rateLimitPerUser = slowmode;
    if (category) options.parent = category.id;

    await (channel as GuildChannel).edit(options);

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle("Channel Updated")
      .setDescription(`Updated ${channel}`)
      .setTimestamp();

    if (newName) embed.addFields({ name: "Name", value: `#${newName}`, inline: true });
    if (topic !== undefined) embed.addFields({ name: "Topic", value: topic || "Cleared", inline: true });
    if (nsfw !== undefined) embed.addFields({ name: "NSFW", value: nsfw ? "Yes" : "No", inline: true });
    if (slowmode !== undefined) embed.addFields({ name: "Slowmode", value: `${slowmode}s`, inline: true });

    await interaction.editReply({ embeds: [embed] });
  } catch (e) {
    await interaction.editReply({ content: `Failed: ${(e as Error).message}` });
  }
}

export async function handleChannelInfo(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: "Server only.", ephemeral: true });
    return;
  }

  const channel = interaction.options.getChannel("channel", true);
  const guildChannel = channel as GuildChannel;
  await interaction.deferReply();

  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle(`#${guildChannel.name}`)
    .addFields(
      { name: "ID", value: channel.id, inline: true },
      { name: "Type", value: String(channel.type), inline: true },
      { name: "Created", value: guildChannel.createdAt?.toDateString() || "Unknown", inline: true },
      { name: "Position", value: String(guildChannel.position), inline: true },
    )
    .setTimestamp();

  if ("topic" in channel && channel.topic) embed.addFields({ name: "Topic", value: channel.topic.substring(0, 1024) });
  if ("nsfw" in channel) embed.addFields({ name: "NSFW", value: (channel as { nsfw: boolean }).nsfw ? "Yes" : "No", inline: true });
  if ("rateLimitPerUser" in channel) embed.addFields({ name: "Slowmode", value: `${(channel as { rateLimitPerUser: number }).rateLimitPerUser || 0}s`, inline: true });
  if (guildChannel.parent) embed.addFields({ name: "Category", value: guildChannel.parent.name, inline: true });

  await interaction.editReply({ embeds: [embed] });
}

export async function handleChannelList(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: "Server only.", ephemeral: true });
    return;
  }
  await interaction.deferReply();

  const textChannels = interaction.guild.channels.cache.filter(c => c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement);
  const voiceChannels = interaction.guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice);
  const categories = interaction.guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory);
  const forums = interaction.guild.channels.cache.filter(c => c.type === ChannelType.GuildForum);
  const stages = interaction.guild.channels.cache.filter(c => c.type === ChannelType.GuildStageVoice);

  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle(`Channels — ${interaction.guild.name}`)
    .setDescription(`Total: **${interaction.guild.channels.cache.size}** channels`)
    .setTimestamp();

  if (categories.size > 0) {
    const list = categories.map(c => `📁 ${c.name} (\`${c.id}\`)`).join("\n");
    embed.addFields({ name: `Categories (${categories.size})`, value: list.substring(0, 1024) });
  }
  if (textChannels.size > 0) {
    const list = textChannels.map(c => `💬 ${c} (\`${c.id}\`)`).join("\n");
    embed.addFields({ name: `Text (${textChannels.size})`, value: list.substring(0, 1024) });
  }
  if (voiceChannels.size > 0) {
    const list = voiceChannels.map(c => `🔊 ${c.name} (\`${c.id}\`)`).join("\n");
    embed.addFields({ name: `Voice (${voiceChannels.size})`, value: list.substring(0, 1024) });
  }
  if (forums.size > 0) {
    const list = forums.map(c => `📋 ${c.name} (\`${c.id}\`)`).join("\n");
    embed.addFields({ name: `Forums (${forums.size})`, value: list.substring(0, 1024) });
  }
  if (stages.size > 0) {
    const list = stages.map(c => `🎤 ${c.name} (\`${c.id}\`)`).join("\n");
    embed.addFields({ name: `Stages (${stages.size})`, value: list.substring(0, 1024) });
  }

  await interaction.editReply({ embeds: [embed] });
}
