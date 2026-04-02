import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import type { SlashCommand } from "../types/command";
import { prisma } from "../services/prisma";
import {
  buyShopItem,
  getCatalogEntry,
  getUserShop,
  refreshShopForUser,
  SHOP_REFRESH_GOLD,
  msUntilNextUTCMidnight,
} from "../services/shop-service";
import { formatDuration } from "../services/user-service";

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
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      await interaction.editReply({
        content: "Bạn chưa đăng ký. Hãy dùng `/register` trước.",
      });
      return;
    }

    const { listings, listing } = await getUserShop(userId);
    const allSoldOut = listing.every((row) => row.purchased);
    const canRefresh = user.gold >= SHOP_REFRESH_GOLD;

    const resetMs = msUntilNextUTCMidnight();

    const embed = new EmbedBuilder()
      .setColor(0xe67e22)
      .setTitle("🛒 Thương nhân lưu động")
      .setDescription(
        `*"Hàng mới, giá công bằng!"*\n\n` +
          `💰 **Vàng của bạn:** ${user.gold}\n` +
          `🔄 **Làm mới sau:** ${formatDuration(resetMs)}\n\n` +
          `Bấm nút bên dưới để mua vật phẩm. Nút làm mới sẽ thay thế toàn bộ 5 vị trí.`
      )
      .setFooter({ text: "Cửa hàng làm mới mỗi ngày lúc 00:00 UTC." });

    for (let i = 0; i < listings.length; i++) {
      const item = listings[i]!;
      const row = listing[i]!;
      const soldOut = row.purchased;

      embed.addFields({
        name: `Vị trí ${i + 1} — ${item.emoji} ${item.name} ${soldOut ? "*(Hết hàng)*" : ""}`,
        value:
          `${TIER_BADGE[item.tier]}\n` +
          `📖 ${item.description}\n` +
          `💰 Giá: **${item.price} Vàng**`,
        inline: false,
      });
    }

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      ...listings.map((item, idx) => {
        const soldOut = listing[idx]!.purchased;
        return new ButtonBuilder()
          .setCustomId(`shop_buy:${userId}:${idx + 1}`)
          .setLabel(
            soldOut ? `Vị trí ${idx + 1} — Hết hàng` : `Mua: ${item.emoji} ${item.name} (${item.price}v)`
          )
          .setStyle(soldOut ? ButtonStyle.Secondary : ButtonStyle.Primary)
          .setDisabled(soldOut);
      })
    );

    const refreshRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`shop_refresh:${userId}`)
        .setLabel(`🔄 Làm mới (${SHOP_REFRESH_GOLD}v)`)
        .setStyle(ButtonStyle.Danger)
        .setDisabled(!canRefresh)
    );

    await interaction.editReply({ embeds: [embed], components: [row, refreshRow] });
  },
};

