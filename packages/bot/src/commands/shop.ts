import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import type { SlashCommand } from "../types/command";
import { prisma } from "../services/prisma";
import {
  buyShopItem,
  getUserShop,
  refreshShopForUser,
  SHOP_REFRESH_GOLD,
  msUntilNextReset,
  getEquipmentShop,
  refreshEqShopForUser,
  buyEquipmentShopItem,
  buyDungeonItemBySlot,
  getDungeonPrepShop,
  buyDungeonPotion,
  CHEST_CATALOG,
  buyChestItem,
  getAccessoryShop,
  buyAccessoryShopItem,
  buyPet
} from "../services/shop-service";
import { RARITY_COLORS, RARITY_BADGE } from "../utils/rpg-ui";
import { formatDuration } from "../services/user-service";
import { PET_CONFIGS } from "@game/core";
import { describeAccessoryForShop, type AccessoryConfig } from "@game/core";

const TIER_BADGE: Record<number, string> = {
  1: "⚪ Hạng 1",
  2: "🟡 Hạng 2",
  3: "🟠 Hạng 3",
};

export const shopCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("Xem và mua vật phẩm hằng ngày từ thương nhân lưu động.") as any,

  async execute(interaction) {
    await interaction.deferReply();
    const userId = interaction.user.id;
    await renderMainShop(interaction, userId);
  },
};

async function renderMainShop(interaction: any, userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const embed = new EmbedBuilder()
      .setColor(0xe67e22)
      .setTitle("🛒 Thương nhân lưu động")
      .setDescription(`Chào mừng trở lại, **${user?.username || "Thợ săn"}**! Bạn muốn xem loại hàng hóa nào hôm nay?\n\n💰 Vàng hiện có: **${user?.gold ?? 0}**`);

    const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`shop_cat:consumables:${userId}`).setLabel("🍎 Vật phẩm").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(`shop_cat:equipment:${userId}`).setLabel("⚔️ Trang bị").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`shop_cat:accessories:${userId}`).setLabel("💍 Phụ kiện").setStyle(ButtonStyle.Primary)
    );
    const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`shop_cat:pets:${userId}`).setLabel("🐾 Chợ Sủng Vật").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`shop_cat:chests:${userId}`).setLabel("🎁 Rương báu").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`shop_cat:dungeon:${userId}`).setLabel("🏰 Hầm ngục").setStyle(ButtonStyle.Danger)
    );

    await interaction.editReply({ embeds: [embed], components: [row1, row2] });
}

