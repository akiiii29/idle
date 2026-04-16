import { ItemRarity, type GameItem, WEAPON_POOL, ARMOR_POOL, pickRandomItem, getItemsByRarity } from "@game/core";
import { SHOP_CATALOG } from "./shop-service";
import { ItemType } from "@prisma/client";

export interface ChestResult {
  type: "ITEM" | "CONSUMABLE";
  item?: GameItem;
  consumableKey?: string;
  isJackpot?: boolean;
}

export function openChest(chestKey: string): ChestResult {
  const roll = Math.random() * 100;

  if (chestKey === "chest_common") {
    if (roll < 70) {
      // 70% Consumable (Basic items)
      const basics = SHOP_CATALOG.filter(i => i.price <= 100 && i.type !== ItemType.GAMBLE);
      const pick = basics[Math.floor(Math.random() * basics.length)]!;
      return { type: "CONSUMABLE", consumableKey: pick.key };
    } else if (roll < 95) {
      // 25% Common Gear
      return { type: "ITEM", item: rollRandomGear("COMMON") };
    } else {
      // 5% Rare Gear
      return { type: "ITEM", item: rollRandomGear("RARE") };
    }
  }

  if (chestKey === "chest_rare") {
    if (roll < 50) {
      return { type: "ITEM", item: rollRandomGear("COMMON") };
    } else if (roll < 95) {
      return { type: "ITEM", item: rollRandomGear("RARE") };
    } else {
      return { type: "ITEM", item: rollRandomGear("EPIC") };
    }
  }

  if (chestKey === "chest_epic") {
    if (roll < 50) {
      return { type: "ITEM", item: rollRandomGear("RARE") };
    } else if (roll < 90) {
      return { type: "ITEM", item: rollRandomGear("EPIC") };
    } else {
      // 10% Jackpot (Epic/Rare with +30% stats)
      const base = rollRandomGear(Math.random() < 0.7 ? "EPIC" : "RARE");
      const jackpot = applyJackpot(base);
      return { type: "ITEM", item: jackpot, isJackpot: true };
    }
  }

  throw new Error("Unknown chest key");
}

function rollRandomGear(rarity: ItemRarity): GameItem {
  const pool = Math.random() < 0.5 ? WEAPON_POOL : ARMOR_POOL;
  const items = getItemsByRarity(pool, rarity);
  return pickRandomItem(items.length > 0 ? items : getItemsByRarity(pool, "COMMON"))!;
}

function applyJackpot(item: GameItem): GameItem {
  const luckyItem = { ...item };
  luckyItem.name = `✨ [JACKPOT] ${item.name} ✨`;
  if (luckyItem.power) luckyItem.power = Math.floor(luckyItem.power * 1.35);
  if (luckyItem.bonusStr) luckyItem.bonusStr = Math.floor(luckyItem.bonusStr * 1.35);
  if (luckyItem.bonusAgi) luckyItem.bonusAgi = Math.floor(luckyItem.bonusAgi * 1.35);
  if (luckyItem.bonusDef) luckyItem.bonusDef = Math.floor(luckyItem.bonusDef * 1.35);
  if (luckyItem.bonusHp) luckyItem.bonusHp = Math.floor(luckyItem.bonusHp * 1.35);
  return luckyItem;
}
