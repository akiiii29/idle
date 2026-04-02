import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

import { DAILY_COOLDOWN_MS, HUNT_COOLDOWN_MS } from "../constants/config";
import { requiredExpForLevel } from "../services/leveling";
import { buildXpBar, formatDuration, getRemainingCooldown, getUserWithRelations } from "../services/user-service";
import type { SlashCommand } from "../types/command";

export const profileCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Show your hunter stats, progress, and inventory."),
  async execute(interaction) {
    try {
      const user = await getUserWithRelations(interaction.user.id);

      if (!user) {
        await interaction.reply({
          content: "You are not registered yet. Use `/register` first.",
          ephemeral: true
        });
        return;
      }

      const requiredExp = requiredExpForLevel(user.level);
      const topBeast = [...user.beasts].sort((a, b) => b.power - a.power)[0];
      const items = user.inventory.length
        ? user.inventory.map((item) => `${item.name} x${item.quantity}`).join("\n")
        : "Empty";
      const huntCd = getRemainingCooldown(user.lastHunt, HUNT_COOLDOWN_MS);
      const dailyCd = getRemainingCooldown(user.lastDaily, DAILY_COOLDOWN_MS);
      const hospitalCd = user.hospitalUntil ? user.hospitalUntil.getTime() - Date.now() : 0;

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`${interaction.user.username}'s Profile`)
        .setDescription(`${buildXpBar(user.exp, requiredExp)} ${user.exp}/${requiredExp} XP`)
        .addFields(
          { name: "Level", value: user.level.toString(), inline: true },
          { name: "Gold", value: user.gold.toString(), inline: true },
          { name: "HP", value: `${user.hp}/${user.maxHp}`, inline: true },
          { name: "Stats", value: `STR ${user.str} | AGI ${user.agi} | LUCK ${user.luck}`, inline: false },
          {
            name: "Top Beast",
            value: topBeast ? `${topBeast.name} (${topBeast.rarity}) • ${topBeast.power} power` : "No beasts captured yet.",
            inline: false
          },
          {
            name: "Inventory",
            value: items,
            inline: false
          },
          {
            name: "Cooldowns",
            value: `Hunt: ${huntCd > 0 ? formatDuration(huntCd) : "Ready"}\nDaily: ${dailyCd > 0 ? formatDuration(dailyCd) : "Ready"}${
              hospitalCd > 0 ? `\nHospital: ${formatDuration(hospitalCd)}` : ""
            }`,
            inline: false
          }
        );

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("profile command failed", error);
      await interaction.reply({
        content: "Profile lookup failed. Try again in a moment.",
        ephemeral: true
      });
    }
  }
};
