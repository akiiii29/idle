import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeCombatStats, enrichBeast } from "@game/core";

const MAX_CHARGES = 3;
const CHARGE_REFILL_MS = 2 * 60 * 60 * 1000;
const SCALING_FACTOR = 0.04;
const DEATH_PENALTY = 0.4;
const VARIANCE_MIN = 0.85;
const VARIANCE_MAX = 1.45;
const JACKPOT_CHANCE = 0.05;
const JACKPOT_MULT = 2.5;
const STREAK_BONUS_X = 0.04;
const STREAK_CAP = 2.0;
const MAX_FIGHTS = 20;

function calcReward(baseReward: number, streak: number, fightIndex: number, isAuto: boolean) {
  const variance = Math.random() * (VARIANCE_MAX - VARIANCE_MIN) + VARIANCE_MIN;
  const isJackpot = Math.random() < JACKPOT_CHANCE;
  const jackpotMult = isJackpot ? JACKPOT_MULT : 1.0;
  const streakBonus = Math.min(STREAK_CAP, 1 + streak * STREAK_BONUS_X);
  let reward = baseReward * variance * jackpotMult * streakBonus;
  if (isAuto) {
    const efficiency = 0.75;
    const diminishingFactor = Math.max(0.5, 1 - fightIndex * 0.025);
    reward *= efficiency * diminishingFactor;
  }
  return { amount: Math.floor(reward), isJackpot };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const lastChargeAt = user.lastAutoHuntChargeAt?.getTime() || user.createdAt.getTime();
  const elapsed = Date.now() - lastChargeAt;
  let charges = user.autoHuntCharges ?? MAX_CHARGES;
  if (elapsed >= CHARGE_REFILL_MS) {
    const gained = Math.floor(elapsed / CHARGE_REFILL_MS);
    charges = Math.min(MAX_CHARGES, charges + gained);
  }

  const msUntilNextCharge = elapsed < CHARGE_REFILL_MS ? CHARGE_REFILL_MS - elapsed : 0;

  return NextResponse.json({
    charges,
    maxCharges: MAX_CHARGES,
    msUntilNextCharge,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId } = body;

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { beasts: true, inventory: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Check charges
  const lastChargeAt = user.lastAutoHuntChargeAt?.getTime() || user.createdAt.getTime();
  const elapsed = Date.now() - lastChargeAt;
  let charges = user.autoHuntCharges ?? MAX_CHARGES;
  if (elapsed >= CHARGE_REFILL_MS) {
    const gained = Math.floor(elapsed / CHARGE_REFILL_MS);
    charges = Math.min(MAX_CHARGES, charges + gained);
  }
  if (charges <= 0) {
    return NextResponse.json({ error: "No auto-hunt charges remaining" }, { status: 400 });
  }

  // Consume charge
  await prisma.user.update({
    where: { id: userId },
    data: {
      autoHuntCharges: charges - 1,
      lastAutoHuntAt: new Date(),
      lastAutoHuntChargeAt: new Date(),
    },
  });

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

  const playerFinalAtk = stats.final.attack;
  const playerFinalDef = stats.final.defense;
  const playerFinalMaxHp = stats.final.maxHp;
  const critRate = (user.luck * 0.005) + ((stats.extra as any)?.critRateBonus || 0);
  const critDamageMult = (stats.multiplier as any)?.critDamage || 1.5;
  const effectiveAtk = playerFinalAtk * (1 + critRate * (critDamageMult - 1));

  const potionStack = user.inventory?.find((i: any) => i.type === "POTION");
  const baseEnemy = { atk: 10, hp: 50, def: 5, lvl: user.level ?? 1 };

  let accumulatedGold = 0;
  let accumulatedExp = 0;
  let currentHp = user.currentHp;
  let potionsUsed = 0;
  let streak = 0;
  const fightsLog = [];

  for (let n = 0; n < MAX_FIGHTS; n++) {
    const enemyAtk = baseEnemy.atk * (1 + n * SCALING_FACTOR);
    const enemyHp = baseEnemy.hp * (1 + n * SCALING_FACTOR);
    const enemyLvl = baseEnemy.lvl;

    const powerRatio = (effectiveAtk / enemyAtk) * 0.7 + (playerFinalMaxHp / enemyHp) * 0.3;
    const winRate = Math.min(0.95, Math.max(0.05, powerRatio / 1.5));
    const isAmbush = Math.random() < 0.10;
    const isWin = Math.random() < winRate;

    if (!isWin) {
      const finalGold = Math.floor(accumulatedGold * (1 - DEATH_PENALTY));
      const finalExp = Math.floor(accumulatedExp * (1 - DEATH_PENALTY));
      const finalHp = 0; // Force HP to 0 on death
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: {
            gold: { increment: finalGold },
            exp: { increment: finalExp },
            currentHp: finalHp,
            hospitalUntil: new Date(Date.now() + 30 * 60 * 1000),
          },
        }),
        ...(potionsUsed > 0 && potionStack ? [
          prisma.item.update({ where: { id: potionStack.id }, data: { quantity: { decrement: potionsUsed } } })
        ] : []),
      ]);
      return NextResponse.json({
        status: "DIED",
        fightsCompleted: n,
        goldGained: finalGold,
        expGained: finalExp,
        hpRemaining: finalHp,
        potionsUsed,
        logs: fightsLog,
      });
    }

    const reduction = playerFinalDef / (playerFinalDef + 100);
    const cappedReduction = Math.min(0.75, Math.max(0, reduction));
    const baseTurnDmg = (enemyAtk * 4) * (1 - cappedReduction);
    let damage = baseTurnDmg * (1.1 - winRate);
    const lifestealFactor = ((stats.multiplier as any)?.lifesteal || 1) - 1;
    if (lifestealFactor > 0) {
      const healEffective = (effectiveAtk / enemyAtk) * 50 * lifestealFactor;
      damage = Math.max(0, damage - healEffective);
    }
    if (isAmbush) damage *= 1.5;
    currentHp -= damage;

    const currentAvailablePotions = (potionStack?.quantity || 0) - potionsUsed;
    if (currentHp < playerFinalMaxHp * 0.3 && currentAvailablePotions > 0 && potionsUsed < 10) {
      const healPct = (potionStack?.power || 25) / 100;
      currentHp = Math.min(playerFinalMaxHp, currentHp + playerFinalMaxHp * healPct);
      potionsUsed++;
    }

    if (currentHp <= 0) {
      const finalGold = Math.floor(accumulatedGold * (1 - DEATH_PENALTY));
      const finalExp = Math.floor(accumulatedExp * (1 - DEATH_PENALTY));
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: {
            gold: { increment: finalGold },
            exp: { increment: finalExp },
            currentHp: 0,
            hospitalUntil: new Date(Date.now() + 30 * 60 * 1000),
          },
        }),
        ...(potionsUsed > 0 && potionStack ? [
          prisma.item.update({ where: { id: potionStack.id }, data: { quantity: { decrement: potionsUsed } } })
        ] : []),
      ]);
      return NextResponse.json({
        status: "DIED",
        fightsCompleted: n,
        goldGained: finalGold,
        expGained: finalExp,
        hpRemaining: 0,
        potionsUsed,
        logs: fightsLog,
      });
    }

    const goldReward = calcReward(enemyLvl * 50, ++streak, n, true);
    const expReward = calcReward(enemyLvl * 10, streak, n, true);
    accumulatedGold += goldReward.amount;
    accumulatedExp += expReward.amount;
    fightsLog.push({ fight: n + 1, gold: goldReward.amount, exp: expReward.amount, jackpot: goldReward.isJackpot });
  }

  // Completed all 20 fights
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        gold: { increment: accumulatedGold },
        exp: { increment: accumulatedExp },
        currentHp: Math.floor(currentHp),
      },
    }),
    ...(potionsUsed > 0 && potionStack ? [
      prisma.item.update({ where: { id: potionStack.id }, data: { quantity: { decrement: potionsUsed } } })
    ] : []),
  ]);

  return NextResponse.json({
    status: "COMPLETED",
    fightsCompleted: MAX_FIGHTS,
    goldGained: accumulatedGold,
    expGained: accumulatedExp,
    hpRemaining: Math.floor(currentHp),
    potionsUsed,
    logs: fightsLog,
  });
}
