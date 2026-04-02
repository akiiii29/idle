import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

import {
  TAVERN_GOLD_PER_HP,
  TAVERN_HEAL_HP_PER_MIN,
  TAVERN_HEAL_INTERVAL_MS
} from "../constants/config";
import { prisma } from "../services/prisma";
import { getUserWithRelations, formatDuration } from "../services/user-service";
import type { SlashCommand } from "../types/command";

export const tavernCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("tavern")
    .setDescription("Nghỉ ở quán trọ để hồi HP theo thời gian.")
    .addIntegerOption((opt) =>
      opt
        .setName("hp")
        .setDescription("Bạn muốn hồi bao nhiêu máu (tùy chọn). Mặc định nghỉ để hồi đầy.")
        .setMinValue(1)
    ) as any,

  async execute(interaction) {
    try {
      await interaction.deferReply();

      const user = await getUserWithRelations(interaction.user.id);
      if (!user) {
        await interaction.editReply({ content: "Bạn chưa đăng ký. Hãy dùng `/register` trước." });
        return;
      }

      const now = new Date();

      if (user.hospitalUntil && user.hospitalUntil > now) {
        await interaction.editReply({
          content: `Bạn đang ở bệnh viện trong ${formatDuration(user.hospitalUntil.getTime() - now.getTime())}.`
        });
        return;
      }

      if (user.isBusy) {
        await interaction.editReply({ content: "Bạn đang bận ngay lúc này. Hoàn thành hành động hiện tại trước." });
        return;
      }

      if (user.tavernUntil && user.tavernUntil > now) {
        await interaction.editReply({
          content: `Bạn đang nghỉ ở quán trọ trong ${formatDuration(user.tavernUntil.getTime() - now.getTime())}.`
        });
        return;
      }

      const missingHp = user.maxHp - user.currentHp;
      if (missingHp <= 0) {
        await interaction.editReply({ content: "Máu của bạn đã đầy." });
        return;
      }

      const requestedHp = (interaction.options as any).getInteger("hp");
      const healHp = requestedHp ? Math.min(missingHp, requestedHp) : missingHp;

      if (healHp <= 0) {
        await interaction.editReply({ content: "Không có gì để hồi phục." });
        return;
      }

      // 1 HP every 15 seconds => durationMs is linear with recovered HP.
      const durationMs = healHp * TAVERN_HEAL_INTERVAL_MS;
      const endTime = new Date(now.getTime() + durationMs);
      const costGold = healHp * TAVERN_GOLD_PER_HP;

      if (user.gold < costGold) {
        await interaction.editReply({
          content: `💸 Bạn cần **${costGold} vàng** để nghỉ, nhưng bạn chỉ có **${user.gold} vàng**.`
        });
        return;
      }

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: user.id },
          data: {
            gold: { decrement: costGold },
            tavernUntil: endTime,
            isBusy: true,
            busyUntil: endTime,
            // Reset regen baseline so tavern healing timing is accurate.
            lastHpUpdatedAt: now
          } as any
        });
      });

      const minutes = healHp / TAVERN_HEAL_HP_PER_MIN;

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x3498db)
            .setTitle("🍺 Nghỉ ở Quán Trọ")
            .setDescription(
              requestedHp
                ? `Bạn chọn hồi **${healHp} máu**.`
                : `Bạn sẽ hồi về đầy HP (${user.maxHp}/${user.maxHp}).`
            )
            .addFields(
              {
                name: "❤️ Máu",
                value: `Hiện tại: \`${user.currentHp}/${user.maxHp}\` → +\`${healHp}\` máu`,
                inline: false
              },
              {
                name: "💰 Chi phí",
                value: `\`${costGold} vàng\``,
                inline: true
              },
              {
                name: "⏳ Thời gian",
                value: `~\`${formatDuration(durationMs)}\` (${minutes.toFixed(2)} phút với ${TAVERN_HEAL_HP_PER_MIN} máu/phút)`,
                inline: true
              },
              {
                name: "📅 Kết thúc lúc",
                value: `\`${endTime.toISOString()}\``,
                inline: false
              }
            )
        ]
      });
    } catch (error) {
      console.error("tavern command failed", error);
      await interaction.reply({
        content: "Nghỉ ở quán trọ thất bại. Thử lại sau một chút.",
        ephemeral: true
      });
    }
  }
};

