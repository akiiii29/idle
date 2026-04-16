import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

import { DAILY_COOLDOWN_MS, DAILY_ITEMS, pickRandom, randomInt, rollPercent } from "@game/core";
import { prisma } from "../services/prisma";
import { formatDuration, getRemainingCooldown, getUser, upsertItem } from "../services/user-service";
import type { SlashCommand } from "../types/command";

import { isDifferentVnDay, msUntilNextVnMidnight } from "../utils/time";

export const dailyCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Nhận phần thưởng hằng ngày (Reset lúc 00:00 VN)."),
  async execute(interaction) {
    try {
      const user = await getUser(interaction.user.id);
      if (!user) {
        await interaction.reply({ content: "Bạn chưa đăng ký. Hãy dùng `/register` trước.", ephemeral: true });
        return;
      }

      if (!isDifferentVnDay(user.lastDaily)) {
        const remaining = msUntilNextVnMidnight();
        await interaction.reply({
          content: `Bạn đã nhận thưởng hôm nay rồi! Hãy quay lại sau: **${formatDuration(remaining)}**.`,
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
          .setTitle("🎁 Phần thưởng hằng ngày")
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
