import { ItemType } from "@prisma/client";
import { prisma } from "./prisma";
import { upsertItem, getUserWithRelations } from "./user-service";
import { type GameItem, WEAPON_POOL, ARMOR_POOL, getItemsByRarity, pickRandomItem, ItemRarity } from "@game/core";
import { addEquipmentToInventory } from "./equipment-service";
import { PET_CONFIGS } from "@game/core";
import { autoFuseBeasts } from "./beast-service";

// ─── Item Catalog ──────────────────────────────────────────────────────────

export interface ShopCatalogEntry {
  key: string;
  name: string;
  description: string;
  type: ItemType;
  power: number;
  price: number;
  tier: 1 | 2 | 3;
  emoji: string;
}

export const SHOP_CATALOG: ShopCatalogEntry[] = [
  // ── Tier 1 (Core) ───────────────────────────────────────────────────
  {
    key: "trap_basic",
    name: "Hunter Trap",
    description: "Tăng cơ hội bắt giữ của bạn lên +1.",
    type: ItemType.TRAP,
    power: 1,
    price: 80,
    tier: 1,
    emoji: "🪤",
  },
  {
    key: "clover_basic",
    name: "Lucky Clover",
    description: "Tăng chỉ số May Mắn của bạn lên +1 trong các lần đi săn.",
    type: ItemType.LUCK_BUFF,
    power: 1,
    price: 80,
    tier: 1,
    emoji: "🍀",
  },
  {
    key: "potion_basic",
    name: "Basic Potion",
    description: "Hồi phục ngay lập tức 10 máu (HP).",
    type: ItemType.POTION,
    power: 10,
    price: 60,
    tier: 1,
    emoji: "🧪",
  },
  // ── Tier 2 (Limited) ────────────────────────────────────────────────
  {
    key: "trap_rare",
    name: "Rare Trap",
    description: "Cái bẫy vượt trội, tăng cơ hội bắt giữ lên +5.",
    type: ItemType.TRAP,
    power: 5,
    price: 350,
    tier: 2,
    emoji: "🔱",
  },
  {
    key: "clover_4leaf",
    name: "Four-Leaf Clover",
    description: "Một loại cỏ 4 lá hiếm, tăng May Mắn lên +5.",
    type: ItemType.LUCK_BUFF,
    power: 5,
    price: 350,
    tier: 2,
    emoji: "🌿",
  },
  {
    key: "potion_mid",
    name: "Potion",
    description: "Hồi phục ngay lập tức 25 máu (HP).",
    type: ItemType.POTION,
    power: 25,
    price: 200,
    tier: 2,
    emoji: "⚗️",
  },
  // ── Tier 1.5 (pre-tier) ─────────────────────────────────────────────
  {
    key: "scout_lens",
    name: "Scout Lens",
    description: "Tiết lộ sự kiện đi săn tiếp theo trước khi thực hiện /hunt.",
    type: ItemType.UTILITY,
    power: 0,
    price: 120,
    tier: 1,
    emoji: "🔍",
  },
  {
    key: "risk_coin",
    name: "Risk Coin",
    description: "Nhân phần thưởng vàng của lượt đi săn tiếp theo ngẫu nhiên (0x, 1.5x, 2x, 5x).",
    type: ItemType.GAMBLE,
    power: 2,
    price: 100,
    tier: 1,
    emoji: "🪙",
  },
  {
    key: "blood_vial",
    name: "Blood Vial",
    description: "Mất 10 máu để nhận +5 Sức mạnh (STR) cho lượt đi săn tiếp theo.",
    type: ItemType.BUFF,
    power: 5,
    price: 90,
    tier: 1,
    emoji: "🩸",
  },

  // ── Tier 2 ─────────────────────────────────────────────────────────
  {
    key: "hunters_mark",
    name: "Hunter's Mark",
    description: "Tăng sát thương chiến đấu thêm 30% trong lượt đi săn kế tiếp.",
    type: ItemType.SITUATIONAL,
    power: 30,
    price: 300,
    tier: 2,
    emoji: "🎯",
  },
  {
    key: "bag_upgrade",
    name: "Reinforced Bag",
    description: "Tăng giới hạn hành trang lên +5 vĩnh viễn.",
    type: ItemType.PERMANENT,
    power: 5,
    price: 500,
    tier: 2,
    emoji: "🎒",
  },
  {
    key: "beast_bait",
    name: "Beast Bait",
    description: "Tăng xác suất gặp quái hiếm trong lượt đi săn tiếp theo.",
    type: ItemType.ENCOUNTER,
    power: 1,
    price: 250,
    tier: 2,
    emoji: "🍖",
  },

  // ── Tier 3 ─────────────────────────────────────────────────────────
  {
    key: "golden_contract",
    name: "Golden Contract",
    description: "Lượt đi săn tiếp theo: +200% phần thưởng nhưng kẻ địch mạnh gấp đôi.",
    type: ItemType.RISK,
    power: 2,
    price: 800,
    tier: 3,
    emoji: "📜",
  },
  {
    key: "chaos_orb",
    name: "Chaos Orb",
    description: "Ngẫu nhiên nhận +10 STR/AGI/MAY MẮN hoặc mất -10 ở tất cả chỉ số.",
    type: ItemType.CHAOS,
    power: 10,
    price: 600,
    tier: 3,
    emoji: "🔮",
  },
  {
    key: "spirit_bond",
    name: "Spirit Bond",
    description: "Tăng phần thưởng từ thú đồng hành mạnh nhất từ +50% lên +80% trong 3 lượt đi săn.",
    type: ItemType.PET_BUFF,
    power: 30,
    price: 700,
    tier: 3,
    emoji: "🐾",
  },
];

