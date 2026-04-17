import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { QUESTS, getQuest } from "@game/core";

const SHOP_REFRESH_GOLD = 500;

// GET /api/quests?userId=xxx — get user's quest progress
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { quests: { include: { quest: true } } },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Ensure all quests exist in DB
  await prisma.$transaction(
    QUESTS.map((q) =>
      prisma.quest.upsert({
        where: { key: q.key },
        create: {
          key: q.key,
          description: q.description,
          type: q.type as any,
          target: q.target,
          goldReward: q.goldReward,
        },
        update: {},
      })
    )
  );

  const now = new Date();
  const userQuestMap = new Map(user.quests.map((uq) => [uq.quest.key, uq]));

  const daily = QUESTS.filter((q) => q.type === "DAILY").map((q) => {
    const uq = userQuestMap.get(q.key);
    return {
      key: q.key,
      description: q.description,
      emoji: q.emoji,
      target: q.target,
      goldReward: q.goldReward,
      progress: uq?.progress ?? 0,
      isCompleted: uq?.isCompleted ?? false,
      isClaimed: uq?.isClaimed ?? false,
    };
  });

  const weekly = QUESTS.filter((q) => q.type === "WEEKLY").map((q) => {
    const uq = userQuestMap.get(q.key);
    return {
      key: q.key,
      description: q.description,
      emoji: q.emoji,
      target: q.target,
      goldReward: q.goldReward,
      progress: uq?.progress ?? 0,
      isCompleted: uq?.isCompleted ?? false,
      isClaimed: uq?.isClaimed ?? false,
    };
  });

  const achievements = QUESTS.filter((q) => q.type === "ACHIEVEMENT").map((q) => {
    const uq = userQuestMap.get(q.key);
    return {
      key: q.key,
      description: q.description,
      emoji: q.emoji,
      target: q.target,
      goldReward: q.goldReward,
      progress: uq?.progress ?? 0,
      isCompleted: uq?.isCompleted ?? false,
      isClaimed: uq?.isClaimed ?? false,
    };
  });

  return NextResponse.json({ gold: user.gold, daily, weekly, achievements });
}
