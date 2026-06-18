// Load .env from project root (works for npx tsx directly, npm run dev uses --import preload)
try { require("dotenv").config({ path: require("path").resolve(process.cwd() + "/../.env") }); } catch {}

// Force absolute database path so the bot shares the same database as the web app
try { process.env.DATABASE_URL = "file:" + require("path").resolve(process.cwd() + "/../prisma/marketplace.db"); } catch {}

import { Client, Events, GatewayIntentBits, REST, Routes } from "discord.js";
import { PrismaClient } from "@prisma/client";
import { handleStats } from "./commands/stats";
import { handlePlugin } from "./commands/plugin";
import { handleAgent } from "./commands/agent";
import { handleReview } from "./commands/review";
import { handleWarn } from "./commands/warn";
import { handleMute, handleUnmute } from "./commands/mute";
import { handleKick } from "./commands/kick";
import { handleBan, handleUnban } from "./commands/ban";
import { handlePurge } from "./commands/purge";
import { handleModlogs } from "./commands/modlogs";
import { handleGuildInfo, handleGuildSettings } from "./commands/guild";
import { handleUserInfo } from "./commands/userinfo";
import { handleSlowmode } from "./commands/slowmode";
import { handleRoleCreate, handleRoleDelete, handleRoleEdit, handleRoleAssign, handleRoleList, handleRoleInfo, handleRoleMassAssign } from "./commands/role";
import { handleChannelCreate, handleChannelDelete, handleChannelEdit, handleChannelInfo, handleChannelList } from "./commands/channel";
import { handleReactionRoleCreate, handleReactionRoleDelete, handleReactionRoleList, handleReactionRolePanel } from "./commands/reactionrole";
import { handleAnnounce, handleSay, handleEmbed } from "./commands/announce";
import { handleLockdown, handleUnlock } from "./commands/lockdown";
import { handlePollCreate, handlePollEnd } from "./commands/poll";
import { handleTicketCreate, handleTicketClose, handleTicketClaim, handleTicketAdd, handleTicketRemove } from "./commands/ticket";
import { handleNickname } from "./commands/nickname";
import { checkAutoMod } from "./lib/auto-mod";
import { isModerator } from "./lib/moderation";
import { handleWelcome, handleLeave } from "./lib/events";
import { commandDefinitions } from "./commands/command-definitions";

export const prisma = new PrismaClient();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [],
});

const BOT_START_TIME = Date.now();

async function trackCommand(name: string) {
  try {
    const row = await prisma.setting.findUnique({ where: { key: "discord_bot_command_counts" } });
    const counts: Record<string, number> = row?.value ? JSON.parse(row.value) : {};
    counts[name] = (counts[name] || 0) + 1;
    await prisma.setting.upsert({
      where: { key: "discord_bot_command_counts" },
      update: { value: JSON.stringify(counts) },
      create: { key: "discord_bot_command_counts", value: JSON.stringify(counts) },
    });
  } catch {}
}

async function trackStartTime() {
  try {
    await prisma.setting.upsert({
      where: { key: "discord_bot_started_at" },
      update: { value: String(BOT_START_TIME) },
      create: { key: "discord_bot_started_at", value: String(BOT_START_TIME) },
    });
  } catch {}
}

client.once(Events.ClientReady, async (c) => {
  console.log(`Bot logged in as ${c.user.tag}`);
  await trackStartTime();
  await updateHeartbeat();
});

async function updateHeartbeat() {
  try {
    await prisma.setting.upsert({
      where: { key: "discord_bot_heartbeat" },
      update: { value: String(Date.now()) },
      create: { key: "discord_bot_heartbeat", value: String(Date.now()) },
    });
  } catch {}
  setTimeout(updateHeartbeat, 30000);
}

// Welcome / Leave events
client.on(Events.GuildMemberAdd, async (member) => {
  try { await handleWelcome(member); } catch {}
});

client.on(Events.GuildMemberRemove, async (member) => {
  try { await handleLeave(member); } catch {}
});

// Auto-mod message check
client.on(Events.MessageCreate, async (message) => {
  try { await checkAutoMod(message); } catch {}
});

