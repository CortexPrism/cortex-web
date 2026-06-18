import { ChatInputCommandInteraction, EmbedBuilder, GuildMember } from "discord.js";
import { isModerator, logModerationAction } from "../lib/moderation";

export async function handleNickname(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: "Server only.", ephemeral: true });
    return;
  }
  const { authorized } = await isModerator(interaction, interaction.guild);
  if (!authorized) {
    await interaction.reply({ content: "No permission.", ephemeral: true });
    return;
  }

  const member = interaction.options.getMember("user") as GuildMember | null;
  const name = interaction.options.get("name")?.value as string | undefined;
  const reason = interaction.options.get("reason")?.value as string | undefined;

  if (!member) {
    await interaction.reply({ content: "User not found.", ephemeral: true });
    return;
  }

  if (!member.manageable) {
    await interaction.reply({ content: "Cannot manage this user's nickname (role hierarchy).", ephemeral: true });
    return;
  }

  await interaction.deferReply();

  try {
    const oldNick = member.nickname || member.user.username;
    await member.setNickname(name || null, reason || `Nickname changed by ${interaction.user.tag}`);

    await logModerationAction({
      guildId: interaction.guildId!,
      actionType: "nickname",
      moderatorId: interaction.user.id,
      moderatorTag: interaction.user.tag,
      targetId: member.id,
      targetTag: member.user.tag,
      reason: reason || null,
      metadata: { oldNick, newNick: name || member.user.username },
    });

    const newNick = name || member.user.username;
    const label = name ? `changed to **${newNick}**` : "reset";

    await interaction.editReply({
      embeds: [new EmbedBuilder()
        .setColor(0x5865F2)
        .setDescription(`✏️ **${member.user.tag}**'s nickname ${label}${reason ? ` | Reason: ${reason}` : ""}`)]
    });
  } catch (e) {
    await interaction.editReply({ content: `Failed: ${(e as Error).message}` });
  }
}
