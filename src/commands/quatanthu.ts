import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { prisma } from "../services/prisma";
import type { SlashCommand } from "../types/command";

export const quatanthuCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("quatanthu")
    .setDescription("Nhận quà tân thủ cho những người chơi cũ (500 Vàng & 5 Potion)."),
  async execute(interaction) {
    try {
      await interaction.deferReply();
      const userId = interaction.user.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        await interaction.editReply({
          content: "Bạn chưa đăng ký hồ sơ. Hãy dùng `/register` trước.",
        });
        return;
      }

      if (user.hasReceivedNewbieGift) {
        await interaction.editReply({
          content: "❌ Bạn đã nhận quà tân thủ rồi (hoặc đã nhận khi đăng ký mới).",
        });
        return;
      }

      // Trao quà
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: {
            gold: { increment: 500 },
            hasReceivedNewbieGift: true,
          },
        }),
        prisma.item.upsert({
          where: {
            ownerId_name_type: {
              ownerId: userId,
              name: "Potion",
              type: "POTION",
            },
          },
          create: {
            ownerId: userId,
            name: "Potion",
            type: "POTION",
            power: 50,
            quantity: 5,
          },
          update: {
            quantity: { increment: 5 },
          },
        }),
      ]);

      const embed = new EmbedBuilder()
        .setColor(0xF1C40F)
        .setTitle("🎁 Nhận quà tân thủ thành công!")
        .setDescription(`Chào mừng người cũ trở lại! Bạn đã nhận được phần quà hỗ trợ đặc biệt.`)
        .addFields(
          { name: "Phần thưởng", value: "💰 **500 Vàng**\n🧪 **5 Bình Potion**", inline: false }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("quatanthu command failed", error);
      await interaction.editReply({
        content: "Có lỗi xảy ra khi nhận quà. Thử lại sau.",
      });
    }
  },
};
