import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

import {
  TAVERN_GOLD_PER_HP,
  TAVERN_HEAL_HP_PER_MIN,
  TAVERN_HEAL_INTERVAL_MS
} from "../constants/config";
import { prisma } from "../services/prisma";
import { getUserWithRelations, formatDuration } from "../services/user-service";
import { computeCombatStats } from "../services/stats-service";
import type { SlashCommand } from "../types/command";

export const tavernCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("tavern")
    .setDescription("Nghỉ ở quán trọ để hồi HP theo thời gian.")
    .addSubcommand(sub => 
      sub.setName("start")
        .setDescription("Bắt đầu nghỉ ngơi (Trả vàng để hồi HP)")
        .addIntegerOption(opt => opt.setName("hp").setDescription("Số máu muốn hồi (Để trống để hồi đầy)").setMinValue(1))
    )
    .addSubcommand(sub =>
      sub.setName("stop")
        .setDescription("Ngừng nghỉ ngơi ngay lập tức")
    )
    .addSubcommand(sub =>
      sub.setName("gamble")
        .setDescription("Thử vận may với vàng tại quán trọ")
        .addIntegerOption(opt => 
          opt.setName("amount")
            .setDescription("Số vàng muốn cược (Tối đa 30% tổng vàng)")
            .setRequired(true)
            .setMinValue(10)
        )
    ) as any,

  async execute(interaction) {
    try {
      const subcommand = interaction.options.getSubcommand();
      await interaction.deferReply();

      const user = await getUserWithRelations(interaction.user.id);
      if (!user) {
        await interaction.editReply({ content: "Bạn chưa đăng ký. Hãy dùng `/register` trước." });
        return;
      }

      const now = new Date();

      if (subcommand === "stop") {
        if (!user.tavernUntil || user.tavernUntil <= now) {
          await interaction.editReply({ content: "Bạn hiện không nghỉ ngơi tại quán trọ." });
          return;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            tavernUntil: null,
            isBusy: false,
            busyUntil: null
          }
        });

        await interaction.editReply({ content: "✅ Bạn đã rời quán trọ. Việc hồi máu đã dừng lại." });
        return;
      }

      if (subcommand === "gamble") {
        const betAmount = interaction.options.getInteger("amount") || 0;
        const maxBet = Math.floor(user.gold * 0.3);

        if (user.gold < betAmount) {
          await interaction.editReply({ content: `❌ Bạn không có đủ vàng (Cần: **${betAmount}**, Có: **${user.gold}**).` });
          return;
        }
        if (betAmount > maxBet && user.gold > 100) { // Allow small bets even if they exceed 30% for poor players
           await interaction.editReply({ content: `⚠️ Mức cược tối đa là 30% tổng vàng (**${maxBet}** vàng).` });
           return;
        }

        // Win chance logic: 45% + streak bonus (2% per loss)
        const streakBonus = (user.gambleStreak || 0) * 0.02;
        const winChance = 0.45 + streakBonus;
        const roll = Math.random();
        const isWin = roll < winChance;

        let newGold = user.gold;
        let newStreak = user.gambleStreak || 0;
        let resultMsg = "";
        let color = 0x000000;

        if (isWin) {
          newGold += betAmount;
          newStreak = 0;
          resultMsg = `🎊 **BẠN ĐÃ THẮNG!**\nBạn nhận được **+${betAmount}** vàng.`;
          color = 0x2ecc71; // Green
        } else {
          newGold -= betAmount;
          newStreak += 1;
          resultMsg = `💀 **BẠN ĐÃ THUA...**\nBạn đã mất **${betAmount}** vàng.`;
          color = 0xe74c3c; // Red
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { gold: newGold, gambleStreak: newStreak }
        });

        const nextChance = Math.min(0.95, 0.45 + (newStreak * 0.02));

        const embed = new EmbedBuilder()
          .setColor(color)
          .setTitle("🎲 Sòng Bạc Quán Trọ")
          .setDescription(
            `*"Tay chơi ${user.username} đặt cược ${betAmount} vàng..."*\n\n` + 
            `${isWin ? "🎰 💰 💎" : "🎱 ❌ 💀"}\n\n` +
            resultMsg
          )
          .addFields(
            { name: "💰 Vàng hiện tại", value: `\`${newGold}\` vàng`, inline: true },
            { name: "📈 Tỉ lệ thắng lượt tới", value: `\`${Math.round(nextChance * 100)}%\` ${newStreak > 0 ? `(+${newStreak * 2}% bonus)` : ""}`, inline: true }
          )
          .setFooter({ text: isWin ? "Vận may đang đến!" : "Lần sau chắc chắn sẽ thắng... có lẽ vậy." });

        await interaction.editReply({ embeds: [embed] });
        return;
      }

      // ─── START LOGIC ──────────────────────────────────────────────────
      
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

      const equippedItems = user.inventory.filter((i: any) => i.isEquipped);
      const equippedPets = user.beasts.filter((b: any) => b.isEquipped);
      const stats = computeCombatStats(user, equippedItems, equippedPets);
      const maxHp = stats.final.maxHp;

      const missingHp = maxHp - user.currentHp;
      if (missingHp <= 0) {
        await interaction.editReply({ content: `Máu của bạn đã đầy (**${user.currentHp}/${maxHp}**).` });
        return;
      }

      const requestedHp = interaction.options.getInteger("hp");
      const healHp = requestedHp ? Math.min(missingHp, requestedHp) : missingHp;

      if (healHp <= 0) {
        await interaction.editReply({ content: "Không có gì để hồi phục." });
        return;
      }

      // 1 HP every 15 seconds => durationMs is linear with recovered HP.
      const durationMs = healHp * TAVERN_HEAL_INTERVAL_MS;
      const endTime = new Date(now.getTime() + durationMs);
      const costGold = Math.ceil(healHp * TAVERN_GOLD_PER_HP);

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
                : `Bạn sẽ hồi về đầy HP (${maxHp}/${maxHp}).`
            )
            .addFields(
              {
                name: "❤️ Máu",
                value: `Hiện tại: \`${user.currentHp}/${maxHp}\` → +\`${healHp}\` máu`,
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

