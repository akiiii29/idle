import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDailySkills, getSkillDescription, SKILL_EMOJIS } from "@game/core";
import { getVnDayString } from "@game/core";

const SKILL_PRICE = 2000;
const MAX_EQUIPPED = 5;

// GET /api/skills?userId=xxx — get user's skills + daily shop
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { skills: { include: { skill: true } } },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // All available skills
  const allSkills = await prisma.skill.findMany();

  // Daily 5
  const daily5 = getDailySkills(userId, allSkills, getVnDayString);
  const userSkillIds = new Set(user.skills.map((us) => us.skillId));
  const ownedSkillIds = new Set(user.skills.map((us) => us.skillId));

  const dailySlots = daily5.map((skill) => ({
    id: skill.id,
    name: skill.name,
    type: skill.type,
    trigger: skill.trigger,
    emoji: SKILL_EMOJIS[skill.name] ?? "✨",
    description: getSkillDescription(skill),
    owned: userSkillIds.has(skill.id),
    price: SKILL_PRICE,
  }));

  const equippedSkills = user.skills
    .filter((us) => us.isEquipped)
    .map((us) => ({
      id: us.skill.id,
      name: us.skill.name,
      type: us.skill.type,
      trigger: us.skill.trigger,
      emoji: SKILL_EMOJIS[us.skill.name] ?? "✨",
      description: getSkillDescription(us.skill),
    }));

  const ownedSkills = user.skills.map((us) => ({
    id: us.skill.id,
    name: us.skill.name,
    type: us.skill.type,
    trigger: us.skill.trigger,
    emoji: SKILL_EMOJIS[us.skill.name] ?? "✨",
    description: getSkillDescription(us.skill),
    isEquipped: us.isEquipped,
  }));

  return NextResponse.json({
    gold: user.gold,
    skillPrice: SKILL_PRICE,
    maxEquipped: MAX_EQUIPPED,
    equippedCount: user.skills.filter((us) => us.isEquipped).length,
    dailySlots,
    ownedSkills,
  });
}
