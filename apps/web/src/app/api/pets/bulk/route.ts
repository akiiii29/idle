import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const GOLD_VALUES: Record<string, number> = { COMMON: 10, RARE: 30, EPIC: 80, LEGENDARY: 200 };
const ESSENCE_VALUES: Record<string, number> = { COMMON: 5, RARE: 15, EPIC: 40, LEGENDARY: 100 };
const UPGRADE_COSTS = [0, 0, 10, 20, 40, 80, 120, 180, 250, 350, 500];

function calculateDismantleEssence(pet: any) {
  const base = ESSENCE_VALUES[pet.rarity] || 0;
  const bonus = pet.level > 1 ? pet.level * 2 : 0;
  let total = base + bonus;
  if (pet.rarity === "EPIC" || pet.rarity === "LEGENDARY") total = Math.floor(total * 1.1);
  return total;
}

// POST /api/pets/bulk — bulk sell | dismantle | sacrifice unequipped pets
export async function POST(req: NextRequest) {
  try {
    const { userId, action, rarity } = await req.json();

    if (!userId || !action) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const beasts = await prisma.beast.findMany({
      where: { ownerId: userId, isEquipped: false, ...(rarity ? { rarity } : {}) },
    });

    if (beasts.length === 0) return NextResponse.json({ success: true, message: "No pets to process.", count: 0 });

    if (action === "sell") {
      let totalGold = 0;
      for (const pet of beasts) totalGold += GOLD_VALUES[pet.rarity] || 0;
      await prisma.$transaction([
        prisma.user.update({ where: { id: userId }, data: { gold: { increment: totalGold } } }),
        prisma.beast.deleteMany({ where: { id: { in: beasts.map((b) => b.id) } } }),
      ]);
      return NextResponse.json({ success: true, message: `Sold ${beasts.length} pets for **${totalGold}** gold!`, count: beasts.length, gold: totalGold });
    }

    if (action === "dismantle") {
      let totalEssence = 0;
      for (const pet of beasts) totalEssence += calculateDismantleEssence(pet);
      await prisma.$transaction([
        prisma.user.update({ where: { id: userId }, data: { petEssence: { increment: totalEssence } } as any }),
        prisma.beast.deleteMany({ where: { id: { in: beasts.map((b) => b.id) } } }),
      ]);
      return NextResponse.json({ success: true, message: `Dismantled ${beasts.length} pets for **${totalEssence}** Essence!`, count: beasts.length, essence: totalEssence });
    }

    if (action === "sacrifice") {
      await prisma.$transaction([
        prisma.user.update({ where: { id: userId }, data: { talentDps: { increment: beasts.length } } as any }),
        prisma.beast.deleteMany({ where: { id: { in: beasts.map((b) => b.id) } } }),
      ]);
      return NextResponse.json({ success: true, message: `Sacrificed ${beasts.length} pets!`, count: beasts.length });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("[/api/pets/bulk]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
