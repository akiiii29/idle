import { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, type ButtonInteraction } from "discord.js";
import { ItemType } from "@prisma/client";
import { getInventoryDisplay } from "../services/equipment-service";
import { getUserWithRelations } from "../services/user-service";
import { RARITY_BADGE, Rarity } from "../utils/rpg-ui";
import type { SlashCommand } from "../types/command";

// ==========================================
// TYPE EMOJI MAP
// ==========================================

const TYPE_EMOJI: Record<string, string> = {
    WEAPON: "⚔️",
    ARMOR: "🛡️",
    HELMET: "🪖",
    ACCESSORY: "💍",
    POTION: "🧪",
    CONSUMABLE: "🍖",
    TRAP: "🪤",
    LUCK_BUFF: "🍀",
    MEAT: "🥩",
    UTILITY: "🔧",
    GAMBLE: "🎲",
    BUFF: "✨",
    SITUATIONAL: "🔮",
    PET_BUFF: "🐾"
};

const TYPE_LABEL: Record<string, string> = {
    WEAPON: "Vũ Khí",
    ARMOR: "Giáp",
    HELMET: "Mũ",
    ACCESSORY: "Phụ Kiện",
    POTION: "Thuốc",
    CONSUMABLE: "Tiêu Hao",
    TRAP: "Bẫy",
    LUCK_BUFF: "May Mắn",
    MEAT: "Thịt",
    UTILITY: "Công Cụ",
    GAMBLE: "Cờ Bạc",
    BUFF: "Buff",
    PET_BUFF: "Pet Buff"
};

// ==========================================
// /inven COMMAND
// ==========================================

export const invenCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName("inven")
        .setDescription("Xem trang bị và túi đồ của bạn") as any,

    async execute(interaction) {
        try {
            await interaction.deferReply();
            const { embed, row } = await renderInvenEmbed(interaction.user.id, "GEAR");
            await interaction.editReply({ embeds: [embed], components: [row] });
        } catch (e) {
            console.error("inven command failed:", e);
            if (!interaction.replied) {
                await interaction.editReply("Lỗi khi mở túi đồ.");
            }
        }
    }
};

export async function handleInvenButton(interaction: ButtonInteraction): Promise<boolean> {
    if (!interaction.customId.startsWith("inven_")) return false;
    
    const parts = interaction.customId.split("_");
    const userId = parts[1];
    const view = parts[2] as "GEAR" | "ITEMS";
    
    if (interaction.user.id !== userId) {
        await interaction.reply({ content: "Đây không phải túi đồ của bạn.", ephemeral: true });
        return true;
    }

    try {
        await interaction.deferUpdate();
        const { embed, row } = await renderInvenEmbed(userId, view);
        await interaction.editReply({ embeds: [embed], components: [row] });
    } catch (e) {
        console.error("inven button error:", e);
    }
    return true;
}

