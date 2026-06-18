import { Message, EmbedBuilder, GuildMember } from "discord.js";
import { prisma } from "../index";
import { logModerationAction, sendLogEmbed, formatDuration } from "./moderation";

let configCache: { guildId: string; config: Record<string, unknown>; timestamp: number } | null = null;
let rulesCache: { guildId: string; rules: Record<string, unknown>[]; timestamp: number } | null = null;
let channelCache: { channelId: string; config: Record<string, unknown> | null; timestamp: number }[] = [];
const CACHE_TTL = 30000;

export async function checkAutoMod(message: Message): Promise<boolean> {
  if (!message.guild || !message.member || message.author.bot) return false;

  try {
    const now = Date.now();
    if (!configCache || configCache.guildId !== message.guild.id || now - configCache.timestamp > CACHE_TTL) {
      const config = await prisma.guildConfig.findUnique({ where: { guildId: message.guild.id } });
      configCache = { guildId: message.guild.id, config: config as unknown as Record<string, unknown>, timestamp: now };
    }
    if (!configCache?.config?.autoModEnabled) return false;

    if (!rulesCache || rulesCache.guildId !== message.guild.id || now - rulesCache.timestamp > CACHE_TTL) {
      const rules = await prisma.autoModRule.findMany({
        where: { guildId: message.guild.id, enabled: true },
      });
      rulesCache = { guildId: message.guild.id, rules: rules as unknown as Record<string, unknown>[], timestamp: now };
    }
    const rules = (rulesCache?.rules || []) as unknown as { type: string; config: string | null; name: string; action: string; duration: number | null }[];

    const cc = channelCache.find(c => c.channelId === message.channel.id && now - c.timestamp < CACHE_TTL);
    let channelCfg: Record<string, unknown> | null = cc?.config ?? undefined;
    if (!cc || now - (cc.timestamp || 0) > CACHE_TTL) {
      const dbCfg = await prisma.channelConfig.findUnique({ where: { channelId: message.channel.id } });
      channelCfg = dbCfg as unknown as Record<string, unknown> | null;
      channelCache = channelCache.filter(c => c.channelId !== message.channel.id || now - c.timestamp >= CACHE_TTL);
    }
    if (channelCfg?.autoModExempt) return false;

    const member = message.member as GuildMember;
    const cfg = configCache.config as Record<string, unknown>;
    const modRoleId = cfg.modRoleId as string | null | undefined;
    const adminRoleId = cfg.adminRoleId as string | null | undefined;
    if ((adminRoleId && member.roles.cache.has(adminRoleId)) ||
        (modRoleId && member.roles.cache.has(modRoleId)) ||
        member.permissions.has("ModerateMembers")) {
      return false;
    }

    for (const rule of rules) {
      let triggered = false;
      let reason = "";

      switch (rule.type) {
        case "invite_filter":
          if (/discord(?:\.gg|app\.com\/invite|\.com\/invite)\/[a-zA-Z0-9-]+/i.test(message.content)) {
            triggered = true;
            reason = `Invite link detected`;
          }
          break;

        case "link_filter": {
          const excludedChannels = rule.config ? JSON.parse(rule.config).excludedChannels || [] : [];
          if (!excludedChannels.includes(message.channel.id) &&
              /https?:\/\/[^\s]+/i.test(message.content) &&
              !message.content.includes("discord.com") &&
              !message.content.includes("discord.gg")) {
            triggered = true;
            reason = `Link detected`;
          }
          break;
        }

        case "spam_filter": {
          const threshold = rule.config ? JSON.parse(rule.config).threshold || 5 : 5;
          const timeWindow = rule.config ? JSON.parse(rule.config).timeWindow || 5000 : 5000;
          const messages = message.channel.messages.cache.filter(
            m => m.author.id === message.author.id &&
                 m.createdTimestamp > Date.now() - timeWindow
          );
          if (messages.size >= threshold) {
            triggered = true;
            reason = `Spam detected (${messages.size} messages in ${timeWindow / 1000}s)`;
          }
          break;
        }

        case "mention_limit": {
          const limit = rule.config ? JSON.parse(rule.config).limit || 10 : 10;
          const mentionCount = (message.mentions.users?.size || 0) + (message.mentions.roles?.size || 0);
          if (mentionCount > limit) {
            triggered = true;
            reason = `Mass mention detected (${mentionCount} mentions, limit: ${limit})`;
          }
          break;
        }

        case "caps_filter": {
          const threshold = rule.config ? JSON.parse(rule.config).threshold || 70 : 70;
          const minLength = rule.config ? JSON.parse(rule.config).minLength || 10 : 10;
          const text = message.content.replace(/[^a-zA-Z]/g, "");
          if (text.length >= minLength) {
            const capsPercent = (text.match(/[A-Z]/g)?.length || 0) / text.length * 100;
            if (capsPercent > threshold) {
              triggered = true;
              reason = `Excessive caps (${Math.round(capsPercent)}%)`;
            }
          }
          break;
        }

        case "keyword_filter": {
          const keywords: string[] = rule.config ? JSON.parse(rule.config).keywords || [] : [];
          for (const kw of keywords) {
            if (message.content.toLowerCase().includes(kw.toLowerCase())) {
              triggered = true;
              reason = `Banned keyword detected: "${kw}"`;
              break;
            }
          }
          break;
        }
      }

      if (triggered) {
        await executeAutoModAction(message, rule, reason);
        return true;
      }
    }
  } catch (error) {
    console.error("Auto-mod check error:", error);
  }

  return false;
}

