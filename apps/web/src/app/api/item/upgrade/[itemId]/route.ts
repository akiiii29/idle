import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getUpgradeCost,
  previewUpgradePayment,
  getEffectiveSuccessRate,
  GEAR_TYPES,
  MAX_UPGRADE_LEVEL,
  SCRAP_VALUE_IN_GOLD,
} from "@game/core";

export async function POST(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  try {
    const { userId } = await req.json();
    const { itemId } = await params;

    if (!userId || !itemId) {
      return NextResponse.json({ error: "Missing userId or itemId" }, { status: 400 });
    }

    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item || item.ownerId !== userId) {
      return NextResponse.json({ error: "Item not found or not yours" }, { status: 404 });
    }

    if (!GEAR_TYPES.includes(item.type as any)) {
      return NextResponse.json({ error: "Only WEAPON, ARMOR, ACCESSORY can be upgraded." }, { status: 400 });
    }

    if (item.upgradeLevel >= MAX_UPGRADE_LEVEL) {
      return NextResponse.json({ error: `Max upgrade level (+${MAX_UPGRADE_LEVEL}) reached.` }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const preview = previewUpgradePayment(user.scrap, item.upgradeLevel, item.rarity as any);

    if (user.gold < preview.goldToUse) {
      return NextResponse.json({ error: `Not enough gold. Need ${preview.goldToUse}.` }, { status: 400 });
    }

    // Deduct cost
    await prisma.user.update({
      where: { id: userId },
      data: { scrap: { decrement: preview.scrapToUse }, gold: { decrement: preview.goldToUse } },
    });

    // Roll
    const effRate = getEffectiveSuccessRate(item.upgradeLevel, item.failCount || 0);
    const roll = Math.random();
    const isSuccess = roll <= effRate;
    const isPity = (item.failCount || 0) >= 5;

    let newLevel: number;
    let newFailCount: number;

    if (isSuccess) {
      newLevel = item.upgradeLevel + 1;
      newFailCount = 0;
    } else {
      newLevel = Math.max(0, item.upgradeLevel - 1);
      newFailCount = (item.failCount || 0) + 1;
    }

    await prisma.item.update({
      where: { id: itemId },
      data: { upgradeLevel: newLevel, failCount: newFailCount },
    });

    const updatedItem = await prisma.item.findUnique({ where: { id: itemId } });
    const updatedUser = await prisma.user.findUnique({ where: { id: userId } });

    let costStr = "";
    if (preview.scrapToUse > 0 && preview.goldToUse > 0) costStr = `${preview.scrapToUse} Scrap + ${preview.goldToUse} gold`;
    else if (preview.scrapToUse > 0) costStr = `${preview.scrapToUse} Scrap`;
    else costStr = `${preview.goldToUse} gold`;

    return NextResponse.json({
      success: true,
      leveledUp: isSuccess,
      pityTriggered: isPity && !isSuccess,
      newLevel,
      failCount: newFailCount,
      scrap: updatedUser?.scrap ?? 0,
      gold: updatedUser?.gold ?? 0,
      cost: costStr,
      message: isSuccess
        ? `Success! ${item.name} is now +${newLevel}.`
        : `Failed! ${item.name} dropped to +${newLevel}. Pity: ${newFailCount}/5.`,
    });
  } catch (err) {
    console.error("[/api/item/upgrade]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const { itemId } = await params;

    if (!userId || !itemId) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item || item.ownerId !== userId) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const preview = previewUpgradePayment(user.scrap, item.upgradeLevel, item.rarity as any);
    const effRate = getEffectiveSuccessRate(item.upgradeLevel, item.failCount || 0);

    return NextResponse.json({
      item: {
        id: item.id,
        name: item.name,
        type: item.type,
        rarity: item.rarity,
        upgradeLevel: item.upgradeLevel,
        failCount: item.failCount || 0,
        power: item.power,
        bonusStr: item.bonusStr,
        bonusAgi: item.bonusAgi,
        bonusDef: item.bonusDef,
        bonusHp: item.bonusHp,
        isEquipped: item.isEquipped,
      },
      preview,
      effectiveRate: effRate,
      userScrap: user.scrap,
      userGold: user.gold,
    });
  } catch (err) {
    console.error("[/api/item/upgrade GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
