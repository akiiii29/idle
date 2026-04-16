import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SHOP_CATALOG: Record<string, { name: string; type: string; power: number; rarity: string; price: number }> = {
  slot1: { name: "Large Potion", type: "POTION", power: 50, rarity: "COMMON", price: 200 },
  slot2: { name: "Lucky Charm", type: "LUCK_BUFF", power: 10, rarity: "RARE", price: 500 },
  slot3: { name: "Hunter's Mark", type: "CONSUMABLE", power: 30, rarity: "COMMON", price: 150 },
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, slotKey } = body;

  if (!userId || !slotKey) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const catalogItem = SHOP_CATALOG[slotKey];
  if (!catalogItem) {
    return NextResponse.json({ error: "Invalid slot" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.gold < catalogItem.price) {
    return NextResponse.json({ error: "Not enough gold" }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { gold: { decrement: catalogItem.price } },
    });

    await tx.item.create({
      data: {
        name: catalogItem.name,
        type: catalogItem.type as any,
        power: catalogItem.power,
        rarity: catalogItem.rarity as any,
        quantity: 1,
        bonusStr: 0,
        bonusAgi: 0,
        bonusDef: 0,
        bonusHp: 0,
        isEquipped: false,
        ownerId: userId,
      },
    });
  });

  return NextResponse.json({ success: true });
}
