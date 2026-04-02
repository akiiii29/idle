import { ItemType } from "@prisma/client";
import { prisma } from "./prisma";
import { upsertItem } from "./user-service";

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

export function getCatalogEntry(key: string): ShopCatalogEntry | undefined {
  return SHOP_CATALOG.find((e) => e.key === key);
}

// ─── Daily Refresh ─────────────────────────────────────────────────────────

const SHOP_SLOTS = 5;
export const SHOP_REFRESH_GOLD = 500;

/** Returns true if the shop needs a new daily roll (last refresh was on a previous UTC day). */
function needsRefresh(refreshedAt: Date): boolean {
  const now = new Date();
  const lastDay = new Date(refreshedAt);

  return (
    now.getUTCFullYear() !== lastDay.getUTCFullYear() ||
    now.getUTCMonth() !== lastDay.getUTCMonth() ||
    now.getUTCDate() !== lastDay.getUTCDate()
  );
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
  const existing = await prisma.shopListing.findMany({ where: { userId } });

  const needsRoll =
    existing.length !== SHOP_SLOTS || needsRefresh(existing[0]!.refreshedAt);

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

    return {
      listings: picks,
      listing: picks.map((item, idx) => ({
        slot: idx + 1,
        itemKey: item.key,
        purchased: false,
        refreshedAt: now,
      })),
    };
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

export function msUntilNextUTCMidnight(): number {
  const now = new Date();
  const next = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  );
  return next.getTime() - now.getTime();
}
