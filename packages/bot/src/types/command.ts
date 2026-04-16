import type { ChatInputCommandInteraction, AutocompleteInteraction, SlashCommandBuilder } from "discord.js";

export interface SlashCommand {
  data: SlashCommandBuilder | any;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
  autocomplete?(interaction: AutocompleteInteraction): Promise<void>;
}
