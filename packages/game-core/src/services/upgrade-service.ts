/**
 * upgrade-service.ts — pure upgrade/scrap logic, no Prisma dependency.
 * Use in web API routes with @/lib/prisma for DB operations.
 */

import type { Rarity, ItemType } from "../types/rpg-enums";

export const SCRAP_VALUE_IN_GOLD = 5;
export const MAX_UPGRADE_LEVEL = 100;
const FAIL_BONUS_RATE = 0.1;
const MAX_FAILS_FOR_PITY = 5;

export const GEAR_TYPES: ItemType[] = ["WEAPON", "ARMOR", "ACCESSORY"];

export function getRarityMultiplier(rarity: Rarity): number {
  if (rarity === "LEGENDARY") return 15.0;
  if (rarity === "EPIC") return 6.0;
  if (rarity === "RARE") return 2.5;
  return 1.0;
}

export function rarityRank(rarity: Rarity): number {
  if (rarity === "LEGENDARY") return 4;
  if (rarity === "EPIC") return 3;
  if (rarity === "RARE") return 2;
  return 1;
}

/** Gold equivalent before scrap offset: `(level + 1) * 300 * rarityMultiplier` */
export function getUpgradeCost(currentLevel: number, rarity: Rarity): number {
  return Math.floor((currentLevel + 1) * 300 * getRarityMultiplier(rarity));
}

/** Base success rate — no pity / fail streak. */
export function getBaseSuccessRate(currentLevel: number): number {
  if (currentLevel < 3) return 1.0;
  if (currentLevel < 5) return 0.8;
  if (currentLevel < 7) return 0.6;
  if (currentLevel < 9) return 0.4;
  return 0.2;
}

export function getUpgradeSuccessRate(currentLevel: number): number {
  return getBaseSuccessRate(currentLevel);
}

export function getEffectiveSuccessRate(currentLevel: number, failCount: number): number {
  let baseRate = getBaseSuccessRate(currentLevel);
  let totalRate = baseRate + failCount * FAIL_BONUS_RATE;
  if (failCount >= MAX_FAILS_FOR_PITY) return 1.0;
  return Math.min(1.0, totalRate);
}

export type UpgradePaymentPreview = {
  baseGoldCost: number;
  scrapToUse: number;
  goldToUse: number;
};

export function previewUpgradePayment(
  userScrap: number,
  currentLevel: number,
  rarity: Rarity
): UpgradePaymentPreview {
  const baseGoldCost = getUpgradeCost(currentLevel, rarity);
  let remainingGoldCost = baseGoldCost;
  let scrapToUse = 0;
  let goldToUse = 0;
  const totalScrapValue = userScrap * SCRAP_VALUE_IN_GOLD;

  if (totalScrapValue >= remainingGoldCost) {
    scrapToUse = Math.ceil(remainingGoldCost / SCRAP_VALUE_IN_GOLD);
    remainingGoldCost = 0;
  } else {
    scrapToUse = userScrap;
    remainingGoldCost -= scrapToUse * SCRAP_VALUE_IN_GOLD;
    goldToUse = Math.ceil(remainingGoldCost);
  }

  return { baseGoldCost, scrapToUse, goldToUse };
}

export function calculateScrapValue(item: {
  power: number;
  bonusStr: number;
  bonusAgi: number;
  bonusDef: number;
  bonusHp: number;
  rarity: Rarity;
}): number {
  const statScore =
    item.power +
    item.bonusStr +
    item.bonusAgi +
    item.bonusDef * 1.5 +
    item.bonusHp * 0.25;
  return Math.floor(statScore * getRarityMultiplier(item.rarity));
}

export function sortGearKeepBestFirst<
  T extends { upgradeLevel: number; rarity: Rarity; power: number; id: string }
>(a: T, b: T): number {
  if (b.upgradeLevel !== a.upgradeLevel) return b.upgradeLevel - a.upgradeLevel;
  const rr = rarityRank(b.rarity) - rarityRank(a.rarity);
  if (rr !== 0) return rr;
  if (b.power !== a.power) return b.power - a.power;
  return a.id.localeCompare(b.id);
}
