import { ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { isModerator, logModerationAction } from "../lib/moderation";

const ROLE_COLORS: Record<string, number> = {
  Red: 0xFF0000, Orange: 0xFFA500, Yellow: 0xFFFF00, Green: 0x00FF00,
  Blue: 0x0000FF, Purple: 0x800080, Pink: 0xFF69B4, Teal: 0x008080,
  White: 0xFFFFFF, Black: 0x000000, Grey: 0x808080, Default: 0x99AAB5,
};

export async function handleRoleCreate(interaction: ChatInputCommandInteraction) {
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
  const colorName = (interaction.options.get("color")?.value as string) || "Default";
  const hoist = interaction.options.get("hoist")?.value as boolean | undefined;
  const mentionable = interaction.options.get("mentionable")?.value as boolean | undefined;

  await interaction.deferReply();

  try {
    const color = ROLE_COLORS[colorName] || 0x99AAB5;
    const role = await interaction.guild.roles.create({
      name,
      color,
      hoist: hoist ?? false,
      mentionable: mentionable ?? false,
      reason: `Created by ${interaction.user.tag}`,
    });

    await logModerationAction({
      guildId: interaction.guildId!,
      actionType: "role_create",
      moderatorId: interaction.user.id,
      moderatorTag: interaction.user.tag,
      targetId: role.id,
      targetTag: `@${role.name}`,
      metadata: { color: colorName, hoist, mentionable },
    });

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle("Role Created")
      .addFields(
        { name: "Name", value: role.name, inline: true },
        { name: "Color", value: colorName, inline: true },
        { name: "Hoisted", value: hoist ? "Yes" : "No", inline: true },
        { name: "Mentionable", value: mentionable ? "Yes" : "No", inline: true },
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (e) {
    await interaction.editReply({ content: `Failed to create role: ${(e as Error).message}` });
  }
}

export async function handleRoleDelete(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: "Server only.", ephemeral: true });
    return;
  }
  const { authorized } = await isModerator(interaction, interaction.guild);
  if (!authorized) {
    await interaction.reply({ content: "No permission.", ephemeral: true });
    return;
  }

  const role = interaction.options.getRole("role", true);

  if (role.id === interaction.guild.id) {
    await interaction.reply({ content: "Cannot delete the @everyone role.", ephemeral: true });
    return;
  }
  if (role.managed) {
    await interaction.reply({ content: "Cannot delete a managed role (bot/integration).", ephemeral: true });
    return;
  }

  await interaction.deferReply();

  try {
    const roleName = role.name;
    await role.delete(`Deleted by ${interaction.user.tag}`);

    await logModerationAction({
      guildId: interaction.guildId!,
      actionType: "role_delete",
      moderatorId: interaction.user.id,
      moderatorTag: interaction.user.tag,
      targetId: role.id,
      targetTag: `@${roleName}`,
    });

    await interaction.editReply({ embeds: [new EmbedBuilder().setColor(0xEF4444).setDescription(`🗑️ Role **@${roleName}** deleted.`)] });
  } catch (e) {
    await interaction.editReply({ content: `Failed to delete role: ${(e as Error).message}` });
  }
}

export async function handleRoleEdit(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: "Server only.", ephemeral: true });
    return;
  }
  const { authorized } = await isModerator(interaction, interaction.guild);
  if (!authorized) {
    await interaction.reply({ content: "No permission.", ephemeral: true });
    return;
  }

  const role = interaction.options.getRole("role", true);
  const newName = interaction.options.get("name")?.value as string | undefined;
  const colorName = interaction.options.get("color")?.value as string | undefined;
  const hoist = interaction.options.get("hoist")?.value as boolean | undefined;
  const mentionable = interaction.options.get("mentionable")?.value as boolean | undefined;

  if (!newName && !colorName && hoist === undefined && mentionable === undefined) {
    await interaction.reply({ content: "Provide at least one property to edit.", ephemeral: true });
    return;
  }

  await interaction.deferReply();

  try {
    const changes: Record<string, unknown> = {};
    if (newName) changes.name = newName;
    if (colorName && ROLE_COLORS[colorName]) changes.color = ROLE_COLORS[colorName];
    if (hoist !== undefined) changes.hoist = hoist;
    if (mentionable !== undefined) changes.mentionable = mentionable;

    await role.edit({ ...changes, reason: `Edited by ${interaction.user.tag}` } as Parameters<typeof role.edit>[0]);

    const embed = new EmbedBuilder()
      .setColor(role.color || 0x99AAB5)
      .setTitle("Role Updated")
      .setDescription(`Role **<@&${role.id}>** updated:`)
      .setTimestamp();

    if (newName) embed.addFields({ name: "Name", value: newName, inline: true });
    if (colorName) embed.addFields({ name: "Color", value: colorName, inline: true });
    if (hoist !== undefined) embed.addFields({ name: "Hoisted", value: hoist ? "Yes" : "No", inline: true });
    if (mentionable !== undefined) embed.addFields({ name: "Mentionable", value: mentionable ? "Yes" : "No", inline: true });

    await interaction.editReply({ embeds: [embed] });
  } catch (e) {
    await interaction.editReply({ content: `Failed to edit role: ${(e as Error).message}` });
  }
}

