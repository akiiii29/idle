import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  EmbedBuilder,
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} from "discord.js";
import type { SlashCommand } from "../types/command";
import { prisma } from "../services/prisma";
import { ItemType } from "@prisma/client";
import {
  getEffectiveSuccessRate,
  getUpgradeCost,
  previewUpgradePayment,
  SCRAP_VALUE_IN_GOLD,
  upgradeEquipment,
} from "../services/upgrade-service";

export const upgradeCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("upgrade")
    .setDescription("Nâng cấp vũ khí và áo giáp của bạn.") as any,

  async execute(interaction) {
    await interaction.deferReply();
    const userId = interaction.user.id;

    // Fetch user inventory for equipped items that can be upgraded
    const inventory = await prisma.item.findMany({
      where: {
        ownerId: userId,
        type: { in: [ItemType.WEAPON, ItemType.ARMOR, ItemType.ACCESSORY] },
        isEquipped: true
      },
      orderBy: [
        { type: "asc" }
      ]
    });

    if (inventory.length === 0) {
      await interaction.editReply("Bạn chưa trang bị Vũ khí, Giáp hay Trang sức nào để có thể nâng cấp.");
      return;
    }

    const userRow = await prisma.user.findUnique({
      where: { id: userId },
      select: { scrap: true },
    });
    const scrapHint = userRow?.scrap ?? 0;

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle("⚒️ Lò Rèn - Nâng cấp trang bị")
      .setDescription(
        "Chọn một trang bị từ danh sách bên dưới để xem thông tin cường hóa.\n" +
          `Scrap của bạn: **${scrapHint}** (1 Scrap quy đổi **${SCRAP_VALUE_IN_GOLD}** vàng phí nâng cấp).`
      );

    // Select Menu max 25 items
    const displayItems = inventory.slice(0, 25);
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("select_upgrade_item")
      .setPlaceholder("Chọn trang bị để nâng cấp...");

    for (const item of displayItems) {
      const equipTag = item.isEquipped ? "[Đang đeo] " : "";
      const levelTag = item.upgradeLevel > 0 ? `[+${item.upgradeLevel}]` : "";
      selectMenu.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(`${equipTag}${item.name} ${levelTag}`)
          .setDescription(`Loại: ${item.type === ItemType.WEAPON ? "Vũ khí" : item.type === ItemType.ARMOR ? "Áo giáp" : "Trang sức"} - Rarity: ${item.rarity}`)
          .setValue(item.id)
      );
    }

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
    
    const response = await interaction.editReply({ embeds: [embed], components: [row] });

    // Component collector for selections and button presses
    const collector = response.createMessageComponentCollector({
      filter: (i: any) => i.user.id === interaction.user.id,
      time: 60000,
    });

    let selectedItemId: string | null = null;

    collector.on("collect", async (i: any) => {
      try {
        if (i.customId === "select_upgrade_item") {
          selectedItemId = i.values[0];
          const item = inventory.find(x => x.id === selectedItemId);
          
          if (!item) {
             await i.reply({ content: "Đã xảy ra lỗi khi tìm trang bị.", ephemeral: true });
             return;
          }

          const currentLevel = item.upgradeLevel || 0;
          const failCt = item.failCount || 0;
          const u = await prisma.user.findUnique({
            where: { id: userId },
            select: { scrap: true },
          });
          const userScrap = u?.scrap ?? 0;
          const preview = previewUpgradePayment(userScrap, currentLevel, item.rarity);
          const effRate = getEffectiveSuccessRate(currentLevel, failCt);
          let payLine = `**${preview.baseGoldCost}** vàng tương đương\n`;
          if (preview.scrapToUse > 0 && preview.goldToUse > 0) {
            payLine += `→ Trừ **${preview.scrapToUse}** Scrap + **${preview.goldToUse}** vàng`;
          } else if (preview.scrapToUse > 0) {
            payLine += `→ Trừ **${preview.scrapToUse}** Scrap`;
          } else {
            payLine += `→ Trừ **${preview.goldToUse}** vàng`;
          }
          let rateLine = `${(effRate * 100).toFixed(0)}%`;
          if (failCt > 0) {
            rateLine += ` (đã +${failCt} lần xịt: +${(failCt * 10).toFixed(0)}% bảo hiểm)`;
          }
          if (failCt >= 5) {
            rateLine = `100% (Pity — lần này chắc chắn thành công)`;
          }

          const itemEmbed = new EmbedBuilder()
            .setColor(0xe67e22)
            .setTitle(`Nâng cấp: ${item.name} [+${currentLevel}]`)
            .addFields(
              { name: "🎚️ Cấp hiện tại", value: `+${currentLevel}`, inline: true },
              { name: "📈 Tỉ lệ (lần này)", value: rateLine, inline: true },
              { name: "💰 Chi phí", value: payLine, inline: false }
            );

          const upgradeBtn = new ButtonBuilder()
            .setCustomId(`do_upgrade_${item.id}`)
            .setLabel("Nâng cấp ngay")
            .setStyle(ButtonStyle.Success);
            
          const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(upgradeBtn);

          // We must update the main message with both the select menu and the button
          await i.update({
            embeds: [itemEmbed],
            components: [row, actionRow] // keep the select menu so they can change their mind
          });
        } else if (i.customId.startsWith("do_upgrade_")) {
          const itemId = i.customId.replace("do_upgrade_", "");
          
          if (itemId !== selectedItemId) {
              await i.reply({ content: "Trang bị chọn không khớp, vui lòng chọn lại.", ephemeral: true });
              return;
          }
          
          // Execute upgrade
          await i.deferUpdate();
          const result = await upgradeEquipment(userId, itemId);
          
          // Re-fetch item to show new stats
          const updatedItem = await prisma.item.findUnique({ where: { id: itemId } });
          const newLevel = updatedItem?.upgradeLevel || 0;
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { gold: true, scrap: true },
          });
          
          // Show result
          const resEmbed = new EmbedBuilder()
            .setColor(result.leveledUp ? 0x2ecc71 : 0xe74c3c)
            .setTitle(result.leveledUp ? "🎉 Nâng cấp thành công!" : "💥 Nâng cấp thất bại!")
            .setDescription(
              `${result.message}\nVàng: **${user?.gold ?? 0}** · Scrap: **${user?.scrap ?? 0}**`
            );
            
          // If leveled up, recreate select menu to reflect changes
          if (result.leveledUp && updatedItem) {
             const index = displayItems.findIndex(x => x.id === itemId);
             if (index !== -1) {
                 displayItems[index] = updatedItem; // update in local list
             }
             
             // rebuild menu
             const newSelectMenu = new StringSelectMenuBuilder()
               .setCustomId("select_upgrade_item")
               .setPlaceholder("Chọn trang bị để tiếp tục...");
             for (const it of displayItems) {
               const equipTag = it.isEquipped ? "[Đang đeo] " : "";
               const levelTag = it.upgradeLevel > 0 ? `[+${it.upgradeLevel}]` : "";
               newSelectMenu.addOptions(
                  new StringSelectMenuOptionBuilder()
                    .setLabel(`${equipTag}${it.name} ${levelTag}`)
                    .setDescription(`Loại: ${it.type === ItemType.WEAPON ? "Vũ khí" : it.type === ItemType.ARMOR ? "Áo giáp" : "Trang sức"} - Rarity: ${it.rarity}`)
                    .setValue(it.id)
               );
             }
             
             const u2 = await prisma.user.findUnique({
               where: { id: userId },
               select: { scrap: true },
             });
             const nextPreview = previewUpgradePayment(
               u2?.scrap ?? 0,
               newLevel,
               updatedItem.rarity
             );
             const nextEff = getEffectiveSuccessRate(newLevel, updatedItem.failCount || 0);
             let nextPay = `**${nextPreview.baseGoldCost}** vàng tương đương\n`;
             if (nextPreview.scrapToUse > 0 && nextPreview.goldToUse > 0) {
               nextPay += `→ **${nextPreview.scrapToUse}** Scrap + **${nextPreview.goldToUse}** vàng`;
             } else if (nextPreview.scrapToUse > 0) {
               nextPay += `→ **${nextPreview.scrapToUse}** Scrap`;
             } else {
               nextPay += `→ **${nextPreview.goldToUse}** vàng`;
             }
             const contBtn = new ButtonBuilder()
               .setCustomId(`do_upgrade_${updatedItem.id}`)
               .setLabel(`Nâng cấp lên +${newLevel+1}`)
               .setStyle(ButtonStyle.Success)
               .setDisabled(newLevel >= 10);
               
             resEmbed.addFields(
               { name: "🎚️ Cấp mới", value: `+${newLevel}`, inline: true },
               { name: "📈 Tỉ lệ cấp sau", value: `${(nextEff * 100).toFixed(0)}%`, inline: true },
               { name: "💰 Chi phí cấp sau", value: nextPay, inline: true }
             );

             await interaction.editReply({ 
                 embeds: [resEmbed], 
                 components: [
                     new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(newSelectMenu),
                     new ActionRowBuilder<ButtonBuilder>().addComponents(contBtn)
                 ] 
             });
          } else {
             // In case of failure or can't fetch, just show message and select menu
             await interaction.editReply({ embeds: [resEmbed], components: [row] });
             // Clear selected item id so they have to click select menu again, or keep it, keeping it is fine as button might be gone
          }
        }
      } catch (err) {
        console.error("Upgrade interaction error:", err);
      }
    });

    collector.on("end", () => {
      // Disable components when time is over
      interaction.editReply({ components: [] }).catch(() => {});
    });
  },
};
