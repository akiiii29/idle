import type { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export interface SlashCommand {
  data: SlashCommandBuilder | any;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}
