/**
 * combat-ui.ts
 * Combat UI helpers for the final result embed and transition animation.
 *
 * Skills, synergies, and damage are shown PER-TURN by the combat engine's
 * onTurnUpdate callback. The final result embed shows a STATS SUMMARY:
 * - Which skills activated and how many times
 * - Which synergies triggered
 * - Combo count
 * - Highest single-turn damage
 * - Rewards, HP status, achievement progress
 */

import { EmbedBuilder } from "discord.js";
import { randomRpgFooter } from "./rpg-ui";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CombatSummaryData {
  /** Skill name → number of activations across the fight */
  skillCounts: Record<string, number>;
  /** Unique synergy names triggered */
  synergies: string[];
  /** Number of turns where combo triggered (≥2 skills+synergies) */
  comboCount: number;
  /** Highest damage dealt in a single turn */
  maxTurnDamage: number;
  /** Total damage across all turns */
  totalDamageDealt: number;
}

export interface CombatUIData {
  isWin: boolean;
  isBoss?: boolean;
  enemyName: string;
  /** Player HP bar string */
  playerHpBar: string;
  /** Enemy HP bar (shown on defeat) */
  enemyHpBar?: string | undefined;
  /** Gold & EXP rewards */
  goldGained: number;
  expGained: number;
  /** Hospital duration string */
  hospitalDuration?: string | undefined;
  /** Achievement progress formatted text */
  achievementProgressText?: string | undefined;
  /** Scout prefix notice */
  scoutPrefix?: string | undefined;
  /** Combat stats summary from the engine */
  summary?: CombatSummaryData | undefined;
}

// ─── Formatters ───────────────────────────────────────────────────────────────

/**
 * Format skill activation counts into a field value.
 * Example: "⚔️ Fireball ×3 · 💥 Critical Strike ×1"
 */
function formatSkillSummary(skillCounts: Record<string, number>): string {
  const entries = Object.entries(skillCounts);
  if (entries.length === 0) return "*Không có kỹ năng nào được kích hoạt.*";

  // Sort by count descending
  entries.sort((a, b) => b[1] - a[1]);

  return entries
    .map(([name, count]) => `⚔️ ${name} ×${count}`)
    .join("\n");
}

/**
 * Format synergy list.
 * Example: "✨ Burn + Crit\n✨ Multi-hit + Crit"
 */
function formatSynergySummary(synergies: string[]): string {
  if (synergies.length === 0) return "*Không có cộng hưởng nào.*";
  return synergies.map(s => `✨ ${s}`).join("\n");
}

/**
 * Format combat stats line (combo + max damage).
 */
function formatCombatStats(summary: CombatSummaryData): string {
  const lines: string[] = [];

  // Combo
  if (summary.comboCount >= 5) {
    lines.push(`🔥🔥 **ULTRA COMBO** — ${summary.comboCount} lượt combo!`);
  } else if (summary.comboCount >= 3) {
    lines.push(`🔥 **COMBO** — ${summary.comboCount} lượt combo!`);
  } else if (summary.comboCount > 0) {
    lines.push(`🔥 Combo: ${summary.comboCount} lượt`);
  }

  // Max single-turn damage
  if (summary.maxTurnDamage > 0) {
    lines.push(`💥 Đòn mạnh nhất: **${summary.maxTurnDamage}** dmg`);
  }

  // Total damage
  if (summary.totalDamageDealt > 0) {
    lines.push(`⚡ Tổng sát thương: **${summary.totalDamageDealt}**`);
  }

  return lines.length > 0 ? lines.join("\n") : "*Không có dữ liệu.*";
}

// ─── Result Embed Builder ─────────────────────────────────────────────────────

function resultColor(isWin: boolean, isBoss: boolean): number {
  if (!isWin) return 0xff0000;
  if (isBoss) return 0xf1c40f;
  return 0x00ff00;
}

export interface BuildResultEmbedOptions {
  data: CombatUIData;
  avatarUrl?: string | undefined;
}

/**
 * Build the final result embed shown after combat.
 * Shows a stats summary of the entire fight.
 */
export function buildCombatResultEmbed({ data, avatarUrl }: BuildResultEmbedOptions): EmbedBuilder {
  const {
    isWin, isBoss = false, enemyName,
    playerHpBar, enemyHpBar, goldGained, expGained,
    hospitalDuration, achievementProgressText, scoutPrefix, summary,
  } = data;

  const titleEmoji = isWin ? "⚔️" : "💀";
  const outcomeVerb = isWin ? "Chiến thắng trước" : "Thất bại trước";

  const embed = new EmbedBuilder()
    .setColor(resultColor(isWin, isBoss))
    .setTitle(`${titleEmoji} ${outcomeVerb} ${enemyName}`);

  if (avatarUrl) {
    embed.setAuthor({ name: "Báo cáo chiến đấu", iconURL: avatarUrl });
  }

  if (scoutPrefix) {
    embed.setDescription(`*${scoutPrefix}*`);
  }

  // ── Combat Stats Summary ──
  if (summary) {
    const hasSkills = Object.keys(summary.skillCounts).length > 0;
    const hasSynergies = summary.synergies.length > 0;

    if (hasSkills) {
      embed.addFields({
        name: "⚔️ Kỹ năng đã kích hoạt",
        value: formatSkillSummary(summary.skillCounts),
        inline: true,
      });
    }

    if (hasSynergies) {
      embed.addFields({
        name: "✨ Cộng hưởng đã kích hoạt",
        value: formatSynergySummary(summary.synergies),
        inline: true,
      });
    }

    embed.addFields({
      name: "📊 Thống kê trận đấu",
      value: formatCombatStats(summary),
      inline: false,
    });
  }

  // ── Rewards ──
  embed.addFields({
    name: "🎁 Phần thưởng",
    value: isWin
      ? `XP: \`+${expGained}\` | Vàng: \`+${goldGained}\``
      : "Không nhận được phần thưởng.",
    inline: true,
  });

  // ── HP Status ──
  let hpText = `👩 **Bạn:** ${playerHpBar}`;
  if (hospitalDuration) {
    hpText += `\n🏥 Bệnh viện: \`${hospitalDuration}\``;
  }
  if (!isWin && enemyHpBar) {
    hpText += `\n👹 **${enemyName}:** ${enemyHpBar}`;
  }
  embed.addFields({ name: "🩺 Trạng thái sau trận", value: hpText, inline: true });

  // ── Achievement Progress ──
  if (achievementProgressText) {
    embed.addFields({
      name: "🏆 Tiến trình thành tích",
      value: achievementProgressText,
      inline: false,
    });
  }

  embed.setFooter({ text: randomRpgFooter() });
  return embed;
}

// ─── Animation Runner ─────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * Brief animated transition from per-turn combat display to final result embed.
 */
export async function runCombatAnimation(
  interaction: any,
  data: CombatUIData,
  avatarUrl?: string,
): Promise<void> {
  try {
    await delay(400);
    await interaction.editReply({ content: "⚔️ **Tổng kết chiến đấu...**", embeds: [] });

    await delay(600);
    const finalEmbed = buildCombatResultEmbed({ data, avatarUrl });
    await interaction.editReply({ content: "", embeds: [finalEmbed] });
  } catch (_e) {
    try {
      const finalEmbed = buildCombatResultEmbed({ data, avatarUrl });
      await interaction.editReply({ content: "", embeds: [finalEmbed] });
    } catch (_e2) {}
  }
}
