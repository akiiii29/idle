import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TITLES } from "@game/core";

const TITLE_LIMITS: Record<string, number> = {
  COMMON: 3,
  RARE: 3,
  EPIC: 2,
  LEGENDARY: 1,
};

function getEquippedKeys(titleField: string | null): string[] {
  if (!titleField) return [];
  try {
    if (titleField.startsWith("[")) return JSON.parse(titleField);
    return [titleField];
  } catch { return []; }
}

function getUnlockedKeys(unlockedField: string | null): string[] {
  if (!unlockedField) return [];
  try {
    return JSON.parse(unlockedField);
  } catch { return []; }
}

// GET /api/achievements?userId=xxx — get all titles with unlock/equip status
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const unlocked = getUnlockedKeys(user.unlockedTitles);
  const equipped = getEquippedKeys(user.title);

  const byRarity = {
    COMMON: TITLES.filter((t) => t.rarity === "COMMON"),
    RARE: TITLES.filter((t) => t.rarity === "RARE"),
    EPIC: TITLES.filter((t) => t.rarity === "EPIC"),
    LEGENDARY: TITLES.filter((t) => t.rarity === "LEGENDARY"),
  };

  const serialize = (title: typeof TITLES[0]) => ({
    key: title.key,
    name: title.name,
    description: title.description,
    rarity: title.rarity,
    effectType: title.effectType,
    effectValue: title.effectValue,
    unlocked: unlocked.includes(title.key),
    equipped: equipped.includes(title.key),
  });

  return NextResponse.json({
    equippedTitles: equipped,
    unlockedTitles: unlocked,
    limits: TITLE_LIMITS,
    titles: {
      COMMON: byRarity.COMMON.map(serialize),
      RARE: byRarity.RARE.map(serialize),
      EPIC: byRarity.EPIC.map(serialize),
      LEGENDARY: byRarity.LEGENDARY.map(serialize),
    },
  });
}

// POST /api/achievements — equip or unequip a title
export async function POST(req: NextRequest) {
  try {
    const { userId, titleKey, action } = await req.json();

    if (!userId || !titleKey) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const unlocked = getUnlockedKeys(user.unlockedTitles);
    if (!unlocked.includes(titleKey)) {
      return NextResponse.json({ success: false, message: "Title not unlocked." });
    }

    let equipped = getEquippedKeys(user.title);
    const title = TITLES.find((t) => t.key === titleKey);
    if (!title) return NextResponse.json({ error: "Title not found" }, { status: 404 });

    if (action === "equip") {
      // Check rarity slot limit
      const currentRarityCount = equipped.filter((k) => {
        const t = TITLES.find((x) => x.key === k);
        return t?.rarity === title.rarity;
      }).length;
      if (currentRarityCount >= TITLE_LIMITS[title.rarity]) {
        return NextResponse.json({
          success: false,
          message: `${title.rarity} titles max: ${TITLE_LIMITS[title.rarity]}. Unequip one first.`,
        });
      }
      if (!equipped.includes(titleKey)) equipped.push(titleKey);
    } else if (action === "unequip") {
      equipped = equipped.filter((k) => k !== titleKey);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { title: JSON.stringify(equipped) },
    });

    return NextResponse.json({ success: true, equippedTitles: equipped });
  } catch (err) {
    console.error("[/api/achievements]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