export const CHEST_CATALOG: ShopCatalogEntry[] = [
  {
    key: "chest_common",
    name: "Rương Gỗ (Common)",
    description: "Chứa: 70% Tiêu hao, 25% Đồ Common, 5% Đồ Rare.",
    type: ItemType.GAMBLE,
    power: 0,
    price: 500,
    tier: 1,
    emoji: "📦",
  },
  {
    key: "chest_rare",
    name: "Rương Bạc (Rare)",
    description: "Chứa: 50% Đồ Common, 45% Đồ Rare, 5% Đồ Epic.",
    type: ItemType.GAMBLE,
    power: 0,
    price: 2000,
    tier: 2,
    emoji: "🥈",
  },
  {
    key: "chest_epic",
    name: "Rương Vàng (Epic)",
    description: "Chứa: 50% Đồ Rare, 40% Đồ Epic, 10% Jackpot (Stats +30%)!",
    type: ItemType.GAMBLE,
    power: 0,
    price: 5000,
    tier: 3,
    emoji: "🥇",
  },
];

// ─── Dungeon Prepare Catalog ──────────────────────────────────────────

export const DUNGEON_BUFF_ITEMS: ShopCatalogEntry[] = [
  {
    key: "hunters_mark_dungeon",
    name: "Hunter's Mark",
    description: "Tăng sát thương người chơi lên +30% trong suốt chuyến đi Dungeon.",
    type: ItemType.CONSUMABLE,
    power: 30,
    price: 300,
    tier: 1,
    emoji: "🎯",
  },
  {
    key: "blood_vial_dungeon",
    name: "Blood Vial",
    description: "Tăng +5 Sức mạnh (STR) nhưng mất 10 HP khi bắt đầu Dungeon.",
    type: ItemType.CONSUMABLE,
    power: 5,
    price: 200,
    tier: 1,
    emoji: "🩸",
  },
  {
    key: "steel_skin",
    name: "Steel Skin",
    description: "Tăng +15 Phòng thủ (DEF) trong suốt chuyến đi Dungeon.",
    type: ItemType.CONSUMABLE,
    power: 15,
    price: 350,
    tier: 1,
    emoji: "🛡️",
  },
  {
    key: "agility_tonic",
    name: "Swift Tonic",
    description: "Tăng +15 Tốc độ (AGI) trong suốt chuyến đi Dungeon.",
    type: ItemType.CONSUMABLE,
    power: 15,
    price: 350,
    tier: 1,
    emoji: "🍃",
  },
  {
    key: "chaos_orb_dungeon",
    name: "Chaos Orb",
    description: "Biến động mạnh mẽ: +/-10 ngẫu nhiên vào tất cả chỉ số.",
    type: ItemType.CHAOS,
    power: 10,
    price: 450,
    tier: 2,
    emoji: "🔮",
  },
  {
    key: "lucky_charm_dungeon",
    name: "Lucky Charm",
    description: "Tăng 10% cơ hội nhận được vật phẩm hiếm khi đánh bại quái trong Dungeon.",
    type: ItemType.CONSUMABLE,
    power: 10,
    price: 300,
    tier: 2,
    emoji: "🍀",
  },
  {
    key: "berserker_brew",
    name: "Berserker Brew",
    description: "Tăng 20% Sát thương (ATK) nhưng giảm 10% Phòng thủ (DEF) trong suốt chuyến đi.",
    type: ItemType.CONSUMABLE,
    power: 20,
    price: 400,
    tier: 2,
    emoji: "🍷",
  },
  {
    key: "guardian_elixir",
    name: "Guardian Elixir",
    description: "Tăng 20% Phòng thủ (DEF) nhưng giảm 10% Tốc độ (AGI) trong suốt chuyến đi.",
    type: ItemType.CONSUMABLE,
    power: 20,
    price: 400,
    tier: 2,
    emoji: "🛡️",
  },
  {
    key: "luck_potion",
    name: "Luck Potion",
    description: "Tăng 20 Luck trong suốt chuyến đi.",
    type: ItemType.CONSUMABLE,
    power: 20,
    price: 400,
    tier: 2,
    emoji: "🍀",
  },
];

