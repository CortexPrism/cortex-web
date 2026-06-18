import { ChatInputCommandInteraction, EmbedBuilder, TextChannel, ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, GuildMember } from "discord.js";
import { isModerator } from "../lib/moderation";
import { prisma } from "../index";

const TICKET_PRIORITIES: Record<string, { label: string; emoji: string }> = {
  low: { label: "Low", emoji: "🟢" },
  normal: { label: "Normal", emoji: "🟡" },
  high: { label: "High", emoji: "🟠" },
  urgent: { label: "Urgent", emoji: "🔴" },
};

export async function handleTicketCreate(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: "Server only.", ephemeral: true });
    return;
  }

  const subject = interaction.options.get("subject")?.value as string;
  const priority = (interaction.options.get("priority")?.value as string) || "normal";

  if (!subject) {
    await interaction.reply({ content: "Subject required.", ephemeral: true });
    return;
  }

  const config = await prisma.guildConfig.findUnique({ where: { guildId: interaction.guildId! } });
  const categoryId = config?.ticketCategoryId;

  await interaction.deferReply({ ephemeral: true });

  try {
    const prio = TICKET_PRIORITIES[priority] || TICKET_PRIORITIES.normal;

    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, "-").substring(0, 20)}`,
      type: ChannelType.GuildText,
      parent: categoryId || undefined,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
        { id: interaction.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageChannels] },
      ],
    });

    const staffRoleId = config?.ticketStaffRoleId;
    if (staffRoleId) {
      await channel.permissionOverwrites.create(staffRoleId, {
        ViewChannel: true, SendMessages: true, ReadMessageHistory: true,
      });
    }

    const ticket = await prisma.ticket.create({
      data: {
        guildId: interaction.guildId!,
        channelId: channel.id,
        userId: interaction.user.id,
        userTag: interaction.user.tag,
        subject,
        priority,
      },
    });

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`Ticket: ${subject}`)
      .setDescription(
        `**Created by:** ${interaction.user}\n` +
        `**Priority:** ${prio.emoji} ${prio.label}\n` +
        `**Status:** Open\n\n` +
        `Staff will assist you shortly. Use the buttons below to manage this ticket.`
      )
      .setFooter({ text: `Ticket ID: ${ticket.id}` })
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`ticket_close_${ticket.id}`).setLabel("Close").setStyle(ButtonStyle.Danger).setEmoji("🔒"),
      new ButtonBuilder().setCustomId(`ticket_claim_${ticket.id}`).setLabel("Claim").setStyle(ButtonStyle.Primary).setEmoji("🙋"),
    );

    const msg = await channel.send({
      content: `${interaction.user} | Staff: ${staffRoleId ? `<@&${staffRoleId}>` : "No staff role configured"}`,
      embeds: [embed],
      components: [row],
    });
    await msg.pin();

    await interaction.editReply({ content: `✅ Ticket created: ${channel}` });

    const logChannelId = config?.ticketLogChannelId;
    if (logChannelId) {
      const logChannel = interaction.guild.channels.cache.get(logChannelId) as TextChannel;
      if (logChannel) {
        await logChannel.send({
          embeds: [new EmbedBuilder().setColor(0x5865F2).setTitle("New Ticket")
            .addFields(
              { name: "Ticket", value: `${channel}`, inline: true },
              { name: "User", value: interaction.user.tag, inline: true },
              { name: "Priority", value: `${prio.emoji} ${prio.label}`, inline: true },
              { name: "Subject", value: subject },
            )]
        });
      }
    }
  } catch (e) {
    await interaction.editReply({ content: `Failed to create ticket: ${(e as Error).message}` });
  }
}

export async function handleTicketClose(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: "Server only.", ephemeral: true });
    return;
  }
  const { authorized } = await isModerator(interaction, interaction.guild);
  if (!authorized) {
    await interaction.reply({ content: "No permission.", ephemeral: true });
    return;
  }

  const reason = interaction.options.get("reason")?.value as string | undefined;
  const channel = interaction.channel as TextChannel;

  await interaction.deferReply();

  try {
    const ticket = await prisma.ticket.findFirst({
      where: { channelId: channel.id, guildId: interaction.guildId! },
    });

    if (!ticket) {
      await interaction.editReply({ content: "This channel is not a ticket." });
      return;
    }

    if (ticket.status === "closed") {
      await interaction.editReply({ content: "Ticket is already closed." });
      return;
    }

    await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: "closed",
        closedAt: new Date(),
        closedBy: interaction.user.id,
        closeReason: reason || null,
      },
    });

    const closeEmbed = new EmbedBuilder()
      .setColor(0xEF4444)
      .setTitle("Ticket Closed")
      .setDescription(`This ticket has been closed by ${interaction.user}.${reason ? `\n**Reason:** ${reason}` : ""}`)
      .setTimestamp();

    await channel.send({ embeds: [closeEmbed] });

    await interaction.editReply({
      embeds: [new EmbedBuilder().setColor(0xEF4444).setDescription(`🔒 Ticket \`${ticket.id}\` closed. Channel will be deleted in 10 seconds.`)]
    });

    setTimeout(async () => {
      try { await channel.delete("Ticket closed"); } catch {}
    }, 10000);
  } catch (e) {
    await interaction.editReply({ content: `Failed: ${(e as Error).message}` });
  }
}