export async function handleShopButton(interaction: any): Promise<boolean> {
  const customId = interaction.customId;
  const isSelectMenu = interaction.isStringSelectMenu();
  if (typeof customId !== "string" && !isSelectMenu) return false;

  const match = isSelectMenu ? null : customId.match(/^(shop_cat|shop_buy|shop_refresh|eqshop_buy|eqshop_refresh|dungeon_buy_item|dungeon_buy_potion|shop_chest_buy|accshop_buy|shop_back|pet_filter|pet_buy_select):(.*)$/);
  if (!isSelectMenu && !match) return false;

  const action = isSelectMenu ? interaction.customId : match![1];
  const payload = isSelectMenu ? interaction.values[0] : match![2];

  if (!action) return false;

  const parts = payload.split(":");
  let ownerId = "";

  if (action === "pet_buy_select") {
      ownerId = parts[0];
  } else if (parts.length >= 2 && (action === "shop_cat" || action === "pet_filter" || action.startsWith("dungeon_buy_") || action === "shop_chest_buy")) {
      ownerId = parts[1] ?? "";
  } else {
      ownerId = parts[0] ?? "";
  }

  if (interaction.user.id !== ownerId) {
    if (!interaction.replied) await interaction.reply({ content: "Đây không phải phiên của bạn!", ephemeral: true });
    return true;
  }

  // Categories Navigation
  if (action === "shop_cat") {
    await interaction.deferUpdate();
    if (parts[0] === "consumables") await renderConsumableShop(interaction, ownerId);
    else if (parts[0] === "equipment") await renderEquipmentShop(interaction, ownerId);
    else if (parts[0] === "dungeon") await renderDungeonShop(interaction, ownerId);
    else if (parts[0] === "chests") await renderChestShop(interaction, ownerId);
    else if (parts[0] === "accessories") await renderAccessoryShop(interaction, ownerId);
    else if (parts[0] === "pets") await renderPetShop(interaction, ownerId, "ALL");
    return true;
  }

  if (action === "pet_filter") {
    await interaction.deferUpdate();
    await renderPetShop(interaction, ownerId, parts[0]);
    return true;
  }

  if (action === "pet_buy_select") {
      const petName = parts[1];
      const result = await buyPet(ownerId, petName);
      await interaction.reply({ content: result.message, ephemeral: true });
      return true;
  }

  if (action === "shop_refresh") {
    await interaction.deferUpdate();
    const result = await refreshShopForUser(ownerId);
    if (!result.success) { await interaction.followUp({ content: `❌ ${result.message}`, ephemeral: true }); return true; }
    await renderConsumableShop(interaction, ownerId);
    return true;
  }

  if (action === "shop_buy") {
    await interaction.deferUpdate();
    const slot = Number(parts[1]);
    const result = await buyShopItem(ownerId, slot);
    if (!result.success) { await interaction.followUp({ content: `❌ ${result.message}`, ephemeral: true }); return true; }
    await renderConsumableShop(interaction, ownerId);
    await interaction.followUp({ content: `✅ Bạn đã mua **${result.item!.emoji} ${result.item!.name}**!`, ephemeral: true });
    return true;
  }

  if (action === "eqshop_refresh") {
    await interaction.deferUpdate();
    const result = await refreshEqShopForUser(ownerId);
    if (!result.success) { await interaction.followUp({ content: `❌ ${result.message}`, ephemeral: true }); return true; }
    await renderEquipmentShop(interaction, ownerId);
    return true;
  }

  if (action === "eqshop_buy") {
    await interaction.deferUpdate();
    const slot = Number(parts[1]);
    const result = await buyEquipmentShopItem(ownerId, slot);
    if (!result.success) { await interaction.followUp({ content: `❌ ${result.message}`, ephemeral: true }); return true; }
    await renderEquipmentShop(interaction, ownerId);
    await interaction.followUp({ content: `✅ ${result.message}`, ephemeral: true });
    return true;
  }

  if (action === "dungeon_buy_potion") {
    await interaction.deferUpdate();
    const qty = parseInt(parts[0] || "1");
    const res = await buyDungeonPotion(ownerId, qty);
    await interaction.followUp({ content: res.message, ephemeral: true });
    await renderDungeonShop(interaction, ownerId);
    return true;
  }

  if (action === "dungeon_buy_item") {
    await interaction.deferUpdate();
    const slot = parseInt(parts[0] || "11");
    const res = await buyDungeonItemBySlot(ownerId, slot);
    await interaction.followUp({ content: res.message, ephemeral: true });
    await renderDungeonShop(interaction, ownerId);
    return true;
  }

  if (action === "shop_chest_buy") {
    await interaction.deferUpdate();
    const key = parts[0]!;
    const res = await buyChestItem(ownerId, key);
    await interaction.followUp({ content: res.message, ephemeral: true });
    await renderChestShop(interaction, ownerId);
    return true;
  }

  if (action === "accshop_buy") {
    await interaction.deferUpdate();
    const slot = Number(parts[1]);
    const result = await buyAccessoryShopItem(ownerId, slot);
    if (!result.success) { await interaction.followUp({ content: `❌ ${result.message}`, ephemeral: true }); return true; }
    await renderAccessoryShop(interaction, ownerId);
    await interaction.followUp({ content: `✅ ${result.message}`, ephemeral: true });
    return true;
  }

  if (action === "shop_back" || customId.startsWith("shop_back:")) {
    await interaction.deferUpdate();
    await renderMainShop(interaction, ownerId);
    return true;
  }

  return true;
}

// ─── Render Helpers ──────────────────────────────────────────────────

async function renderConsumableShop(interaction: any, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const { listings, listing } = await getUserShop(userId);
  const resetMs = msUntilNextReset();
  const canRefresh = (user?.gold ?? 0) >= SHOP_REFRESH_GOLD;

  const embed = new EmbedBuilder()
    .setColor(0xe67e22)
    .setTitle("🍎 Cửa hàng Vật phẩm")
    .setDescription(`💰 Vàng của bạn: **${user?.gold ?? 0}**\n🔄 Làm mới sau: ${formatDuration(resetMs)}`);

  listings.forEach((it, i) => {
    const soldOut = listing[i]!.purchased;
    embed.addFields({
      name: `Vị trí ${i + 1} — ${it.emoji} ${it.name} ${soldOut ? "*(Hết hàng)*" : ""}`,
      value: `${TIER_BADGE[it.tier] ?? "⚪"}\n📖 ${it.description}\n💰 Giá: **${it.price} v**`,
      inline: false,
    });
  });

  const buyRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    listings.map((it, idx) => {
      const soldOut = listing[idx]!.purchased;
      return new ButtonBuilder()
        .setCustomId(`shop_buy:${userId}:${idx + 1}`)
        .setLabel(soldOut ? `Hết hàng` : `🛒 Mua ${it.name}`)
        .setStyle(soldOut ? ButtonStyle.Secondary : ButtonStyle.Primary)
        .setDisabled(soldOut);
    })
  );

  const navRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(`shop_refresh:${userId}`).setLabel(`🔄 Làm mới (${SHOP_REFRESH_GOLD}v)`).setStyle(ButtonStyle.Danger).setDisabled(!canRefresh),
    new ButtonBuilder().setCustomId(`shop_back:${userId}`).setLabel("⬅️ Quay lại").setStyle(ButtonStyle.Secondary)
  );

  await interaction.editReply({ embeds: [embed], components: [buyRow, navRow] });
}

