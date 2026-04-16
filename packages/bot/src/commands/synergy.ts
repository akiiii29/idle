import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { prisma } from "../services/prisma";
import { SYNERGY_LIST } from "@game/core";
import {
  REQ_HINTS,
  PET_FLAG_HINTS,
  examplePetsForFlag,
  flagsFromPlayerSkillNames,
  flagsFromEquippedPets,
  ownedPetNamesByFlag,
  type SynergyFlag,
} from "@game/core";
import type { SlashCommand } from "../types/command";

const FIELD_VALUE_MAX = 1024;
const FOOTER_NOTE =
  "Cộng hưởng kích hoạt khi các flag **cùng thỏa trong một lượt** (skill có % proc). Pet cũng cần **proc** đúng pha. `/skill_shop` · `/beasts` · `/stats` (Luck → crit tự nhiên).";

function isPetFlag(f: SynergyFlag): f is keyof typeof PET_FLAG_HINTS {
  return f in PET_FLAG_HINTS;
}

function hasRequirement(
  flag: SynergyFlag,
  skillFlags: Set<SynergyFlag>,
  petFlags: Set<SynergyFlag>
): boolean {
  if (isPetFlag(flag)) return petFlags.has(flag);
  return skillFlags.has(flag);
}

function formatLearnLine(
  flag: SynergyFlag,
  ownedSkillNames: Set<string>,
  petOwnership: Map<SynergyFlag, { equipped: string[]; inventory: string[] }>
): string {
  const hint = REQ_HINTS[flag];
  if (!hint) return `• **${String(flag)}** *(không có gợi ý chi tiết)*`;

  const lines: string[] = [`**${hint.label}**`];

  if (hint.playerSkills.length > 0) {
    const have = hint.playerSkills.filter((n) => ownedSkillNames.has(n));
    const need = hint.playerSkills.filter((n) => !ownedSkillNames.has(n));
    if (have.length > 0) {
      lines.push(`  ✓ Đã có: ${have.map((n) => `\`${n}\``).join(", ")}`);
    }
    if (need.length > 0) {
      lines.push(`  → Học (/skill_shop): ${need.map((n) => `\`${n}\``).join(", ")}`);
    }
    if (need.length === 0 && have.length === 0) {
      lines.push(`  → Gợi ý: ${hint.playerSkills.map((n) => `\`${n}\``).join(" hoặc ")}`);
    }
  }

  if (isPetFlag(flag)) {
    const meta = PET_FLAG_HINTS[flag];
    const ex = examplePetsForFlag(flag);
    lines.push(`  · ${meta.label}`);
    const own = petOwnership.get(flag);
    if (own?.equipped.length) {
      lines.push(`  ✓ Pet đang trang bị: ${own.equipped.map((n) => `**${n}**`).join(", ")}`);
    } else if (own?.inventory.length) {
      lines.push(
        `  ⚠ Có pet phù hợp nhưng **chưa mang**: ${own.inventory.map((n) => `**${n}**`).join(", ")} → \`/beasts\``
      );
    } else if (ex.length > 0) {
      lines.push(`  → Ví dụ pet: ${ex.slice(0, 8).join(", ")} (bắt/săn thêm nếu chưa có)`);
    }
  }

  if (hint.note) {
    lines.push(`  _${hint.note}_`);
  }

  return lines.join("\n");
}

function buildSynergyParagraph(
  syn: (typeof SYNERGY_LIST)[number],
  skillFlags: Set<SynergyFlag>,
  petFlags: Set<SynergyFlag>,
  ownedSkillNames: Set<string>,
  petOwnership: Map<SynergyFlag, { equipped: string[]; inventory: string[] }>,
  mode: "active" | "potential"
): string {
  const missing = syn.req.filter((r) => !hasRequirement(r, skillFlags, petFlags));
  const met = syn.req.filter((r) => hasRequirement(r, skillFlags, petFlags));

  const head =
    mode === "active"
      ? `✅ **${syn.name}**\n_${syn.desc}_\nThưởng: **${syn.bonus}**`
      : `⚠️ **${syn.name}**\n_${syn.desc}_\nThưởng: **${syn.bonus}**`;

  if (mode === "active") {
    return `${head}\n✓ Đủ điều kiện flag (${syn.req.map(String).join(" + ")}).`;
  }

  const parts = [head];
  if (met.length > 0) {
    parts.push(`**Đã có nhánh:** ${met.map((r) => REQ_HINTS[r]?.label ?? r).join(" · ")}`);
  }
  if (missing.length > 0) {
    parts.push("**Cần bổ sung:**");
    for (const m of missing) {
      parts.push(formatLearnLine(m, ownedSkillNames, petOwnership));
    }
  }
  return parts.join("\n\n");
}

