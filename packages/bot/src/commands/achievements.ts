import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  type ButtonInteraction
} from "discord.js";
import { claimAchievementReward, getOrCreateUserAchievements } from "../services/achievement-service";
import { getUserWithRelations } from "../services/user-service";
import type { SlashCommand } from "../types/command";
import { TITLES, type TitleRarity } from "@game/core";
import { prisma } from "../services/prisma";
import { RARITY_BADGE } from "../utils/rpg-ui";

/**
 * Map effect types to human readable strings
 */
const EFFECT_DESC_MAP: Record<string, string> = {
  damage: "Sát thương gốc",
  critDamage: "Sát thương chí mạng",
  burnDamage: "Sát thương thiêu đốt",
  poisonDamage: "Sát thương độc",
  lifesteal: "Hiệu quả hút máu",
  goldGain: "Nhận thêm vàng",
  petPower: "Sức mạnh Pet",
  procChance: "Tỉ lệ tung kỹ năng"
};

const TITLE_LIMITS: Record<string, number> = {
  COMMON: 3,
  RARE: 3,
  EPIC: 2,
  LEGENDARY: 1
};

export const achievementsCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("achievements")
    .setDescription("Xem danh hiệu, thành tựu và quản lý trang bị.") as any,

  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });
      const { embed, rows } = await renderAchievementsView(interaction.user.id, "PROGRESS");
      await interaction.editReply({ embeds: [embed], components: rows });
    } catch (error) {
      console.error("achievements command failed", error);
      if (interaction.deferred) await interaction.editReply("Không thể tải thành tựu.");
    }
  }
};

// ==========================================
// 1. RENDER LOGIC
// ==========================================

export async function renderAchievementsView(userId: string, view: "PROGRESS" | "TITLES", filter: string = "ALL") {
  const user = await getUserWithRelations(userId);
  if (!user) throw new Error("User not found");

  let unlockedTitles: string[] = [];
  try { unlockedTitles = JSON.parse(user.unlockedTitles || "[]"); } catch(e) {}

  let equippedKeys: string[] = [];
  try {
    if (user.title) {
      equippedKeys = user.title.startsWith("[") ? JSON.parse(user.title) : [user.title];
    }
  } catch (e) {}

  const embed = new EmbedBuilder();
  const rows: any[] = [];

  // --- TOP NAVIGATION ---
  const navRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`achv_nav_${userId}_PROGRESS`)
      .setLabel("📊 Mốc Tiến Độ")
      .setStyle(view === "PROGRESS" ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`achv_nav_${userId}_TITLES`)
      .setLabel("👑 Kho Danh Hiệu")
      .setStyle(view === "TITLES" ? ButtonStyle.Primary : ButtonStyle.Secondary)
  );
  rows.push(navRow);

  const slotSummary = `• **C**: ${TITLE_LIMITS.COMMON} | **R**: ${TITLE_LIMITS.RARE} | **E**: ${TITLE_LIMITS.EPIC} | **L**: ${TITLE_LIMITS.LEGENDARY}`;
  embed.setFooter({ text: `Giới hạn trang bị: ${slotSummary}` });

  if (view === "PROGRESS") {
    embed.setColor(0xffd700)
      .setTitle(`🏆 Thành tựu của ${user.username}`)
      .setDescription("Hoàn thành các nhiệm vụ đặc biệt để mở khóa Danh Hiệu độc quyền.");

    const userQuests = await getOrCreateUserAchievements(userId);
    const claimableRow = new ActionRowBuilder<ButtonBuilder>();

    // Detailed stats for equipped
    if (equippedKeys.length > 0) {
      const activeDetails = equippedKeys.map(k => {
        const d = TITLES.find(t => t.key === k);
        return d ? `• **${d.name}**: +${Math.round(d.effectValue * 100)}% ${EFFECT_DESC_MAP[d.effectType]}` : "";
      }).filter(t => t !== "").join("\n");
      embed.addFields({ name: "🏅 Đang trang bị", value: activeDetails || "Chưa trang bị" });
    }

    // List top achievements
    const achvLines = userQuests.map(uq => {
        const titleDef = TITLES.find(t => t.key === uq.quest.titleReward);
        const pStr = uq.isCompleted ? "✅ Hoàn thành" : `⏳ ${uq.progress}/${uq.quest.target}`;
        const sStr = uq.isClaimed ? "👑 Đã nhận" : pStr;
        
        if (uq.isCompleted && !uq.isClaimed && claimableRow.components.length < 5) {
            claimableRow.addComponents(
                new ButtonBuilder()
                    .setCustomId(`claim_achv:${uq.id}`)
                    .setLabel(`Nhận ${titleDef?.name || "???"}`)
                    .setStyle(ButtonStyle.Success)
            );
        }
        return `**${uq.quest.description}**\n> *${sStr}* — [${titleDef?.name || "???"}]`;
    });

    const CHUNK = 5;
    achvLines.slice(0, 10).forEach((line, idx) => {
        if (idx % CHUNK === 0) embed.addFields({ name: idx === 0 ? "Nhiệm vụ" : "\u200B", value: achvLines.slice(idx, idx + CHUNK).join("\n") });
    });

    if (claimableRow.components.length > 0) rows.push(claimableRow);

  } else {
    // TITLES VIEW
    embed.setColor(0x9b59b6)
      .setTitle(`👑 Kho Danh Hiệu — ${user.username}`)
      .setDescription("Trang bị danh hiệu để nhận chỉ số cộng thêm. Phẩm cấp càng cao, giới hạn trang bị càng ít.");

    // Filter Row
    const filterRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        ["ALL", "COMMON", "RARE", "EPIC", "LEGENDARY"].map(r => 
            new ButtonBuilder()
                .setCustomId(`achv_nav_${userId}_TITLES_${r}`) // THIS IS STILL NAV, but unique because of the suffix
                .setLabel(r === "ALL" ? "Tất cả" : r)
                .setStyle(filter === r ? ButtonStyle.Success : ButtonStyle.Secondary)
        )
    );
    rows.push(filterRow);

    // Grouping
    const filteredTitles = unlockedTitles
        .map(k => TITLES.find(t => t.key === k)!)
        .filter(t => t && (filter === "ALL" || t.rarity === filter));

    if (filteredTitles.length === 0) {
        embed.addFields({ name: "Trống", value: "Bạn chưa mở khóa danh hiệu nào thuộc phẩm cấp này." });
    } else {
        const rarityGroups = new Map<string, string[]>();
        
        filteredTitles.forEach(t => {
            if (!t) return;
            const current = rarityGroups.get(t.rarity) || [];
            const isEquipped = equippedKeys.includes(t.key) ? " ✅" : "";
            const rarityKey = t.rarity as keyof typeof RARITY_BADGE;
            const badge = (RARITY_BADGE as any)[rarityKey] || "⚪";
            const val = `${badge} **${t.name}**${isEquipped}\n> *+${Math.round(t.effectValue*100)}% ${EFFECT_DESC_MAP[t.effectType]}*`;
            current.push(val);
            rarityGroups.set(t.rarity, current);
        });

        rarityGroups.forEach((list, rarity) => {
            embed.addFields({ name: `✨ phầm cấp ${rarity}`, value: list.slice(0, 10).join("\n") });
        });

        // Select Menu
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("select_equip_title")
            .setPlaceholder("Chọn danh hiệu để Trang bị/Tháo...");
        
        selectMenu.addOptions(new StringSelectMenuOptionBuilder().setLabel("Tháo toàn bộ").setValue("none"));
        filteredTitles.slice(0, 24).forEach(t => {
            selectMenu.addOptions(new StringSelectMenuOptionBuilder()
                .setLabel(`${t.name}${equippedKeys.includes(t.key) ? " [ĐANG MANG]" : ""}`)
                .setDescription(`${EFFECT_DESC_MAP[t.effectType]} +${Math.round(t.effectValue*100)}%`)
                .setValue(t.key)
            );
        });
        rows.push(new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu));
    }
  }

  return { embed, rows };
}

