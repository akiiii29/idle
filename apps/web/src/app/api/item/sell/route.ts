import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const GEAR_TYPES = new Set(["WEAPON", "ARMOR", "ACCESSORY"]);

function getSellPrice(item: any): number {
  const base = item.power > 0 ? item.power * 10 : 20;
  const rarityMultiplier: Record<string, number> = {
    COMMON: 1,
    RARE: 2,
    EPIC: 5,
    LEGENDARY: 10,
  };
  const mult = rarityMultiplier[item.rarity] ?? 1;
  const isGear = GEAR_TYPES.has(item.type);
  return Math.floor(base * mult * (isGear ? 1 : 0.5));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, itemId } = body;

  if (!userId || !itemId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const item = await prisma.item.findFirst({
    where: { id: itemId, ownerId: userId },
  });

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  if (item.isEquipped) {
    return NextResponse.json({ error: "Cannot sell equipped item" }, { status: 400 });
  }

  const goldGained = getSellPrice(item);
  const quantity = item.quantity ?? 1;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { gold: { increment: goldGained } },
    });

    if (quantity > 1) {
      await tx.item.update({
        where: { id: itemId },
        data: { quantity: { decrement: 1 } },
      });
    } else {
      await tx.item.delete({ where: { id: itemId } });
    }
  });

  return NextResponse.json({ success: true, goldGained, itemName: item.name });
}
