import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { simulateHunt } from "@/lib/game/simulate-battle";
import { addPetExp } from "@/lib/pet-server";
import { ALL_ITEMS } from "@game/core/constants";

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rollItemRarity(bossKill: boolean): "COMMON" | "RARE" | "EPIC" | "LEGENDARY" {
  const roll = Math.random() * 100;
  if (bossKill) {
    // Boss: 1% legendary, 29% epic, 40% rare, 30% common
    if (roll < 1) return "LEGENDARY";
    if (roll < 30) return "EPIC";
    if (roll < 70) return "RARE";
    return "COMMON";
  }
  // Normal: 50% common, 30% rare, 15% epic, 5% legendary
  if (roll < 50) return "COMMON";
  if (roll < 80) return "RARE";
  if (roll < 95) return "EPIC";
  return "LEGENDARY";
}

function pickRandomItem(rarity: string) {
  const pool = ALL_ITEMS.filter((i) => i.rarity === rarity);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

function makeInventoryEntry(item: any, userId: string) {
  return {
    userId,
    name: item.name,
    type: item.type,
    rarity: item.rarity,
    power: item.power ?? 0,
    bonusStr: item.bonusStr ?? 0,
    bonusAgi: item.bonusAgi ?? 0,
    bonusDef: item.bonusDef ?? 0,
    bonusHp: item.bonusHp ?? 0,
    isEquipped: false,
  };
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, huntType = "normal" } = body;

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      beasts: true,
      skills: { include: { skill: true } },
      inventory: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const result = await simulateHunt(userId, user, huntType);

  const isWin = result.isWin;
  const lvl = Math.max(1, user.level - randomInt(0, 2));
  const isNewbie = lvl < 5;
  const isBossKill = huntType === "boss" && isWin;
  const goldMult = isBossKill ? 3 : 1;
  const goldGained = isWin ? Math.floor((randomInt(20, 50) + lvl * 10) * (isNewbie ? 2 : 1) * goldMult) : 0;
  const expGained = isWin ? Math.floor((10 + lvl * 5) * (isNewbie ? 2 : 1)) : 0;

  // Boss drop: guaranteed 1 item, chance for 2nd
  let dropItems: any[] = [];
  if (isBossKill) {
    const rarity1 = rollItemRarity(true);
    const item1 = pickRandomItem(rarity1);
    if (item1) {
      dropItems.push(makeInventoryEntry(item1, userId));
    }
    // 40% chance for second drop
    if (Math.random() < 0.4) {
      const rarity2 = rollItemRarity(true);
      const item2 = pickRandomItem(rarity2);
      if (item2) {
        dropItems.push(makeInventoryEntry(item2, userId));
      }
    }
  }

  // Update user in DB
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        gold: { increment: goldGained },
        exp: { increment: expGained },
        currentHp: result.finalHp,
        lastHunt: new Date().toISOString(),
      },
    });

    if (isWin) {
      await tx.combatLog.create({
        data: {
          userId,
          enemyName: result.enemyName ?? "Unknown",
          isWin,
          goldGained,
          expGained,
          logDetails: result.fullLogs?.map((l: any) => l.events).flat().join("\n")?.substring(0, 5000) ?? "",
        },
      });

      // Boss drop items
      for (const item of dropItems) {
        await tx.item.create({ data: { ...item, ownerId: userId } });
      }
    }

    // Pet exp
    if (result.combatSummary?.petExpPool) {
      for (const [petId, amount] of result.combatSummary.petExpPool.entries()) {
        await addPetExp(petId as string, amount as number, tx);
      }
    }
  });

  return NextResponse.json({
    isWin,
    enemyName: result.enemyName,
    goldGained,
    expGained,
    battleLogs: result.fullLogs?.flatMap((l: any) => l.events) ?? [],
    finalHp: Math.max(0, Math.floor(result.finalHp ?? 0)),
    playerMaxHp: user.maxHp,
    finalEnemyHp: Math.max(0, Math.floor(result.finalEnemyHp ?? 0)),
    enemyMaxHp: result.enemyMaxHp ?? 0,
    achievementTracking: result.achievementTracking,
    combatSummary: result.combatSummary,
    fullLogs: result.fullLogs,
    dropItems: dropItems.map((i) => ({ name: i.name, type: i.type, rarity: i.rarity })),
    isBossKill,
  });
}
