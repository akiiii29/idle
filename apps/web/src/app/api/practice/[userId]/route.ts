import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeCombatStats, enrichBeast, simulateCombat } from "@game/core";

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { beasts: true, skills: { include: { skill: true } }, inventory: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const equippedItems = user.inventory?.filter((i: any) => i.isEquipped) || [];
  const equippedPets = user.beasts?.filter((b: any) => b.isEquipped).map((b: any) => enrichBeast(b)) || [];
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

  const critRate = (user.luck * 0.005) + ((stats.extra as any)?.critRateBonus || 0);
  const dummyMaxHp = 100_000_000;

  const results = await simulateCombat({
    player: {
      hp: stats.final.maxHp,
      maxHp: stats.final.maxHp,
      atk: stats.final.attack,
      def: stats.final.defense,
      spd: stats.final.speed,
      critRate,
      pets: equippedPets,
      skills: user.skills?.filter((s: any) => s.isEquipped) || [],
      title: user.title,
    },
    enemy: {
      name: "Bù nhìn luyện tập",
      hp: dummyMaxHp,
      maxHp: dummyMaxHp,
      atk: 0,
      def: 0,
      spd: 0,
    },
    accessories: {
      effects: (stats.extra as any)?.activeUniqueEffects || [],
      uniquePowers: (stats.extra as any)?.uniquePowers || {},
      sets: (stats.extra as any)?.activeSets || [],
    },
    maxTurns: 10,
  });

  const summary = results.combatSummary;
  const tracking = results.achievementTracking;

  return NextResponse.json({
    totalDamage: summary?.totalDamageDealt ?? 0,
    maxTurnDamage: summary?.maxTurnDamage ?? 0,
    crits: tracking?.crits ?? 0,
    combos: summary?.comboCount ?? 0,
    burns: tracking?.burns ?? 0,
    poisons: tracking?.poisons ?? 0,
    lifesteals: tracking?.lifesteals ?? 0,
    skillCounts: summary?.skillCounts || {},
    synergies: summary?.synergies || [],
    turnLogs: (results.fullLogs || []).map((l: any) => ({
      turn: l.turn,
      events: l.events,
    })),
    playerAtk: stats.final.attack,
    playerDef: stats.final.defense,
    playerSpd: stats.final.speed,
  });
}
