import { ChatInputCommandInteraction, EmbedBuilder, TextChannel } from "discord.js";
import { isModerator } from "../lib/moderation";
import { prisma } from "../index";

export async function handleReactionRoleCreate(interaction: ChatInputCommandInteraction) {
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
  const role = interaction.options.getRole("role", true);
  const emoji = interaction.options.get("emoji")?.value as string;
  const label = interaction.options.get("label")?.value as string | undefined;
  const messageId = interaction.options.get("message_id")?.value as string | undefined;

  if (!emoji) {
    await interaction.reply({ content: "Emoji is required.", ephemeral: true });
    return;
  }

  await interaction.deferReply();

  try {
    const rr = await prisma.reactionRole.create({
      data: {
        guildId: interaction.guildId!,
        channelId: channel.id,
        messageId: messageId || null,
        roleId: role.id,
        emoji,
        label: label || null,
      },
    });

    const description = messageId
      ? `Reaction role created for message \`${messageId}\` in ${channel}.`
      : `Reaction role created for channel ${channel}. Use \`/reactionrole panel\` to send the panel.`;

    await interaction.editReply({
      embeds: [new EmbedBuilder().setColor(0x10B981).setTitle("Reaction Role Created")
        .addFields(
          { name: "Channel", value: channel.toString(), inline: true },
          { name: "Role", value: role.toString(), inline: true },
          { name: "Emoji", value: emoji, inline: true },
          { name: "ID", value: rr.id, inline: true },
        )
        .setDescription(description)]
    });
  } catch (e) {
    await interaction.editReply({ content: `Failed: ${(e as Error).message}` });
  }
}

export async function handleReactionRoleDelete(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: "Server only.", ephemeral: true });
    return;
  }
  const { authorized } = await isModerator(interaction, interaction.guild);
  if (!authorized) {
    await interaction.reply({ content: "No permission.", ephemeral: true });
    return;
  }

  const id = interaction.options.get("id")?.value as string;
  if (!id) {
    await interaction.reply({ content: "Reaction role ID required.", ephemeral: true });
    return;
  }

  await interaction.deferReply();

  try {
    const rr = await prisma.reactionRole.findFirst({ where: { id, guildId: interaction.guildId! } });
    if (!rr) {
      await interaction.editReply({ content: "Reaction role not found." });
      return;
    }
    await prisma.reactionRole.delete({ where: { id: rr.id } });
    await interaction.editReply({
      embeds: [new EmbedBuilder().setColor(0xEF4444).setDescription(`🗑️ Deleted reaction role \`${rr.id}\` (${rr.emoji} → <@&${rr.roleId}>)`)]
    });
  } catch (e) {
    await interaction.editReply({ content: `Failed: ${(e as Error).message}` });
  }
}

export async function handleReactionRoleList(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: "Server only.", ephemeral: true });
    return;
  }
  await interaction.deferReply();

  const roles = await prisma.reactionRole.findMany({
    where: { guildId: interaction.guildId! },
    orderBy: { createdAt: "desc" },
  });

  if (roles.length === 0) {
    await interaction.editReply({ content: "No reaction roles configured for this server." });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle(`Reaction Roles — ${interaction.guild.name}`)
    .setTimestamp();

  const lines = roles.map(rr =>
    `\`${rr.id}\` ${rr.emoji} → <@&${rr.roleId}> | <#${rr.channelId}>${rr.messageId ? ` | Msg: \`${rr.messageId}\`` : ""}`
  );
  for (let i = 0; i < lines.length; i++) {
    embed.addFields({ name: `#${i + 1}`, value: lines[i] });
  }

  await interaction.editReply({ embeds: [embed] });
}

export async function handleReactionRolePanel(interaction: ChatInputCommandInteraction) {
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
  await interaction.deferReply({ ephemeral: true });

  const roles = await prisma.reactionRole.findMany({
    where: { guildId: interaction.guildId!, channelId: channel.id, messageId: null },
  });

  if (roles.length === 0) {
    await interaction.editReply({ content: "No reaction roles configured for this channel. Create them first with `/reactionrole create`." });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle("Reaction Roles")
    .setDescription("React with the corresponding emoji to get or remove a role.")
    .setFooter({ text: interaction.guild.name })
    .setTimestamp();

  for (const rr of roles) {
    embed.addFields({ name: `${rr.emoji} — <@&${rr.roleId}>`, value: rr.label || "No description" });
  }

  try {
    const msg = await channel.send({ embeds: [embed] });

    for (const rr of roles) {
      try {
        await msg.react(rr.emoji);
      } catch {}
      await prisma.reactionRole.update({ where: { id: rr.id }, data: { messageId: msg.id } });
    }

    await interaction.editReply({ content: `✅ Reaction role panel sent in ${channel}` });
  } catch (e) {
    await interaction.editReply({ content: `Failed: ${(e as Error).message}` });
  }
}
