import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder, type ButtonInteraction } from "discord.js";
import { prisma } from "../services/prisma";
import { getUserWithRelations } from "../services/user-service";
import type { SlashCommand } from "../types/command";

function buildSkillEmbed(user: any) {
  const equipped = user.skills.filter((us: any) => us.isEquipped);
  const unequipped = user.skills.filter((us: any) => !us.isEquipped);

  const embed = new EmbedBuilder()
    .setTitle("Quản lý Kỹ Năng")
    .setColor(0x3498db)
    .addFields({ 
      name: `Đang trang bị (${equipped.length}/3)`, 
      value: equipped.length > 0 ? equipped.map((us: any) => `⚔️ **${us.skill.name}** (${us.skill.type})`).join("\n") : "Trống" 
    });

  if (unequipped.length > 0) {
    embed.addFields({
      name: "Chưa trang bị",
      value: unequipped.map((us: any) => `📦 ${us.skill.name}`).join("\n")
    });
  } else {
    embed.addFields({ name: "Chưa trang bị", value: "Không có kỹ năng nào khác." });
  }
  return embed;
}

function buildSkillButtons(user: any) {
  const equipped = user.skills.filter((us: any) => us.isEquipped);
  const unequipped = user.skills.filter((us: any) => !us.isEquipped);

  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  
  if (equipped.length > 0) {
    const equippedRow = new ActionRowBuilder<ButtonBuilder>();
    for (const us of equipped) {
      equippedRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`skill_unequip:${us.skillId}`)
          .setLabel(`Tháo ${us.skill.name}`)
          .setStyle(ButtonStyle.Danger)
      );
    }
    rows.push(equippedRow);
  }

  let currentRow = new ActionRowBuilder<ButtonBuilder>();
  for (let i = 0; i < unequipped.length; i++) {
    const us = unequipped[i];
    currentRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`skill_equip:${us.skillId}`)
        .setLabel(`${us.skill.name}`)
        .setStyle(ButtonStyle.Secondary)
    );

    if (currentRow.components.length === 5) {
      rows.push(currentRow);
      currentRow = new ActionRowBuilder<ButtonBuilder>();
    }
    
    // Discord limits to 5 components (ActionRows). So if we hit 5, stop adding unequipped skills.
    if (rows.length === 5) break; 
  }

  if (currentRow.components.length > 0 && rows.length < 5) {
    rows.push(currentRow);
  }

  return rows;
}

export const skillsCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("skills")
    .setDescription("Xem và quản lý các kỹ năng của bạn (Loadout)") as any,
  async execute(interaction) {
    await interaction.deferReply();
    const user = await getUserWithRelations(interaction.user.id);

    if (!user) {
      await interaction.editReply("Bạn chưa đăng ký tài khoản! (Dùng /register)");
      return;
    }

    await interaction.editReply({ 
      embeds: [buildSkillEmbed(user)], 
      components: buildSkillButtons(user) 
    });
  }
};

export async function handleSkillButton(interaction: ButtonInteraction): Promise<boolean> {
  const customId = interaction.customId;
  const isEquip = customId.startsWith("skill_equip:");
  const isUnequip = customId.startsWith("skill_unequip:");

  if (!isEquip && !isUnequip) return false;

  const skillId = customId.split(":")[1];
  const user = await getUserWithRelations(interaction.user.id);

  if (!user) {
    await interaction.reply({ content: "Tài khoản không tồn tại.", ephemeral: true });
    return true;
  }

  const userSkill = user.skills.find((us: any) => us.skillId === skillId);
  if (!userSkill) {
    await interaction.reply({ content: "Bạn không sở hữu kỹ năng này!", ephemeral: true });
    return true;
  }

  if (isEquip) {
    const equippedCount = user.skills.filter((us: any) => us.isEquipped).length;
    if (userSkill.isEquipped) {
      await interaction.reply({ content: "Kỹ năng này đã được trang bị!", ephemeral: true });
      return true;
    }
    if (equippedCount >= 3) {
      await interaction.reply({ content: "Bạn đã vượt quá 3 kỹ năng trang bị. Hãy tháo ra bớt.", ephemeral: true });
      return true;
    }

    await prisma.userSkill.update({
      where: { id: userSkill.id },
      data: { isEquipped: true }
    });
  } else if (isUnequip) {
    if (!userSkill.isEquipped) {
      await interaction.reply({ content: "Kỹ năng này hiện không được trang bị!", ephemeral: true });
      return true;
    }

    await prisma.userSkill.update({
      where: { id: userSkill.id },
      data: { isEquipped: false }
    });
  }

  const updatedUser = await getUserWithRelations(interaction.user.id);
  await interaction.update({ 
    embeds: [buildSkillEmbed(updatedUser)], 
    components: buildSkillButtons(updatedUser) 
  });

  return true;
}
