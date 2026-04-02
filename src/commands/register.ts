import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

import { prisma } from "../services/prisma";
import type { SlashCommand } from "../types/command";

export const registerCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("Tạo hồ sơ RPG của bạn."),
  async execute(interaction) {
    try {
      const existing = await prisma.user.findUnique({
        where: { id: interaction.user.id }
      });

      if (existing) {
        await interaction.reply({
          content: "Bạn đã đăng ký rồi.",
          ephemeral: true
        });
        return;
      }

      const user = await prisma.user.create({
        data: {
          id: interaction.user.id
        }
      });

      const embed = new EmbedBuilder()
        .setColor(0x57f287)
        .setTitle(`${interaction.user.username} tham gia cuộc săn`)
        .setDescription("Hồ sơ RPG của bạn đã sẵn sàng.")
        .addFields(
          { name: "Cấp độ", value: user.level.toString(), inline: true },
          { name: "Máu", value: `${user.currentHp}/${user.maxHp}`, inline: true },
          {
            name: "Thuộc tính",
            value: `Sức mạnh ${user.str} | Nhanh nhẹn ${user.agi} | May mắn ${user.luck}`,
            inline: false
          }
        );

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("register command failed", error);
      await interaction.reply({
        content: "Đăng ký thất bại. Thử lại sau một chút.",
        ephemeral: true
      });
    }
  }
};