async function renderEquipmentShop(interaction: any, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const session = await getEquipmentShop(userId);
  const canRefresh = (user?.gold ?? 0) >= SHOP_REFRESH_GOLD;

  const embed = new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle("⚔️ Cửa hàng Trang bị")
    .setDescription(`💰 Vàng của bạn: **${user?.gold ?? 0}**\nTrang bị theo cấp độ: **Level ${user?.level ?? 1}**`);

  session.items.forEach((entry, i) => {
    const it = entry.item;
    const soldOut = entry.purchased;
    embed.addFields({
      name: `Vị trí ${i + 1} — ${it.name} ${soldOut ? "*(Đã mua)*" : ""}`,
      value: `${RARITY_BADGE[it.rarity as keyof typeof RARITY_BADGE] ?? "⚪"}\n💰 Giá: **${entry.price} v**`,
      inline: false,
    });
  });

  const buyRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    session.items.map((entry, idx) => 
      new ButtonBuilder()
        .setCustomId(`eqshop_buy:${userId}:${idx + 1}`)
        .setLabel(entry.purchased ? "Đã mua" : `🛒 Mua ${entry.item.name}`)
        .setStyle(entry.purchased ? ButtonStyle.Secondary : ButtonStyle.Primary)
        .setDisabled(entry.purchased)
    )
  );

  const navRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(`eqshop_refresh:${userId}`).setLabel(`🔄 Làm mới (${SHOP_REFRESH_GOLD}v)`).setStyle(ButtonStyle.Danger).setDisabled(!canRefresh),
    new ButtonBuilder().setCustomId(`shop_back:${userId}`).setLabel("⬅️ Quay lại").setStyle(ButtonStyle.Secondary)
  );

  await interaction.editReply({ embeds: [embed], components: [buyRow, navRow] });
}

async function renderPetShop(interaction: any, userId: string, rarity: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const allPets = Object.values(PET_CONFIGS);
    
    const rarityOrder: any = { EPIC: 3, RARE: 2, COMMON: 1 };
    
    // Filter out legendary and only include matching rarity
    const filteredPets = allPets
        .filter(p => (rarity === "ALL" || p.rarity === rarity) && p.rarity !== "LEGENDARY")
        .sort((a,b) => {
            // First by rarity
            const rDiff = (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
            if (rDiff !== 0) return rDiff;
            // Then by power
            return b.skillPower - a.skillPower;
        });
    
    // Sort logic for "5 strongest" (already handled by the sort above)
    const topPets = filteredPets.slice(0, 5);
    const priceMap: any = { COMMON: 100, RARE: 1000, EPIC: 5000 };

    const embed = new EmbedBuilder()
        .setColor(rarity === "ALL" ? 0x2ecc71 : (RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] || 0x2ecc71))
        .setTitle(`🐾 Chợ Sủng Vật — ${rarity === "ALL" ? "Hàng Mới Về" : `Phẩm Cấp ${rarity}`}`)
        .setDescription(`💰 Vàng: **${user?.gold ?? 0}**\nNơi giao lưu và nhận nuôi những sủng vật trung thành.`);

    if (topPets.length > 0) {
        topPets.forEach(p => {
            embed.addFields({ 
                name: `${RARITY_BADGE[p.rarity as keyof typeof RARITY_BADGE]} ${p.name}`, 
                value: `📖 ${p.description}\n💰 Giá: **${priceMap[p.rarity]}v**`, 
                inline: false 
            });
        });
    } else {
        embed.setDescription("Không có sủng vật nào thuộc cấp này đang được bán.");
    }

    const filterRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        ["ALL", "COMMON", "RARE", "EPIC"].map(r => 
            new ButtonBuilder()
                .setCustomId(`pet_filter:${r}:${userId}`)
                .setLabel(r === "ALL" ? "Tất cả" : r)
                .setStyle(rarity === r ? ButtonStyle.Success : ButtonStyle.Secondary)
        )
    );

    const components: any[] = [filterRow];

    if (filteredPets.length > 0) {
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("pet_buy_select")
            .setPlaceholder("Chọn sủng vật muốn mua...");

        filteredPets.slice(0, 24).forEach(p => {
            selectMenu.addOptions(new StringSelectMenuOptionBuilder()
                .setLabel(`${p.name} (${p.rarity})`)
                .setDescription(`Giá: ${priceMap[p.rarity]}v | ${p.role}`)
                .setValue(`${userId}:${p.name}`)
            );
        });
        components.push(new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu));
    }

    components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId(`shop_back:${userId}`).setLabel("⬅️ Quay lại").setStyle(ButtonStyle.Secondary)
    ));

    await interaction.editReply({ embeds: [embed], components });
}

