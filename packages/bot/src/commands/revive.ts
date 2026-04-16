import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { reviveUser, getUserWithRelations } from "../services/user-service";
import { prisma } from "../services/prisma";
import { computeCombatStats } from "@game/core";
import type { SlashCommand } from "../types/command";

export const reviveCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("revive")
    .setDescription("Trả Vàng bằng đúng số Máu Tối Đa để rời bệnh viện ngay lập tức."),

  async execute(interaction) {
    try {
      const result = await reviveUser(interaction.user.id);

      if (!result.success) {
        await interaction.reply({ content: result.message, ephemeral: true });
        return;
      }

      await interaction.deferReply();
      // Fetch updated user with relations for current HP display
      const user = await getUserWithRelations(interaction.user.id);
      if (!user) {
         await interaction.editReply("Không tìm thấy dữ liệu.");
         return;
      }

      const equippedItems = user.inventory?.filter((i: any) => i.isEquipped) || [];
      const equippedPets = user.beasts?.filter((b: any) => b.isEquipped) || [];
      const stats = computeCombatStats(user, equippedItems, equippedPets);
      const finalMaxHp = stats.final.maxHp;

      const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setAuthor({ name: "Bệnh viện", iconURL: interaction.user.displayAvatarURL() })
        .setTitle("🚑 Tái sinh khẩn cấp!")
        .setDescription(result.message)
        .addFields(
          {
            name: "❤️ Máu",
            value: `\`${finalMaxHp}/${finalMaxHp}\``,
            inline: true
          },
          {
            name: "💰 Vàng",
            value: `\`${user.gold}\``,
            inline: true
          }
        )
        .setFooter({ text: "Hãy giữ an toàn, thợ săn!" });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("revive command failed", error);
      await interaction.editReply({
        content: "Có lỗi xảy ra. Hãy thử lại."
      });
    }
  }
};
