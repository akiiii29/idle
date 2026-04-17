import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  SHOP_CATALOG,
  CHEST_CATALOG,
  DUNGEON_BUFF_ITEMS,
  SHOP_REFRESH_GOLD,
  getCatalogEntry,
  isDifferentVnDay,
  PET_SHOP_PRICES,
  WEAPON_POOL,
  ARMOR_POOL,
  rollItemRarity,
} from "@game/core";

const SHOP_SLOTS = 5;
const ACC_SLOT_START = 21;
const ACC_SHOP_SLOTS = 5;
const DUNGEON_SLOT_START = 11;
const DUNGEON_SHOP_SLOTS = 4;
const EQ_SLOT_START = 31;
const EQ_SHOP_SLOTS = 5;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { shopListings: { orderBy: { slot: "asc" } } },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const now = new Date();

  // ── 1. Daily Consumable Shop (slots 1-5) ───────────────────────────────────
  const consumableListings = user.shopListings.filter((l) => l.slot >= 1 && l.slot <= SHOP_SLOTS);
  const consumableNeedsRoll = consumableListings.length !== SHOP_SLOTS ||
    (consumableListings[0] ? isDifferentVnDay(consumableListings[0].refreshedAt) : true);

  let consumableSlots: any[] = [];
  if (consumableNeedsRoll) {
    // Roll 5 items
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
    // Upsert
    await prisma.$transaction(
      picks.map((item, idx) =>
        prisma.shopListing.upsert({
          where: { userId_slot: { userId, slot: idx + 1 } },
          create: { userId, slot: idx + 1, itemKey: item.key, purchased: false, refreshedAt: now },
          update: { itemKey: item.key, purchased: false, refreshedAt: now },
        })
      )
    );
    consumableSlots = picks.map((item, idx) => ({ slot: idx + 1, item, purchased: false }));
  } else {
    consumableSlots = consumableListings.map((l) => ({
      slot: l.slot,
      item: getCatalogEntry(l.itemKey),
      purchased: l.purchased,
    }));
  }

  // ── 2. Equipment Shop (generated from user level) ─────────────────────────
  const level = user.level ?? 1;
  function rollRarity(level: number): "COMMON" | "RARE" | "EPIC" {
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
  function getEqPrice(rarity: string): number {
    if (rarity === "COMMON") return 150 + Math.floor(Math.random() * 50);
    if (rarity === "RARE") return 400 + Math.floor(Math.random() * 150);
    if (rarity === "EPIC") return 1200 + Math.floor(Math.random() * 400);
    return 3000;
  }

  // ── 2. Equipment Shop (slots 31-35) — persisted to DB ───────────────────────
  const eqListings = user.shopListings.filter((l) => l.slot >= EQ_SLOT_START && l.slot < EQ_SLOT_START + EQ_SHOP_SLOTS);
  const eqNeedsRoll = eqListings.length === 0 || (eqListings[0] ? isDifferentVnDay(eqListings[0].refreshedAt) : true);
  let equipmentSlots: any[] = [];
  if (eqNeedsRoll) {
    const eqPool = [...WEAPON_POOL, ...ARMOR_POOL];
    const selected: any[] = [];
    for (let i = 0; i < EQ_SHOP_SLOTS; i++) {
      const rarity = rollRarity(level);
      const pool = eqPool.filter((e) => e.rarity === rarity);
      const item = pool[Math.floor(Math.random() * pool.length)];
      if (!item) continue;
      selected.push({ ...item, rarity });
    }
    await prisma.$transaction([
      prisma.shopListing.deleteMany({ where: { userId, slot: { gte: EQ_SLOT_START, lt: EQ_SLOT_START + EQ_SHOP_SLOTS } } }),
      ...selected.map((item, idx) =>
        prisma.shopListing.create({
          data: {
            userId,
            slot: EQ_SLOT_START + idx,
            // Store full item data + price as JSON so we buy exactly what was displayed
            itemKey: JSON.stringify({ name: item.name, type: item.type, rarity: item.rarity, power: item.power ?? 0, bonusStr: item.bonusStr ?? 0, bonusAgi: item.bonusAgi ?? 0, bonusDef: item.bonusDef ?? 0, bonusHp: item.bonusHp ?? 0, price: getEqPrice(item.rarity) }),
            purchased: false,
            refreshedAt: now,
          },
        })
      ),
    ]);
    for (let i = 0; i < selected.length; i++) {
      const item = selected[i];
      equipmentSlots.push({
        slot: EQ_SLOT_START + i,
        name: item.name,
        type: item.type,
        rarity: item.rarity,
        power: item.power ?? 0,
        bonusStr: item.bonusStr ?? 0,
        bonusAgi: item.bonusAgi ?? 0,
        bonusDef: item.bonusDef ?? 0,
        bonusHp: item.bonusHp ?? 0,
        price: getEqPrice(item.rarity),
      });
    }
  } else {
    for (const l of eqListings) {
      let itemData: any = null;
      try { itemData = JSON.parse(l.itemKey); } catch { continue; }
      equipmentSlots.push({
        slot: l.slot,
        name: itemData.name,
        type: itemData.type,
        rarity: itemData.rarity,
        power: itemData.power ?? 0,
        bonusStr: itemData.bonusStr ?? 0,
        bonusAgi: itemData.bonusAgi ?? 0,
        bonusDef: itemData.bonusDef ?? 0,
        bonusHp: itemData.bonusHp ?? 0,
        price: itemData.price ?? 150,
      });
    }
  }

  // ── 3. Accessory Shop (slots 21-25) ────────────────────────────────────────
  const { ACCESSORY_CONFIGS } = await import("@game/core");
  const accListings = user.shopListings.filter((l) => l.slot >= ACC_SLOT_START && l.slot < ACC_SLOT_START + ACC_SHOP_SLOTS);
  const accNeedsRoll = accListings.length === 0 || (accListings[0] ? isDifferentVnDay(accListings[0].refreshedAt) : true);
  const accessorySlots: any[] = [];
  if (accNeedsRoll) {
    const allAccessories = Object.values(ACCESSORY_CONFIGS);
    const shuffled = [...allAccessories].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, ACC_SHOP_SLOTS);
    await prisma.$transaction([
      prisma.shopListing.deleteMany({ where: { userId, slot: { gte: ACC_SLOT_START, lt: ACC_SLOT_START + ACC_SHOP_SLOTS } } }),
      ...selected.map((acc, idx) =>
        prisma.shopListing.create({ data: { userId, slot: ACC_SLOT_START + idx, itemKey: acc.name, purchased: false, refreshedAt: now } })
      ),
    ]);
    for (let i = 0; i < selected.length; i++) {
      accessorySlots.push({ slot: ACC_SLOT_START + i, item: { name: selected[i].name, rarity: selected[i].rarity, power: 0, price: 150 }, purchased: false });
    }
  } else {
    for (const l of accListings) {
      const acc = ACCESSORY_CONFIGS[l.itemKey];
      accessorySlots.push({ slot: l.slot, item: acc ? { name: acc.name, rarity: acc.rarity, power: 0, price: 150 } : null, purchased: l.purchased });
    }
  }

  // ── 4. Chest Shop ───────────────────────────────────────────────────────────
  const chestSlots = CHEST_CATALOG.map((item) => ({ slot: item.key, item }));

  // ── 5. Dungeon Prep Shop (slots 11-14) ──────────────────────────────────────
  const dungeonListings = user.shopListings.filter((l) => l.slot >= DUNGEON_SLOT_START && l.slot < DUNGEON_SLOT_START + DUNGEON_SHOP_SLOTS);
  const dungeonNeedsRoll = dungeonListings.length === 0 || (dungeonListings[0] ? isDifferentVnDay(dungeonListings[0].refreshedAt) : true);
  let dungeonSlots: any[] = [];
  if (dungeonNeedsRoll) {
    const shuffled = [...DUNGEON_BUFF_ITEMS].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, DUNGEON_SHOP_SLOTS);
    await prisma.$transaction([
      prisma.shopListing.deleteMany({ where: { userId, slot: { gte: DUNGEON_SLOT_START, lt: DUNGEON_SLOT_START + DUNGEON_SHOP_SLOTS } } }),
      ...selected.map((item, idx) =>
        prisma.shopListing.create({ data: { userId, slot: DUNGEON_SLOT_START + idx, itemKey: item.key, purchased: false, refreshedAt: now } })
      ),
    ]);
    for (let i = 0; i < selected.length; i++) {
      dungeonSlots.push({ slot: DUNGEON_SLOT_START + i, item: selected[i], purchased: false });
    }
  } else {
    dungeonSlots = dungeonListings.map((l) => ({
      slot: l.slot,
      item: DUNGEON_BUFF_ITEMS.find((d) => d.key === l.itemKey),
      purchased: l.purchased,
    }));
  }

  // ── 6. Pet Shop ─────────────────────────────────────────────────────────────
  const petSlots = Object.entries(PET_SHOP_PRICES).map(([rarity, price]) => ({
    rarity,
    price,
  }));

  return NextResponse.json({
    gold: user.gold,
    refreshCost: SHOP_REFRESH_GOLD,
    consumableSlots,
    equipmentSlots,
    accessorySlots,
    chestSlots,
    dungeonSlots,
    petSlots,
  });
}
