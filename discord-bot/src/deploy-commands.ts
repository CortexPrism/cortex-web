import { REST, Routes } from "discord.js";
import { commandDefinitions } from "./commands/command-definitions";

async function main() {
  const token = process.env.DISCORD_BOT_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!token || !clientId) {
    console.error("DISCORD_BOT_TOKEN and DISCORD_CLIENT_ID environment variables are required");
    process.exit(1);
  }

  const rest = new REST({ version: "10" }).setToken(token);

  try {
    if (guildId) {
      await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commandDefinitions },
      );
      console.log(`Guild commands registered for guild ${guildId}`);
    } else {
      await rest.put(
        Routes.applicationCommands(clientId),
        { body: commandDefinitions },
      );
      console.log("Global commands registered");
    }
  } catch (error) {
    console.error("Failed to register commands:", error);
    process.exit(1);
  }
}

main();
