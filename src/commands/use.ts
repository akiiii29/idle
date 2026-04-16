import { AutocompleteInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { ItemType } from "@prisma/client";
import { prisma } from "../services/prisma";
import { getUserWithRelations } from "../services/user-service";
import { computeCombatStats } from "../services/stats-service";
import { openChest } from "../services/chest-service";
import { addEquipmentToInventory } from "../services/equipment-service";
import { upsertItem } from "../services/user-service";
import { SHOP_CATALOG } from "../services/shop-service";
import { RARITY_BADGE, Rarity } from "../utils/rpg-ui";
import type { SlashCommand } from "../types/command";

export const useCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("use")
    .setDescription("Dùng một hoặc nhiều vật phẩm tiêu hao (tối đa 10).")
    .addStringOption(option =>
      option.setName("item")
        .setDescription("Tên vật phẩm bạn muốn dùng")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addIntegerOption(option =>
      option.setName("quantity")
        .setDescription("Số lượng muốn dùng (tối đa 10)")
        .setMinValue(1)
        .setMaxValue(10)
        .setRequired(false)
    ) as any,
  async execute(interaction) {
    try {
      const itemName = (interaction.options as any).getString("item");
      const useQuantity = (interaction.options as any).getInteger("quantity") ?? 1;
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
        const consumableItems = user.inventory.filter(
          (i: any) => i.type === ItemType.MEAT || i.type === ItemType.POTION || i.type === ItemType.CONSUMABLE
        );
        const list =
          consumableItems.length > 0
            ? consumableItems.map((c: any) => `**${c.name}** (x${c.quantity})`).join(", ")
            : "Không có vật phẩm tiêu hao để dùng.";

        await interaction.reply({
          content: `Bạn không có vật phẩm đó hoặc không thể dùng vật phẩm này.\nCác vật phẩm khả dụng: ${list}`,
          ephemeral: true
        });
        return;
      }

      const validTypes = [ItemType.MEAT, ItemType.POTION, ItemType.CONSUMABLE, ItemType.GAMBLE];
      if (!validTypes.includes(item.type)) {
        await interaction.reply({
          content: `Bạn không thể dùng **${item.name}** theo cách này.`,
          ephemeral: true
        });
        return;
      }

      // Handle Chests (GAMBLE)
      if (item.type === ItemType.GAMBLE && item.name.includes("Rương")) {
        const finalQty = Math.min(useQuantity, item.quantity);
        const results: string[] = [];
        
        await interaction.deferReply();

        for (let i = 0; i < finalQty; i++) {
          const res = openChest(item.name.includes("Vàng") ? "chest_epic" : item.name.includes("Bạc") ? "chest_rare" : "chest_common");
          
          if (res.type === "ITEM" && res.item) {
            const added = await addEquipmentToInventory(user.id, {
              ...res.item,
              type: res.item.type as any,
              power: res.item.power ?? 0,
              rarity: res.item.rarity as any
            });
            const badge = RARITY_BADGE[res.item.rarity as Rarity] || "⚪";
            results.push(
              `${added.added ? "🎁" : "⚠️"} ${badge} **${res.item.name}** — ${added.added ? added.message : added.message}`
            );
          } else if (res.type === "CONSUMABLE" && res.consumableKey) {
            const catalog = SHOP_CATALOG.find(c => c.key === res.consumableKey);
            if (catalog) {
              await upsertItem(prisma, user.id, { name: catalog.name, type: catalog.type, power: catalog.power, quantity: 1 });
              results.push(`🔹 **${catalog.name}** (x1)`);
            }
          }
        }

        await prisma.$transaction(async (tx) => {
          if (item.quantity > finalQty) {
            await tx.item.update({ where: { id: item.id }, data: { quantity: { decrement: finalQty } } });
          } else {
            await tx.item.delete({ where: { id: item.id } });
          }
        });

        const embed = new EmbedBuilder()
          .setColor(0xf1c40f)
          .setTitle(`📦 Bạn đã mở ${finalQty} ${item.name}`)
          .setDescription(`Chúc mừng! Bạn nhận được:\n\n${results.join("\n")}`)
          .setFooter({ text: "Vật phẩm rương là hên xui - Chúc bạn may mắn lần sau!" });

        await interaction.editReply({ embeds: [embed] });
        return;
      }

      const equippedItems = user.inventory.filter((i: any) => i.isEquipped);
      const equippedPets = user.beasts.filter((b: any) => b.isEquipped);
      const stats = computeCombatStats(user, equippedItems, equippedPets);
      const maxHp = stats.final.maxHp;

      if (user.currentHp >= maxHp) {
        await interaction.reply({
          content: `Máu của bạn đã đầy (**${user.currentHp}/${maxHp}**)!`,
          ephemeral: true
        });
        return;
      }

      const finalQty = Math.min(useQuantity, item.quantity);
      const healPerItem = item.power;
      const totalHealPotential = healPerItem * finalQty;
      const newHp = Math.min(maxHp, user.currentHp + totalHealPotential);
      const actualHeal = newHp - user.currentHp;

      await prisma.$transaction(async (tx) => {
        if (item.quantity > finalQty) {
          await tx.item.update({
            where: { id: item.id },
            data: { quantity: { decrement: finalQty } }
          });
        } else {
          await tx.item.delete({
            where: { id: item.id }
          });
        }

        await tx.user.update({
          where: { id: user.id },
          data: { 
            currentHp: newHp,
            lastHpUpdatedAt: new Date()
          }
        });
      });

      const embed = new EmbedBuilder()
        .setColor(0x57f287)
        .setTitle("Vật phẩm đã được sử dụng")
        .setDescription(
          `Bạn đã dùng **x${finalQty} ${item.name}** và hồi lại **${actualHeal} máu**.\nTình trạng: **${newHp}/${maxHp} máu**`
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

  const consumableItems = user.inventory.filter((i: any) => {
    return i.type === ItemType.MEAT || i.type === ItemType.POTION || i.type === ItemType.CONSUMABLE || i.type === ItemType.GAMBLE;
  });

  const suggestions = consumableItems
    .filter((i: any) => (focused ? i.name.toLowerCase().includes(focused) : true))
    .slice(0, 25)
    .map((i: any) => ({
      name: `${i.name} (x${i.quantity})`,
      value: i.name
    }));

  await interaction.respond(suggestions);
}
