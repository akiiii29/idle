import {
  AutocompleteInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { ItemType, Rarity } from "@prisma/client";
import type { SlashCommand } from "../types/command";
import { prisma } from "../services/prisma";
import {
  scrapAllUnequippedByRarity,
  scrapDuplicates,
  scrapOneItemUnit,
} from "../services/upgrade-service";

const GEAR = [ItemType.WEAPON, ItemType.ARMOR, ItemType.ACCESSORY];

export const scrapCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("scrap")
    .setDescription("Phân giải trang bị lấy Phế liệu (Scrap). 1 Scrap ≈ 5 vàng khi nâng cấp.")
    .addSubcommand((sub) =>
      sub
        .setName("item")
        .setDescription("Phân giải 1 đơn vị trang bị (tên hoặc ID). Phải tháo trước.")
        .addStringOption((o) =>
          o
            .setName("target")
            .setDescription("Tên hoặc ID vật phẩm")
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("rarity")
        .setDescription("Phân giải toàn bộ trang bị chưa đeo theo độ hiếm.")
        .addStringOption((o) =>
          o
            .setName("cap")
            .setDescription("Độ hiếm")
            .setRequired(true)
            .addChoices(
              { name: "Common", value: "COMMON" },
              { name: "Rare", value: "RARE" },
              { name: "Epic", value: "EPIC" },
              { name: "Legendary", value: "LEGENDARY" }
            )
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("duplicates")
        .setDescription(
          "Gom Scrap từ trùng tên (giữ món + cao nhất) hoặc xếp chồng quantity > 1."
        )
    ) as any,

  async autocomplete(interaction: AutocompleteInteraction) {
    const sub = interaction.options.getSubcommand();
    if (sub !== "item") {
      await interaction.respond([]);
      return;
    }
    const focused = interaction.options.getFocused().toLowerCase();
    const rows = await prisma.item.findMany({
      where: {
        ownerId: interaction.user.id,
        type: { in: GEAR },
        quantity: { gt: 0 },
      },
      take: 25,
      orderBy: { name: "asc" },
    });
    const choices = rows
      .filter((i) => i.name.toLowerCase().includes(focused))
      .slice(0, 25)
      .map((i) => ({
        name: `${i.name} (+${i.upgradeLevel})${i.isEquipped ? " [đang đeo]" : ""}`.slice(
          0,
          100
        ),
        value: i.id,
      }));
    await interaction.respond(choices.length ? choices : []);
  },

  async execute(interaction) {
    const userId = interaction.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      await interaction.reply({
        content: "Bạn chưa đăng ký. Dùng `/register` trước.",
        ephemeral: true,
      });
      return;
    }

    const sub = interaction.options.getSubcommand(true);

    if (sub === "item") {
      await interaction.deferReply();
      const target = interaction.options.getString("target", true);
      const res = await scrapOneItemUnit(userId, target);
      const embed = new EmbedBuilder()
        .setColor(res.ok ? 0x2ecc71 : 0xe74c3c)
        .setTitle(res.ok ? "♻️ Phân giải thành công" : "Không thể phân giải")
        .setDescription(res.message);
      if (res.ok) {
        const u = await prisma.user.findUnique({ where: { id: userId } });
        embed.setFooter({ text: `Scrap hiện có: ${u?.scrap ?? 0}` });
      }
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    if (sub === "rarity") {
      await interaction.deferReply();
      const cap = interaction.options.getString("cap", true) as Rarity;
      const res = await scrapAllUnequippedByRarity(userId, cap);
      const embed = new EmbedBuilder()
        .setColor(0xf1c40f)
        .setTitle("♻️ Phân giải theo độ hiếm")
        .setDescription(res.message);
      const u = await prisma.user.findUnique({ where: { id: userId } });
      embed.setFooter({ text: `Scrap hiện có: ${u?.scrap ?? 0}` });
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    if (sub === "duplicates") {
      await interaction.deferReply();
      const res = await scrapDuplicates(userId);
      const embed = new EmbedBuilder()
        .setColor(res.totalScrap > 0 ? 0x3498db : 0x95a5a6)
        .setTitle("♻️ Gom trùng lặp")
        .setDescription(res.message);
      const u = await prisma.user.findUnique({ where: { id: userId } });
      embed.setFooter({ text: `Scrap hiện có: ${u?.scrap ?? 0}` });
      await interaction.editReply({ embeds: [embed] });
    }
  },
};
