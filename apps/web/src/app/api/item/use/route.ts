import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeCombatStats, enrichBeast } from "@game/core";

const CONSUMABLE_TYPES = new Set(["POTION", "CONSUMABLE", "LUCK_BUFF", "MEAT"]);

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, itemId } = body;

  if (!userId || !itemId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { beasts: true, inventory: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const item = await prisma.item.findFirst({
    where: { id: itemId, ownerId: userId },
  });

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  if (!CONSUMABLE_TYPES.has(item.type)) {
    return NextResponse.json({ error: "Cannot use this item type" }, { status: 400 });
  }

  const quantity = item.quantity ?? 1;

  if (item.type === "LUCK_BUFF") {
    // Permanent luck increase
    const luckGain = item.power * quantity;
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { luck: { increment: luckGain } },
      }),
      quantity >= item.quantity
        ? prisma.item.delete({ where: { id: itemId } })
        : prisma.item.update({
            where: { id: itemId },
            data: { quantity: { decrement: quantity } },
          }),
    ]);
    return NextResponse.json({ success: true, message: `+${luckGain} Luck permanently!` });
  }

  // POTION, MEAT, CONSUMABLE — heal based on power
  const equippedItems = user.inventory?.filter((i: any) => i.isEquipped) ?? [];
  const equippedPets = user.beasts?.filter((b: any) => b.isEquipped).map((b: any) => enrichBeast(b)) ?? [];
  const stats = computeCombatStats(
    {
      str: user.str,
      agi: user.agi,
      maxHp: user.maxHp,
      luck: user.luck ?? 0,
      talentDps: user.talentDps ?? 0,
      talentTank: user.talentTank ?? 0,
      talentSupport: user.talentSupport ?? 0,
      talentBurn: user.talentBurn ?? 0,
      talentPoison: user.talentPoison ?? 0,
      title: user.title ?? null,
    },
    equippedItems,
    equippedPets,
    [],
    undefined
  );

  const maxHp = stats.final.maxHp;
  if (user.currentHp >= maxHp) {
    return NextResponse.json({ error: "HP already full" }, { status: 400 });
  }

  const healPerItem = item.power;
  const totalHeal = healPerItem * quantity;
  const newHp = Math.min(maxHp, user.currentHp + totalHeal);
  const actualHeal = newHp - user.currentHp;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { currentHp: newHp, lastHpUpdatedAt: new Date() },
    }),
    quantity >= item.quantity
      ? prisma.item.delete({ where: { id: itemId } })
      : prisma.item.update({
          where: { id: itemId },
          data: { quantity: { decrement: quantity } },
        }),
  ]);

  return NextResponse.json({
    success: true,
    message: `Healed ${actualHeal} HP (${newHp}/${maxHp})`,
    currentHp: newHp,
    maxHp,
  });
}
