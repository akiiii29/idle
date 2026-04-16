import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder, type ButtonInteraction } from "discord.js";
import { getSkillDescription } from "../services/skill-system";
import { prisma } from "../services/prisma";
import { getUserWithRelations } from "../services/user-service";
import type { SlashCommand } from "../types/command";

const SKILL_PRICE = 2000;

import { getVnDayString } from "../utils/time";

/**
 * Seeded shuffle to ensure 5 skills are the same for a user today.
 */
function getDailySkills(userId: string, skills: any[]) {
  const dateStr = getVnDayString(); // YYYY-MM-DD VN time
  const seedString = `${userId}-${dateStr}`;

  // Very simple hash for seeding
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0;
  }

  const seededRandom = () => {
    const x = Math.sin(hash++) * 10000;
    return x - Math.floor(x);
  };

  const pool = [...skills];
  const result = [];
  for (let i = 0; i < 5 && pool.length > 0; i++) {
    const index = Math.floor(seededRandom() * pool.length);
    result.push(pool.splice(index, 1)[0]);
  }
  return result;
}


export const skillShopCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("skill_shop")
    .setDescription("Phòng Tập Kỹ Năng — Học những chiêu thức mới (2000 Vàng/kỹ năng).") as any,
  async execute(interaction) {
    await interaction.deferReply();
    const user = await getUserWithRelations(interaction.user.id);
    if (!user) {
      await interaction.editReply("Bạn chưa đăng ký tài khoản! (Dùng /register)");
      return;
    }

    const allSkills = await prisma.skill.findMany();
    if (allSkills.length === 0) {
      await interaction.editReply("Hiện tại không có kỹ năng nào trong võ quán.");
      return;
    }

    const dailySkills = getDailySkills(user.id, allSkills);
    const userSkillIds = user.skills.map((us: any) => us.skillId);

    const embed = new EmbedBuilder()
      .setTitle("🏮 Cửa Hàng Kỹ Năng")
      .setColor(0xEE5A24)
      .setDescription("Hôm nay võ sư có thể dạy cho bạn các tuyệt kỹ sau:")
      .addFields({ name: "💰 Tiền của bạn", value: `\`${user.gold} Vàng\`` })
      .setFooter({ text: "Kỹ năng sẽ thay đổi vào ngày mai. Không có nút làm mới!" });

    const rows: ActionRowBuilder<ButtonBuilder>[] = [];
    let currentRow = new ActionRowBuilder<ButtonBuilder>();

    for (const skill of dailySkills) {
      const isOwned = userSkillIds.includes(skill.id);

      embed.addFields({
        name: `${isOwned ? "✅" : "📜"} ${skill.name}`,
        value: `Type: \`${skill.type}\` | Price: \`${SKILL_PRICE} Vàng\`\n${getSkillDescription(skill)}`,
        inline: false
      });

      currentRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`buy_skill:${skill.id}:${user.id}`)
          .setLabel(isOwned ? `Đã sở hữu` : `Mua ${skill.name}`)
          .setStyle(isOwned ? ButtonStyle.Secondary : ButtonStyle.Primary)
          .setDisabled(isOwned)
      );

      if (currentRow.components.length === 2) {
        rows.push(currentRow);
        currentRow = new ActionRowBuilder<ButtonBuilder>();
      }
    }

    if (currentRow.components.length > 0) rows.push(currentRow);

    await interaction.editReply({ embeds: [embed], components: rows });
  }
};

export async function handleSkillShopButton(interaction: ButtonInteraction): Promise<boolean> {
  const customId = interaction.customId;
  if (!customId.startsWith("buy_skill:")) return false;

  const parts = customId.split(":");
  const skillId = parts[1];
  const ownerId = parts[2];

  if (interaction.user.id !== ownerId) {
    await interaction.reply({ content: "Đây không phải võ quán dành cho bạn!", ephemeral: true });
    return true;
  }

  await interaction.deferUpdate();
  const userId = interaction.user.id;

  if (!skillId) return true;

  const user = await getUserWithRelations(userId);
  if (!user) return true;

  const skill = await prisma.skill.findUnique({ where: { id: skillId } });
  if (!skill) return true;

  const isOwned = user.skills.some((us: any) => us.skillId === skillId);
  if (isOwned) {
    await interaction.followUp({ content: "Bạn đã sở hữu kỹ năng này rồi!", ephemeral: true });
    return true;
  }

  if (user.gold < SKILL_PRICE) {
    await interaction.followUp({ content: `❌ Bạn không đủ vàng! Cần **${SKILL_PRICE} Vàng**.`, ephemeral: true });
    return true;
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { gold: { decrement: SKILL_PRICE } }
      });
      await tx.userSkill.create({
        data: { userId, skillId: skillId as string, isEquipped: false }
      });
    });

    await interaction.followUp({
      content: `🎉 Chúc mừng! Bạn đã học thành công tuyệt kỹ **${skill.name}**!`,
      ephemeral: true
    });

    // Refresh shop view
    const updatedUser = await getUserWithRelations(userId);
    const allSkills = await prisma.skill.findMany();
    const dailySkills = getDailySkills(updatedUser.id, allSkills);
    const userSkillIds = updatedUser.skills.map((us: any) => us.skillId);

    const oldEmbed = interaction.message.embeds[0];
    if (!oldEmbed) return true;

    const embed = EmbedBuilder.from(oldEmbed);
    embed.setFields([]);
    embed.addFields({ name: "💰 Ngân lượng của bạn", value: `\`${updatedUser.gold} Vàng\`` });

    const rows: ActionRowBuilder<ButtonBuilder>[] = [];
    let currentRow = new ActionRowBuilder<ButtonBuilder>();

    for (const s of dailySkills) {
      const owned = userSkillIds.includes(s.id);
      embed.addFields({
        name: `${owned ? "✅" : "📜"} ${s.name}`,
        value: `Type: \`${s.type}\` | Price: \`${SKILL_PRICE} Vàng\`\n${getSkillDescription(s)}`,
        inline: false
      });
      currentRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`buy_skill:${s.id}:${updatedUser.id}`)
          .setLabel(owned ? "Đã sở hữu" : `Mua ${s.name}`)
          .setStyle(owned ? ButtonStyle.Secondary : ButtonStyle.Primary)
          .setDisabled(owned)
      );
      if (currentRow.components.length === 2) {
        rows.push(currentRow);
        currentRow = new ActionRowBuilder<ButtonBuilder>();
      }
    }
    if (currentRow.components.length > 0) rows.push(currentRow);

    await interaction.editReply({ embeds: [embed], components: rows });

  } catch (error) {
    console.error("buy_skill failed", error);
    await interaction.followUp({ content: "Giao dịch thất bại. Thử lại sau.", ephemeral: true });
  }

  return true;
}
