import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SHOP_REFRESH_GOLD, SHOP_CATALOG, getCatalogEntry, getChestEntry, WEAPON_POOL, ARMOR_POOL, ACCESSORY_CONFIGS } from "@game/core";

const SHOP_SLOTS = 5;
const ACC_SLOT_START = 21;
const ACC_SHOP_SLOTS = 5;
const DUNGEON_SLOT_START = 11;
const DUNGEON_SHOP_SLOTS = 4;
const EQ_SLOT_START = 31;

// ─── Buy from Consumable Shop (slot 1-5) ─────────────────────────────────────
async function buyConsumable(userId: string, slot: number) {
  const listing = await prisma.shopListing.findUnique({
    where: { userId_slot: { userId, slot } },
  });
  if (!listing) return { success: false, message: "Invalid slot." };
  if (listing.purchased) return { success: false, message: "Already purchased." };

  const item = getCatalogEntry(listing.itemKey);
  if (!item) return { success: false, message: "Item no longer exists." };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { success: false, message: "User not found." };
  if (user.gold < item.price) return { success: false, message: `Need ${item.price} gold.` };

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { gold: { decrement: item.price } } }),
    prisma.item.create({
      data: {
        ownerId: userId, name: item.name, type: item.type as any,
        power: item.power, rarity: item.tier === 1 ? "COMMON" : item.tier === 2 ? "RARE" : "EPIC",
        quantity: 1, bonusStr: 0, bonusAgi: 0, bonusDef: 0, bonusHp: 0, isEquipped: false,
      },
    }),
    prisma.shopListing.update({ where: { id: listing.id }, data: { purchased: true } }),
  ]);

  return { success: true, message: `Purchased **${item.name}**!` };
}

// ─── Buy from Equipment Shop (slots 31-35) ─────────────────────────────────────
async function buyEquipment(userId: string, slot: number, _price: number) {
  // Frontend sends slot as 100+i (0-4), map back to DB slot 31-35
  const dbSlot = EQ_SLOT_START + (slot - 100);
  const listing = await prisma.shopListing.findUnique({
    where: { userId_slot: { userId, slot: dbSlot } },
  });
  if (!listing) return { success: false, message: "Invalid slot." };
  if (listing.purchased) return { success: false, message: "Already purchased." };

  let itemData: any = null;
  try { itemData = JSON.parse(listing.itemKey); } catch {}
  if (!itemData) return { success: false, message: "Item data corrupted." };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { success: false, message: "User not found." };
  const price = itemData.price ?? 150;
  if (user.gold < price) return { success: false, message: `Need ${price} gold.` };

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { gold: { decrement: price } } }),
    prisma.item.create({
      data: {
        ownerId: userId,
        name: itemData.name,
        type: itemData.type as any,
        power: itemData.power ?? 0,
        rarity: itemData.rarity as any,
        quantity: 1,
        bonusStr: itemData.bonusStr ?? 0,
        bonusAgi: itemData.bonusAgi ?? 0,
        bonusDef: itemData.bonusDef ?? 0,
        bonusHp: itemData.bonusHp ?? 0,
        isEquipped: false,
      },
    }),
    prisma.shopListing.update({ where: { id: listing.id }, data: { purchased: true } }),
  ]);

  return { success: true, message: `Purchased **${itemData.name}** (${itemData.rarity})!` };
}

// ─── Buy from Accessory Shop (slot 21-25) ─────────────────────────────────────
async function buyAccessory(userId: string, slot: number) {
  const listing = await prisma.shopListing.findUnique({
    where: { userId_slot: { userId, slot } },
  });
  if (!listing) return { success: false, message: "Invalid slot." };
  if (listing.purchased) return { success: false, message: "Already purchased." };

  const acc = ACCESSORY_CONFIGS[listing.itemKey];
  if (!acc) return { success: false, message: "Item no longer exists." };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { success: false, message: "User not found." };
  const price = 150;
  if (user.gold < price) return { success: false, message: `Need ${price} gold.` };

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { gold: { decrement: price } } }),
    prisma.item.create({
      data: {
        ownerId: userId, name: acc.name, type: "ACCESSORY" as any,
        power: 0, rarity: acc.rarity as any,
        quantity: 1, bonusStr: 0, bonusAgi: 0, bonusDef: 0, bonusHp: 0, isEquipped: false,
      },
    }),
    prisma.shopListing.update({ where: { id: listing.id }, data: { purchased: true } }),
  ]);

  return { success: true, message: `Purchased **${acc.name}**!` };
}

// ─── Buy from Dungeon Prep Shop (slot 11-14) ──────────────────────────────────
async function buyDungeon(userId: string, slot: number) {
  const listing = await prisma.shopListing.findUnique({
    where: { userId_slot: { userId, slot } },
  });
  if (!listing) return { success: false, message: "Invalid slot." };
  if (listing.purchased) return { success: false, message: "Already purchased." };

  const { DUNGEON_BUFF_ITEMS } = await import("@game/core");
  const item = DUNGEON_BUFF_ITEMS.find((d) => d.key === listing.itemKey);
  if (!item) return { success: false, message: "Item no longer exists." };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { success: false, message: "User not found." };
  if (user.gold < item.price) return { success: false, message: `Need ${item.price} gold.` };

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { gold: { decrement: item.price } } }),
    prisma.item.create({
      data: {
        ownerId: userId, name: item.name, type: item.type as any,
        power: item.power, rarity: item.tier === 1 ? "COMMON" : "RARE",
        quantity: 1, bonusStr: 0, bonusAgi: 0, bonusDef: 0, bonusHp: 0, isEquipped: false,
      },
    }),
    prisma.shopListing.update({ where: { id: listing.id }, data: { purchased: true } }),
  ]);

  return { success: true, message: `Purchased **${item.name}**!` };
}

