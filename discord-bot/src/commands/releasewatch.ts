import { ChatInputCommandInteraction, EmbedBuilder, TextChannel } from "discord.js";
import { prisma } from "../index";
import { isModerator } from "../lib/moderation";
import { checkSingleRepo } from "../lib/github-release-monitor";

function parseRepo(input: string): { owner: string; repo: string } | null {
  const cleaned = input.trim().replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "");
  const parts = cleaned.split("/");
  if (parts.length === 2 && parts[0] && parts[1]) {
    return { owner: parts[0], repo: parts[1] };
  }
  return null;
}

export async function handleReleaseWatchAdd(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
    return;
  }

  const { authorized } = await isModerator(interaction, interaction.guild);
  if (!authorized) {
    await interaction.reply({ content: "Only moderators can manage release watches.", ephemeral: true });
    return;
  }

  const repoInput = interaction.options.getString("repo", true);
  const channel = interaction.options.getChannel("channel", true);
  const type = interaction.options.getString("type", false) || "release";

  const parsed = parseRepo(repoInput);
  if (!parsed) {
    await interaction.reply({ content: "Invalid repository. Use format: `owner/repo` or a GitHub URL.", ephemeral: true });
    return;
  }

  const existing = await prisma.releaseWatch.findUnique({
    where: { owner_repo_guildId: { owner: parsed.owner, repo: parsed.repo, guildId: interaction.guild.id } },
  });

  if (existing) {
    await interaction.reply({
      content: `**${parsed.owner}/${parsed.repo}** is already being watched. Use \`/releasewatch remove\` to stop.`,
      ephemeral: true,
    });
    return;
  }

  await prisma.releaseWatch.create({
    data: {
      owner: parsed.owner,
      repo: parsed.repo,
      watchType: type,
      channelId: channel.id,
      guildId: interaction.guild.id,
      createdBy: interaction.user.id,
    },
  });

  const typeLabel = type === "both" ? "releases & tags" : type === "tag" ? "tags" : "releases";
  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle("Release Watch Added")
        .setDescription(`Now watching **${parsed.owner}/${parsed.repo}** for ${typeLabel}\nStar and fork changes are also monitored automatically.`)
        .addFields({ name: "Channel", value: `<#${channel.id}>`, inline: true })
        .setFooter({ text: `Added by ${interaction.user.tag}` })
        .setTimestamp(),
    ],
  });
}

export async function handleReleaseWatchRemove(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
    return;
  }

  const { authorized } = await isModerator(interaction, interaction.guild);
  if (!authorized) {
    await interaction.reply({ content: "Only moderators can manage release watches.", ephemeral: true });
    return;
  }

  const repoInput = interaction.options.getString("repo", true);
  const parsed = parseRepo(repoInput);
  if (!parsed) {
    await interaction.reply({ content: "Invalid repository. Use format: `owner/repo`.", ephemeral: true });
    return;
  }

  const existing = await prisma.releaseWatch.findUnique({
    where: { owner_repo_guildId: { owner: parsed.owner, repo: parsed.repo, guildId: interaction.guild.id } },
  });

  if (!existing) {
    await interaction.reply({ content: `**${parsed.owner}/${parsed.repo}** is not being watched.`, ephemeral: true });
    return;
  }

  await prisma.releaseWatch.delete({ where: { id: existing.id } });

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle("Release Watch Removed")
        .setDescription(`Stopped watching **${parsed.owner}/${parsed.repo}**`)
        .setFooter({ text: `Removed by ${interaction.user.tag}` })
        .setTimestamp(),
    ],
  });
}