export function getDungeonPrepItems(): ShopCatalogEntry[] {
  // Always include Potion as one of the items or handled separately
  return DUNGEON_BUFF_ITEMS;
}

export function getCatalogEntry(key: string): ShopCatalogEntry | undefined {
  return SHOP_CATALOG.find((e) => e.key === key);
}

// ─── Daily Refresh ─────────────────────────────────────────────────────────

const SHOP_SLOTS = 5;
export const SHOP_REFRESH_GOLD = 500;

import { isDifferentVnDay, msUntilNextVnMidnight } from "../utils/time";

/** Returns true if the shop needs a new daily roll (last refresh was on a previous VN day). */
function needsRefresh(refreshedAt: Date): boolean {
  return isDifferentVnDay(refreshedAt);
}

/** Pick SHOP_SLOTS random items from the catalog ensuring variety. */
function rollShopItems(): ShopCatalogEntry[] {
  const tier1 = SHOP_CATALOG.filter((e) => e.tier === 1);
  const tier2 = SHOP_CATALOG.filter((e) => e.tier === 2);
  const tier3 = SHOP_CATALOG.filter((e) => e.tier === 3);

  const pools = [tier1, tier2, tier3];
  const picks: ShopCatalogEntry[] = [];
  const usedKeys = new Set<string>();

  const pickFromPool = (pool: ShopCatalogEntry[]): ShopCatalogEntry | undefined => {
    if (pool.length === 0) return undefined;
    return pool[Math.floor(Math.random() * pool.length)]!;
  };

  for (let slot = 0; slot < SHOP_SLOTS; slot++) {
    // Prefer lower tiers, but allow tier 3 occasionally.
    const r = Math.random();
    let pool: ShopCatalogEntry[] = tier1;
    if (r < 0.25 && tier2.length > 0) pool = tier2;
    if (r < 0.12 && tier3.length > 0) pool = tier3;

    // Avoid duplicates when possible.
    let chosen: ShopCatalogEntry | undefined;
    for (let tries = 0; tries < 5; tries++) {
      chosen = pickFromPool(pool);
      if (!chosen) break;
      if (!usedKeys.has(chosen.key)) break;
      chosen = undefined;
    }
    if (!chosen) chosen = pickFromPool(pool) ?? pickFromPool(pools[Math.floor(Math.random() * pools.length)]!)!;

    picks.push(chosen);
    usedKeys.add(chosen.key);
  }

  // Shuffle to randomize slot order.
  return picks.sort(() => Math.random() - 0.5);
}