// ==========================================
// 2. HANDLERS
// ==========================================

export async function handleAchievementNav(interaction: ButtonInteraction): Promise<boolean> {
    if (!interaction.customId.startsWith("achv_nav_")) return false;
    const parts = interaction.customId.split("_");
    const userId = parts[2];
    const view = parts[3] as "PROGRESS" | "TITLES";
    const filter = parts[4] || "ALL";

    if (interaction.user.id !== userId) {
        await interaction.reply({ content: "Đây là bảng thành tựu của người khác.", ephemeral: true });
        return true;
    }

    try {
        await interaction.deferUpdate();
        const { embed, rows } = await renderAchievementsView(userId, view, filter);
        await interaction.editReply({ embeds: [embed], components: rows });
    } catch (e) {
        console.error("nav error", e);
    }
    return true;
}

export async function handleAchievementClaim(interaction: ButtonInteraction): Promise<boolean> {
  if (!interaction.customId.startsWith("claim_achv:")) return false;
  const userQuestId = interaction.customId.replace("claim_achv:", "");
  
  try {
    const quest = await claimAchievementReward(interaction.user.id, userQuestId);
    await interaction.reply({ content: `🎉 Đã nhận danh hiệu từ: **${quest.description}**!`, ephemeral: true });
    // Update view
    const { embed, rows } = await renderAchievementsView(interaction.user.id, "PROGRESS");
    await interaction.editReply({ embeds: [embed], components: rows });
  } catch (error: any) {
    await interaction.reply({ content: `❌ ${error.message}`, ephemeral: true });
  }
  return true;
}

export async function handleAchievementSelect(interaction: any): Promise<boolean> {
  if (!interaction.isStringSelectMenu()) return false;
  if (interaction.customId !== "select_equip_title") return false;

  const selectedKey = interaction.values[0];
  const userId = interaction.user.id;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return true;

    let equipped: string[] = [];
    try {
        if (user.title) equipped = user.title.startsWith("[") ? JSON.parse(user.title) : [user.title];
    } catch (e) {}

    if (selectedKey === "none") {
      await prisma.user.update({ where: { id: userId }, data: { title: "[]" } });
    } else {
        const titleDef = TITLES.find(t => t.key === selectedKey);
        if (!titleDef) return true;

        if (equipped.includes(selectedKey)) {
            equipped = equipped.filter(k => k !== selectedKey);
        } else {
            const sameRarityCount = equipped.filter(k => TITLES.find(t => t.key === k)?.rarity === titleDef.rarity).length;
            const limit = TITLE_LIMITS[titleDef.rarity] || 1;
            if (sameRarityCount >= limit) {
                await interaction.reply({ content: `❌ Giới hạn phẩm cấp **${titleDef.rarity}** là ${limit} danh hiệu.`, ephemeral: true });
                return true;
            }
            equipped.push(selectedKey);
        }
        await prisma.user.update({ where: { id: userId }, data: { title: JSON.stringify(equipped) } });
    }

    await interaction.deferUpdate();
    const { embed, rows } = await renderAchievementsView(userId, "TITLES", "ALL");
    await interaction.editReply({ embeds: [embed], components: rows });

  } catch (e: any) {
     console.error(e);
  }
  return true;
}
