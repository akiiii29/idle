import "dotenv/config";

import { Client, Events, GatewayIntentBits } from "discord.js";

import { commands } from "./commands";
import { handleHuntAutocomplete, handleButtonInteraction } from "./commands/hunt";
import { handleSkillButton } from "./commands/skills";
import { handleQuestClaim } from "./commands/quest";
import { handleShopButton } from "./commands/shop";
import { syncApplicationCommands } from "./services/command-sync";
import { prisma } from "./services/prisma";
import { syncQuests } from "./services/quest-service";
import { handleUseAutocomplete } from "./commands/use";
import { handleSkillShopButton } from "./commands/skill-shop";
import { handleBeastButton } from "./commands/beasts";
import { handleAchievementClaim, handleAchievementNav, handleAchievementSelect } from "./commands/achievements";
import { syncAchievements } from "./services/achievement-service";
import { handleUserAutocomplete } from "./services/user-service";
import { handleEquipAutocomplete } from "./commands/equip";
import { handleUnequipAutocomplete } from "./commands/unequip";
import { handleDungeonButton, handleDungeonAutocomplete } from "./commands/dungeon";
import { handleInvenButton } from "./commands/inven";
import { handleHelpRpgSelect } from "./commands/help-rpg";

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
    await syncQuests();
    console.log("Quests synced.");
    await syncAchievements();
    console.log("Achievements synced.");
  } catch (error) {
    console.error("command sync failed", error);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isButton()) {
    try {
      const dungeonHandled = await handleDungeonButton(interaction);
      if (!dungeonHandled) {
        const skillHandled = await handleSkillButton(interaction);
        if (!skillHandled) {
          const huntHandled = await handleButtonInteraction(interaction);
          if (!huntHandled) {
            const shopHandled = await handleShopButton(interaction);
            if (!shopHandled) {
              const skillShopHandled = await handleSkillShopButton(interaction);
              if (!skillShopHandled) {
                const beastHandled = await handleBeastButton(interaction);
                if (!beastHandled) {
                  const questHandled = await handleQuestClaim(interaction);
                  if (!questHandled) {
                    const achievementHandled = await handleAchievementClaim(interaction);
                    if (!achievementHandled) {
                        const achNavHandled = await handleAchievementNav(interaction);
                        if (!achNavHandled) {
                            await handleInvenButton(interaction);
                        }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Button interaction error:", error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: "Đã có lỗi xảy ra khi xử lý nút bấm.", ephemeral: true });
      } else {
        await interaction.followUp({ content: "Đã có lỗi xảy ra khi xử lý nút bấm.", ephemeral: true });
      }
    }
    return;
  }

  if (interaction.isStringSelectMenu()) {
    try {
      const helpRpgHandled = await handleHelpRpgSelect(interaction);
      if (!helpRpgHandled) {
        await handleAchievementSelect(interaction);
      }
    } catch (error) {
      console.error("Select menu interaction error:", error);
    }
    return;
  }

  if (interaction.isAutocomplete()) {
    const command = commands.find((entry) => entry.data.name === interaction.commandName);
    if (command && command.autocomplete) {
      await command.autocomplete(interaction);
      return;
    }

    // Fallback for legacy handlers if not integrated into command objects
    if (interaction.commandName === "use") {
      await handleUseAutocomplete(interaction);
    } else if (interaction.commandName === "dungeon") {
      await handleDungeonAutocomplete(interaction);
    } else if (interaction.commandName === "hunt") {
      await handleHuntAutocomplete(interaction);
    } else if (interaction.commandName === "equip") {
      await handleEquipAutocomplete(interaction);
    } else if (interaction.commandName === "unequip") {
      await handleUnequipAutocomplete(interaction);
    } else if (interaction.commandName === "profile" || interaction.commandName === "stats") {
      await handleUserAutocomplete(interaction);
    }
    return;
  }

  if (!interaction.isChatInputCommand()) {
    return;
  }

  const command = commands.find((entry) => entry.data.name === interaction.commandName);
  if (!command) {
    await interaction.reply({
      content: "Không rõ lệnh.",
      ephemeral: true
    });
    return;
  }

  // Update lastActiveAt to prevent AFK income abuse during active play
  await prisma.user.update({
    where: { id: interaction.user.id },
    data: { lastActiveAt: new Date() } as any
  }).catch(() => {}); // Ignore if user not registered yet

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