/** Pick SHOP_SLOTS random items excluding some keys (when possible). */
function rollShopItemsExcluding(excludeKeys: Set<string>): ShopCatalogEntry[] {
  const tier1All = SHOP_CATALOG.filter((e) => e.tier === 1);
  const tier2All = SHOP_CATALOG.filter((e) => e.tier === 2);
  const tier3All = SHOP_CATALOG.filter((e) => e.tier === 3);

  const tier1 = tier1All.filter((e) => !excludeKeys.has(e.key));
  const tier2 = tier2All.filter((e) => !excludeKeys.has(e.key));
  const tier3 = tier3All.filter((e) => !excludeKeys.has(e.key));

  // If we excluded everything, fall back to normal rolling.
  const hasAny =
    tier1.length > 0 || tier2.length > 0 || tier3.length > 0;
  if (!hasAny) return rollShopItems();

  const tier1Pool = tier1.length > 0 ? tier1 : tier1All;
  const tier2Pool = tier2.length > 0 ? tier2 : tier2All;
  const tier3Pool = tier3.length > 0 ? tier3 : tier3All;

  const pools = [tier1Pool, tier2Pool, tier3Pool];
  const picks: ShopCatalogEntry[] = [];
  const usedKeys = new Set<string>();

  const pickFromPool = (pool: ShopCatalogEntry[]): ShopCatalogEntry | undefined => {
    if (pool.length === 0) return undefined;
    return pool[Math.floor(Math.random() * pool.length)]!;
  };

  for (let slot = 0; slot < SHOP_SLOTS; slot++) {
    const r = Math.random();
    let pool: ShopCatalogEntry[] = tier1Pool;
    if (r < 0.25 && tier2Pool.length > 0) pool = tier2Pool;
    if (r < 0.12 && tier3Pool.length > 0) pool = tier3Pool;

    let chosen: ShopCatalogEntry | undefined;
    for (let tries = 0; tries < 5; tries++) {
      chosen = pickFromPool(pool);
      if (!chosen) break;
      if (!usedKeys.has(chosen.key)) break;
      chosen = undefined;
    }

    if (!chosen) {
      const allPool = pools.flat();
      chosen = allPool.find((x) => !usedKeys.has(x.key)) ?? allPool[Math.floor(Math.random() * allPool.length)]!;
    }

    picks.push(chosen);
    usedKeys.add(chosen.key);
  }

  return picks.sort(() => Math.random() - 0.5);
}

/** Get (and lazily refresh) the user's daily shop listings. */
export async function getUserShop(
  userId: string
): Promise<{ listings: typeof SHOP_CATALOG; listing: any[] }> {
  // Only look for main shop slots (1-5)
  const existing = await prisma.shopListing.findMany({
    where: { userId, slot: { gte: 1, lte: SHOP_SLOTS } },
    orderBy: { slot: 'asc' }
  });

  const needsRoll =
    existing.length !== SHOP_SLOTS || (existing.length > 0 ? needsRefresh(existing[0]!.refreshedAt) : true);

  if (needsRoll) {
    const picks = rollShopItems();
    const now = new Date();

    await prisma.$transaction(
      picks.map((item, idx) =>
        prisma.shopListing.upsert({
          where: { userId_slot: { userId, slot: idx + 1 } },
          create: {
            userId,
            slot: idx + 1,
            itemKey: item.key,
            purchased: false,
            refreshedAt: now,
          },
          update: {
            itemKey: item.key,
            purchased: false,
            refreshedAt: now,
          },
        })
      )
    );

    // Fetch newly created to return it (instead of manual map to avoid out of sync)
    const fresh = await prisma.shopListing.findMany({
      where: { userId, slot: { gte: 1, lte: SHOP_SLOTS } },
      orderBy: { slot: 'asc' }
    });

    return { listings: picks, listing: fresh };
  }

  const listingData = existing
    .sort((a, b) => a.slot - b.slot)
    .map((row) => ({
      slot: row.slot,
      itemKey: row.itemKey,
      purchased: row.purchased,
      refreshedAt: row.refreshedAt,
    }));

  const listings = listingData.map(
    (row) => getCatalogEntry(row.itemKey)!
  );

  return { listings, listing: listingData };
}

/** Buy an item at a given slot. Returns success + message. */
export async function buyShopItem(
  userId: string,
  slot: number
): Promise<{ success: boolean; message: string; item?: ShopCatalogEntry }> {
  return prisma.$transaction(async (tx) => {
    const listing = await tx.shopListing.findUnique({
      where: { userId_slot: { userId, slot } },
    });

    if (!listing) {
      return { success: false, message: "Vị trí cửa hàng không hợp lệ." };
    }

    if (listing.purchased) {
      return { success: false, message: `Vị trí **${slot}** đã hết hàng hôm nay.` };
    }

    const catalogItem = getCatalogEntry(listing.itemKey);
    if (!catalogItem) {
      return { success: false, message: "Món đồ này không còn tồn tại. Hãy liên hệ quản trị viên." };
    }

    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, message: "Không tìm thấy người chơi." };

    if (user.gold < catalogItem.price) {
      return {
        success: false,
        message: `💸 Bạn cần **${catalogItem.price} vàng** nhưng hiện chỉ có **${user.gold} vàng**.`,
      };
    }

    // Deduct gold
    await tx.user.update({
      where: { id: userId },
      data: { gold: { decrement: catalogItem.price } },
    });

    // Give item
    await upsertItem(tx as any, userId, {
      name: catalogItem.name,
      type: catalogItem.type,
      power: catalogItem.power,
      quantity: 1,
    });

    // Mark as purchased
    await tx.shopListing.update({
      where: { userId_slot: { userId, slot } },
      data: { purchased: true },
    });

    return { success: true, message: "ok", item: catalogItem };
  });
}

