import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeCombatStats, enrichBeast } from "@game/core";
import { TITLES } from "@game/core/constants";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

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
    []
  );

  // Parse equipped titles
  let equippedKeys: string[] = [];
  try {
    if (user.title) {
      equippedKeys = user.title.startsWith("[") ? JSON.parse(user.title) : [user.title];
    }
  } catch { /* ignore */ }

  const equippedTitles = equippedKeys
    .map((k) => TITLES.find((t) => t.key === k))
    .filter((t): t is (typeof TITLES)[number] => !!t);

  // Top pet by power
  const topBeast = [...(user.beasts ?? [])].sort((a, b) => (b.power ?? 0) - (a.power ?? 0))[0] ?? null;

  // Cooldowns
  const now = Date.now();
  const HUNT_COOLDOWN_MS = 3600000; // 1 hour
  const DAILY_COOLDOWN_MS = 86400000; // 24 hours
  const huntCd = user.lastHunt ? Math.max(0, HUNT_COOLDOWN_MS - (now - new Date(user.lastHunt).getTime())) : 0;
  const dailyCd = user.lastDaily ? Math.max(0, DAILY_COOLDOWN_MS - (now - new Date(user.lastDaily).getTime())) : 0;
  const hospitalCd = user.hospitalUntil ? Math.max(0, new Date(user.hospitalUntil).getTime() - now) : 0;
  const tavernCd = user.tavernUntil ? Math.max(0, new Date(user.tavernUntil).getTime() - now) : 0;

  const equippedSkillCount = user.skills?.filter((s: any) => s.isEquipped).length ?? 0;

  return NextResponse.json({
    username: user.username || "Hunter",
    level: user.level,
    gold: user.gold,
    scrap: user.scrap ?? 0,
    exp: user.exp,
    expRequired: Math.floor(100 * Math.pow(user.level, 1.5)),
    currentHp: user.currentHp,
    maxHp: stats.final.maxHp,
    str: user.str,
    agi: user.agi,
    luck: user.luck ?? 0,
    attack: stats.final.attack,
    defense: stats.final.defense,
    speed: stats.final.speed,
    topBeast: topBeast ? { name: topBeast.name, rarity: topBeast.rarity, power: topBeast.power ?? 0 } : null,
    equippedSkillCount,
    inventoryCount: (user.inventory ?? []).filter((i: any) => i.quantity > 0).length,
    inventoryLimit: user.inventoryLimit ?? 50,
    petCount: user.beasts?.length ?? 0,
    equippedPetCount: equippedPets.length,
    title: equippedTitles.length > 0 ? equippedTitles[0].name : null,
    titleRarity: equippedTitles.length > 0 ? equippedTitles[0].rarity : null,
    huntReady: huntCd <= 0,
    dailyReady: dailyCd <= 0,
    isInHospital: hospitalCd > 0,
    isInTavern: tavernCd > 0,
    huntCdMs: huntCd,
    dailyCdMs: dailyCd,
    hospitalCdMs: hospitalCd,
    tavernCdMs: tavernCd,
    equippedItems,
    equippedPets: equippedPets.map((p: any) => ({ id: p.id, name: p.name, rarity: p.rarity, power: p.power, level: p.level, role: p.role })),
    inventory: (user.inventory ?? []).filter((i: any) => i.quantity > 0 && i.isEquipped).slice(0, 6),
  });
}
