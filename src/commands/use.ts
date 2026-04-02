import { AutocompleteInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { ItemType } from "@prisma/client";
import { prisma } from "../services/prisma";
import { getUserWithRelations } from "../services/user-service";
import type { SlashCommand } from "../types/command";

export const useCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("use")
    .setDescription("Dùng vật phẩm tiêu hao trong túi đồ của bạn.")
    .addStringOption(option =>
      option.setName("item")
        .setDescription("Tên vật phẩm bạn muốn dùng")
        .setRequired(true)
        .setAutocomplete(true)
    ) as any,
  async execute(interaction) {
    try {
      const itemName = (interaction.options as any).getString("item");
      const user = await getUserWithRelations(interaction.user.id);

      if (!user) {
        await interaction.reply({
          content: "Bạn chưa đăng ký. Hãy dùng `/register` trước.",
          ephemeral: true
        });
        return;
      }

      const item = user.inventory.find((i: any) => i.name.toLowerCase() === itemName.toLowerCase());

      if (!item) {
        const healItems = user.inventory.filter(
          (i: any) => i.type === ItemType.MEAT || i.type === ItemType.POTION
        );
        const list =
          healItems.length > 0
            ? healItems.map((c: any) => `**${c.name}** (x${c.quantity})`).join(", ")
            : "Không có vật phẩm hồi máu để dùng.";

        await interaction.reply({
          content: `Bạn không có vật phẩm đó hoặc không thể dùng vật phẩm này.\nCác vật phẩm hồi máu có sẵn: ${list}`,
          ephemeral: true
        });
        return;
      }

      if (item.type !== ItemType.MEAT && item.type !== ItemType.POTION) {
        await interaction.reply({
          content: `Bạn không thể dùng **${item.name}** theo cách này. Hãy dùng lệnh phù hợp (ví dụ /hunt) cho loại vật phẩm này.`,
          ephemeral: true
        });
        return;
      }

      if (user.hp >= user.maxHp) {
        await interaction.reply({
          content: "Máu của bạn đã đầy!",
          ephemeral: true
        });
        return;
      }

      const healAmount = item.power;
      const newHp = Math.min(user.maxHp, user.hp + healAmount);

      await prisma.$transaction(async (tx) => {
        // Decrease quantity
        if (item.quantity > 1) {
          await tx.item.update({
            where: { id: item.id },
            data: { quantity: { decrement: 1 } }
          });
        } else {
          await tx.item.delete({
            where: { id: item.id }
          });
        }

        // Update user HP
        await tx.user.update({
          where: { id: user.id },
          data: { 
            hp: newHp,
            lastHpUpdatedAt: new Date()
          }
        });
      });

      const embed = new EmbedBuilder()
        .setColor(0x57f287)
        .setTitle("Vật phẩm đã được sử dụng")
        .setDescription(
          `Bạn đã dùng **${item.name}** và hồi lại **${newHp - user.hp} máu**.\nTình trạng: **${newHp}/${user.maxHp} máu**`
        );

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error("use command failed", error);
      await interaction.reply({
        content: "Không thể dùng vật phẩm. Thử lại sau.",
        ephemeral: true
      });
    }
  }
};

export async function handleUseAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
  const userId = interaction.user.id;
  const user = await getUserWithRelations(userId);
  if (!user) {
    await interaction.respond([]);
    return;
  }

  const focused = (interaction.options.getFocused() ?? "").toString().toLowerCase();

  const healItems = user.inventory.filter((i: any) => {
    return i.type === ItemType.MEAT || i.type === ItemType.POTION;
  });

  const suggestions = healItems
    .filter((i: any) => (focused ? i.name.toLowerCase().includes(focused) : true))
    .slice(0, 25)
    .map((i: any) => ({
      name: `${i.name} (x${i.quantity})`,
      value: i.name
    }));

  await interaction.respond(suggestions);
}
