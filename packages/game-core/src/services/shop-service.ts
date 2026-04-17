/**
 * shop-service.ts — pure shop catalog data and random logic (no Prisma).
 */

import type { Rarity } from "../types/rpg-enums";

// ─── Consumable Shop Catalog ─────────────────────────────────────────────────

export interface ShopCatalogEntry {
  key: string;
  name: string;
  description: string;
  type: string;
  power: number;
  price: number;
  tier: 1 | 2 | 3;
  emoji: string;
}

export const SHOP_CATALOG: ShopCatalogEntry[] = [
  // Tier 1
  { key: "trap_basic", name: "Hunter Trap", description: "Tăng cơ hội bắt giữ +1.", type: "TRAP", power: 1, price: 80, tier: 1, emoji: "🪤" },
  { key: "clover_basic", name: "Lucky Clover", description: "Tăng May Mắn +1.", type: "LUCK_BUFF", power: 1, price: 80, tier: 1, emoji: "🍀" },
  { key: "potion_basic", name: "Basic Potion", description: "Hồi phục ngay 10 HP.", type: "POTION", power: 10, price: 60, tier: 1, emoji: "🧪" },
  { key: "scout_lens", name: "Scout Lens", description: "Tiết lộ sự kiện đi săn tiếp theo.", type: "UTILITY", power: 0, price: 120, tier: 1, emoji: "🔍" },
  { key: "risk_coin", name: "Risk Coin", description: "Nhân phần thưởng vàng (0x, 1.5x, 2x, 5x).", type: "GAMBLE", power: 2, price: 100, tier: 1, emoji: "🪙" },
  { key: "blood_vial", name: "Blood Vial", description: "Mất 10 HP để nhận +5 STR cho lượt đi săn kế.", type: "BUFF", power: 5, price: 90, tier: 1, emoji: "🩸" },
  // Tier 2
  { key: "trap_rare", name: "Rare Trap", description: "Tăng cơ hội bắt giữ +5.", type: "TRAP", power: 5, price: 350, tier: 2, emoji: "🔱" },
  { key: "clover_4leaf", name: "Four-Leaf Clover", description: "Tăng May Mắn +5.", type: "LUCK_BUFF", power: 5, price: 350, tier: 2, emoji: "🌿" },
  { key: "potion_mid", name: "Potion", description: "Hồi phục ngay 25 HP.", type: "POTION", power: 25, price: 200, tier: 2, emoji: "⚗️" },
  { key: "hunters_mark", name: "Hunter's Mark", description: "Tăng sát thương +30% cho lượt đi săn kế.", type: "SITUATIONAL", power: 30, price: 300, tier: 2, emoji: "🎯" },
  { key: "bag_upgrade", name: "Reinforced Bag", description: "Tăng giới hạn hành trang +5.", type: "PERMANENT", power: 5, price: 500, tier: 2, emoji: "🎒" },
  { key: "beast_bait", name: "Beast Bait", description: "Tăng cơ hội gặp quái hiếm.", type: "ENCOUNTER", power: 1, price: 250, tier: 2, emoji: "🍖" },
  // Tier 3
  { key: "golden_contract", name: "Golden Contract", description: "+200% phần thưởng nhưng kẻ địch mạnh gấp đôi.", type: "RISK", power: 2, price: 800, tier: 3, emoji: "📜" },
  { key: "chaos_orb", name: "Chaos Orb", description: "Ngẫu nhiên +/-10 vào tất cả chỉ số.", type: "CHAOS", power: 10, price: 600, tier: 3, emoji: "🔮" },
  { key: "spirit_bond", name: "Spirit Bond", description: "Tăng phần thưởng pet mạnh nhất +80% trong 3 lượt.", type: "PET_BUFF", power: 30, price: 700, tier: 3, emoji: "🐾" },
];

export const CHEST_CATALOG: ShopCatalogEntry[] = [
  { key: "chest_common", name: "Rương Gỗ", description: "70% Tiêu hao, 25% Common, 5% Rare.", type: "GAMBLE", power: 0, price: 500, tier: 1, emoji: "📦" },
  { key: "chest_rare", name: "Rương Bạc", description: "50% Common, 45% Rare, 5% Epic.", type: "GAMBLE", power: 0, price: 2000, tier: 2, emoji: "🥈" },
  { key: "chest_epic", name: "Rương Vàng", description: "50% Rare, 40% Epic, 10% Jackpot!", type: "GAMBLE", power: 0, price: 5000, tier: 3, emoji: "🥇" },
];

export const DUNGEON_BUFF_ITEMS: ShopCatalogEntry[] = [
  { key: "hunters_mark_dungeon", name: "Hunter's Mark", description: "+30% sát thương trong Dungeon.", type: "CONSUMABLE", power: 30, price: 300, tier: 1, emoji: "🎯" },
  { key: "blood_vial_dungeon", name: "Blood Vial", description: "+5 STR nhưng -10 HP khi vào.", type: "CONSUMABLE", power: 5, price: 200, tier: 1, emoji: "🩸" },
  { key: "steel_skin", name: "Steel Skin", description: "+15 DEF trong Dungeon.", type: "CONSUMABLE", power: 15, price: 350, tier: 1, emoji: "🛡️" },
  { key: "agility_tonic", name: "Swift Tonic", description: "+15 AGI trong Dungeon.", type: "CONSUMABLE", power: 15, price: 350, tier: 1, emoji: "🍃" },
  { key: "chaos_orb_dungeon", name: "Chaos Orb", description: "+/-10 ngẫu nhiên vào tất cả chỉ số.", type: "CHAOS", power: 10, price: 450, tier: 2, emoji: "🔮" },
  { key: "lucky_charm_dungeon", name: "Lucky Charm", description: "+10% cơ hội nhận item hiếm trong Dungeon.", type: "CONSUMABLE", power: 10, price: 300, tier: 2, emoji: "🍀" },
  { key: "berserker_brew", name: "Berserker Brew", description: "+20% ATK nhưng -10% DEF.", type: "CONSUMABLE", power: 20, price: 400, tier: 2, emoji: "🍷" },
  { key: "guardian_elixir", name: "Guardian Elixir", description: "+20% DEF nhưng -10% AGI.", type: "CONSUMABLE", power: 20, price: 400, tier: 2, emoji: "🛡️" },
  { key: "luck_potion", name: "Luck Potion", description: "+20 Luck trong Dungeon.", type: "CONSUMABLE", power: 20, price: 400, tier: 2, emoji: "🍀" },
];

