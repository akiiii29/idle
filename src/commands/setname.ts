import { SlashCommandBuilder } from "discord.js";
import { prisma } from "../services/prisma";
import type { SlashCommand } from "../types/command";

export const setnameCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("setname")
    .setDescription("Đổi tên thợ săn của bạn (Chỉ được đổi 1 lần duy nhất!)")
    .addStringOption(opt => 
      opt.setName("name")
        .setDescription("Tên mới (3-16 ký tự, không ký tự đặc biệt)")
        .setRequired(true)
        .setMinLength(3)
        .setMaxLength(16)
    ) as any,
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const newName = interaction.options.getString("name", true).trim();

    // 1. Validation
    const nameRegex = /^[a-zA-Z0-9_À-ỹ\s]+$/;
    if (!nameRegex.test(newName)) {
      await interaction.editReply("❌ Tên không được chứa ký tự đặc biệt.");
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: interaction.user.id } });
    if (!user) {
      await interaction.editReply("❌ Bạn chưa đăng ký thợ săn! Hãy dùng `/register`.");
      return;
    }

    if ((user as any).hasChangedUsername) {
      await interaction.editReply("❌ bạn đã sử dụng quyền đổi tên duy nhất của mình rồi.");
      return;
    }

    // 2. Check uniqueness
    const existing = await prisma.user.findFirst({
      where: { username: { equals: newName } }
    });

    if (existing) {
      await interaction.editReply("❌ Tên này đã có người sử dụng. Hãy chọn tên khác.");
      return;
    }

    // 3. Update
    await prisma.user.update({
      where: { id: interaction.user.id },
      data: { 
        username: newName,
        hasChangedUsername: true
      } as any
    });

    await interaction.editReply(`✅ Chúc mừng! Tên thợ săn của bạn đã được đổi thành **${newName}**.`);
  }
};
