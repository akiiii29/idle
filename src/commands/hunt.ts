import { type ButtonInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";

import { CAPTURE_TIMEOUT_MS, EVENT_RATES, HUNT_COOLDOWN_MS, RARITY_COLORS } from "../constants/config";
import { resolveCombat } from "../services/combat";
import {
  buildCaptureButton,
  consumePendingEncounter,
  createEncounterToken,
  peekPendingEncounter,
  startPendingEncounter
} from "../services/encounter-service";
import { createWildBeast } from "../services/hunt-service";
import { applyLevelUps } from "../services/leveling";
import { prisma } from "../services/prisma";
import { formatDuration, getRemainingCooldown, getUser } from "../services/user-service";
import type { SlashCommand } from "../types/command";

export const huntCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("hunt")
    .setDescription("Go hunting for monsters, loot, or new beasts."),
  async execute(interaction) {
    let shouldReleaseBusy = false;

    try {
      const now = new Date();
      const user = await getUser(interaction.user.id);

      if (!user) {
        await interaction.reply({
          content: "You are not registered yet. Use `/register` first.",
          ephemeral: true
        });
        return;
      }

      if (user.hospitalUntil && user.hospitalUntil > now) {
        await interaction.reply({
          content: `You are in the hospital for ${formatDuration(user.hospitalUntil.getTime() - now.getTime())}.`,
          ephemeral: true
        });
        return;
      }

      if (user.isBusy) {
        await interaction.reply({
          content: "You are already in an encounter!",
          ephemeral: true
        });
        return;
      }

      const cooldown = getRemainingCooldown(user.lastHunt, HUNT_COOLDOWN_MS, now);
      if (cooldown > 0) {
        await interaction.reply({
          content: `You need to rest for ${formatDuration(cooldown)} before hunting again.`,
          ephemeral: true
        });
        return;
      }

      const busyUntil = new Date(now.getTime() + CAPTURE_TIMEOUT_MS);
      const lockResult = await prisma.user.updateMany({
        where: {
          id: user.id,
          isBusy: false
        },
        data: {
          isBusy: true,
          busyUntil
        }
      });

      if (lockResult.count === 0) {
        await interaction.reply({
          content: "You are already in an encounter!",
          ephemeral: true
        });
        return;
      }

      shouldReleaseBusy = true;
      const eventRoll = Math.random() * 100;

      if (eventRoll < EVENT_RATES.combat) {
        const combat = resolveCombat(user, now);

        await prisma.user.update({
          where: { id: user.id },
          data: {
            level: combat.updatedStats.level,
            exp: combat.updatedStats.exp,
            gold: combat.updatedStats.gold,
            str: combat.updatedStats.str,
            agi: combat.updatedStats.agi,
            luck: combat.updatedStats.luck,
            hp: combat.updatedStats.hp,
            maxHp: combat.updatedStats.maxHp,
            hospitalUntil: combat.hospitalUntil,
            lastHunt: now,
            lastHpUpdatedAt: now
          }
        });

        const embed = new EmbedBuilder()
          .setColor(combat.victory ? 0x57f287 : 0xed4245)
          .setTitle(combat.victory ? "Battle Won" : "Battle Lost")
          .setDescription(
            combat.victory
              ? `You defeated the monster. Roll ${combat.playerRoll} vs ${combat.monsterDef}.`
              : `The monster overpowered you. Roll ${combat.playerRoll} vs ${combat.monsterDef}.`
          )
          .addFields(
            {
              name: "Rewards",
              value: combat.victory ? `+${combat.expGained} XP\n+${combat.goldGained} gold` : `-${combat.damageTaken} HP${combat.expLost > 0 ? `\n-${combat.expLost} XP` : ""}`,
              inline: true
            },
            {
              name: "Status",
              value: combat.victory
                ? `${combat.updatedStats.hp}/${combat.updatedStats.maxHp} HP`
                : `${combat.updatedStats.hp}/${combat.updatedStats.maxHp} HP${
                    combat.hospitalUntil ? `\nHospital: ${formatDuration(combat.hospitalUntil.getTime() - now.getTime())}` : ""
                  }`,
              inline: true
            }
          );

        if (combat.levelUp && combat.levelUp.levelsGained > 0) {
          embed.addFields({
            name: "Level Up",
            value: combat.levelUp.summaries.join("\n"),
            inline: false
          });
        }

        await interaction.reply({ embeds: [embed] });
        return;
      }

      if (eventRoll < EVENT_RATES.combat + EVENT_RATES.catch) {
        const beast = createWildBeast(user.level, user.luck);
        const token = createEncounterToken();

        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastHunt: now,
            busyUntil
          }
        });

        const embed = new EmbedBuilder()
          .setColor(RARITY_COLORS[beast.rarity])
          .setTitle("Wild Beast Found")
          .setDescription(`A **${beast.rarity} ${beast.name}** appeared.`)
          .addFields(
            { name: "Power", value: beast.power.toString(), inline: true },
            { name: "Window", value: "Capture within 30 seconds.", inline: true }
          );

        await interaction.reply({
          embeds: [embed],
          components: [buildCaptureButton(token)]
        });

        const message = await interaction.fetchReply();
        shouldReleaseBusy = false;

        startPendingEncounter(token, user.id, beast, async () => {
          try {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                isBusy: false,
                busyUntil: null
              }
            });
          } catch (error) {
            console.error("encounter timeout cleanup failed", error);
          }

          try {
            await message.edit({
              components: [buildCaptureButton(token, true, "Expired")]
            });
          } catch (error) {
            console.error("encounter timeout message edit failed", error);
          }
        });

        return;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastHunt: now
        }
      });

      const embed = new EmbedBuilder()
        .setColor(0x95a5a6)
        .setTitle("Nothing Found")
        .setDescription("The area was quiet. You found nothing this time.");

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("hunt command failed", error);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: "Hunt failed. Try again in a moment.",
          ephemeral: true
        });
      } else {
        await interaction.followUp({
          content: "Hunt failed. Try again in a moment.",
          ephemeral: true
        });
      }
    } finally {
      if (shouldReleaseBusy) {
        try {
          await prisma.user.update({
            where: { id: interaction.user.id },
            data: {
              isBusy: false,
              busyUntil: null
            }
          });
        } catch (error) {
          console.error("hunt busy cleanup failed", error);
        }
      }
    }
  }
};