async function renderDungeonShop(interaction: any, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const { listings, listing } = await getDungeonPrepShop(userId);
  
  const embed = new EmbedBuilder().setColor(0xe74c3c).setTitle("🏰 Tiếp vận Hầm ngục")
    .setDescription(`💰 Vàng: **${user?.gold ?? 0}**\nChuẩn bị trước khi vào nơi tăm tối.`);

  embed.addFields({ name: `🧪 Potion hồi máu`, value: `💰 Giá: **60v/bình**`, inline: false });

  listings.forEach((it, idx) => {
    const soldOut = listing[idx]!.purchased;
    embed.addFields({ name: `Buff ${idx + 1} — ${it.name} ${soldOut ? "*(Hết)*" : ""}`, value: `📖 ${it.description}\n💰 Giá: **${it.price} v**`, inline: false });
  });

  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(`dungeon_buy_potion:1:${userId}`).setLabel("🛒 Mua x1 Potion").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`dungeon_buy_potion:3:${userId}`).setLabel("🛒 Mua x3 Potion").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`dungeon_buy_potion:5:${userId}`).setLabel("🛒 Mua x5 Potion").setStyle(ButtonStyle.Primary)
  );

  const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    listings.map((it, idx) => new ButtonBuilder().setCustomId(`dungeon_buy_item:${listing[idx]!.slot}:${userId}`).setLabel(listing[idx]!.purchased ? "Hết" : `Mua ${it.name}`).setStyle(ButtonStyle.Secondary).setDisabled(listing[idx]!.purchased))
  );

  const row3 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(`shop_back:${userId}`).setLabel("⬅️ Quay lại").setStyle(ButtonStyle.Secondary)
  );

  await interaction.editReply({ embeds: [embed], components: [row1, row2, row3] });
}

async function renderChestShop(interaction: any, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const embed = new EmbedBuilder().setColor(0x9b59b6).setTitle("🎁 Cửa hàng Rương báu").setDescription(`💰 Vàng: **${user?.gold ?? 0}**`);

  CHEST_CATALOG.forEach((it) => embed.addFields({ name: `${it.emoji} ${it.name}`, value: `📖 ${it.description}\n💰 Giá: **${it.price} v**`, inline: false }));

  const buyRow = new ActionRowBuilder<ButtonBuilder>().addComponents(CHEST_CATALOG.map((it) => new ButtonBuilder().setCustomId(`shop_chest_buy:${it.key}:${userId}`).setLabel(`Mua ${it.name}`).setStyle(ButtonStyle.Primary)));
  const navRow = new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`shop_back:${userId}`).setLabel("⬅️ Quay lại").setStyle(ButtonStyle.Secondary));

  await interaction.editReply({ embeds: [embed], components: [buyRow, navRow] });
}

async function renderAccessoryShop(interaction: any, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const { items, listings } = await getAccessoryShop(userId);
  const resetMs = msUntilNextReset();

  const embed = new EmbedBuilder().setColor(0x9b59b6).setTitle("💍 Cửa hàng Phụ kiện").setDescription(`💰 Vàng: **${user?.gold ?? 0}**\n🔄 Reset sau: ${formatDuration(resetMs)}`);

  items.forEach((it: AccessoryConfig & { price: number }, i) => {
    const soldOut = listings[i]!.purchased;
    let detail = describeAccessoryForShop(it);
    if (detail.length > 1010) {
      detail = detail.slice(0, 990) + "\n… *(mô tả rút gọn — đeo vào rồi xem `/stats` để đủ dòng)*";
    }
    embed.addFields({
      name: `Vị trí ${i + 1} — ${it.name} ${soldOut ? "*(Hết)*" : ""}`,
      value: `${RARITY_BADGE[it.rarity as keyof typeof RARITY_BADGE]}\n💰 Giá: **${it.price}** vàng\n\n${detail}`,
      inline: false,
    });
  });

  const buyRow = new ActionRowBuilder<ButtonBuilder>().addComponents(items.map((it: any, idx: number) => new ButtonBuilder().setCustomId(`accshop_buy:${userId}:${listings[idx]!.slot}`).setLabel(listings[idx]!.purchased ? "Hết" : `Mua ${it.name}`).setStyle(ButtonStyle.Primary).setDisabled(listings[idx]!.purchased)));
  const navRow = new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`shop_back:${userId}`).setLabel("⬅️ Quay lại").setStyle(ButtonStyle.Secondary));

  await interaction.editReply({ embeds: [embed], components: [buyRow, navRow] });
}
