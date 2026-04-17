import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeCombatStats, enrichBeast } from "@game/core";

const HOSPITAL_COOLDOWN_MS = 30 * 60 * 1000;

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { inventory: true, beasts: true, skills: { include: { skill: true } } },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const now = new Date();
  const hospUntil = user.hospitalUntil;
  const inHospital = hospUntil && hospUntil > now;
  const remainingMs = inHospital && hospUntil ? hospUntil.getTime() - now.getTime() : 0;

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
  const reviveCost = Math.ceil(maxHp * 1.2);

  return NextResponse.json({
    inHospital,
    hospitalUntil: hospUntil,
    remainingMs,
    currentHp: user.currentHp,
    maxHp,
    reviveCost,
    cooldownMs: HOSPITAL_COOLDOWN_MS,
  });
}