/** Manual refresh (reroll) with gold cost. */
export async function refreshShopForUser(
  userId: string
): Promise<{ success: boolean; message: string; listings?: typeof SHOP_CATALOG; listing?: any[] }> {
  const txRes = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, message: "Không tìm thấy người chơi." };

    if (user.gold < SHOP_REFRESH_GOLD) {
      return {
        success: false,
        message: `💸 Bạn cần ${SHOP_REFRESH_GOLD} vàng để làm mới shop, nhưng hiện bạn chỉ có ${user.gold} vàng.`,
      };
    }

    const existing = await tx.shopListing.findMany({ where: { userId } });
    const now = new Date();

    // Daily roll needed? If yes, we still do it here.
    const mustDailyRoll =
      existing.length !== SHOP_SLOTS ||
      (existing[0]?.refreshedAt ? needsRefresh(existing[0]!.refreshedAt) : true);

    // Deduct gold first.
    await tx.user.update({
      where: { id: userId },
      data: { gold: { decrement: SHOP_REFRESH_GOLD } },
    });

    // Always reroll all 5 slots and reset purchased flags.
    // This means: regardless of whether the user already bought some slots,
    // paying 500 gold will replace the entire shop with 5 new items.
    const picks = rollShopItems();
    await Promise.all(
      picks.map((item, idx) =>
        tx.shopListing.upsert({
          where: { userId_slot: { userId, slot: idx + 1 } },
          create: {
            userId,
            slot: idx + 1,
            itemKey: item.key,
            purchased: false,
            refreshedAt: now,
          },
          update: {
            itemKey: item.key,
            purchased: false,
            refreshedAt: now,
          },
        })
      )
    );

    return { success: true, message: "ok" };
  });

  if (!txRes.success) return txRes as any;

  const rolled = await getUserShop(userId);
  return { success: true, message: "ok", listings: rolled.listings, listing: rolled.listing };
}

// ─── Next Reset Time ───────────────────────────────────────────────────────

export function msUntilNextReset(): number {
  return msUntilNextVnMidnight();
}

// ─── Equipment Shop (In-Memory) ───────────────────────────────────────────

export interface EqShopEntry {
  item: GameItem;
  price: number;
  purchased: boolean;
}

export interface EqShopSession {
  userId: string;
  items: EqShopEntry[];
  refreshedAt: Date;
}

export const eqShopCache = new Map<string, EqShopSession>();

function rollEquipmentRarity(level: number): "COMMON" | "RARE" | "EPIC" {
  const r = Math.random();
  if (level <= 5) return "COMMON";
  if (level <= 10) return r < 0.3 ? "RARE" : "COMMON";
  if (level <= 20) {
    if (r < 0.15) return "EPIC";
    if (r < 0.50) return "RARE";
    return "COMMON";
  }
  // Level 20+
  if (r < 0.25) return "EPIC";
  if (r < 0.60) return "RARE";
  return "COMMON";
}

function getEqPrice(rarity: ItemRarity): number {
  switch (rarity) {
    case "COMMON": return 150 + Math.floor(Math.random() * 50);
    case "RARE": return 400 + Math.floor(Math.random() * 150);
    case "EPIC": return 1200 + Math.floor(Math.random() * 400);
    default: return 9999;
  }
}

