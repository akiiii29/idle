import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { reviveUser } from "../services/user-service";
import { prisma } from "../services/prisma";
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

      // Fetch updated user for current HP display
      const user = await prisma.user.findUnique({ where: { id: interaction.user.id } });

      const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setAuthor({ name: "Bệnh viện", iconURL: interaction.user.displayAvatarURL() })
        .setTitle("🚑 Tái sinh khẩn cấp!")
        .setDescription(result.message)
        .addFields(
          {
            name: "❤️ Máu",
            value: user ? `\`${user.maxHp}/${user.maxHp}\`` : "Đầy",
            inline: true
          },
          {
            name: "💰 Vàng",
            value: user ? `\`${user.gold}\`` : "—",
            inline: true
          }
        )
        .setFooter({ text: "Hãy giữ an toàn, thợ săn!" });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("revive command failed", error);
      await interaction.reply({
        content: "Có lỗi xảy ra. Hãy thử lại.",
        ephemeral: true
      });
    }
  }
};