/** Handle shop buy button interactions — call from index.ts */
export async function handleShopButton(interaction: any): Promise<boolean> {
  if (!interaction.customId?.startsWith("shop_buy:") && !interaction.customId?.startsWith("shop_refresh:")) return false;

  if (interaction.customId.startsWith("shop_refresh:")) {
    const [, ownerId] = interaction.customId.split(":") as string[];

    if (interaction.user.id !== ownerId) {
      await interaction.reply({ content: "Đây không phải cửa hàng của bạn!", ephemeral: true });
      return true;
    }

    await interaction.deferUpdate();
    const result = await refreshShopForUser(interaction.user.id);
    if (!result.success) {
      await interaction.followUp({ content: `❌ ${result.message}`, ephemeral: true });
      return true;
    }

    const user = await prisma.user.findUnique({ where: { id: interaction.user.id } });
    const { listings, listing } = await getUserShop(interaction.user.id);
    const resetMs = msUntilNextUTCMidnight();

    const allSoldOut = listing.every((row) => row.purchased);
    const canRefresh = (user?.gold ?? 0) >= SHOP_REFRESH_GOLD;

    const embed = new EmbedBuilder()
      .setColor(0xe67e22)
      .setTitle("🛒 Thương nhân lưu động")
      .setDescription(
        `*"Hoan nghênh giao dịch!"*\n\n` +
          `💰 **Vàng của bạn:** ${user?.gold ?? "?"}\n` +
          `🔄 **Làm mới sau:** ${formatDuration(resetMs)}`
      )
      .setFooter({ text: "Cửa hàng làm mới mỗi ngày lúc 00:00 UTC." });

    for (let i = 0; i < listings.length; i++) {
      const it = listings[i]!;
      const row = listing[i]!;
      const soldOut = row.purchased;
      embed.addFields({
        name: `Vị trí ${i + 1} — ${it.emoji} ${it.name} ${soldOut ? "*(Hết hàng)*" : ""}`,
        value:
          `${TIER_BADGE[it.tier] ?? "⚪"}\n` +
          `📖 ${it.description}\n` +
          `💰 Giá: **${it.price} Vàng**`,
        inline: false,
      });
    }

    const buyRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      ...listings.map((it, idx) => {
        const soldOut = listing[idx]!.purchased;
        return new ButtonBuilder()
          .setCustomId(`shop_buy:${interaction.user.id}:${idx + 1}`)
          .setLabel(
            soldOut ? `Vị trí ${idx + 1} — Hết hàng` : `Mua: ${it.emoji} ${it.name} (${it.price}v)`
          )
          .setStyle(soldOut ? ButtonStyle.Secondary : ButtonStyle.Primary)
          .setDisabled(soldOut);
      })
    );

    const refreshRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`shop_refresh:${interaction.user.id}`)
        .setLabel(`🔄 Làm mới (${SHOP_REFRESH_GOLD}v)`)
        .setStyle(ButtonStyle.Danger)
        .setDisabled(!canRefresh)
    );

    await interaction.editReply({ embeds: [embed], components: [buyRow, refreshRow] });

    return true;
  }

  const [, ownerId, slotStr] = interaction.customId.split(":") as string[];
  const slot = Number(slotStr);

  if (interaction.user.id !== ownerId) {
    await interaction.reply({
      content: "Đây không phải cửa hàng của bạn!",
      ephemeral: true,
    });
    return true;
  }

  await interaction.deferUpdate();

  const result = await buyShopItem(interaction.user.id, slot);

  if (!result.success) {
    await interaction.followUp({ content: `❌ ${result.message}`, ephemeral: true });
    return true;
  }

  const item = result.item!;

  // Refresh embed
  const user = await prisma.user.findUnique({ where: { id: interaction.user.id } });
  const { listings, listing } = await getUserShop(interaction.user.id);
  const resetMs = msUntilNextUTCMidnight();
  const allSoldOut = listing.every((row) => row.purchased);
  const canRefresh = (user?.gold ?? 0) >= SHOP_REFRESH_GOLD && !allSoldOut;

  const embed = new EmbedBuilder()
    .setColor(0xe67e22)
      .setTitle("🛒 Thương nhân lưu động")
    .setDescription(
        `*"Hoan nghênh giao dịch!"*\n\n` +
          `💰 **Vàng của bạn:** ${user?.gold ?? "?"}\n` +
          `🔄 **Làm mới sau:** ${formatDuration(resetMs)}`
    )
      .setFooter({ text: "Cửa hàng làm mới mỗi ngày lúc 00:00 UTC." });

  for (let i = 0; i < listings.length; i++) {
    const it = listings[i]!;
    const row = listing[i]!;
    const soldOut = row.purchased;
    embed.addFields({
      name: `Vị trí ${i + 1} — ${it.emoji} ${it.name} ${soldOut ? "*(Hết hàng)*" : ""}`,
      value:
        `${TIER_BADGE[it.tier] ?? "⚪"}\n` +
        `📖 ${it.description}\n` +
        `💰 Giá: **${it.price} Vàng**`,
      inline: false,
    });
  }

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    ...listings.map((it, idx) => {
      const soldOut = listing[idx]!.purchased;
      return new ButtonBuilder()
        .setCustomId(`shop_buy:${interaction.user.id}:${idx + 1}`)
        .setLabel(
          soldOut ? `Vị trí ${idx + 1} — Hết hàng` : `Mua: ${it.emoji} ${it.name} (${it.price}v)`
        )
        .setStyle(soldOut ? ButtonStyle.Secondary : ButtonStyle.Primary)
        .setDisabled(soldOut);
    })
  );

  const refreshRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`shop_refresh:${interaction.user.id}`)
      .setLabel(`🔄 Làm mới (${SHOP_REFRESH_GOLD}v)`)
      .setStyle(ButtonStyle.Danger)
      .setDisabled(!canRefresh)
  );

  await interaction.editReply({ embeds: [embed], components: [row, refreshRow] });

  await interaction.followUp({
    content: `✅ Bạn đã mua **${item.emoji} ${item.name}** với **${item.price} Vàng**!`,
    ephemeral: true,
  });

  return true;
}