export const SHOP_REFRESH_GOLD = 500;
const SHOP_SLOTS = 5;

// ─── Rolling helpers ─────────────────────────────────────────────────────────

function pickFromPool<T>(pool: T[]): T | undefined {
  if (pool.length === 0) return undefined;
  return pool[Math.floor(Math.random() * pool.length)];
}

function rollShopItemsFn(excludeKeys: Set<string> = new Set()): ShopCatalogEntry[] {
  const tier1 = SHOP_CATALOG.filter((e) => e.tier === 1 && !excludeKeys.has(e.key));
  const tier2 = SHOP_CATALOG.filter((e) => e.tier === 2 && !excludeKeys.has(e.key));
  const tier3 = SHOP_CATALOG.filter((e) => e.tier === 3 && !excludeKeys.has(e.key));

  const pools = [
    tier1.length > 0 ? tier1 : SHOP_CATALOG.filter((e) => e.tier === 1),
    tier2.length > 0 ? tier2 : SHOP_CATALOG.filter((e) => e.tier === 2),
    tier3.length > 0 ? tier3 : SHOP_CATALOG.filter((e) => e.tier === 3),
  ];

  const picks: ShopCatalogEntry[] = [];
  const usedKeys = new Set<string>();

  for (let slot = 0; slot < SHOP_SLOTS; slot++) {
    const r = Math.random();
    let pool = pools[0] ?? [];
    if (r < 0.25) pool = pools[1] ?? [];
    if (r < 0.12) pool = pools[2] ?? [];

    let chosen: ShopCatalogEntry | undefined;
    for (let tries = 0; tries < 5; tries++) {
      chosen = pickFromPool(pool);
      if (!chosen || !usedKeys.has(chosen.key)) break;
    }
    if (!chosen) chosen = pickFromPool(pools.flat());
    if (!chosen) continue;

    picks.push(chosen);
    usedKeys.add(chosen.key);
  }

  return picks.sort(() => Math.random() - 0.5);
}

export function getCatalogEntry(key: string): ShopCatalogEntry | undefined {
  return SHOP_CATALOG.find((e) => e.key === key);
}

export function getChestEntry(key: string): ShopCatalogEntry | undefined {
  return CHEST_CATALOG.find((e) => e.key === key);
}

// ─── Equipment Shop ─────────────────────────────────────────────────────────

export interface EqShopEntry {
  name: string;
  type: string;
  rarity: Rarity;
  power: number;
  bonusStr: number;
  bonusAgi: number;
  bonusDef: number;
  bonusHp: number;
  price: number;
}

export function rollEquipmentRarityFn(level: number): Rarity {
  const r = Math.random();
  if (level <= 5) return "COMMON";
  if (level <= 10) return r < 0.3 ? "RARE" : "COMMON";
  if (level <= 20) {
    if (r < 0.15) return "EPIC";
    if (r < 0.50) return "RARE";
    return "COMMON";
  }
  if (r < 0.25) return "EPIC";
  if (r < 0.60) return "RARE";
  return "COMMON";
}

export function getEqPrice(rarity: Rarity): number {
  switch (rarity) {
    case "COMMON": return 150 + Math.floor(Math.random() * 50);
    case "RARE": return 400 + Math.floor(Math.random() * 150);
    case "EPIC": return 1200 + Math.floor(Math.random() * 400);
    case "LEGENDARY": return 3000 + Math.floor(Math.random() * 1000);
  }
}

// ─── Accessory Prices ────────────────────────────────────────────────────────

export function getAccessoryPrice(rarity: Rarity): number {
  switch (rarity) {
    case "COMMON": return 150;
    case "RARE": return 450;
    case "EPIC": return 1200;
    case "LEGENDARY": return 3000;
  }
}

// ─── Pet Shop Prices ─────────────────────────────────────────────────────────

export const PET_SHOP_PRICES: Record<Rarity, number> = {
  COMMON: 100,
  RARE: 1000,
  EPIC: 5000,
  LEGENDARY: 15000,
};

// ─── Seeded Daily Skill Shuffle ────────────────────────────────────────────────

/** Returns 5 daily skills deterministically based on userId + VN date. */
export function getDailySkills<T extends { id: string }>(userId: string, skills: T[], getVnDayString: () => string): T[] {
  const seedString = `${userId}-${getVnDayString()}`;
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0;
  }
  const seededRandom = () => {
    const x = Math.sin(hash++) * 10000;
    return x - Math.floor(x);
  };
  const pool = [...skills];
  const result: T[] = [];
  for (let i = 0; i < 5 && pool.length > 0; i++) {
    const index = Math.floor(seededRandom() * pool.length);
    const chosen = pool.splice(index, 1)[0];
    if (chosen !== undefined) result.push(chosen);
  }
  return result;
}
