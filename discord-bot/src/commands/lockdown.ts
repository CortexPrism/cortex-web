import { ChatInputCommandInteraction, EmbedBuilder, TextChannel, ChannelType } from "discord.js";
import { isModerator, logModerationAction } from "../lib/moderation";

export async function handleLockdown(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: "Server only.", ephemeral: true });
    return;
  }
  const { authorized } = await isModerator(interaction, interaction.guild);
  if (!authorized) {
    await interaction.reply({ content: "No permission.", ephemeral: true });
    return;
  }

  const channel = (interaction.options.getChannel("channel") || interaction.channel) as TextChannel;
  const reason = interaction.options.get("reason")?.value as string | undefined;

  if (!channel.isTextBased()) {
    await interaction.reply({ content: "Channel must be text-based.", ephemeral: true });
    return;
  }

  await interaction.deferReply();

  try {
    const everyoneRole = interaction.guild.roles.everyone;
    await channel.permissionOverwrites.edit(everyoneRole, {
      SendMessages: false,
      CreatePublicThreads: false,
      CreatePrivateThreads: false,
      SendMessagesInThreads: false,
    }, { reason: reason || `Lockdown by ${interaction.user.tag}` });

    await logModerationAction({
      guildId: interaction.guildId!,
      actionType: "lockdown",
      moderatorId: interaction.user.id,
      moderatorTag: interaction.user.tag,
      targetId: channel.id,
      targetTag: `#${channel.name}`,
      reason: reason || null,
    });

    const embed = new EmbedBuilder()
      .setColor(0xEF4444)
      .setTitle("🔒 Channel Locked")
      .setDescription(`This channel has been locked by a moderator.${reason ? `\n**Reason:** ${reason}` : ""}`)
      .setFooter({ text: `Locked by ${interaction.user.tag}` })
      .setTimestamp();

    await channel.send({ embeds: [embed] });

    await interaction.editReply({
      embeds: [new EmbedBuilder().setColor(0xEF4444).setDescription(`🔒 Locked ${channel}`)]
    });
  } catch (e) {
    await interaction.editReply({ content: `Failed: ${(e as Error).message}` });
  }
}

export async function handleUnlock(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: "Server only.", ephemeral: true });
    return;
  }
  const { authorized } = await isModerator(interaction, interaction.guild);
  if (!authorized) {
    await interaction.reply({ content: "No permission.", ephemeral: true });
    return;
  }

  const channel = (interaction.options.getChannel("channel") || interaction.channel) as TextChannel;

  if (!channel.isTextBased()) {
    await interaction.reply({ content: "Channel must be text-based.", ephemeral: true });
    return;
  }

  await interaction.deferReply();

  try {
    const everyoneRole = interaction.guild.roles.everyone;
    await channel.permissionOverwrites.delete(everyoneRole, `Unlock by ${interaction.user.tag}`);

    await logModerationAction({
      guildId: interaction.guildId!,
      actionType: "unlock",
      moderatorId: interaction.user.id,
      moderatorTag: interaction.user.tag,
      targetId: channel.id,
      targetTag: `#${channel.name}`,
    });

    const embed = new EmbedBuilder()
      .setColor(0x10B981)
      .setTitle("🔓 Channel Unlocked")
      .setDescription("This channel has been unlocked. You may now send messages.")
      .setFooter({ text: `Unlocked by ${interaction.user.tag}` })
      .setTimestamp();

    await channel.send({ embeds: [embed] });

    await interaction.editReply({
      embeds: [new EmbedBuilder().setColor(0x10B981).setDescription(`🔓 Unlocked ${channel}`)]
    });
  } catch (e) {
    await interaction.editReply({ content: `Failed: ${(e as Error).message}` });
  }
}
