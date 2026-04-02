import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder, type ButtonInteraction } from "discord.js";
import { QuestType } from "@prisma/client";
import { claimQuestReward, getOrCreateUserQuests } from "../services/quest-service";
import type { SlashCommand } from "../types/command";

export const questCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("quest")
    .setDescription("Xem nhiệm vụ đang hoạt động và nhận thưởng.") as any,
  async execute(interaction) {
    try {
      const userQuests = await getOrCreateUserQuests(interaction.user.id);
      
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`Nhiệm vụ của ${interaction.user.username}`)
        .setDescription("Hoàn thành nhiệm vụ để nhận thêm phần thưởng!");

      const typesMap: Record<QuestType, string[]> = {
        [QuestType.DAILY]: [],
        [QuestType.WEEKLY]: [],
        [QuestType.ACHIEVEMENT]: [],
      };

      const claimableRows: ActionRowBuilder<ButtonBuilder>[] = [];
      let currentRow = new ActionRowBuilder<ButtonBuilder>();

      for (const uq of userQuests) {
        const progressStr = uq.isCompleted ? "✅ Hoàn thành" : `⏳ ${uq.progress}/${uq.quest.target}`;
        const statusStr = uq.isClaimed ? "🏆 Đã nhận" : progressStr;
        
        typesMap[uq.quest.type].push(`**${uq.quest.description}**\n> *${statusStr}*`);

        if (uq.isCompleted && !uq.isClaimed) {
          if (currentRow.components.length >= 5) {
            claimableRows.push(currentRow);
            currentRow = new ActionRowBuilder<ButtonBuilder>();
          }
          currentRow.addComponents(
            new ButtonBuilder()
              .setCustomId(`claim_quest:${uq.id}`)
              .setLabel(`Nhận thưởng`)
              .setStyle(ButtonStyle.Success)
          );
        }
      }

      if (currentRow.components.length > 0) claimableRows.push(currentRow);

      for (const [type, list] of Object.entries(typesMap)) {
        if (list.length > 0) {
          embed.addFields({
            name:
              type === "DAILY" ? "Hằng ngày" : type === "WEEKLY" ? "Hằng tuần" : type === "ACHIEVEMENT" ? "Thành tựu" : `${type}`,
            value: list.join("\n\n"),
            inline: false
          });
        }
      }

      await interaction.reply({
        embeds: [embed],
        components: claimableRows,
        ephemeral: true
      });

    } catch (error) {
      console.error("quest command failed", error);
      await interaction.reply({
        content: "Không thể tải nhiệm vụ. Thử lại sau.",
        ephemeral: true
      });
    }
  }
};

export async function handleQuestClaim(interaction: ButtonInteraction): Promise<boolean> {
  if (!interaction.customId.startsWith("claim_quest:")) return false;

  const userQuestId = interaction.customId.replace("claim_quest:", "");
  
  try {
    const quest = await claimQuestReward(interaction.user.id, userQuestId);
    
    await interaction.reply({
      content: `🎉 Bạn đã nhận thưởng nhiệm vụ **${quest.description}**! Bạn nhận **${quest.goldReward} vàng**!`,
      ephemeral: true
    });
    
    // Optionally update the original message to remove the button
    const message = interaction.message;
    if (message.editable) {
      const remainingQuests = await getOrCreateUserQuests(interaction.user.id);
      const claimableRows: ActionRowBuilder<ButtonBuilder>[] = [];
      let currentRow = new ActionRowBuilder<ButtonBuilder>();

      for (const uq of remainingQuests) {
        if (uq.isCompleted && !uq.isClaimed) {
          if (currentRow.components.length >= 5) {
            claimableRows.push(currentRow);
            currentRow = new ActionRowBuilder<ButtonBuilder>();
          }
          currentRow.addComponents(
            new ButtonBuilder()
              .setCustomId(`claim_quest:${uq.id}`)
              .setLabel(`Nhận thưởng`)
              .setStyle(ButtonStyle.Success)
          );
        }
      }
      if (currentRow.components.length > 0) claimableRows.push(currentRow);

      await interaction.editReply({
        components: claimableRows
      });
    }

  } catch (error: any) {
    await interaction.reply({
      content: `❌ ${error.message}`,
      ephemeral: true
    });
  }

  return true;
}
