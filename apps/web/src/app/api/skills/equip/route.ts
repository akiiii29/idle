import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_EQUIPPED = 5;

// POST /api/skills/equip — equip or unequip a skill
export async function POST(req: NextRequest) {
  try {
    const { userId, skillId, equip } = await req.json();

    if (!userId || !skillId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const userSkill = await prisma.userSkill.findUnique({
      where: { userId_skillId: { userId, skillId } },
    });

    if (!userSkill) {
      return NextResponse.json({ error: "You don't own this skill." }, { status: 404 });
    }

    if (equip) {
      // Check max equipped
      const equippedCount = await prisma.userSkill.count({
        where: { userId, isEquipped: true },
      });
      if (equippedCount >= MAX_EQUIPPED) {
        return NextResponse.json({ success: false, message: `Max ${MAX_EQUIPPED} skills equipped.` });
      }
      await prisma.userSkill.update({
        where: { userId_skillId: { userId, skillId } },
        data: { isEquipped: true },
      });
      return NextResponse.json({ success: true, message: "Skill equipped." });
    } else {
      await prisma.userSkill.update({
        where: { userId_skillId: { userId, skillId } },
        data: { isEquipped: false },
      });
      return NextResponse.json({ success: true, message: "Skill unequipped." });
    }
  } catch (err) {
    console.error("[/api/skills/equip]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
