import { ChatInputCommandInteraction, EmbedBuilder, TextChannel } from "discord.js";
import { isModerator } from "../lib/moderation";
import { prisma } from "../index";

const NUMBER_EMOJIS = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

export async function handlePollCreate(interaction: ChatInputCommandInteraction) {
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
  const title = interaction.options.get("title")?.value as string;
  const description = interaction.options.get("description")?.value as string | undefined;
  const optionsStr = interaction.options.get("options")?.value as string;
  const allowMultiple = interaction.options.get("allow_multiple")?.value as boolean | undefined;
  const durationH = interaction.options.get("duration_hours")?.value as number | undefined;

  if (!title || !optionsStr) {
    await interaction.reply({ content: "Title and options required.", ephemeral: true });
    return;
  }

  const optionArray = optionsStr.split("|").map(o => o.trim()).filter(Boolean);
  if (optionArray.length < 2 || optionArray.length > 10) {
    await interaction.reply({ content: "Provide 2-10 options separated by `|`.", ephemeral: true });
    return;
  }

  await interaction.deferReply();

  try {
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(title)
      .setFooter({ text: `Poll by ${interaction.user.tag}${allowMultiple ? " • Multiple choice" : ""}` })
      .setTimestamp();

    if (description) embed.setDescription(description);

    const optionsData: { emoji: string; label: string; votes: number }[] = [];
    for (let i = 0; i < optionArray.length; i++) {
      optionsData.push({ emoji: NUMBER_EMOJIS[i], label: optionArray[i], votes: 0 });
      embed.addFields({ name: `${NUMBER_EMOJIS[i]} ${optionArray[i]}`, value: "No votes yet", inline: true });
    }

    const expiresAt = durationH ? new Date(Date.now() + durationH * 3600000) : null;
    if (expiresAt) {
      embed.addFields({ name: "Ends", value: `<t:${Math.floor(expiresAt.getTime() / 1000)}:R>`, inline: false });
    }

    const msg = await channel.send({ embeds: [embed] });

    for (let i = 0; i < optionArray.length; i++) {
      try { await msg.react(NUMBER_EMOJIS[i]); } catch {}
    }

    await prisma.poll.create({
      data: {
        guildId: interaction.guildId!,
        channelId: channel.id,
        messageId: msg.id,
        title,
        description: description || null,
        options: JSON.stringify(optionsData),
        allowMultiple: allowMultiple || false,
        createdBy: interaction.user.id,
        expiresAt,
      },
    });

    await interaction.editReply({ content: `✅ Poll created in ${channel}` });
  } catch (e) {
    await interaction.editReply({ content: `Failed: ${(e as Error).message}` });
  }
}

export async function handlePollEnd(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: "Server only.", ephemeral: true });
    return;
  }
  const { authorized } = await isModerator(interaction, interaction.guild);
  if (!authorized) {
    await interaction.reply({ content: "No permission.", ephemeral: true });
    return;
  }

  const pollId = interaction.options.get("id")?.value as string;
  if (!pollId) {
    await interaction.reply({ content: "Poll ID required. Find it with the web interface.", ephemeral: true });
    return;
  }

  await interaction.deferReply();

  try {
    const poll = await prisma.poll.findFirst({ where: { id: pollId, guildId: interaction.guildId! } });
    if (!poll) {
      await interaction.editReply({ content: "Poll not found." });
      return;
    }

    await prisma.poll.update({ where: { id: poll.id }, data: { isActive: false } });

    const channel = interaction.guild.channels.cache.get(poll.channelId) as TextChannel;
    if (channel && poll.messageId) {
      try {
        const msg = await channel.messages.fetch(poll.messageId);
        const reactions = msg.reactions.cache;
        const options: { emoji: string; label: string; votes: number }[] = JSON.parse(poll.options);

        for (const reaction of reactions.values()) {
          const opt = options.find(o => o.emoji === reaction.emoji.name);
          if (opt) opt.votes = reaction.count - 1;
        }

        await prisma.poll.update({
          where: { id: poll.id },
          data: { options: JSON.stringify(options) },
        });

        const winner = options.reduce((a, b) => a.votes > b.votes ? a : b, options[0]);
        const results = options.map(o => `${o.emoji} ${o.label}: **${o.votes}** vote(s)`).join("\n");

        const resultEmbed = new EmbedBuilder()
          .setColor(0x10B981)
          .setTitle(`Results: ${poll.title}`)
          .setDescription(results)
          .addFields({ name: "Winner", value: `${winner.emoji} **${winner.label}** with ${winner.votes} vote(s)` })
          .setTimestamp();

        await msg.reply({ embeds: [resultEmbed] });
      } catch {}
    }

    await interaction.editReply({ content: `✅ Poll \`${poll.id}\` ended.` });
  } catch (e) {
    await interaction.editReply({ content: `Failed: ${(e as Error).message}` });
  }
}
