import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { prisma } from "../services/prisma";
import { getUserWithRelations } from "../services/user-service";
import { computeCombatStats } from "../services/stats-service";
import { simulateCombat } from "../services/combat-engine";
import type { CombatLog } from "../types/combat";
import type { SlashCommand } from "../types/command";

const FIELD_VALUE_CAP = 1020;
/** Tổng embed ~6000; để chừa phần header / an toàn */
const MAX_EMBED_BODY = 5200;

function packTurnsIntoFields(fullLogs: CombatLog[]): { name: string; value: string }[] {
  const fields: { name: string; value: string }[] = [];

  const flush = (
    text: string,
    turnFrom: number,
    turnTo: number
  ) => {
    const t = text.trim();
    if (!t) return;
    const label = turnFrom === turnTo ? `Lượt ${turnFrom}` : `Lượt ${turnFrom}–${turnTo}`;
    let v = t;
    if (v.length > FIELD_VALUE_CAP) {
      v = v.slice(0, FIELD_VALUE_CAP - 24) + "\n… *(rút gọn do giới hạn Discord)*";
    }
    fields.push({ name: `📜 ${label}`, value: v });
  };

  let buf = "";
  let turnFrom: number | null = null;
  let turnTo: number | null = null;

  for (const log of fullLogs) {
    const block = `**━━ Lượt ${log.turn} ━━**\n${log.events.join("\n").trim()}`;

    if (block.length > FIELD_VALUE_CAP) {
      if (buf) {
        flush(buf, turnFrom!, turnTo!);
        buf = "";
        turnFrom = null;
        turnTo = null;
      }
      let rest = block;
      let part = 1;
      while (rest.length > 0) {
        const chunk = rest.slice(0, FIELD_VALUE_CAP - 32);
        const suffix = rest.length > FIELD_VALUE_CAP - 32 ? "\n… *(tiếp)*" : "";
        fields.push({
          name: `📜 Lượt ${log.turn} · phần ${part}`,
          value: (chunk + suffix).slice(0, FIELD_VALUE_CAP),
        });
        rest = rest.slice(FIELD_VALUE_CAP - 32);
        part++;
        if (part > 12) break;
      }
      continue;
    }

    const next = buf ? `${buf}\n\n${block}` : block;
    if (next.length > FIELD_VALUE_CAP && buf) {
      flush(buf, turnFrom!, turnTo!);
      buf = block;
      turnFrom = log.turn;
      turnTo = log.turn;
    } else {
      if (!buf) turnFrom = log.turn;
      turnTo = log.turn;
      buf = next;
    }
  }

  if (buf && turnFrom != null && turnTo != null) {
    flush(buf, turnFrom, turnTo);
  }

  return fields;
}

function splitFieldsAcrossEmbeds(
  summaryEmbed: EmbedBuilder,
  logFields: { name: string; value: string }[]
): EmbedBuilder[] {
  const embeds: EmbedBuilder[] = [summaryEmbed];
  let current = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("📋 Nhật ký đầy đủ từng lượt")
    .setDescription(
      "Mỗi ô là một hoặc nhiều lượt liền kề (gom để vừa giới hạn Discord). **Tất cả lượt** đều được hiển thị."
    );

  let bodyLen = 0;

  const pushNewLogEmbed = () => {
    embeds.push(current);
    current = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("📋 Nhật ký (tiếp)")
      .setDescription("*(phần tiếp theo)*");
    bodyLen = 0;
  };

  for (const f of logFields) {
    const addLen = f.name.length + f.value.length + 24;
    const fieldCount = current.data.fields?.length ?? 0;
    if (
      fieldCount >= 6 ||
      bodyLen + addLen > MAX_EMBED_BODY ||
      (fieldCount > 0 && bodyLen + addLen > MAX_EMBED_BODY * 0.85)
    ) {
      pushNewLogEmbed();
    }
    current.addFields(f);
    bodyLen += addLen;
  }

  if ((current.data.fields?.length ?? 0) > 0) {
    embeds.push(current);
  }

  return embeds;
}

