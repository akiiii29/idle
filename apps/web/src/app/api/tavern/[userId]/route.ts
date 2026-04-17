import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeCombatStats, enrichBeast } from "@game/core";

const TAVERN_HEAL_INTERVAL_MS = 15_000;
const TAVERN_GOLD_PER_HP = 0.2;

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
  const isResting = user.tavernUntil && user.tavernUntil > now;
  const remainingMs = isResting && user.tavernUntil ? user.tavernUntil.getTime() - now.getTime() : 0;

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
  const missingHp = maxHp - user.currentHp;

  return NextResponse.json({
    isResting,
    tavernUntil: user.tavernUntil,
    remainingMs,
    currentHp: user.currentHp,
    maxHp,
    missingHp,
    healRateHpPerMin: 30,
    goldPerHp: TAVERN_GOLD_PER_HP,
    healCostPerHp: TAVERN_GOLD_PER_HP,
    gambleStreak: user.gambleStreak ?? 0,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, action, hp } = body;

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { inventory: true, beasts: true, skills: { include: { skill: true } } },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const now = new Date();

  if (action === "stop") {
    if (!user.tavernUntil || user.tavernUntil <= now) {
      return NextResponse.json({ error: "Not currently resting" }, { status: 400 });
    }

    // Calculate how much HP to heal based on elapsed time
    // Rate: 30 HP per minute = 0.5 HP per second
    const startTime = user.lastHpUpdatedAt ? new Date(user.lastHpUpdatedAt).getTime() : (user.tavernUntil.getTime() - (user.tavernUntil.getTime() - now.getTime()));
    const paidRestMs = user.tavernUntil.getTime() - startTime;
    const elapsedMs = Math.min(now.getTime() - startTime, paidRestMs);
    const healRateHpPerSec = 30 / 60; // 0.5 HP/sec
    const actualHealHp = Math.floor(elapsedMs * healRateHpPerSec / 1000);
    const newHp = Math.min(user.currentHp + actualHealHp, user.currentHp + 999999); // cap at effectively max

    // Get computed maxHp
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
    const finalHp = Math.min(newHp, maxHp);
    const actualHealed = finalHp - user.currentHp;

    await prisma.user.update({
      where: { id: userId },
      data: {
        currentHp: finalHp,
        tavernUntil: null,
        isBusy: false,
        busyUntil: null,
      },
    });
    return NextResponse.json({ success: true, message: `Left the tavern. Healed ${actualHealed} HP.`, healedHp: actualHealed, newHp: finalHp, maxHp });
  }

  if (action === "gamble") {
    const betAmount = Number(hp);
    if (!betAmount || betAmount < 10) {
      return NextResponse.json({ error: "Minimum bet is 10 gold" }, { status: 400 });
    }
    if (user.gold < betAmount) {
      return NextResponse.json({ error: "Not enough gold" }, { status: 400 });
    }
    const maxBet = Math.floor(user.gold * 0.3);
    if (betAmount > maxBet && user.gold > 100) {
      return NextResponse.json({ error: `Max bet is 30% of gold (${maxBet})` }, { status: 400 });
    }

    const streakBonus = (user.gambleStreak ?? 0) * 0.02;
    const winChance = 0.45 + streakBonus;
    const roll = Math.random();
    const isWin = roll < winChance;

    let newGold = user.gold;
    let newStreak = user.gambleStreak ?? 0;
    if (isWin) {
      newGold += betAmount;
      newStreak = 0;
    } else {
      newGold -= betAmount;
      newStreak += 1;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { gold: newGold, gambleStreak: newStreak },
    });

    const nextChance = Math.min(0.95, 0.45 + newStreak * 0.02);
    return NextResponse.json({
      success: true,
      isWin,
      goldGained: isWin ? betAmount : -betAmount,
      newGold,
      newStreak,
      nextChance: Math.round(nextChance * 100),
    });
  }

  if (user.hospitalUntil && user.hospitalUntil > now) {
    return NextResponse.json({ error: "In hospital, cannot rest" }, { status: 400 });
  }
  if (user.isBusy) {
    return NextResponse.json({ error: "Already busy with another action" }, { status: 400 });
  }
  if (user.tavernUntil && user.tavernUntil > now) {
    return NextResponse.json({ error: "Already resting" }, { status: 400 });
  }

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
  const missingHp = maxHp - user.currentHp;
  if (missingHp <= 0) {
    return NextResponse.json({ error: "HP already full" }, { status: 400 });
  }

  const healHp = hp ? Math.min(missingHp, Number(hp)) : missingHp;
  if (healHp <= 0) {
    return NextResponse.json({ error: "Nothing to heal" }, { status: 400 });
  }

  const durationMs = healHp * TAVERN_HEAL_INTERVAL_MS;
  const endTime = new Date(now.getTime() + durationMs);
  const costGold = Math.ceil(healHp * TAVERN_GOLD_PER_HP);

  if (user.gold < costGold) {
    return NextResponse.json({ error: `Not enough gold (need ${costGold})` }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        gold: { decrement: costGold },
        tavernUntil: endTime,
        isBusy: true,
        busyUntil: endTime,
        lastHpUpdatedAt: now,
      },
    }),
  ]);

  return NextResponse.json({
    success: true,
    message: `Resting started: +${healHp} HP over ${Math.round(durationMs / 60000)} min`,
    healHp,
    costGold,
    endTime,
  });
}