function chunkToFields(namePrefix: string, paragraphs: string[]): { name: string; value: string }[] {
  const fields: { name: string; value: string }[] = [];
  let buf: string[] = [];
  let part = 1;

  const flush = () => {
    if (buf.length === 0) return;
    const value = buf.join("\n\n─ ─ ─ ─ ─\n\n");
    fields.push({
      name: `${namePrefix} (${part})`.slice(0, 256),
      value: value.length <= FIELD_VALUE_MAX ? value : value.slice(0, FIELD_VALUE_MAX - 20) + "\n… *(rút gọn)*",
    });
    part++;
    buf = [];
  };

  for (const p of paragraphs) {
    const sep = buf.length ? 2 : 0;
    if (buf.join("\n\n").length + sep + p.length > 950) {
      flush();
    }
    buf.push(p);
  }
  flush();
  return fields;
}

export const synergyCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("synergy")
    .setDescription("Xem gợi ý cộng hưởng kỹ năng dựa trên những gì bạn đang có."),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const user = await prisma.user.findUnique({
        where: { id: interaction.user.id },
        include: {
          skills: { include: { skill: true } },
          beasts: true,
        },
      });

      if (!user) {
        await interaction.editReply("Bạn cần đăng ký tài khoản trước.");
        return;
      }

      const ownedSkillNames = new Set(user.skills.map((s) => s.skill.name));
      const skillFlags = flagsFromPlayerSkillNames([...ownedSkillNames]);
      const petFlags = flagsFromEquippedPets(user.beasts);
      const petOwnership = ownedPetNamesByFlag(user.beasts);

      const activeBlocks: string[] = [];
      const potentialBlocks: string[] = [];

      for (const syn of SYNERGY_LIST) {
        const missing = syn.req.filter((r) => !hasRequirement(r, skillFlags, petFlags));
        if (missing.length === 0) {
          activeBlocks.push(
            buildSynergyParagraph(syn, skillFlags, petFlags, ownedSkillNames, petOwnership, "active")
          );
        } else if (missing.length < syn.req.length || syn.req.length === 1) {
          potentialBlocks.push(
            buildSynergyParagraph(syn, skillFlags, petFlags, ownedSkillNames, petOwnership, "potential")
          );
        }
      }

      const activeFields = chunkToFields("✅ Đã đủ điều kiện", activeBlocks);
      const potentialFields = chunkToFields("📌 Gợi ý học / trang bị", potentialBlocks);

      const allFields: { name: string; value: string }[] = [...activeFields];
      if (activeFields.length === 0) {
        allFields.push({
          name: "✅ Đã đủ điều kiện",
          value: "_Chưa có bộ nào đủ mọi flag cùng lúc (theo skill & pet đang mang)._",
        });
      }
      allFields.push(...potentialFields);
      if (potentialBlocks.length === 0) {
        allFields.push({
          name: "📌 Gợi ý",
          value: "_Không có bộ “gần đủ” để gợi ý — xem danh sách đầy đủ tại `/synergies`._",
        });
      }

      const embeds: EmbedBuilder[] = [];
      for (let i = 0; i < allFields.length; i += 25) {
        const slice = allFields.slice(i, i + 25);
        if (i === 0) {
          embeds.push(
            new EmbedBuilder()
              .setColor(0x00ae86)
              .setTitle("🌀 Cộng hưởng — gợi ý theo đồ của bạn")
              .setDescription(
                "Mỗi bộ liệt kê **flag** cần có khi skill/pet **proc**. Dưới đây là skill/pet cụ thể nên học hoặc trang bị."
              )
              .setThumbnail(interaction.user.displayAvatarURL())
              .setFooter({ text: FOOTER_NOTE })
              .addFields(slice)
          );
        } else {
          embeds.push(
            new EmbedBuilder()
              .setColor(0x00ae86)
              .setTitle(`🌀 Gợi ý (trang ${Math.floor(i / 25) + 1})`)
              .addFields(slice)
          );
        }
      }

      await interaction.editReply({ embeds: embeds.slice(0, 10) });
    } catch (error) {
      console.error("Synergy command failed:", error);
      await interaction.editReply("Đã có lỗi xảy ra khi lấy thông tin cộng hưởng.");
    }
  },
};