function generateEquipmentShop(level: number): EqShopEntry[] {
  const picks: EqShopEntry[] = [];
  for (let i = 0; i < 5; i++) {
    const rarity = rollEquipmentRarity(level);
    const useWeapon = Math.random() < 0.6;
    const pool = useWeapon ? WEAPON_POOL : ARMOR_POOL;
    const items = getItemsByRarity(pool, rarity);
    const item = pickRandomItem(items.length > 0 ? items : getItemsByRarity(pool, "COMMON"));

    if (item) {
      picks.push({
        item,
        price: getEqPrice(item.rarity),
        purchased: false
      });
    }
  }
  return picks;
}

export async function getEquipmentShop(userId: string): Promise<EqShopSession> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { level: true } });
  const level = user?.level ?? 1;

  const existing = eqShopCache.get(userId);
  if (existing && !needsRefresh(existing.refreshedAt)) {
    return existing;
  }

  const session: EqShopSession = {
    userId,
    items: generateEquipmentShop(level),
    refreshedAt: new Date()
  };
  eqShopCache.set(userId, session);
  return session;
}

export async function refreshEqShopForUser(userId: string): Promise<{ success: boolean; message: string; session?: EqShopSession }> {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, message: "Không tìm thấy người chơi!" };

    if (user.gold < SHOP_REFRESH_GOLD) {
      return { success: false, message: `Bạn cần ${SHOP_REFRESH_GOLD} vàng để làm mới.` };
    }

    await tx.user.update({
      where: { id: userId },
      data: { gold: { decrement: SHOP_REFRESH_GOLD } }
    });

    const session: EqShopSession = {
      userId,
      items: generateEquipmentShop(user.level),
      refreshedAt: new Date()
    };
    eqShopCache.set(userId, session);

    return { success: true, message: "ok", session };
  });
}

export async function buyEquipmentShopItem(userId: string, slot: number): Promise<{ success: boolean; message: string }> {
  const session = eqShopCache.get(userId);
  if (!session) return { success: false, message: "Cửa hàng đã hết hạn." };

  const entry = session.items[slot - 1];
  if (!entry) return { success: false, message: "Vị trí không hợp lệ." };
  if (entry.purchased) return { success: false, message: "Món đồ này đã bán!" };

  const res = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, message: "Không tìm thấy user." };

    if (user.gold < entry.price) {
      return { success: false, message: `Bạn không đủ ${entry.price} vàng.` };
    }

    const itemCount = await tx.item.count({ where: { ownerId: userId } });
    const eqType = entry.item.type as ItemType;
    const alreadyHaveStack = await tx.item.findFirst({
      where: { ownerId: userId, name: entry.item.name, type: eqType },
    });
    if (itemCount >= user.inventoryLimit && !alreadyHaveStack) {
      return { success: false, message: `Túi đồ đầy (${itemCount}/${user.inventoryLimit}). Cần dọn dẹp trước!` };
    }

    await tx.user.update({
      where: { id: userId },
      data: { gold: { decrement: entry.price } }
    });

    return { success: true, message: "ok" };
  });

  if (!res.success) return res;

  const addRes = await addEquipmentToInventory(userId, {
    ...entry.item,
    type: entry.item.type as any,
    power: entry.item.power ?? 0
  });
  if (!addRes.added) {
    await prisma.user.update({
      where: { id: userId },
      data: { gold: { increment: entry.price } },
    });
    return { success: false, message: addRes.message };
  }
  entry.purchased = true;
  return { success: true, message: addRes.message };
}

// ─── Accessory Shop (Persistent Daily Slots 21-25) ────────────

const ACC_SHOP_SLOTS = 5;
const ACC_SLOT_START = 21;

import { ACCESSORY_CONFIGS } from "@game/core";

