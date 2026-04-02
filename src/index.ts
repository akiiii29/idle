import "dotenv/config";

import { Client, Events, GatewayIntentBits } from "discord.js";

import { commands } from "./commands";
import { handleCaptureButton } from "./commands/hunt";
import { syncApplicationCommands } from "./services/command-sync";
import { prisma } from "./services/prisma";

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !clientId) {
  throw new Error("Missing DISCORD_TOKEN or DISCORD_CLIENT_ID in environment.");
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);

  try {
    await syncApplicationCommands(token, clientId, guildId, commands);
    console.log(`Slash commands synced${guildId ? ` to guild ${guildId}` : " globally"}.`);
  } catch (error) {
    console.error("command sync failed", error);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isButton()) {
    await handleCaptureButton(interaction);
    return;
  }

  if (!interaction.isChatInputCommand()) {
    return;
  }

  const command = commands.find((entry) => entry.data.name === interaction.commandName);
  if (!command) {
    await interaction.reply({
      content: "Unknown command.",
      ephemeral: true
    });
    return;
  }

  await command.execute(interaction);
});

async function shutdown(): Promise<void> {
  await prisma.$disconnect();
  client.destroy();
}

process.on("SIGINT", () => {
  void shutdown().finally(() => process.exit(0));
});

process.on("SIGTERM", () => {
  void shutdown().finally(() => process.exit(0));
});

void client.login(token);
