import { ItemType, Rarity } from "@prisma/client";

export const HUNT_COOLDOWN_MS = 15_000;
export const HOSPITAL_COOLDOWN_MS = 30 * 60_000;
export const DAILY_COOLDOWN_MS = 24 * 60 * 60_000;
export const CAPTURE_TIMEOUT_MS = 30_000;
export const HP_RECOVERY_INTERVAL_MS = 2 * 60_000;
export const XP_BAR_SIZE = 10;

export const EVENT_RATES = {
  combat: 60,
  catch: 30,
  fail: 10
} as const;

export const RARITY_BASE_RATES: Record<Rarity, number> = {
  [Rarity.COMMON]: 70,
  [Rarity.RARE]: 20,
  [Rarity.EPIC]: 8,
  [Rarity.LEGENDARY]: 2
};

export const RARITY_COLORS: Record<Rarity, number> = {
  [Rarity.COMMON]: 0x808080,
  [Rarity.RARE]: 0x3498db,
  [Rarity.EPIC]: 0x9b59b6,
  [Rarity.LEGENDARY]: 0xf1c40f
};

export const RARITY_POWER_RANGES: Record<Rarity, { min: number; max: number }> = {
  [Rarity.COMMON]: { min: 6, max: 12 },
  [Rarity.RARE]: { min: 12, max: 20 },
  [Rarity.EPIC]: { min: 20, max: 30 },
  [Rarity.LEGENDARY]: { min: 32, max: 45 }
};

export const DAILY_ITEMS: ReadonlyArray<{ name: string; type: ItemType; power: number }> = [
  { name: "Hunter Trap", type: ItemType.TRAP, power: 1 },
  { name: "Lucky Clover", type: ItemType.LUCK_BUFF, power: 1 }
];
