import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

import { DAILY_COOLDOWN_MS, DAILY_ITEMS } from "../constants/config";
import { prisma } from "../services/prisma";
import { pickRandom, randomInt, rollPercent } from "../services/rng";
import { formatDuration, getRemainingCooldown, getUser, upsertItem } from "../services/user-service";
import type { SlashCommand } from "../types/command";

export const dailyCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Claim a daily gold bundle or a random item."),
  async execute(interaction) {
    try {
      const user = await getUser(interaction.user.id);

      if (!user) {
        await interaction.reply({
          content: "You are not registered yet. Use `/register` first.",
          ephemeral: true
        });
        return;
      }

      const remaining = getRemainingCooldown(user.lastDaily, DAILY_COOLDOWN_MS);
      if (remaining > 0) {
        await interaction.reply({
          content: `Your daily reward is on cooldown for ${formatDuration(remaining)}.`,
          ephemeral: true
        });
        return;
      }

      const now = new Date();
      const itemReward = rollPercent(35);

      if (itemReward) {
        const item = pickRandom(DAILY_ITEMS);

        await prisma.$transaction(async (tx) => {
          await upsertItem(tx, user.id, item);
          await tx.user.update({
            where: { id: user.id },
            data: { lastDaily: now }
          });
        });

        const embed = new EmbedBuilder()
          .setColor(0xfee75c)
          .setTitle("Daily Reward")
          .setDescription(`You received **${item.name}**.`);

        await interaction.reply({ embeds: [embed] });
        return;
      }

      const gold = randomInt(50, 150);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          gold: { increment: gold },
          lastDaily: now
        }
      });

      const embed = new EmbedBuilder()
        .setColor(0xfee75c)
        .setTitle("Daily Reward")
        .setDescription(`You claimed **${gold} gold**.`);

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("daily command failed", error);
      await interaction.reply({
        content: "Daily reward failed. Try again in a moment.",
        ephemeral: true
      });
    }
  }
};