export async function handleCaptureButton(interaction: ButtonInteraction): Promise<boolean> {
  if (!interaction.customId.startsWith("capture:")) {
    return false;
  }

  const token = interaction.customId.replace("capture:", "");
  const preview = peekPendingEncounter(token);

  if (!preview) {
    await interaction.reply({
      content: "This encounter has expired.",
      ephemeral: true
    });
    return true;
  }

  if (preview.userId !== interaction.user.id) {
    await interaction.reply({
      content: "This encounter belongs to someone else.",
      ephemeral: true
    });
    return true;
  }

  const encounter = consumePendingEncounter(token);
  if (!encounter) {
    await interaction.reply({
      content: "This encounter was already resolved.",
      ephemeral: true
    });
    return true;
  }

  let shouldReleaseBusy = true;

  try {
    await interaction.update({
      components: [buildCaptureButton(token, true, "Captured")]
    });

    const user = await getUser(interaction.user.id);
    if (!user) {
      await interaction.followUp({
        content: "You are not registered yet. Use `/register` first.",
        ephemeral: true
      });
      return true;
    }

    const levelUp = applyLevelUps({
      level: user.level,
      exp: user.exp + 5,
      str: user.str,
      agi: user.agi,
      luck: user.luck,
      hp: user.hp,
      maxHp: user.maxHp
    });

    await prisma.$transaction(async (tx) => {
      await tx.beast.create({
        data: {
          name: encounter.beast.name,
          rarity: encounter.beast.rarity,
          power: encounter.beast.power,
          ownerId: interaction.user.id
        }
      });

      await tx.user.update({
        where: { id: interaction.user.id },
        data: {
          level: levelUp.updated.level,
          exp: levelUp.updated.exp,
          str: levelUp.updated.str,
          agi: levelUp.updated.agi,
          luck: levelUp.updated.luck,
          hp: levelUp.updated.hp,
          maxHp: levelUp.updated.maxHp,
          isBusy: false,
          busyUntil: null,
          lastHpUpdatedAt: new Date()
        }
      });
    });

    const embed = new EmbedBuilder()
      .setColor(RARITY_COLORS[encounter.beast.rarity])
      .setTitle("Beast Captured")
      .setDescription(`You captured **${encounter.beast.name}**.`)
      .addFields(
        { name: "Rarity", value: encounter.beast.rarity, inline: true },
        { name: "Power", value: encounter.beast.power.toString(), inline: true },
        { name: "Reward", value: "+5 XP", inline: true }
      );

    if (levelUp.levelsGained > 0) {
      embed.addFields({
        name: "Level Up",
        value: levelUp.summaries.join("\n"),
        inline: false
      });
    }

    await interaction.editReply({
      embeds: [embed],
      components: [buildCaptureButton(token, true, "Captured")]
    });
    shouldReleaseBusy = false;
  } catch (error) {
    console.error("capture button failed", error);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "Capture failed. Try hunting again.",
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: "Capture failed. Try hunting again.",
        ephemeral: true
      });
    }
  } finally {
    if (shouldReleaseBusy) {
      try {
        await prisma.user.update({
          where: { id: interaction.user.id },
          data: {
            isBusy: false,
            busyUntil: null
          }
        });
      } catch (cleanupError) {
        console.error("capture cleanup failed", cleanupError);
      }
    }
  }

  return true;
}