async function executeAutoModAction(message: Message, rule: { action: string; duration: number | null; name: string }, reason: string) {
  try {
    if (rule.action === "delete") {
      await message.delete().catch(() => {});
    }

    const actionMap: Record<string, string> = {
      warn: "warn",
      mute: "mute",
      kick: "kick",
      ban: "ban",
      delete: "delete",
    };
    const actionType = actionMap[rule.action] || "warn";

    const durationMs = rule.action === "mute" && rule.duration ? rule.duration * 60000 : null;
    const expiresAt = durationMs ? new Date(Date.now() + durationMs) : null;

    await logModerationAction({
      guildId: message.guildId!,
      actionType,
      moderatorId: message.client.user.id,
      moderatorTag: message.client.user.tag,
      targetId: message.author.id,
      targetTag: message.author.tag,
      reason: `[Auto-Mod: ${rule.name}] ${reason}`,
      duration: durationMs ? String(durationMs) : null,
      expiresAt,
    });

    if (rule.action === "mute" && message.member && durationMs) {
      await (message.member as GuildMember).timeout(durationMs, `Auto-mod: ${rule.name}`).catch(() => {});
    }

    if (rule.action === "kick" && message.member) {
      await (message.member as GuildMember).kick(`Auto-mod: ${rule.name}`).catch(() => {});
    }

    if (rule.action === "ban" && message.member) {
      await (message.member as GuildMember).ban({ reason: `Auto-mod: ${rule.name}` }).catch(() => {});
    }

    if (message.guild) {
      const embed = new EmbedBuilder()
        .setColor(0xFBBF24)
        .setTitle("Auto-Mod Action")
        .addFields(
          { name: "Rule", value: rule.name, inline: true },
          { name: "User", value: `${message.author.tag} (\`${message.author.id}\`)`, inline: true },
          { name: "Action", value: rule.action.toUpperCase(), inline: true },
          { name: "Reason", value: reason },
          { name: "Channel", value: `${message.channel}`, inline: true },
        )
        .setTimestamp();

      if (message.content && !message.deleted) {
        embed.addFields({ name: "Message", value: message.content.substring(0, 1024) });
      }

      await sendLogEmbed(message.guild, embed);
    }

    try {
      const dmEmbed = new EmbedBuilder()
        .setColor(0xFBBF24)
        .setTitle(`Auto-Mod Action in ${message.guild?.name}`)
        .setDescription(`You triggered the auto-mod rule **${rule.name}**.`)
        .addFields(
          { name: "Action", value: rule.action.toUpperCase(), inline: true },
          { name: "Reason", value: reason },
        );
      await message.author.send({ embeds: [dmEmbed] }).catch(() => {});
    } catch {}
  } catch (error) {
    console.error("Failed to execute auto-mod action:", error);
  }
}
