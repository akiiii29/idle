import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { getUserWithRelations, buildXpBar } from "../services/user-service";
import { getActiveSynergies } from "../services/pet-synergy";
import { requiredExpForLevel } from "../services/leveling";
import {
  computeCombatStats,
  type MultDeltaPart,
  type StatValuePart,
} from "../services/stats-service";
import type { SlashCommand } from "../types/command";

const MAX_FIELD = 1020;

function clampField(s: string): string {
  if (s.length <= MAX_FIELD) return s;
  return s.slice(0, MAX_FIELD - 20) + "\n… *(rút gọn)*";
}

function linesFromParts(parts: StatValuePart[]): string {
  return parts.map((p) => `• ${p.source} → \`${fmtNum(p.value)}\``).join("\n");
}

function fmtNum(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function multSection(
  title: string,
  baseLabel: string,
  baseValue: number,
  deltas: MultDeltaPart[]
): string {
  const lines: string[] = [
    `${baseLabel} **×${baseValue.toFixed(2)}**`,
    ...deltas.map(
      (d) => `• ${d.source} → **+${(d.delta * 100).toFixed(1)}%** hệ số (Δ +${d.delta.toFixed(3)})`
    ),
  ];
  const total = baseValue + deltas.reduce((s, d) => s + d.delta, 0);
  lines.push(`**→ Tổng: ×${total.toFixed(3)}**`);
  return lines.join("\n");
}

export const statsCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Xem chi tiết các chỉ số thợ săn (nguồn gốc từng phần).")
    .addStringOption((opt) =>
      opt
        .setName("hunter")
        .setDescription("Tên thợ săn (để trống để xem bản thân).")
        .setAutocomplete(true)
        .setRequired(false)
    ) as any,

  async execute(interaction) {
    await interaction.deferReply();
    const hunterName = interaction.options.getString("hunter");
    const user = await getUserWithRelations(hunterName || interaction.user.id);

    if (!user) {
      await interaction.editReply(
        hunterName ? "Không tìm thấy thợ săn này." : "Bạn chưa đăng ký tài khoản! (Dùng /register)"
      );
      return;
    }

    const displayName = user.username || "Thợ săn";
    const equippedItems = user.inventory.filter((i: any) => i.isEquipped);
    const equippedPets = user.beasts.filter((b: any) => b.isEquipped);

    const block = computeCombatStats(user, equippedItems, equippedPets);
    const { derived, final, multiplier, breakdown: bd, base } = block;

    const activeSynergies = getActiveSynergies(equippedPets);
    const reqExp = requiredExpForLevel(user.level);
    const xpBar = buildXpBar(user.exp, reqExp);

    const targetUserObj = await interaction.client.users.fetch(user.id).catch(() => interaction.user);

    const critTotal = base.luck * 0.005 + multiplier.critRateBonus;

    const petRawAtk = bd.petContributions.reduce((s, c) => s + c.atk, 0);
    const petRawDef = bd.petContributions.reduce((s, c) => s + c.def, 0);

    const petLines =
      bd.petContributions.length === 0
        ? "*(Chưa trang bị pet — không có cộng ATK/DEF pet.)*"
        : [
            ...bd.petContributions.map(
              (c) =>
                `• **${c.name}** (${c.role}, pow \`${c.power}\`, hệ số ô \`×${c.slotMult}\`) → ATK +\`${c.atk.toFixed(1)}\` · DEF +\`${c.def.toFixed(1)}\``
            ),
            `— Tổng pet (trước danh hiệu): ATK \`${petRawAtk.toFixed(1)}\` · DEF \`${petRawDef.toFixed(1)}\``,
            `— Sau danh hiệu pet (**×${bd.petTitlePowerMult.toFixed(2)}**): ATK \`${block.flat.petAtk.toFixed(1)}\` · DEF \`${block.flat.petDef.toFixed(1)}\``,
          ].join("\n");

    const embed1 = new EmbedBuilder()
      .setTitle(`📊 Chỉ số chi tiết — ${displayName}`)
      .setColor(0x3498db)
      .setThumbnail(targetUserObj.displayAvatarURL())
      .setDescription(
        "Luồng tính **khớp combat**: ATK/DEF/HP cuối dùng cho đồ họa sát thương; chí mạng dùng **LUCK×0.005 + bonus phụ kiện**."
      )
      .addFields(
        {
          name: "📌 Gốc nhân vật (không gồm đồ)",
          value: `STR \`${base.str}\` · AGI \`${base.agi}\` · LUCK \`${base.luck}\` · HP gốc \`${base.hp}\``,
          inline: false,
        },
        {
          name: "❤️ Máu & cấp",
          value: clampField(
            `HP hiện tại: **${user.currentHp.toFixed(0)}** / **${final.maxHp}** (tối đa sau mọi hệ số)\n` +
              `HP nền (trước ×HP): **${derived.maxHp}** = gốc \`${base.hp}\` + đồ \`+${block.flat.hp}\`\n` +
              `Cấp **${user.level}** — ${xpBar} (\`${user.exp}\` / \`${reqExp}\` EXP)`
          ),
          inline: false,
        },
        {
          name: "⚔️ ATK — từng thành phần (trước × sát thương)",
          value: clampField(
            `${linesFromParts(bd.attackParts)}\n` +
              `**Cộng dồn (ATK nền):** \`${derived.attack.toFixed(1)}\` ≈ \`${Math.round(derived.attack)}\`\n` +
              `${multSection("", "Hệ số ST (damageMult)", 1.0, bd.damageMultDeltas)}\n` +
              `**ATK hiển thị trong trận:** \`${final.attack}\` = floor(${derived.attack.toFixed(1)} × hệ số)`
          ),
          inline: false,
        },
        {
          name: "🛡️ DEF — từng thành phần",
          value: clampField(
            `${linesFromParts(bd.defenseParts)}\n` +
              `**DEF nền:** \`${derived.defense.toFixed(1)}\`\n` +
              `${multSection("", "Hệ số giảm ST nhận (defenseMult)", 1.0, bd.defenseMultDeltas)}\n` +
              `**DEF hiển thị trong trận:** \`${final.defense}\` *(giảm ST theo DEF/(DEF+100), tối đa 75%)*`
          ),
          inline: false,
        }
      );

    const embed2 = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle(`📎 Nguồn chỉ số — ${displayName}`)
      .addFields(
        {
          name: "👟 Tốc độ (SPD)",
          value: clampField(
            `${linesFromParts(bd.speedParts)}\n**SPD trong trận:** \`${final.speed}\` *(bằng AGI tổng)*`
          ),
          inline: false,
        },
        {
          name: "🎯 Chí mạng (khớp combat-system)",
          value: clampField(
            `${linesFromParts(bd.critChanceParts)}\n` +
              `**Tỉ lệ chí mạng (xác suất):** \`${(critTotal * 100).toFixed(2)}%\` = ${(base.luck * 0.005 * 100).toFixed(2)}% + ${(multiplier.critRateBonus * 100).toFixed(2)}%\n` +
              `**Hệ số ST khi chí mạng:** \`${multiplier.critDamage.toFixed(2)}\` *(mặc định 1.5 + phụ kiện/danh hiệu)*`
          ),
          inline: false,
        },
        {
          name: "❤️ HP — hệ số máu tối đa",
          value: clampField(
            `${linesFromParts(bd.hpParts)}\n` +
              `${multSection("", "Hệ số HP (hpMult)", 1.0, bd.hpMultDeltas)}\n` +
              `**HP tối đa cuối:** \`${final.maxHp}\``
          ),
          inline: false,
        },
        {
          name: "🔥 DOT & proc (hệ số nhân)",
          value: clampField(
            `• ST **Đốt** ×\`${multiplier.burnDamage.toFixed(2)}\`\n` +
              `• ST **Độc** ×\`${multiplier.poisonDamage.toFixed(2)}\`\n` +
              `• **Hút máu** ×\`${multiplier.lifesteal.toFixed(2)}\`\n` +
              `• **Tỉ lệ proc skill** ×\`${multiplier.procChance.toFixed(2)}\``
          ),
          inline: false,
        }
      );

    const gearBlock = bd.gearFlatLines.length
      ? bd.gearFlatLines.join("\n")
      : "*(Không có vũ khí/giáp đang trang bị — chỉ số STR/AGI/DEF/HP/WP từ đồ = 0.)*";

    const accBlock =
      bd.accessoryEffectLines.length > 0
        ? bd.accessoryEffectLines.join("\n")
        : "*(Không có dòng phụ kiện/bộ/danh hiệu ghi nhận — hoặc chưa đeo phụ kiện.)*";

    const buffBlock =
      bd.buffLines.length > 0 ? bd.buffLines.join("\n") : "*(Không có buff tạm STR%/HP% trong pipeline này.)*";

    const synBlock =
      activeSynergies.length > 0
        ? activeSynergies.map((s) => `${s.icon} **${s.name}** — ${s.description}`).join("\n")
        : "*(Cần ≥2 pet để có cộng hưởng.)*";

    const embed3 = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle(`🧩 Trang bị & pet — ${displayName}`)
      .addFields(
        {
          name: "⚔️🛡️ Vũ khí & giáp (chỉ số phẳng đã + cường hóa)",
          value: clampField(gearBlock),
          inline: false,
        },
        {
          name: "🐾 Pet đang ra trận (góp ATK/DEF nền)",
          value: clampField(petLines),
          inline: false,
        },
        {
          name: "💍 Phụ kiện · bộ · danh hiệu · thiên phú (chi tiết)",
          value: clampField(accBlock),
          inline: false,
        },
        {
          name: "✨ Cộng hưởng pet (đã vào hệ số × ở embed trên)",
          value: clampField(synBlock),
          inline: false,
        },
        {
          name: "⚗️ Buff tạm (hunt/combat)",
          value: clampField(buffBlock),
          inline: false,
        }
      );

    if (multiplier.uniquePowers && Object.keys(multiplier.uniquePowers).length > 0) {
      const uniq = Object.entries(multiplier.uniquePowers)
        .map(([k, v]) => `• \`${k}\` → power **${v.toFixed(2)}**`)
        .join("\n");
      embed3.addFields({ name: "✴️ Unique accessory (sức mạnh)", value: clampField(uniq), inline: false });
    }

    await interaction.editReply({ embeds: [embed1, embed2, embed3] });
  },
};
