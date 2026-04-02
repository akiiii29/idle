import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

import { prisma } from "../services/prisma";
import type { SlashCommand } from "../types/command";

export const registerCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("Create your RPG profile."),
  async execute(interaction) {
    try {
      const existing = await prisma.user.findUnique({
        where: { id: interaction.user.id }
      });

      if (existing) {
        await interaction.reply({
          content: "You are already registered.",
          ephemeral: true
        });
        return;
      }

      const user = await prisma.user.create({
        data: {
          id: interaction.user.id
        }
      });

      const embed = new EmbedBuilder()
        .setColor(0x57f287)
        .setTitle(`${interaction.user.username} joined the hunt`)
        .setDescription("Your RPG profile is ready.")
        .addFields(
          { name: "Level", value: user.level.toString(), inline: true },
          { name: "HP", value: `${user.hp}/${user.maxHp}`, inline: true },
          { name: "Stats", value: `STR ${user.str} | AGI ${user.agi} | LUCK ${user.luck}`, inline: false }
        );

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("register command failed", error);
      await interaction.reply({
        content: "Registration failed. Try again in a moment.",
        ephemeral: true
      });
    }
  }
};