export async function getAccessoryShop(userId: string): Promise<{ items: any[]; listings: any[] }> {
  const existing = await prisma.shopListing.findMany({
    where: { userId, slot: { gte: ACC_SLOT_START, lte: ACC_SLOT_START + ACC_SHOP_SLOTS - 1 } },
    orderBy: { slot: 'asc' }
  });

  const needsRoll = existing.length === 0 || needsRefresh(existing[0]!.refreshedAt);

  if (needsRoll) {
    // Filter pool for Common/Rare only as requested
    const pool = Object.values(ACCESSORY_CONFIGS).filter(a => a.rarity === "COMMON" || a.rarity === "RARE");
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, ACC_SHOP_SLOTS);

    const now = new Date();
    await prisma.$transaction([
      prisma.shopListing.deleteMany({
        where: { userId, slot: { gte: ACC_SLOT_START, lte: ACC_SLOT_START + ACC_SHOP_SLOTS - 1 } }
      }),
      ...selected.map((item, idx) => prisma.shopListing.create({
        data: {
          userId,
          slot: ACC_SLOT_START + idx,
          itemKey: item.name, // Use name since ACCESSORY_CONFIGS is keyed by name
          purchased: false,
          refreshedAt: now,
        }
      }))
    ]);

    const fresh = await prisma.shopListing.findMany({
        where: { userId, slot: { gte: ACC_SLOT_START, lte: ACC_SLOT_START + ACC_SHOP_SLOTS - 1 } },
        orderBy: { slot: 'asc' }
    });

    return { 
        items: selected.map(s => ({ ...s, price: s.rarity === "COMMON" ? 150 : 450 })), 
        listings: fresh 
    };
  }

  const items = existing.map(listing => {
    const config = ACCESSORY_CONFIGS[listing.itemKey];
    return {
        ...config,
        price: config?.rarity === "COMMON" ? 150 : 450
    };
  });

  return { items, listings: existing };
}

export async function buyAccessoryShopItem(userId: string, slot: number): Promise<{ success: boolean; message: string }> {
  return prisma.$transaction(async (tx) => {
    const listing = await tx.shopListing.findUnique({
      where: { userId_slot: { userId, slot } },
    });

    if (!listing || listing.slot < ACC_SLOT_START) return { success: false, message: "Vị trí không hợp lệ." };
    if (listing.purchased) return { success: false, message: "Món đồ này đã bán hết!" };

    const config = ACCESSORY_CONFIGS[listing.itemKey];
    if (!config) return { success: false, message: "Không tìm thấy dữ liệu phụ kiện." };

    const price = config.rarity === "COMMON" ? 150 : 450;
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, message: "User not found." };

    if (user.gold < price) return { success: false, message: `Bạn không đủ ${price} vàng.` };

    const itemCount = await tx.item.count({ where: { ownerId: userId } });
    if (itemCount >= user.inventoryLimit) return { success: false, message: "Túi đồ đầy!" };

    // Deduct gold
    await tx.user.update({
      where: { id: userId },
      data: { gold: { decrement: price } }
    });

    // Create item
    await tx.item.create({
        data: {
            ownerId: userId,
            name: config.name,
            type: "ACCESSORY",
            rarity: config.rarity,
            power: 0, // Accessories have effects, not power
            set: config.set,
            isEquipped: false
        } as any
    });

    // Mark as purchased
    await tx.shopListing.update({
      where: { userId_slot: { userId, slot } },
      data: { purchased: true },
    });

    return { success: true, message: `Bạn đã mua thành công **${config.name}**!` };
  });
}

// ─── Dungeon Prep Shop (Persistent Daily Slots 11-14) ────────────

const DUNGEON_SHOP_SLOTS = 4;
const DUNGEON_SLOT_START = 11;

export async function getDungeonPrepShop(userId: string): Promise<{ listings: ShopCatalogEntry[]; listing: any[] }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { shopListings: { where: { slot: { gte: DUNGEON_SLOT_START, lte: DUNGEON_SLOT_START + DUNGEON_SHOP_SLOTS - 1 } } } },
  });

  if (!user) throw new Error("User not found");

  const existing = user.shopListings.sort((a, b) => a.slot - b.slot);

  // If no listings or they are old (needsRefresh), roll new ones
  if (existing.length === 0 || needsRefresh(existing[0]!.refreshedAt)) {
    // Delete old
    await prisma.shopListing.deleteMany({
      where: { userId, slot: { gte: DUNGEON_SLOT_START, lte: DUNGEON_SLOT_START + DUNGEON_SHOP_SLOTS - 1 } },
    });

    // Roll random 4
    const shuffled = [...DUNGEON_BUFF_ITEMS].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, DUNGEON_SHOP_SLOTS);

    const created = [];
    for (let i = 0; i < DUNGEON_SHOP_SLOTS; i++) {
      const item = selected[i]!;
      const l = await prisma.shopListing.create({
        data: {
          userId,
          slot: DUNGEON_SLOT_START + i,
          itemKey: item.key,
          purchased: false,
          refreshedAt: new Date(),
        },
      });
      created.push(l);
    }

    const catalogs = created.map((l) => DUNGEON_BUFF_ITEMS.find((it) => it.key === l.itemKey)!);
    return { listings: catalogs, listing: created };
  }

  const catalogs = existing.map((l) => DUNGEON_BUFF_ITEMS.find((it) => it.key === l.itemKey)!);
  return { listings: catalogs, listing: existing };
}

