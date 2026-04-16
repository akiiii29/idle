import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { SYNERGY_LIST } from "../services/skill-system";
import type { SlashCommand } from "../types/command";

/** Discord giới hạn value mỗi field 1024 ký tự; name 256. */
const FIELD_VALUE_MAX = 1024;
const FIELD_NAME_MAX = 256;

function synergyBlocks(): string[] {
  return SYNERGY_LIST.map(
    (syn) =>
      `✨ **${syn.name}**\n   📝 *${syn.desc}*\n   ⚡ **Hiệu ứng:** ${syn.bonus}\n   💡 **Tip:** ${syn.tips}`
  );
}

/** Gom các block vào nhiều field, mỗi value ≤ FIELD_VALUE_MAX; không bao giờ trả về value rỗng. */
function buildSynergyFields(): { name: string; value: string }[] {
  const blocks = synergyBlocks();
  const fields: { name: string; value: string }[] = [];
  let part = 1;
  let chunk: string[] = [];
  let chunkLen = 0;

  const flush = () => {
    if (chunk.length === 0) return;
    const value = chunk.join("\n\n");
    const name = `📜 Danh sách (${part})`.slice(0, FIELD_NAME_MAX);
    fields.push({ name, value });
    part++;
    chunk = [];
    chunkLen = 0;
  };

  for (const block of blocks) {
    const sep = chunk.length > 0 ? 2 : 0;
    if (block.length > FIELD_VALUE_MAX) {
      flush();
      fields.push({
        name: `📜 Một mục (${part})`.slice(0, FIELD_NAME_MAX),
        value: block.slice(0, FIELD_VALUE_MAX - 1) + "…",
      });
      part++;
      continue;
    }
    if (chunkLen + sep + block.length > FIELD_VALUE_MAX) {
      flush();
    }
    chunk.push(block);
    chunkLen = chunk.length === 1 ? block.length : chunkLen + sep + block.length;
  }
  flush();

  if (fields.length === 0) {
    fields.push({ name: "📜", value: "*(Chưa có dữ liệu cộng hưởng.)*" });
  }
  return fields;
}

export const synergiesListCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName("synergies")
        .setDescription("Liệt kê TOÀN BỘ các bộ cộng hưởng (Synergy) kỹ năng trong game."),

    async execute(interaction: ChatInputCommandInteraction) {
        const embed = new EmbedBuilder()
            .setColor(0x00AE86)
            .setTitle("📖 CẨM NANG CỘNG HƯỞNG (SYNERGY)")
            .setDescription("Dưới đây là danh sách toàn bộ các bộ cộng hưởng có thể kích hoạt trong chiến đấu.")
            .setThumbnail("https://cdn.discordapp.com/attachments/1068832591605334068/1151475716508827678/Epic_Loot.png")
            .setFooter({ text: "Gợi ý: Dùng /synergy để xem bạn đang thiếu kỹ năng nào cho bộ cộng hưởng!" });

        const synergyFields = buildSynergyFields();
        const MAX_FIELDS_PER_EMBED = 25;
        const embeds: EmbedBuilder[] = [embed];

        for (let i = 0; i < synergyFields.length; i += MAX_FIELDS_PER_EMBED) {
          const slice = synergyFields.slice(i, i + MAX_FIELDS_PER_EMBED);
          if (i === 0) {
            embed.addFields(slice);
          } else {
            embeds.push(
              new EmbedBuilder()
                .setColor(0x00AE86)
                .setTitle(`📖 Cộng hưởng (tiếp ${Math.floor(i / MAX_FIELDS_PER_EMBED) + 1})`)
                .addFields(slice)
            );
          }
        }

        await interaction.reply({ embeds: embeds.slice(0, 10) });
    }
};