export async function handleRoleAssign(interaction: ChatInputCommandInteraction) {
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
  const role = interaction.options.getRole("role", true);

  if (!member) {
    await interaction.reply({ content: "User not found.", ephemeral: true });
    return;
  }

  await interaction.deferReply();

  try {
    if (member.roles.cache.has(role.id)) {
      await member.roles.remove(role, `Removed by ${interaction.user.tag}`);
      await logModerationAction({
        guildId: interaction.guildId!,
        actionType: "role_remove",
        moderatorId: interaction.user.id,
        moderatorTag: interaction.user.tag,
        targetId: member.id,
        targetTag: member.user.tag,
        metadata: { roleId: role.id, roleName: role.name },
      });
      await interaction.editReply({ embeds: [new EmbedBuilder().setColor(0xF59E0B).setDescription(`🔽 Removed **<@&${role.id}>** from **${member.user.tag}**`)] });
    } else {
      await member.roles.add(role, `Added by ${interaction.user.tag}`);
      await logModerationAction({
        guildId: interaction.guildId!,
        actionType: "role_assign",
        moderatorId: interaction.user.id,
        moderatorTag: interaction.user.tag,
        targetId: member.id,
        targetTag: member.user.tag,
        metadata: { roleId: role.id, roleName: role.name },
      });
      await interaction.editReply({ embeds: [new EmbedBuilder().setColor(0x10B981).setDescription(`🔼 Assigned **<@&${role.id}>** to **${member.user.tag}**`)] });
    }
  } catch (e) {
    await interaction.editReply({ content: `Failed: ${(e as Error).message}` });
  }
}

export async function handleRoleList(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: "Server only.", ephemeral: true });
    return;
  }
  await interaction.deferReply();

  const roles = interaction.guild.roles.cache
    .filter(r => r.id !== interaction.guild!.id)
    .sort((a, b) => b.position - a.position);

  const chunks: string[] = [];
  let current = "";
  for (const role of roles.values()) {
    const line = `${role} — \`${role.id}\` — ${role.members.size} members — Color: \`#${role.color.toString(16).padStart(6, "0")}\`${role.hoist ? " 📌" : ""}${role.mentionable ? " 📢" : ""}${role.managed ? " 🤖" : ""}\n`;
    if (current.length + line.length > 1024) {
      chunks.push(current);
      current = line;
    } else {
      current += line;
    }
  }
  if (current) chunks.push(current);

  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle(`Roles — ${interaction.guild.name}`)
    .setDescription(`Total: **${roles.size}** roles`)
    .setFooter({ text: `Requested by ${interaction.user.tag}` })
    .setTimestamp();

  if (chunks.length > 0) embed.addFields({ name: "List", value: chunks[0].substring(0, 1024) });
  if (chunks.length > 1) embed.addFields({ name: "Continued", value: chunks[1].substring(0, 1024) });

  await interaction.editReply({ embeds: [embed] });
}

export async function handleRoleInfo(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: "Server only.", ephemeral: true });
    return;
  }

  const role = interaction.options.getRole("role", true);
  await interaction.deferReply();

  const embed = new EmbedBuilder()
    .setColor(role.color || 0x99AAB5)
    .setTitle(`Role Info: @${role.name}`)
    .addFields(
      { name: "ID", value: role.id, inline: true },
      { name: "Name", value: role.name, inline: true },
      { name: "Color", value: `#${role.color.toString(16).padStart(6, "0")}`, inline: true },
      { name: "Position", value: String(role.position), inline: true },
      { name: "Members", value: String(role.members.size), inline: true },
      { name: "Hoisted", value: role.hoist ? "Yes" : "No", inline: true },
      { name: "Mentionable", value: role.mentionable ? "Yes" : "No", inline: true },
      { name: "Managed", value: role.managed ? "Yes (Bot/Integration)" : "No", inline: true },
      { name: "Created", value: role.createdAt.toDateString(), inline: true },
    )
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

export async function handleRoleMassAssign(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: "Server only.", ephemeral: true });
    return;
  }
  const { authorized } = await isModerator(interaction, interaction.guild);
  if (!authorized) {
    await interaction.reply({ content: "No permission.", ephemeral: true });
    return;
  }

  const role = interaction.options.getRole("role", true);
  const action = interaction.options.get("action")?.value as string;

  await interaction.deferReply();

  try {
    const members = await interaction.guild.members.fetch();
    let count = 0;
    let membersProcessed = 0;
    for (const [, member] of members) {
      if (member.user.bot) continue;
      membersProcessed++;
      try {
        if (action === "add") {
          if (!member.roles.cache.has(role.id)) {
            await member.roles.add(role);
            count++;
          }
        } else {
          if (member.roles.cache.has(role.id)) {
            await member.roles.remove(role);
            count++;
          }
        }
      } catch {}
    }

    await interaction.editReply({
      embeds: [new EmbedBuilder()
        .setColor(action === "add" ? 0x10B981 : 0xF59E0B)
        .setDescription(
          `${action === "add" ? "🔼" : "🔽"} ${action === "add" ? "Added" : "Removed"} **<@&${role.id}>** to/from **${count}** of **${membersProcessed}** non-bot members.\n\n` +
          `⚠️ This operation processes all members sequentially and may hit rate limits on large servers.`)]
    });
  } catch (e) {
    await interaction.editReply({ content: `Failed: ${(e as Error).message}` });
  }
}
