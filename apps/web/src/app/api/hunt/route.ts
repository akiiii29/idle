import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { simulateHunt } from "@/lib/game/simulate-battle";
import { addPetExp } from "@/lib/pet-server";

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const result = await simulateHunt(userId, user, huntType);

  const isWin = result.isWin;
  const lvl = Math.max(1, user.level - randomInt(0, 2));
  const isNewbie = lvl < 5;
  const goldGained = isWin ? Math.floor((randomInt(20, 50) + lvl * 10) * (isNewbie ? 2 : 1)) : 0;
  const expGained = isWin ? Math.floor((10 + lvl * 5) * (isNewbie ? 2 : 1)) : 0;

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
    finalHp: result.finalHp,
    playerMaxHp: user.maxHp,
    finalEnemyHp: result.finalEnemyHp,
    enemyMaxHp: result.enemyMaxHp,
  });
}