async function renderInvenEmbed(userId: string, view: "GEAR" | "ITEMS") {
    const { items, limit } = await getInventoryDisplay(userId);

    const embed = new EmbedBuilder()
        .setColor(view === "GEAR" ? 0x3498db : 0x95a5a6)
        .setTitle(view === "GEAR" ? "👤 Trang Bị Hiện Tại" : "🎒 Túi Đồ")
        .setDescription(`<@${userId}> — **${items.length}/${limit}** ô đã sử dụng`);

    if (view === "GEAR") {
        const weapon = items.find(i => i.type === "WEAPON" && i.isEquipped);
        const armor = items.find(i => i.type === "ARMOR" && i.isEquipped);
        const accessories = items.filter(i => i.type === "ACCESSORY" && i.isEquipped)
            .sort((a: any, b: any) => (a.equipSlot || 0) - (b.equipSlot || 0));

        embed.addFields(
            { name: "⚔️ Vũ Khí", value: weapon ? `**${weapon.name}** (+${weapon.upgradeLevel || 0})\n${formatItemStats(weapon as any)}` : "Chưa trang bị", inline: true },
            { name: "🛡️ Giáp Trụ", value: armor ? `**${armor.name}** (+${armor.upgradeLevel || 0})\n${formatItemStats(armor as any)}` : "Chưa trang bị", inline: true },
            { name: "\u200B", value: "\u200B", inline: true }, // Spacer
            { 
               name: "💍 Trang Sức", 
               value: accessories.length > 0 
                ? accessories.map((a: any) => `**${a.name}** (Ô ${a.equipSlot || 1})${a.upgradeLevel ? ` (+${a.upgradeLevel})` : ""}\n${formatItemStats(a)}`).join("\n")
                : "Chưa trang bị",
               inline: false 
            }
        );
    } else {
        // Group by type for ITEMS view
        for (const type of Object.keys(TYPE_LABEL)) {
            const typeItems = items.filter(i => i.type === type);
            if (typeItems.length > 0) {
                const label = TYPE_LABEL[type];
                const emoji = TYPE_EMOJI[type] || "📦";
                const lines = typeItems.slice(0, 10).map(i => {
                    const badge = RARITY_BADGE[i.rarity as Rarity] || "";
                    const eq = i.isEquipped ? " [E]" : "";
                    return `${badge} **${i.name}** x${i.quantity}${eq}`;
                });
                if (typeItems.length > 10) lines.push(`*...và ${typeItems.length - 10} món khác*`);
                embed.addFields({ name: `${emoji} ${label}`, value: lines.join("\n"), inline: false });
            }
        }
    }

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId(`inven_${userId}_GEAR`)
            .setLabel("👤 Trang Bị")
            .setStyle(view === "GEAR" ? ButtonStyle.Primary : ButtonStyle.Secondary)
            .setDisabled(view === "GEAR"),
        new ButtonBuilder()
            .setCustomId(`inven_${userId}_ITEMS`)
            .setLabel("🎒 Kho Đồ")
            .setStyle(view === "ITEMS" ? ButtonStyle.Primary : ButtonStyle.Secondary)
            .setDisabled(view === "ITEMS")
    );

    return { embed, row };
}

// ==========================================
// HELPER: format bonus stats line
// ==========================================

import { ACCESSORY_CONFIGS } from "@game/core";

const ACC_EFFECT_LABELS: Record<string, string> = {
    CRIT_CHANCE: "🎯 Crit",
    CRIT_DMG: "💥 CritDmg",
    LIFESTEAL: "🩸 Lifesteal",
    MULTI_HIT: "⚔️ Multi-hit",
    REDUCE_DMG: "🛡️ Giảm ST",
    PROC_CHANCE: "✨ Tỉ lệ kích",
    BURN_DMG: "🔥 Sát thương đốt",
    POISON_DMG: "🧪 Sát thương độc"
};

function formatItemStats(item: { name: string; type: string | ItemType; power: number; bonusStr: number; bonusAgi: number; bonusDef: number; bonusHp: number; upgradeLevel: number }): string {
    const parts: string[] = [];
    
    // Check if it's an accessory with special config
    const accConfig = (item.type === "ACCESSORY" || item.type === ItemType.ACCESSORY) ? ACCESSORY_CONFIGS[item.name] : null;

    if (accConfig) {
        // Format accessory special effects from its effects array
        const upscale = 1 + (item.upgradeLevel * 0.05); // Accessories scale 5% per level
        
        for (const eff of accConfig.effects) {
            const label = ACC_EFFECT_LABELS[eff.type] || eff.type;
            const isUnique = eff.type.startsWith("UNIQUE");
            
            if (isUnique) {
                parts.push(`✨ Đặc biệt: **${eff.type.replace("UNIQUE_", "").replace("_", " ")}**`);
            } else if (eff.type.includes("DUR")) {
                parts.push(`${label}: +${eff.power} lượt`);
            } else {
                parts.push(`${label}: +${Math.round(eff.power * upscale * 100)}%`);
            }
        }
    } else {
        const upscale = 1 + (item.upgradeLevel * 0.1); // Weapons/Armor scale 10% per level
        if (item.power > 0) parts.push(item.type === "WEAPON" ? `🗡️ ATK: **${Math.round(item.power * upscale)}**` : `🛡️ DEF: **${Math.round(item.power * upscale)}**`);
        if (item.bonusStr) parts.push(`💪 Str: +${Math.round(item.bonusStr * upscale)}`);
        if (item.bonusAgi) parts.push(`⚡ Agi: +${Math.round(item.bonusAgi * upscale)}`);
        if (item.bonusDef) parts.push(`🛡️ Def: +${Math.round(item.bonusDef * upscale)}`);
        if (item.bonusHp) parts.push(`❤️ Hp: +${Math.round(item.bonusHp * upscale)}`);
    }

    return parts.length > 0 ? `> ${parts.join(" · ")}` : "> *(Không có chỉ số)*";
}