// Reaction role handling
client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (user.bot) return;
  try {
    if (reaction.partial) await reaction.fetch();
    const guildId = reaction.message.guildId;
    if (!guildId) return;

    const emojiStr = reaction.emoji.id ? `<:${reaction.emoji.name}:${reaction.emoji.id}>` : reaction.emoji.name;
    if (!emojiStr) return;

    const poll = await prisma.poll.findFirst({
      where: { guildId, messageId: reaction.message.id, isActive: true },
    });
    if (poll && !poll.allowMultiple) {
      const userReactions = reaction.message.reactions.cache.filter(r => r.users.cache.has(user.id));
      if (userReactions.size > 1) {
        try { await reaction.users.remove(user.id); } catch {}
        return;
      }
    }

    const rr = await prisma.reactionRole.findFirst({
      where: { guildId, channelId: reaction.message.channel.id, emoji: emojiStr, messageId: reaction.message.id },
    });
    if (!rr) return;

    const guild = client.guilds.cache.get(guildId);
    if (!guild) return;

    const member = await guild.members.fetch(user.id).catch(() => null);
    if (!member) return;

    const role = guild.roles.cache.get(rr.roleId);
    if (!role) return;

    try {
      if (rr.type === "toggle") {
        if (member.roles.cache.has(role.id)) {
          await member.roles.remove(role, "Reaction role");
        } else {
          await member.roles.add(role, "Reaction role");
        }
      } else if (rr.type === "single") {
        if (!member.roles.cache.has(role.id)) {
          await member.roles.add(role, "Reaction role");
        }
      }
    } catch {}
  } catch (err) {
    console.error("Reaction role add error:", err);
  }
});

client.on(Events.MessageReactionRemove, async (reaction, user) => {
  if (user.bot) return;
  try {
    if (reaction.partial) await reaction.fetch();
    const emojiStr = reaction.emoji.id ? `<:${reaction.emoji.name}:${reaction.emoji.id}>` : reaction.emoji.name;
    if (!emojiStr) return;

    const guildId = reaction.message.guildId;
    if (!guildId) return;

    const rr = await prisma.reactionRole.findFirst({
      where: { guildId, channelId: reaction.message.channel.id, emoji: emojiStr, messageId: reaction.message.id },
    });
    if (!rr || rr.type !== "toggle") return;

    const guild = client.guilds.cache.get(guildId);
    if (!guild) return;

    const member = await guild.members.fetch(user.id).catch(() => null);
    if (!member) return;

    const role = guild.roles.cache.get(rr.roleId);
    if (!role) return;

    try {
      if (member.roles.cache.has(role.id)) {
        await member.roles.remove(role, "Reaction role removed");
      }
    } catch {}
  } catch (err) {
    console.error("Reaction role remove error:", err);
  }
});

// Ticket button interaction handler
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId.startsWith("ticket_close_")) {
    const ticketId = interaction.customId.replace("ticket_close_", "");

    if (!interaction.guild) {
      await interaction.reply({ content: "Server only.", ephemeral: true });
      return;
    }
    const { authorized } = await isModerator(interaction as never, interaction.guild);
    if (!authorized) {
      await interaction.reply({ content: "Only moderators can close tickets.", ephemeral: true });
      return;
    }

    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      await interaction.reply({ content: "Ticket not found.", ephemeral: true });
      return;
    }
    await interaction.deferReply({ ephemeral: true });
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: "closed", closedAt: new Date(), closedBy: interaction.user.id },
    });
    await interaction.editReply({ content: "Ticket closed. Channel will be deleted shortly." });
    const channel = interaction.channel;
    if (channel) {
      setTimeout(async () => {
        try { await channel.delete("Ticket closed"); } catch {}
      }, 5000);
    }
    return;
  }

  if (interaction.customId.startsWith("ticket_claim_")) {
    const ticketId = interaction.customId.replace("ticket_claim_", "");

    if (!interaction.guild) {
      await interaction.reply({ content: "Server only.", ephemeral: true });
      return;
    }
    const { authorized } = await isModerator(interaction as never, interaction.guild);
    if (!authorized) {
      await interaction.reply({ content: "Only moderators can claim tickets.", ephemeral: true });
      return;
    }

    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      await interaction.reply({ content: "Ticket not found.", ephemeral: true });
      return;
    }
    if (ticket.claimedBy) {
      await interaction.reply({ content: `Already claimed by <@${ticket.claimedBy}>.`, ephemeral: true });
      return;
    }
    await interaction.deferReply({ ephemeral: true });
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: "claimed", claimedBy: interaction.user.id, claimedByTag: interaction.user.tag },
    });
    await interaction.editReply({ content: "Ticket claimed!" });
    return;
  }
});

