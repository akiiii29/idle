import { randomUUID } from "node:crypto";

import { Rarity } from "@prisma/client";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

import { CAPTURE_TIMEOUT_MS } from "../constants/config";

export interface PendingEncounter {
  token: string;
  userId: string;
  beast: {
    name: string;
    rarity: Rarity;
    power: number;
    role?: string | undefined;
    skillType?: string | undefined;
    skillPower?: number | undefined;
    trigger?: string | undefined;
  };
  trapsWanted: number;
  trapPower: number;
  luckForTame: number;
  expiresAt: Date;
  timeout: NodeJS.Timeout;
}

export interface PendingChest {
  token: string;
  userId: string;
  goldMultiplier: number;
  strForRoll: number;
  agiForRoll: number;
  expiresAt: Date;
  timeout: NodeJS.Timeout;
}

const pendingEncounters = new Map<string, PendingEncounter>();
const pendingChests = new Map<string, PendingChest>();

export function createEncounterToken(): string {
  return randomUUID();
}

export function buildBeastButtons(
  token: string,
  disabled = false,
  tameLabel = "Thuần phục",
  killLabel = "Giết"
): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`tame:${token}`)
      .setLabel(tameLabel)
      .setStyle(ButtonStyle.Success)
      .setDisabled(disabled),
    new ButtonBuilder()
      .setCustomId(`kill:${token}`)
      .setLabel(killLabel)
      .setStyle(ButtonStyle.Danger)
      .setDisabled(disabled)
  );
}

export function buildChestButtons(
  token: string,
  disabled = false,
  strLabel = "Phá (STR)",
  agiLabel = "Vô hiệu hóa (AGI)"
): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`chest_str:${token}`)
      .setLabel(strLabel)
      .setStyle(ButtonStyle.Danger)
      .setDisabled(disabled),
    new ButtonBuilder()
      .setCustomId(`chest_agi:${token}`)
      .setLabel(agiLabel)
      .setStyle(ButtonStyle.Primary)
      .setDisabled(disabled)
  );
}

export function startPendingEncounter(
  token: string,
  userId: string,
  beast: PendingEncounter["beast"],
  trapsWanted: number,
  trapPower: number,
  luckForTame: number,
  onExpire: () => Promise<void>
): void {
  const timeout = setTimeout(() => {
    pendingEncounters.delete(token);
    void onExpire();
  }, CAPTURE_TIMEOUT_MS);

  pendingEncounters.set(token, {
    token,
    userId,
    beast,
    trapsWanted,
    trapPower,
    luckForTame,
    expiresAt: new Date(Date.now() + CAPTURE_TIMEOUT_MS),
    timeout
  });
}

export function peekPendingEncounter(token: string): PendingEncounter | null {
  return pendingEncounters.get(token) ?? null;
}

export function consumePendingEncounter(token: string): PendingEncounter | null {
  const encounter = pendingEncounters.get(token);
  if (!encounter) {
    return null;
  }

  clearTimeout(encounter.timeout);
  pendingEncounters.delete(token);
  return encounter;
}

export function startPendingChest(
  token: string,
  userId: string,
  goldMultiplier: number,
  strForRoll: number,
  agiForRoll: number,
  onExpire: () => Promise<void>
): void {
  const timeout = setTimeout(() => {
    pendingChests.delete(token);
    void onExpire();
  }, CAPTURE_TIMEOUT_MS);

  pendingChests.set(token, {
    token,
    userId,
    goldMultiplier,
    strForRoll,
    agiForRoll,
    expiresAt: new Date(Date.now() + CAPTURE_TIMEOUT_MS),
    timeout
  });
}

export function peekPendingChest(token: string): PendingChest | null {
  return pendingChests.get(token) ?? null;
}

export function consumePendingChest(token: string): PendingChest | null {
  const chest = pendingChests.get(token);
  if (!chest) {
    return null;
  }

  clearTimeout(chest.timeout);
  pendingChests.delete(token);
  return chest;
}
