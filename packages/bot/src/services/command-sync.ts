import { REST, Routes } from "discord.js";

import type { SlashCommand } from "../types/command";

export async function syncApplicationCommands(
  token: string,
  clientId: string,
  guildId: string | undefined,
  commands: SlashCommand[]
): Promise<void> {
  const rest = new REST({ version: "10" }).setToken(token);
  const body = commands.map((command) => command.data.toJSON());

  if (guildId) {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body });
    return;
  }

  await rest.put(Routes.applicationCommands(clientId), { body });
}
