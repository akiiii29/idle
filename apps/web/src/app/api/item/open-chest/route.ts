import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { WEAPON_POOL, ARMOR_POOL, ACCESSORY_CONFIGS, SHOP_CATALOG } from "@game/core";

function rollChestReward(tier: number): { name: string; type: string; rarity: string; power: number; bonusStr: number; bonusAgi: number; bonusDef: number; bonusHp: number; emoji: string } | null {
  const r = Math.random();

  if (tier === 1) {
    // 70% consume, 25% common gear, 5% rare gear
    if (r < 0.70) {
      const consumables = SHOP_CATALOG.filter((e) => e.type === "CONSUMABLE" || e.type === "POTION" || e.type === "MEAT" || e.type === "LUCK_BUFF");
      const pick = consumables[Math.floor(Math.random() * consumables.length)];
      if (!pick) return null;
      return { name: pick.name, type: pick.type, rarity: pick.tier === 1 ? "COMMON" : "RARE", power: pick.power ?? 0, bonusStr: 0, bonusAgi: 0, bonusDef: 0, bonusHp: 0, emoji: pick.emoji ?? "🧪" };
    } else if (r < 0.95) {
      const pool = [...WEAPON_POOL, ...ARMOR_POOL].filter((e) => e.rarity === "COMMON");
      const pick = pool[Math.floor(Math.random() * pool.length)];
      if (!pick) return null;
      return { name: pick.name, type: pick.type, rarity: "COMMON", power: pick.power ?? 0, bonusStr: pick.bonusStr ?? 0, bonusAgi: pick.bonusAgi ?? 0, bonusDef: pick.bonusDef ?? 0, bonusHp: pick.bonusHp ?? 0, emoji: pick.type === "WEAPON" ? "⚔️" : "🛡️" };
    } else {
      const pool = [...WEAPON_POOL, ...ARMOR_POOL].filter((e) => e.rarity === "RARE");
      const pick = pool[Math.floor(Math.random() * pool.length)];
      if (!pick) return null;
      return { name: pick.name, type: pick.type, rarity: "RARE", power: pick.power ?? 0, bonusStr: pick.bonusStr ?? 0, bonusAgi: pick.bonusAgi ?? 0, bonusDef: pick.bonusDef ?? 0, bonusHp: pick.bonusHp ?? 0, emoji: pick.type === "WEAPON" ? "⚔️" : "🛡️" };
    }
  }

  if (tier === 2) {
    // 50% common gear, 45% rare gear, 5% epic gear
    if (r < 0.50) {
      const pool = [...WEAPON_POOL, ...ARMOR_POOL].filter((e) => e.rarity === "COMMON");
      const pick = pool[Math.floor(Math.random() * pool.length)];
      if (!pick) return null;
      return { name: pick.name, type: pick.type, rarity: "COMMON", power: pick.power ?? 0, bonusStr: pick.bonusStr ?? 0, bonusAgi: pick.bonusAgi ?? 0, bonusDef: pick.bonusDef ?? 0, bonusHp: pick.bonusHp ?? 0, emoji: pick.type === "WEAPON" ? "⚔️" : "🛡️" };
    } else if (r < 0.95) {
      const pool = [...WEAPON_POOL, ...ARMOR_POOL].filter((e) => e.rarity === "RARE");
      const pick = pool[Math.floor(Math.random() * pool.length)];
      if (!pick) return null;
      return { name: pick.name, type: pick.type, rarity: "RARE", power: pick.power ?? 0, bonusStr: pick.bonusStr ?? 0, bonusAgi: pick.bonusAgi ?? 0, bonusDef: pick.bonusDef ?? 0, bonusHp: pick.bonusHp ?? 0, emoji: pick.type === "WEAPON" ? "⚔️" : "🛡️" };
    } else {
      const pool = [...WEAPON_POOL, ...ARMOR_POOL].filter((e) => e.rarity === "EPIC");
      const pick = pool[Math.floor(Math.random() * pool.length)];
      if (!pick) return null;
      return { name: pick.name, type: pick.type, rarity: "EPIC", power: pick.power ?? 0, bonusStr: pick.bonusStr ?? 0, bonusAgi: pick.bonusAgi ?? 0, bonusDef: pick.bonusDef ?? 0, bonusHp: pick.bonusHp ?? 0, emoji: pick.type === "WEAPON" ? "⚔️" : "🛡️" };
    }
  }

  // tier 3: 50% rare gear, 40% epic gear, 10% jackpot (legendary)
  if (r < 0.50) {
    const pool = [...WEAPON_POOL, ...ARMOR_POOL].filter((e) => e.rarity === "RARE");
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (!pick) return null;
    return { name: pick.name, type: pick.type, rarity: "RARE", power: pick.power ?? 0, bonusStr: pick.bonusStr ?? 0, bonusAgi: pick.bonusAgi ?? 0, bonusDef: pick.bonusDef ?? 0, bonusHp: pick.bonusHp ?? 0, emoji: pick.type === "WEAPON" ? "⚔️" : "🛡️" };
  } else if (r < 0.90) {
    const pool = [...WEAPON_POOL, ...ARMOR_POOL].filter((e) => e.rarity === "EPIC");
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (!pick) return null;
    return { name: pick.name, type: pick.type, rarity: "EPIC", power: pick.power ?? 0, bonusStr: pick.bonusStr ?? 0, bonusAgi: pick.bonusAgi ?? 0, bonusDef: pick.bonusDef ?? 0, bonusHp: pick.bonusHp ?? 0, emoji: pick.type === "WEAPON" ? "⚔️" : "🛡️" };
  } else {
    // Jackpot — legendary
    const pool = [...WEAPON_POOL, ...ARMOR_POOL].filter((e) => e.rarity === "LEGENDARY");
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (!pick) return null;
    return { name: pick.name, type: pick.type, rarity: "LEGENDARY", power: pick.power ?? 0, bonusStr: pick.bonusStr ?? 0, bonusAgi: pick.bonusAgi ?? 0, bonusDef: pick.bonusDef ?? 0, bonusHp: pick.bonusHp ?? 0, emoji: pick.type === "WEAPON" ? "⚔️" : "🛡️" };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, itemId } = await req.json();
    if (!userId || !itemId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { inventory: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const item = await prisma.item.findFirst({
      where: { id: itemId, ownerId: userId },
    });
    if (!item) return NextResponse.json({ error: "Chest not found" }, { status: 404 });

    if (item.type !== "GAMBLE") {
      return NextResponse.json({ error: "Item is not a chest" }, { status: 400 });
    }

    // Determine chest tier from item name
    let tier = 1;
    const name = item.name ?? "";
    if (name.includes("Bạc") || name.includes("Rare")) tier = 2;
    else if (name.includes("Vàng") || name.includes("Epic") || name.includes("Gold")) tier = 3;

    const reward = rollChestReward(tier);
    if (!reward) return NextResponse.json({ error: "Failed to roll reward" }, { status: 500 });

    await prisma.$transaction([
      prisma.item.delete({ where: { id: itemId } }),
      prisma.item.create({
        data: {
          ownerId: userId,
          name: reward.name,
          type: reward.type as any,
          rarity: reward.rarity as any,
          power: reward.power,
          bonusStr: reward.bonusStr,
          bonusAgi: reward.bonusAgi,
          bonusDef: reward.bonusDef,
          bonusHp: reward.bonusHp,
          quantity: 1,
          isEquipped: false,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Opened **${item.name}** and got **${reward.name}** (${reward.rarity})!`,
      reward: { name: reward.name, rarity: reward.rarity, emoji: reward.emoji },
    });
  } catch (err) {
    console.error("[/api/item/open-chest]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
