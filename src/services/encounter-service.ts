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
  };
  expiresAt: Date;
  timeout: NodeJS.Timeout;
}

const pendingEncounters = new Map<string, PendingEncounter>();

export function createEncounterToken(): string {
  return randomUUID();
}

export function buildCaptureButton(token: string, disabled = false, label = "Capture"): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`capture:${token}`)
      .setLabel(label)
      .setStyle(ButtonStyle.Success)
      .setDisabled(disabled)
  );
}

export function startPendingEncounter(
  token: string,
  userId: string,
  beast: PendingEncounter["beast"],
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
