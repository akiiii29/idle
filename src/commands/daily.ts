import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

import { DAILY_COOLDOWN_MS, DAILY_ITEMS } from "../constants/config";
import { prisma } from "../services/prisma";
import { pickRandom, randomInt, rollPercent } from "../services/rng";
import { formatDuration, getRemainingCooldown, getUser, upsertItem } from "../services/user-service";
import type { SlashCommand } from "../types/command";

export const dailyCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Nhận phần thưởng vàng hằng ngày hoặc một vật phẩm ngẫu nhiên."),
  async execute(interaction) {
    try {
      const user = await getUser(interaction.user.id);

      if (!user) {
        await interaction.reply({
          content: "Bạn chưa đăng ký. Hãy dùng `/register` trước.",
          ephemeral: true
        });
        return;
      }

      const remaining = getRemainingCooldown(user.lastDaily, DAILY_COOLDOWN_MS);
      if (remaining > 0) {
        await interaction.reply({
          content: `Phần thưởng hằng ngày của bạn đang trong thời gian chờ: ${formatDuration(remaining)}.`,
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
          .setTitle("Phần thưởng hằng ngày")
          .setDescription(`Bạn nhận được **${item.name}**.`);

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
        .setTitle("Phần thưởng hằng ngày")
        .setDescription(`Bạn nhận được **${gold} vàng**.`);

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("daily command failed", error);
      await interaction.reply({
        content: "Nhận thưởng hằng ngày thất bại. Thử lại sau một chút.",
        ephemeral: true
      });
    }
  }
};
