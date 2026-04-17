import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const Rarity = { COMMON: "COMMON", RARE: "RARE", EPIC: "EPIC", LEGENDARY: "LEGENDARY" } as const;

const ESSENCE_VALUES: Record<string, number> = { COMMON: 5, RARE: 15, EPIC: 40, LEGENDARY: 100 };
const GOLD_VALUES: Record<string, number> = { COMMON: 10, RARE: 30, EPIC: 80, LEGENDARY: 200 };
const UPGRADE_COSTS = [0, 0, 10, 20, 40, 80, 120, 180, 250, 350, 500]; // index = target level

function calculateDismantleEssence(pet: any) {
  const base = ESSENCE_VALUES[pet.rarity] || 0;
  const bonus = pet.level > 1 ? pet.level * 2 : 0;
  let total = base + bonus;
  if (pet.rarity === "EPIC" || pet.rarity === "LEGENDARY") total = Math.floor(total * 1.1);
  return total;
}

// POST /api/pets/[petId] — action: upgrade | sell | dismantle | sacrifice
export async function POST(req: NextRequest, { params }: { params: Promise<{ petId: string }> }) {
  try {
    const { userId, action } = await req.json();
    const { petId } = await params;

    if (!userId || !action) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const pet = await prisma.beast.findUnique({ where: { id: petId } });
    if (!pet || pet.ownerId !== userId) return NextResponse.json({ error: "Pet not found" }, { status: 404 });

    if (action === "sell") {
      if (pet.isEquipped) return NextResponse.json({ success: false, message: "Unequip pet first." });
      const gold = GOLD_VALUES[pet.rarity] || 0;
      await prisma.$transaction([
        prisma.user.update({ where: { id: userId }, data: { gold: { increment: gold } } }),
        prisma.beast.delete({ where: { id: petId } }),
      ]);
      return NextResponse.json({ success: true, message: `Sold for **${gold}** gold!`, gold });
    }

    if (action === "dismantle") {
      if (pet.isEquipped) return NextResponse.json({ success: false, message: "Unequip pet first." });
      const essence = calculateDismantleEssence(pet);
      await prisma.$transaction([
        prisma.user.update({ where: { id: userId }, data: { petEssence: { increment: essence } } as any }),
        prisma.beast.delete({ where: { id: petId } }),
      ]);
      return NextResponse.json({ success: true, message: `Dismantled for **${essence}** Essence!`, essence });
    }

    if (action === "upgrade") {
      const nextLevel = (pet.upgradeLevel || 0) + 1;
      if (nextLevel > 10) return NextResponse.json({ success: false, message: "Max level reached." });
      const cost = UPGRADE_COSTS[nextLevel] ?? 500;
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      if ((user as any).petEssence < cost) return NextResponse.json({ success: false, message: `Need ${cost} Essence.` });

      await prisma.$transaction([
        prisma.user.update({ where: { id: userId }, data: { petEssence: { decrement: cost } } as any }),
        prisma.beast.update({ where: { id: petId }, data: { upgradeLevel: nextLevel } }),
      ]);
      return NextResponse.json({ success: true, message: `Pet upgraded to ★${nextLevel}!`, newLevel: nextLevel, cost });
    }

    if (action === "sacrifice") {
      if (pet.isEquipped) return NextResponse.json({ success: false, message: "Unequip pet first." });
      // Increment talent counters
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: {
            talentDps: { increment: 1 },
          } as any,
        }),
        prisma.beast.delete({ where: { id: petId } }),
      ]);
      return NextResponse.json({ success: true, message: "Pet sacrificed! Talent counter +1." });
    }

    if (action === "unequip") {
      if (!pet.isEquipped) return NextResponse.json({ success: false, message: "Pet is not equipped." });
      await prisma.beast.update({ where: { id: petId }, data: { isEquipped: false } });
      return NextResponse.json({ success: true, message: "Pet unequipped!" });
    }

    if (action === "equip") {
      if (pet.isEquipped) return NextResponse.json({ success: false, message: "Pet is already equipped." });
      // Count currently equipped pets
      const equippedCount = await prisma.beast.count({ where: { ownerId: userId, isEquipped: true } });
      if (equippedCount >= 3) return NextResponse.json({ success: false, message: "Already have 3 pets equipped." });
      await prisma.beast.update({ where: { id: petId }, data: { isEquipped: true } });
      return NextResponse.json({ success: true, message: "Pet equipped!" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("[/api/pets/[petId]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
