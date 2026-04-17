import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SKILL_PRICE = 2000;

// POST /api/skills/buy/[skillId] — buy a skill
export async function POST(req: NextRequest, { params }: { params: Promise<{ skillId: string }> }) {
  try {
    const { userId } = await req.json();
    const { skillId } = await params;

    if (!userId || !skillId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { skills: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const alreadyOwned = user.skills.some((us) => us.skillId === skillId);
    if (alreadyOwned) {
      return NextResponse.json({ success: false, message: "You already own this skill." });
    }

    if (user.gold < SKILL_PRICE) {
      return NextResponse.json({ success: false, message: `Need ${SKILL_PRICE} gold.` });
    }

    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { gold: { decrement: SKILL_PRICE } } }),
      prisma.userSkill.create({ data: { userId, skillId, isEquipped: false } }),
    ]);

    const skill = await prisma.skill.findUnique({ where: { id: skillId } });
    return NextResponse.json({ success: true, message: `Learned **${skill?.name ?? "skill"}**!` });
  } catch (err) {
    console.error("[/api/skills/buy]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
