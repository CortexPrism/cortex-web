import { ChatInputCommandInteraction, EmbedBuilder, TextChannel } from "discord.js";
import { isModerator, parseDuration } from "../lib/moderation";

export async function handleSlowmode(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
    return;
  }

  const { authorized } = await isModerator(interaction, interaction.guild);
  if (!authorized) {
    await interaction.reply({ content: "You do not have permission to use this command.", ephemeral: true });
    return;
  }

  const duration = interaction.options.get("duration")?.value as string | undefined;
  const channel = (interaction.options.getChannel("channel") || interaction.channel) as TextChannel;

  if (!channel || !channel.isTextBased()) {
    await interaction.reply({ content: "Invalid channel.", ephemeral: true });
    return;
  }

  let seconds = 0;
  if (duration) {
    const ms = parseDuration(duration);
    if (ms === null || ms < 0) {
      await interaction.reply({ content: "Invalid duration format. Use e.g. `30s`, `5m`, `2h`, or `0` to disable.", ephemeral: true });
      return;
    }
    seconds = Math.floor(ms / 1000);
  }

  if (seconds > 21600) {
    await interaction.reply({ content: "Slowmode cannot exceed 6 hours (21600 seconds).", ephemeral: true });
    return;
  }

  await interaction.deferReply();

  try {
    await channel.setRateLimitPerUser(seconds, `Slowmode set by ${interaction.user.tag}`);
  } catch {
    await interaction.editReply({ content: "Failed to set slowmode. Check bot permissions." });
    return;
  }

  const formatted = seconds === 0 ? "off" :
    seconds >= 3600 ? `${seconds / 3600}h` :
    seconds >= 60 ? `${seconds / 60}m` :
    `${seconds}s`;

  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setColor(seconds > 0 ? 0xF59E0B : 0x10B981)
        .setDescription(seconds > 0
          ? `🐢 Slowmode set to **${formatted}** in ${channel}`
          : `🐇 Slowmode turned **off** in ${channel}`)
        .setFooter({ text: `Set by ${interaction.user.tag}` }),
    ],
  });
}
