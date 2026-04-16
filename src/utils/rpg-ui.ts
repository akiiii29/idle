/**
 * Central RPG UI helper — rarity colors, badges, embed themes
 */
import { EmbedBuilder } from "discord.js";
import { GameItem } from "../constants/item-pool";


// ─── Beast Rarity ────────────────────────────────────────────────────
export const RARITY_COLORS = {
  COMMON:    0x95a5a6,  // Grey
  RARE:      0x3498db,  // Blue
  EPIC:      0x9b59b6,  // Purple
  LEGENDARY: 0xf1c40f,  // Gold
} as const;

export const RARITY_BADGE = {
  COMMON:    "⬜ Common",
  RARE:      "🔵 Rare",
  EPIC:      "🟣 Epic",
  LEGENDARY: "🌟 Legendary",
} as const;

export const RARITY_BANNER = {
  COMMON:    "「Common」",
  RARE:      "「✦ Rare ✦」",
  EPIC:      "「★ Epic ★」",
  LEGENDARY: "「✦✦ L E G E N D A R Y ✦✦」",
} as const;

export type Rarity = keyof typeof RARITY_COLORS;

// ─── Skill Rarity ─────────────────────────────────────────────────────
// Score = multiplier * chance, normalised to a 0–1 range
export function getSkillRarity(multiplier: number, chance: number): Rarity {
  const score = multiplier * chance; // e.g. 2.0 * 0.05 = 0.1
  if (score >= 0.3) return "LEGENDARY";
  if (score >= 0.15) return "EPIC";
  if (score >= 0.06) return "RARE";
  return "COMMON";
}

export function formatSkillEntry(s: { skill: { name: string; multiplier: number; chance: number } }): string {
  const rarity = getSkillRarity(s.skill.multiplier, s.skill.chance);
  const badge = RARITY_BADGE[rarity];
  return `${badge} **${s.skill.name}** — ${s.skill.multiplier}x sát thương · ${(s.skill.chance * 100).toFixed(0)}% kích hoạt`;
}

function formatStars(count: number): string {
  if (count <= 0) return "";
  if (count <= 5) return " " + "⭐".repeat(count);
  return ` 🌟x${count}`;
}

// ─── Beast formatting ──────────────────────────────────────────────────
export function formatBeastEntry(beast: { name: string; rarity: string; power: number; level?: number; upgradeLevel?: number }): string {
  const badge = RARITY_BADGE[beast.rarity as Rarity] ?? beast.rarity;
  const starStr = formatStars(beast.upgradeLevel || 0);
  const lvStr = ` (Cấp ${beast.level || 1})`;
  return `${badge} **${beast.name}**${starStr}${lvStr} — Sức mạnh \`${beast.power}\``;
}

// ─── HP bar ───────────────────────────────────────────────────────────
export function buildHpBar(current: number, max: number, size = 5): string {
  const safeCurrent = Math.max(0, current);
  const pct = max > 0 ? safeCurrent / max : 0;
  const filled = Math.max(0, Math.min(size, Math.round(pct * size)));
  const bar = "🟥".repeat(filled) + "⬛".repeat(size - filled);
  return `${bar} \`${Math.floor(safeCurrent)}/${max}\``;
}

// ─── RPG footer pool ───────────────────────────────────────────────────
const RPG_FOOTERS = [
  "⚔️  Cuộc đi săn không bao giờ kết thúc — tiến lên thôi, chiến binh.",
  "🛡️  Mỗi vết thương đều kể một câu chuyện sống sót.",
  "🔥  Huyền thoại được rèn trong ngọn lửa chiến đấu.",
  "🌟  Vận may thuộc về thợ săn dũng cảm.",
  "💀  Cái chết chỉ là tạm thời. Vinh quang là vĩnh cửu.",
];

export function randomRpgFooter(): string {
  return RPG_FOOTERS[Math.floor(Math.random() * RPG_FOOTERS.length)] ?? "Chúc bạn gặp may mắn.";
}

// ─── High Tier Item Drop UI ────────────────────────────────────────────
export function buildHighTierDropEmbed(item: GameItem, contextMsg: string = "Bạn nhận được một bảo vật hiếm có!"): EmbedBuilder {
  const isEpic = item.rarity === "EPIC";
  const color = isEpic ? RARITY_COLORS.EPIC : RARITY_COLORS.LEGENDARY;
  
  const stats: string[] = [];
  if (item.power) stats.push(`🗡️ Sát thương: **${item.power}**`);
  if (item.bonusStr) stats.push(`💪 Cường lực: **+${item.bonusStr}**`);
  if (item.bonusAgi) stats.push(`⚡ Nhanh nhẹn: **+${item.bonusAgi}**`);
  if (item.bonusDef) stats.push(`🛡️ Phòng ngự: **+${item.bonusDef}**`);
  if (item.bonusHp) stats.push(`❤️ Sinh lực: **+${item.bonusHp}**`);

  const statDisplay = stats.length > 0 ? stats.join("\n") : "*(Không có chỉ số cộng thêm)*";
  
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(`🎉 PHÁT HIỆN BẢO VẬT ${isEpic ? "TÍM" : "VÀNG"}!`)
    .setDescription(`*${contextMsg}*\n\n${RARITY_BANNER[item.rarity as "EPIC" | "LEGENDARY"]} **${item.name}**\n\n**Chỉ số:**\n${statDisplay}`)
    .setThumbnail(isEpic 
      ? "https://cdn.discordapp.com/attachments/1068832591605334068/1151475716508827678/Epic_Loot.png" 
      : "https://cdn.discordapp.com/attachments/1068832591605334068/1151475716940845116/Legendary_Loot.png")
    .setFooter({ text: "Sử dụng /inven và /equip để mang trang bị này." });
}