export async function buyDungeonItemBySlot(userId: string, slot: number): Promise<{ success: boolean; message: string }> {
  return prisma.$transaction(async (tx) => {
    const listing = await tx.shopListing.findUnique({
      where: { userId_slot: { userId, slot } }
    });
    if (!listing) return { success: false, message: "Vật phẩm không hợp lệ." };
    if (listing.purchased) return { success: false, message: "Món này bạn đã mua rồi!" };

    const item = DUNGEON_BUFF_ITEMS.find(i => i.key === listing.itemKey);
    if (!item) return { success: false, message: "Dữ liệu lỗi." };

    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    if (user.gold < item.price) {
      return { success: false, message: `Bạn không có đủ vàng (Cần ${item.price}v).` };
    }

    await tx.shopListing.update({ where: { id: listing.id }, data: { purchased: true } });
    await tx.user.update({ where: { id: userId }, data: { gold: { decrement: item.price } } });

    await upsertItem(tx, userId, {
      name: item.name,
      type: item.type,
      power: item.power,
      quantity: 1,
    });

    return { success: true, message: `Bạn đã mua **${item.name}** thành công!` };
  });
}


export async function buyDungeonPotion(
  userId: string,
  qty: number
): Promise<{ success: boolean; message: string }> {
  const potionPricePerUnit = 60;
  const totalPrice = potionPricePerUnit * qty;

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    if (user.gold < totalPrice) {
      return { success: false, message: `Bạn không đủ vàng để mua ${qty}x Potion (Cần ${totalPrice} vàng).` };
    }

    await tx.user.update({
      where: { id: userId },
      data: { gold: { decrement: totalPrice } },
    });

    await upsertItem(tx, userId, {
      name: "Potion",
      type: ItemType.POTION,
      power: 25,
      quantity: qty,
    });

    return { success: true, message: `Bắt đầu chuẩn bị: Bạn đã mua **${qty}x Potion**!` };
  });
}

export async function buyChestItem(userId: string, chestKey: string): Promise<{ success: boolean; message: string }> {
  const chest = CHEST_CATALOG.find(c => c.key === chestKey);
  if (!chest) return { success: false, message: "Rương không tồn tại." };

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    if (user.gold < chest.price) {
      return { success: false, message: `Bạn không có đủ vàng (Cần ${chest.price}v).` };
    }

    await tx.user.update({
      where: { id: userId },
      data: { gold: { decrement: chest.price } }
    });

    await upsertItem(tx, userId, {
      name: chest.name,
      type: chest.type,
      power: chest.power,
      quantity: 1
    });

    return { success: true, message: `Bạn đã mua **${chest.name}** thành công!` };
  });
}

export async function buyPet(userId: string, petName: string): Promise<{ success: boolean; message: string }> {
  const config = PET_CONFIGS[petName];
  if (!config) return { success: false, message: "Không tìm thấy dữ liệu sủng vật." };

  const prices: Record<string, number> = {
    COMMON: 100,
    RARE: 1000,
    EPIC: 5000
  };

  const cost = prices[config.rarity];
  if (!cost) return { success: false, message: "Sủng vật này không được bán rộng rãi tại chợ." };

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    if (user.gold < cost) return { success: false, message: `Bạn không đủ vàng (Cần ${cost}v).` };

    const beastCount = await tx.beast.count({ where: { ownerId: userId } });
    // Assuming a reasonable limit or using default
    if (beastCount >= 20) return { success: false, message: "Chuồng sủng vật đã đầy (Giới hạn 20 con)." };

    await tx.user.update({
      where: { id: userId },
      data: { gold: { decrement: cost } }
    });

    const newBeast = await tx.beast.create({
      data: {
        ownerId: userId,
        name: config.name,
        rarity: config.rarity,
        level: 1,
        exp: 0,
        power: Math.floor(Math.random() * 10) + 1, // Base power RNG 1-10
        isEquipped: false,
        upgradeLevel: 0
      }
    });

    // Check for auto-fusion
    await autoFuseBeasts(userId, config.name, 0, tx);

    return { success: true, message: `Chúc mừng! Bạn đã nhận nuôi **${config.name}** thành công!` };
  });
}


