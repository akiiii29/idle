import { AttachmentBuilder, EmbedBuilder, SlashCommandBuilder } from "discord.js";

import { DAILY_COOLDOWN_MS, HUNT_COOLDOWN_MS, requiredExpForLevel, computeCombatStats, TITLES } from "@game/core";
import { buildXpBar, formatDuration, getRemainingCooldown, getUserWithRelations } from "../services/user-service";
import { buildProfileCard } from "../utils/canvas-cards";
import { RARITY_BADGE } from "../utils/rpg-ui";
import type { SlashCommand } from "../types/command";

const INV_PREVIEW_MAX = 12;

export const profileCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Xem thẻ thợ săn, túi đồ và đội pet (chỉ số tổng; chi tiết dùng /stats).")
    .addStringOption((opt) =>
      opt.setName("hunter").setDescription("Tên thợ săn (để trống = bản thân).").setAutocomplete(true).setRequired(false)
    ) as any,

  async execute(interaction) {
    try {
      await interaction.deferReply();
      const hunterName = interaction.options.getString("hunter");
      const user = await getUserWithRelations(hunterName || interaction.user.id);

      if (!user) {
        await interaction.editReply({
          content: hunterName ? "Không tìm thấy thợ săn này." : "Bạn chưa đăng ký. Hãy dùng `/register` trước.",
        });
        return;
      }

      const displayName = user.username || "Thợ săn";
      const requiredExp = requiredExpForLevel(user.level);
      const topBeast = [...user.beasts].sort((a, b) => b.power - a.power)[0] ?? null;
      const huntCd = getRemainingCooldown(user.lastHunt, HUNT_COOLDOWN_MS);
      const dailyCd = getRemainingCooldown(user.lastDaily, DAILY_COOLDOWN_MS);
      const hospitalCd = user.hospitalUntil ? user.hospitalUntil.getTime() - Date.now() : 0;
      const tavernCd = user.tavernUntil ? user.tavernUntil.getTime() - Date.now() : 0;
      const equippedSkillCount = (user as any).skills?.filter((s: any) => s.isEquipped).length ?? 0;

      const equippedItems = user.inventory.filter((i: any) => i.isEquipped);
      const equippedPets = user.beasts.filter((b: any) => b.isEquipped);
      const statsBlock = computeCombatStats(user, equippedItems, equippedPets);
      const fin = statsBlock.final;

      const targetUserObj = await interaction.client.users.fetch(user.id).catch(() => interaction.user);
      const avatarUrl = targetUserObj.displayAvatarURL({ extension: "png", size: 256 });

      let equippedKeys: string[] = [];
      try {
        if (user.title) {
          equippedKeys = user.title.startsWith("[") ? JSON.parse(user.title) : [user.title];
        }
      } catch {
        /* ignore */
      }

      const RARITY_ORDER: Record<string, number> = {
        LEGENDARY: 4,
        EPIC: 3,
        RARE: 2,
        COMMON: 1,
      };

      const sortedTitles = equippedKeys
        .map((k) => TITLES.find((t) => t.key === k))
        .filter((t): t is (typeof TITLES)[number] => !!t)
        .sort((a, b) => (RARITY_ORDER[b.rarity] || 0) - (RARITY_ORDER[a.rarity] || 0));

      const displayTitle = sortedTitles.length > 0 ? sortedTitles[0]?.name || "" : "";

      const attachment = await buildProfileCard({
        username: displayName,
        avatarUrl,
        title: displayTitle,
        level: user.level,
        gold: user.gold,
        scrap: (user as any).scrap ?? 0,
        exp: user.exp,
        expRequired: requiredExp,
        currentHp: user.currentHp,
        maxHp: fin.maxHp,
        str: user.str,
        agi: user.agi,
        luck: user.luck,
        attack: fin.attack,
        defense: fin.defense,
        speed: fin.speed,
        topBeast: topBeast
          ? { name: topBeast.name, rarity: topBeast.rarity, power: topBeast.power }
          : null,
        equippedSkillCount,
        inventoryCount: user.inventory.length,
        inventoryLimit: (user as any).inventoryLimit ?? 50,
        petCount: user.beasts.length,
        equippedPetCount: equippedPets.length,
        huntReady: huntCd <= 0,
        dailyReady: dailyCd <= 0,
        isInHospital: hospitalCd > 0,
        isInTavern: tavernCd > 0,
        ...(huntCd > 0 ? { huntCdText: formatDuration(huntCd) } : {}),
        ...(dailyCd > 0 ? { dailyCdText: formatDuration(dailyCd) } : {}),
        ...(hospitalCd > 0 ? { hospitalText: formatDuration(hospitalCd) } : {}),
        ...(tavernCd > 0 ? { tavernText: formatDuration(tavernCd) } : {}),
      });

      const validInventory = user.inventory.filter((i: any) => i.quantity > 0);
      const invPreview = validInventory.slice(0, INV_PREVIEW_MAX);
      const invLines =
        invPreview.length > 0
          ? invPreview
              .map((i: any) => `${RARITY_BADGE[i.rarity as keyof typeof RARITY_BADGE] || "⚪"} **${i.name}** ×${i.quantity}`)
              .join("\n")
          : "*(Túi trống)*";
      const invMore =
        validInventory.length > INV_PREVIEW_MAX
          ? `\n_… và ${validInventory.length - INV_PREVIEW_MAX} dòng nữa (dùng \`/inven\`)._`
          : "";

      const xpBar = buildXpBar(user.exp, requiredExp);

      const petLines =
        equippedPets.length > 0
          ? equippedPets
              .sort((a: any, b: any) => (a.equipSlot || 0) - (b.equipSlot || 0))
              .map(
                (p: any) =>
                  `**Ô ${p.equipSlot ?? "?"}** · ${RARITY_BADGE[p.rarity as keyof typeof RARITY_BADGE] || ""} **${p.name}** · Lv.${p.level ?? 1} · ${p.power} pow`
              )
              .join("\n")
          : "Chưa trang bị pet ra trận.";

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setAuthor({ name: displayName, iconURL: avatarUrl })
        .setTitle("📇 Hồ sơ thợ săn")
        .setThumbnail(avatarUrl)
        .setDescription(
          `**Cấp ${user.level}** · ${xpBar}\n` +
            `💰 **${user.gold.toLocaleString("vi-VN")}** vàng · ♻️ **${((user as any).scrap ?? 0).toLocaleString("vi-VN")}** scrap\n` +
            `⚔️ **${fin.attack}** ATK · 🛡️ **${fin.defense}** DEF · 💨 **${fin.speed}** SPD\n` +
            `_Phân tích nguồn chỉ số: \`/stats\`_`
        )
        .addFields(
          { name: "🐾 Pet ra trận", value: petLines.slice(0, 1024), inline: true },
          {
            name: "🎒 Túi đồ (xem nhanh)",
            value: (invLines + invMore).slice(0, 1024),
            inline: true,
          },
          {
            name: "📦 Sức chứa",
            value: `${user.inventory.length} / ${(user as any).inventoryLimit ?? 50} ô`,
            inline: true,
          }
        )
        .setFooter({ text: "Ảnh đính kèm: thẻ hồ sơ · /inven · /stats" })
        .setTimestamp();

      await interaction.editReply({
        embeds: [embed],
        files: [attachment],
      });
    } catch (error) {
      console.error("profile command failed", error);
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: "Không thể tải hồ sơ. Thử lại sau một chút." });
      } else {
        await interaction.reply({ content: "Không thể tải hồ sơ. Thử lại sau một chút.", ephemeral: true });
      }
    }
  },
};