export async function handleReleaseWatchList(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
    return;
  }

  const watches = await prisma.releaseWatch.findMany({
    where: { guildId: interaction.guild.id },
    orderBy: { createdAt: "desc" },
  });

  if (watches.length === 0) {
    await interaction.reply({ content: "No repositories are being watched. Use `/releasewatch add` to start watching.", ephemeral: true });
    return;
  }

  const lines = watches.map((w) => {
    const typeLabel = w.watchType === "both" ? "releases & tags" : w.watchType === "tag" ? "tags" : "releases";
    const last = w.lastReleaseTag ? ` (last: \`${w.lastReleaseTag}\`)` : "";
    const starsStr = w.lastStarCount !== null ? `⭐${w.lastStarCount.toLocaleString()}` : "";
    const forksStr = w.lastForkCount !== null ? ` 🔱${w.lastForkCount.toLocaleString()}` : "";
    const status = w.isActive ? "🟢" : "🔴";
    return `${status} **${w.owner}/${w.repo}** — ${typeLabel} → <#${w.channelId}>${last}${starsStr}${forksStr}`;
  });

  const embed = new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle("Release Watches")
    .setDescription(lines.join("\n") || "None")
    .setFooter({ text: `${watches.length} repo${watches.length !== 1 ? "s" : ""} watched` });

  await interaction.reply({ embeds: [embed] });
}

export async function handleReleaseWatchCheck(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
    return;
  }

  const { authorized } = await isModerator(interaction, interaction.guild);
  if (!authorized) {
    await interaction.reply({ content: "Only moderators can force check releases.", ephemeral: true });
    return;
  }

  const repoInput = interaction.options.getString("repo", false);

  await interaction.deferReply({ ephemeral: true });

  if (repoInput) {
    const parsed = parseRepo(repoInput);
    if (!parsed) {
      await interaction.editReply({ content: "Invalid repository format. Use `owner/repo`." });
      return;
    }

    const watch = await prisma.releaseWatch.findUnique({
      where: { owner_repo_guildId: { owner: parsed.owner, repo: parsed.repo, guildId: interaction.guild.id } },
    });

    if (!watch) {
      await interaction.editReply({ content: `**${parsed.owner}/${parsed.repo}** is not being watched.` });
      return;
    }

    const client = interaction.client;
    const channel = await client.channels.fetch(watch.channelId).catch(() => null);
    const found = await checkSingleRepo(watch, channel as TextChannel | null);

    if (found > 0) {
      await interaction.editReply({ content: `Check complete. Found and posted **${found}** new item(s) for **${parsed.owner}/${parsed.repo}**.` });
    } else {
      await interaction.editReply({ content: `Check complete. No new releases, tags, stars, or forks found for **${parsed.owner}/${parsed.repo}**.` });
    }
  } else {
    await interaction.editReply({ content: "Checking all watched repos... This may take a moment." });

    const { checkAllRepos } = await import("../lib/github-release-monitor");
    const results = await checkAllRepos(interaction.client);

    const lines = results.map((r) =>
      r.found > 0
        ? `✅ **${r.owner}/${r.repo}** — ${r.found} new`
        : `⏭️ **${r.owner}/${r.repo}** — no new`
    );

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x3498db)
          .setTitle("Release Check Results")
          .setDescription(lines.join("\n") || "Nothing to check.")
          .setTimestamp(),
      ],
    });
  }
}

export async function handleReleaseWatchToggle(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
    return;
  }

  const { authorized } = await isModerator(interaction, interaction.guild);
  if (!authorized) {
    await interaction.reply({ content: "Only moderators can manage release watches.", ephemeral: true });
    return;
  }

  const repoInput = interaction.options.getString("repo", true);
  const parsed = parseRepo(repoInput);
  if (!parsed) {
    await interaction.reply({ content: "Invalid repository. Use format: `owner/repo`.", ephemeral: true });
    return;
  }

  const existing = await prisma.releaseWatch.findUnique({
    where: { owner_repo_guildId: { owner: parsed.owner, repo: parsed.repo, guildId: interaction.guild.id } },
  });

  if (!existing) {
    await interaction.reply({ content: `**${parsed.owner}/${parsed.repo}** is not being watched.`, ephemeral: true });
    return;
  }

  const updated = await prisma.releaseWatch.update({
    where: { id: existing.id },
    data: { isActive: !existing.isActive },
  });

  await interaction.reply({
    content: `**${parsed.owner}/${parsed.repo}** is now ${updated.isActive ? "🟢 active" : "🔴 paused"}.`,
  });
}