// Slash command router
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    const cmdHandlers: Record<string, (i: typeof interaction) => Promise<void>> = {
      stats: handleStats,
      warn: handleWarn,
      mute: handleMute,
      unmute: handleUnmute,
      kick: handleKick,
      ban: handleBan,
      unban: handleUnban,
      purge: handlePurge,
      modlogs: handleModlogs,
      slowmode: handleSlowmode,
      user: handleUserInfo,
      nickname: handleNickname,
      lockdown: handleLockdown,
      unlock: handleUnlock,
      announce: handleAnnounce,
      say: handleSay,
      embed: handleEmbed,
    };

    const subCmdHandlers: Record<string, Record<string, (i: typeof interaction) => Promise<void>>> = {
      plugin: { search: handlePlugin, info: handlePlugin },
      agent: { search: handleAgent, info: handleAgent },
      review: {
        list: handleReview,
        approve: handleReview,
        reject: handleReview,
      },
      guild: {
        info: handleGuildInfo,
        settings: handleGuildSettings,
      },
      role: {
        create: handleRoleCreate,
        delete: handleRoleDelete,
        edit: handleRoleEdit,
        assign: handleRoleAssign,
        list: handleRoleList,
        info: handleRoleInfo,
        mass: handleRoleMassAssign,
      },
      channel: {
        create: handleChannelCreate,
        delete: handleChannelDelete,
        edit: handleChannelEdit,
        info: handleChannelInfo,
        list: handleChannelList,
      },
      reactionrole: {
        create: handleReactionRoleCreate,
        delete: handleReactionRoleDelete,
        list: handleReactionRoleList,
        panel: handleReactionRolePanel,
      },
      poll: {
        create: handlePollCreate,
        end: handlePollEnd,
      },
      ticket: {
        create: handleTicketCreate,
        close: handleTicketClose,
        claim: handleTicketClaim,
        add: handleTicketAdd,
        remove: handleTicketRemove,
      },
    };

    const handler = cmdHandlers[interaction.commandName];
    if (handler) {
      await handler(interaction);
      trackCommand(interaction.commandName);
      return;
    }

    const subCmdMap = subCmdHandlers[interaction.commandName];
    if (subCmdMap) {
      const subCmd = interaction.options.getSubcommand();
      const subHandler = subCmdMap[subCmd];
      if (subHandler) {
        await subHandler(interaction);
        trackCommand(interaction.commandName);
        return;
      }
    }
  } catch (error) {
    console.error(`Error handling command ${interaction.commandName}:`, error);
    const reply = interaction.deferred
      ? interaction.editReply.bind(interaction)
      : interaction.reply.bind(interaction);
    await reply({
      content: "An error occurred while processing the command.",
      ephemeral: true,
    }).catch(() => {});
  }
});

async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_BOT_TOKEN!);

  try {
    if (process.env.DISCORD_GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID!, process.env.DISCORD_GUILD_ID),
        { body: commandDefinitions },
      );
      console.log("Guild commands registered successfully");
    } else {
      await rest.put(
        Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!),
        { body: commandDefinitions },
      );
      console.log("Global commands registered successfully");
    }
  } catch (error) {
    console.error("Failed to register commands:", error);
  }
}

async function main() {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    console.error("DISCORD_BOT_TOKEN environment variable is required");
    process.exit(1);
  }

  await registerCommands();
  await client.login(token);
}

main().catch(console.error);
