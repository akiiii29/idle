import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

import { DAILY_COOLDOWN_MS, HUNT_COOLDOWN_MS } from "../constants/config";
import { requiredExpForLevel } from "../services/leveling";
import { buildXpBar, formatDuration, getRemainingCooldown, getUserWithRelations } from "../services/user-service";
import { formatBeastEntry, formatSkillEntry, buildHpBar } from "../utils/rpg-ui";
import type { SlashCommand } from "../types/command";

export const profileCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Xem chỉ số thợ săn, tiến độ và hành trang của bạn."),
  async execute(interaction) {
    try {
      await interaction.deferReply();
      const user = await getUserWithRelations(interaction.user.id);

      if (!user) {
        await interaction.editReply({
          content: "Bạn chưa đăng ký. Hãy dùng `/register` trước.",
        });
        return;
      }

      const requiredExp = requiredExpForLevel(user.level);
      const topBeast = [...user.beasts].sort((a, b) => b.power - a.power)[0];
      const items = user.inventory.length
        ? user.inventory.map((item: { name: string; quantity: number }) => `${item.name} x${item.quantity}`).join("\n")
        : "Trống";
      const huntCd = getRemainingCooldown(user.lastHunt, HUNT_COOLDOWN_MS);
      const dailyCd = getRemainingCooldown(user.lastDaily, DAILY_COOLDOWN_MS);
      const hospitalCd = user.hospitalUntil ? user.hospitalUntil.getTime() - Date.now() : 0;
      const tavernCd = user.tavernUntil ? user.tavernUntil.getTime() - Date.now() : 0;
      const skills = (user as any).skills?.length
        ? (user as any).skills.map((s: any) => formatSkillEntry(s)).join("\n")
        : "_Không có_";

      const titleStr = (user as any).title ? `\n**Danh hiệu:** \`${(user as any).title}\` ✨` : "";

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
        .setTitle(`Hồ sơ thợ săn của ${interaction.user.username}`)
        .setThumbnail(interaction.user.displayAvatarURL())
        .setDescription(`${titleStr}\n${buildXpBar(user.exp, requiredExp)} **${user.exp}/${requiredExp} Kinh nghiệm (XP)**`)
        .addFields(
          { name: "📊 Cấp độ", value: `\`${user.level}\``, inline: true },
          { name: "💰 Vàng", value: `\`${user.gold}\``, inline: true },
          { name: "❤️ Máu", value: buildHpBar(user.hp, user.maxHp), inline: true },
          { 
            name: "⚔️ Thuộc tính", 
            value: `STR: \`${user.str}\` | AGI: \`${user.agi}\` | LUCK: \`${user.luck}\``, 
            inline: false 
          },
          {
            name: "🐾 Sinh vật đồng hành mạnh nhất",
            value: topBeast 
              ? formatBeastEntry(topBeast as any)
              : "_Không có_",
            inline: true
          },
          {
            name: "🎒 Hành trang",
            value: items.length > 50 ? items.substring(0, 47) + "..." : items,
            inline: true
          },
          {
            name: "🔥 Kỹ năng chiến đấu",
            value: skills,
            inline: false
          },
          {
            name: "⏳ Trạng thái",
            value:
              `Đi săn: ${huntCd > 0 ? `\`${formatDuration(huntCd)}\`` : "✅ Sẵn sàng"}\n` +
              `Hằng ngày: ${dailyCd > 0 ? `\`${formatDuration(dailyCd)}\`` : "✅ Sẵn sàng"}` +
              (hospitalCd > 0 ? `\nBệnh viện: \`${formatDuration(hospitalCd)}\`` : "") +
              (tavernCd > 0 ? `\nQuán trọ: \`${formatDuration(tavernCd)}\`` : ""),
            inline: false
          }
        )
        .setFooter({ text: "Cứ đi săn để trở thành Huyền thoại!" });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("profile command failed", error);
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: "Không thể tải hồ sơ. Thử lại sau một chút." });
      } else {
        await interaction.reply({ content: "Không thể tải hồ sơ. Thử lại sau một chút.", ephemeral: true });
      }
    }
  }
};