// ─── Refresh Shop (reroll all slots for 500 gold) ───────────────────────────
async function refreshShop(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { success: false, message: "User not found." };
  if (user.gold < SHOP_REFRESH_GOLD) return { success: false, message: `Need ${SHOP_REFRESH_GOLD} gold.` };

  const tier1 = SHOP_CATALOG.filter((e) => e.tier === 1);
  const tier2 = SHOP_CATALOG.filter((e) => e.tier === 2);
  const tier3 = SHOP_CATALOG.filter((e) => e.tier === 3);

  const picks: any[] = [];
  const usedKeys = new Set<string>();
  for (let i = 0; i < SHOP_SLOTS; i++) {
    const r = Math.random();
    let pool = tier1;
    if (r < 0.25 && tier2.length) pool = tier2;
    if (r < 0.12 && tier3.length) pool = tier3;
    const available = pool.filter((e) => !usedKeys.has(e.key));
    const chosen = available[Math.floor(Math.random() * available.length)] ?? pool[Math.floor(Math.random() * pool.length)];
    if (chosen) { picks.push(chosen); usedKeys.add(chosen.key); }
  }

  const now = new Date();
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { gold: { decrement: SHOP_REFRESH_GOLD } } }),
    ...picks.map((item, idx) =>
      prisma.shopListing.upsert({
        where: { userId_slot: { userId, slot: idx + 1 } },
        create: { userId, slot: idx + 1, itemKey: item.key, purchased: false, refreshedAt: now },
        update: { itemKey: item.key, purchased: false, refreshedAt: now },
      })
    ),
  ]);

  return { success: true, message: "Shop refreshed!" };
}

// ─── Buy Pet ─────────────────────────────────────────────────────────────────
async function buyPet(userId: string, rarity: string, price: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { success: false, message: "User not found." };
  if (user.gold < price) return { success: false, message: `Need ${price} gold.` };

  const { PET_CONFIGS } = await import("@game/core");
  const candidates = Object.values(PET_CONFIGS).filter((p) => p.rarity === rarity);
  if (candidates.length === 0) return { success: false, message: "No pets available for this rarity." };

  const petConfig = candidates[Math.floor(Math.random() * candidates.length)];

  // Roll random beast stats
  const rollPower = Math.floor(Math.random() * 5) + 1;

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { gold: { decrement: price } } }),
    prisma.beast.create({
      data: {
        ownerId: userId,
        name: petConfig.name,
        rarity: rarity as any,
        role: petConfig.role,
        level: 1,
        exp: 0,
        power: rollPower,
        skillType: petConfig.skillType,
        skillPower: petConfig.skillPower,
        isEquipped: false,
      },
    }),
  ]);

  return { success: true, message: `Adopted a **${rarity}** pet!` };
}

// ─── Buy Chest ───────────────────────────────────────────────────────────────
async function buyChest(userId: string, chestKey: string) {
  const chest = getChestEntry(chestKey);
  if (!chest) return { success: false, message: "Chest not found." };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { success: false, message: "User not found." };
  if (user.gold < chest.price) return { success: false, message: `Need ${chest.price} gold.` };

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { gold: { decrement: chest.price } } }),
    prisma.item.create({
      data: {
        ownerId: userId, name: chest.name, type: "GAMBLE" as any,
        power: 0, rarity: chest.tier === 1 ? "COMMON" : chest.tier === 2 ? "RARE" : "EPIC",
        quantity: 1, bonusStr: 0, bonusAgi: 0, bonusDef: 0, bonusHp: 0, isEquipped: false,
      },
    }),
  ]);

  return { success: true, message: `Purchased **${chest.name}**!` };
}

// ─── Main POST handler ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { userId, category, slot, price, chestKey } = await req.json();

    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    // Refresh
    if (category === "refresh") {
      const res = await refreshShop(userId);
      return NextResponse.json(res);
    }

    // Chest purchase
    if (category === "chest") {
      return NextResponse.json(await buyChest(userId, chestKey));
    }

    // Consumable shop (slot 1-5)
    if (category === "consumable") {
      return NextResponse.json(await buyConsumable(userId, slot));
    }

    // Equipment shop (generated, not DB-persisted)
    if (category === "equipment") {
      return NextResponse.json(await buyEquipment(userId, slot, price));
    }

    // Accessory shop (slot 21-25)
    if (category === "accessory") {
      return NextResponse.json(await buyAccessory(userId, slot));
    }

    // Dungeon prep shop (slot 11-14)
    if (category === "dungeon") {
      return NextResponse.json(await buyDungeon(userId, slot));
    }

    // Pet shop
    if (category === "pet") {
      const { petRarity } = await req.json();
      return NextResponse.json(await buyPet(userId, petRarity as string, price));
    }

    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  } catch (err) {
    console.error("[/api/shop/buy]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