export const practiceCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("practice")
    .setDescription("Giả lập 10 lượt tấn công vào bù nhìn để kiểm tra sát thương.") as any,

  async execute(interaction) {
    try {
      await interaction.deferReply();

      const user = await getUserWithRelations(interaction.user.id);
      if (!user) {
        await interaction.editReply("Vui lòng đăng ký trước khi luyện tập.");
        return;
      }

      const equippedItems = user.inventory.filter((i: any) => i.isEquipped);
      const equippedPets = user.beasts.filter((b: any) => b.isEquipped);
      const combatStats = computeCombatStats(user, equippedItems, equippedPets);

      const dummyMaxHp = 100_000_000;
      const results = await simulateCombat({
        player: {
          hp: user.maxHp,
          maxHp: combatStats.final.maxHp,
          atk: combatStats.final.attack,
          def: combatStats.final.defense,
          spd: combatStats.final.speed,
          critRate: user.luck * 0.005 + (combatStats.extra?.critRateBonus || 0),
          pets: equippedPets,
          skills: user.skills.filter((s: any) => s.isEquipped),
          title: user.title,
        },
        enemy: {
          name: "Bù nhìn luyện tập",
          hp: dummyMaxHp,
          maxHp: dummyMaxHp,
          atk: 0,
          def: 0,
          spd: 0,
        },
        accessories: {
          effects: combatStats.extra?.activeUniqueEffects || [],
          uniquePowers: (combatStats.extra as any)?.uniquePowers || {},
          sets: combatStats.extra?.activeSets || [],
        },
        maxTurns: 10,
      });

      const summary = results.combatSummary!;
      const turnCount = results.fullLogs?.length ?? 0;

      const skillLines =
        summary.skillCounts && Object.keys(summary.skillCounts).length > 0
          ? Object.entries(summary.skillCounts)
              .map(([n, c]) => `• **${n}** ×${c}`)
              .join("\n")
          : "*(Không ghi nhận skill kích hoạt trong các đòn ON_ATTACK.)*";

      const synLines =
        summary.synergies && summary.synergies.length > 0
          ? summary.synergies.map((s) => `• ${s}`).join("\n")
          : "—";

      const summaryEmbed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle("🎯 Luyện tập — tóm tắt 10 lượt")
        .setDescription(
          `Người chơi: **${user.username}**\n` +
            `Đã mô phỏng **${turnCount}** lượt (tối đa 10). Nhật ký **đầy đủ** nằm ở (các) embed bên dưới.`
        )
        .addFields(
          {
            name: "📊 Sát thương",
            value:
              `⚔️ **Tổng ST:** \`${summary.totalDamageDealt.toLocaleString()}\`\n` +
              `💥 **Một lượt cao nhất:** \`${summary.maxTurnDamage.toLocaleString()}\``,
            inline: true,
          },
          {
            name: "🎲 Kích hoạt",
            value:
              `🎯 Chí mạng: **${results.achievementTracking?.crits ?? 0}** lượt\n` +
              `🔄 Combo (≥2 skill/cộng hưởng đòn): **${summary.comboCount}** lượt\n` +
              `🔥 Đốt: **${results.achievementTracking?.burns ?? 0}** · ` +
              `🐍 Độc: **${results.achievementTracking?.poisons ?? 0}** · ` +
              `🩸 Hút máu: **${results.achievementTracking?.lifesteals ?? 0}**`,
            inline: true,
          },
          {
            name: "✨ Skill & cộng hưởng skill (ON_ATTACK)",
            value: skillLines.slice(0, FIELD_VALUE_CAP),
            inline: false,
          },
          {
            name: "🔗 Synergy ghi nhận",
            value: synLines.slice(0, FIELD_VALUE_CAP),
            inline: false,
          }
        );

      const logFields = packTurnsIntoFields(results.fullLogs || []);
      const embeds = splitFieldsAcrossEmbeds(summaryEmbed, logFields);

      await interaction.editReply({ embeds: embeds.slice(0, 10) });
    } catch (error) {
      console.error("practice command failed", error);
      await interaction.editReply("Có lỗi xảy ra khi giả lập luyện tập.");
    }
  },
};