export async function handleTicketClaim(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: "Server only.", ephemeral: true });
    return;
  }
  const { authorized } = await isModerator(interaction, interaction.guild);
  if (!authorized) {
    await interaction.reply({ content: "No permission.", ephemeral: true });
    return;
  }

  const channel = interaction.channel as TextChannel;
  await interaction.deferReply();

  try {
    const ticket = await prisma.ticket.findFirst({
      where: { channelId: channel.id, guildId: interaction.guildId! },
    });

    if (!ticket) {
      await interaction.editReply({ content: "Not a ticket channel." });
      return;
    }

    if (ticket.claimedBy) {
      await interaction.editReply({ content: `Ticket already claimed by <@${ticket.claimedBy}>.` });
      return;
    }

    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: "claimed", claimedBy: interaction.user.id, claimedByTag: interaction.user.tag },
    });

    const embed = new EmbedBuilder()
      .setColor(0x10B981)
      .setTitle("Ticket Claimed")
      .setDescription(`This ticket has been claimed by ${interaction.user}.`)
      .setTimestamp();

    await channel.send({ embeds: [embed] });

    await interaction.editReply({ content: `✅ Ticket claimed.` });
  } catch (e) {
    await interaction.editReply({ content: `Failed: ${(e as Error).message}` });
  }
}

export async function handleTicketAdd(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: "Server only.", ephemeral: true });
    return;
  }
  const { authorized } = await isModerator(interaction, interaction.guild);
  if (!authorized) {
    await interaction.reply({ content: "No permission.", ephemeral: true });
    return;
  }

  const member = interaction.options.getMember("user");
  const channel = interaction.channel as TextChannel;

  if (!member) {
    await interaction.reply({ content: "User not found.", ephemeral: true });
    return;
  }

  await interaction.deferReply();

  try {
    const ticket = await prisma.ticket.findFirst({
      where: { channelId: channel.id, guildId: interaction.guildId! },
    });

    if (!ticket) {
      await interaction.editReply({ content: "Not a ticket channel." });
      return;
    }

    await channel.permissionOverwrites.create(member, {
      ViewChannel: true, SendMessages: true, ReadMessageHistory: true,
    });

    await interaction.editReply({ content: `✅ Added ${member} to this ticket.` });
  } catch (e) {
    await interaction.editReply({ content: `Failed: ${(e as Error).message}` });
  }
}

export async function handleTicketRemove(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: "Server only.", ephemeral: true });
    return;
  }
  const { authorized } = await isModerator(interaction, interaction.guild);
  if (!authorized) {
    await interaction.reply({ content: "No permission.", ephemeral: true });
    return;
  }

  const member = interaction.options.getMember("user");
  const channel = interaction.channel as TextChannel;

  if (!member) {
    await interaction.reply({ content: "User not found.", ephemeral: true });
    return;
  }

  await interaction.deferReply();

  try {
    const ticket = await prisma.ticket.findFirst({
      where: { channelId: channel.id, guildId: interaction.guildId! },
    });

    if (!ticket) {
      await interaction.editReply({ content: "Not a ticket channel." });
      return;
    }

    if (member.id === ticket.userId) {
      await interaction.editReply({ content: "Cannot remove the ticket creator." });
      return;
    }

    await channel.permissionOverwrites.delete(member);

    await interaction.editReply({ content: `✅ Removed ${member} from this ticket.` });
  } catch (e) {
    await interaction.editReply({ content: `Failed: ${(e as Error).message}` });
  }
}
