import { GuildMember, EmbedBuilder, TextChannel } from "discord.js";
import { prisma } from "../index";

export async function handleWelcome(member: GuildMember) {
  try {
    const config = await prisma.guildConfig.findUnique({ where: { guildId: member.guild.id } });
    if (!config?.welcomeEnabled || !config.welcomeChannelId) return;

    const channel = member.guild.channels.cache.get(config.welcomeChannelId) as TextChannel;
    if (!channel) return;

    const message = (config.welcomeMessage || "Welcome {user} to {server}! 🎉")
      .replace(/{user}/g, member.toString())
      .replace(/{user_tag}/g, member.user.tag)
      .replace(/{user_name}/g, member.user.username)
      .replace(/{server}/g, member.guild.name)
      .replace(/{member_count}/g, String(member.guild.memberCount));

    const embed = new EmbedBuilder()
      .setColor(0x10B981)
      .setTitle(`Welcome to ${member.guild.name}!`)
      .setDescription(message)
      .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: "Account Created", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: "Member #", value: String(member.guild.memberCount), inline: true },
      )
      .setFooter({ text: `ID: ${member.id}` })
      .setTimestamp();

    await channel.send({ content: member.toString(), embeds: [embed] }).catch(() => {});
  } catch (error) {
    console.error("Welcome handler error:", error);
  }
}

export async function handleLeave(member: GuildMember) {
  try {
    const config = await prisma.guildConfig.findUnique({ where: { guildId: member.guild.id } });
    if (!config?.leaveEnabled || !config.leaveChannelId) return;

    const channel = member.guild.channels.cache.get(config.leaveChannelId) as TextChannel;
    if (!channel) return;

    const message = (config.leaveMessage || "{user_tag} has left the server. 😢")
      .replace(/{user}/g, member.toString())
      .replace(/{user_tag}/g, member.user.tag)
      .replace(/{user_name}/g, member.user.username)
      .replace(/{server}/g, member.guild.name)
      .replace(/{member_count}/g, String(member.guild.memberCount));

    const roles = member.roles.cache
      .filter(r => r.id !== member.guild.id)
      .sort((a, b) => b.position - a.position)
      .map(r => r.toString())
      .join(" ") || "None";

    const embed = new EmbedBuilder()
      .setColor(0xEF4444)
      .setTitle("Member Left")
      .setDescription(message)
      .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: "Joined", value: member.joinedAt ? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:R>` : "Unknown", inline: true },
        { name: "Roles", value: roles.length > 1024 ? `${member.roles.cache.size - 1} roles` : roles },
      )
      .setFooter({ text: `ID: ${member.id}` })
      .setTimestamp();

    await channel.send({ embeds: [embed] }).catch(() => {});
  } catch (error) {
    console.error("Leave handler error:", error);
  }
}
