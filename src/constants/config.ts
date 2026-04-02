import { ItemType, Rarity } from "@prisma/client";

export const HUNT_COOLDOWN_MS = 15_000;
export const HOSPITAL_COOLDOWN_MS = 30 * 60_000;
export const DAILY_COOLDOWN_MS = 24 * 60 * 60_000;
export const CAPTURE_TIMEOUT_MS = 30_000;
export const HP_RECOVERY_INTERVAL_MS = 2 * 60_000;
// Tavern rest: 1 minute heals 4 HP, i.e. 1 HP every 15 seconds.
export const TAVERN_HEAL_HP_PER_MIN = 4;
export const TAVERN_HEAL_INTERVAL_MS = 60_000 / TAVERN_HEAL_HP_PER_MIN; // 15_000
// Gold cost scales linearly with the amount of HP you want to recover.
export const TAVERN_GOLD_PER_HP = 1;
export const XP_BAR_SIZE = 10;

export const EVENT_RATES = {
  combat: 50,
  catch: 30,
  chest: 15,
  fail: 5
} as const;

export const RARITY_BASE_RATES: Record<Rarity, number> = {
  [Rarity.COMMON]: 70,
  [Rarity.RARE]: 20,
  [Rarity.EPIC]: 8,
  [Rarity.LEGENDARY]: 2
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
