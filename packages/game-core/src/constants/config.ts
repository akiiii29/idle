import type { Rarity } from "../types/rpg-enums";

export const HUNT_COOLDOWN_MS = 5_000;
export const HOSPITAL_COOLDOWN_MS = 30 * 60_000;
export const DAILY_COOLDOWN_MS = 24 * 60 * 60_000;
export const CAPTURE_TIMEOUT_MS = 30_000;
export const HP_RECOVERY_INTERVAL_MS = 2 * 60_000;
// Tavern rest: 1 minute heals 4 HP, i.e. 1 HP every 15 seconds.
export const TAVERN_HEAL_HP_PER_MIN = 30;
export const TAVERN_HEAL_INTERVAL_MS = 60_000 / TAVERN_HEAL_HP_PER_MIN; // 15_000
// Gold cost scales linearly with the amount of HP you want to recover.
export const TAVERN_GOLD_PER_HP = 0.2;
export const XP_BAR_SIZE = 10;

export const EVENT_RATES = {
  combat: 50,
  catch: 30,
  chest: 15,
  fail: 5
} as const;

export const RARITY_BASE_RATES: Record<Rarity, number> = {
  COMMON: 70,
  RARE: 20,
  EPIC: 8,
  LEGENDARY: 2
};

export const RARITY_POWER_RANGES: Record<Rarity, { min: number; max: number }> = {
  COMMON: { min: 6, max: 12 },
  RARE: { min: 12, max: 20 },
  EPIC: { min: 20, max: 30 },
  LEGENDARY: { min: 32, max: 45 }
};

// Use local ItemType union — no Prisma dependency
export const DAILY_ITEMS: ReadonlyArray<{ name: string; type: "TRAP" | "LUCK_BUFF"; power: number }> = [
  { name: "Hunter Trap", type: "TRAP", power: 1 },
  { name: "Lucky Clover", type: "LUCK_BUFF", power: 1 }
];
