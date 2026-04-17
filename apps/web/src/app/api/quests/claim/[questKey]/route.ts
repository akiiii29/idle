import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { QUESTS } from "@game/core";

// POST /api/quests/claim/[questKey] — claim a quest reward
export async function POST(req: NextRequest, { params }: { params: Promise<{ questKey: string }> }) {
  try {
    const { userId } = await req.json();
    const { questKey } = await params;

    if (!userId || !questKey) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const questDef = QUESTS.find((q) => q.key === questKey);
    if (!questDef) return NextResponse.json({ error: "Quest not found" }, { status: 404 });

    // Look up quest by key to get its ID
    const quest = await prisma.quest.findUnique({ where: { key: questKey } });
    if (!quest) return NextResponse.json({ error: "Quest not in DB" }, { status: 404 });

    const uq = await prisma.userQuest.findUnique({
      where: { userId_questId: { userId, questId: quest.id } },
    });

    if (!uq) return NextResponse.json({ success: false, message: "Quest not started." });
    if (!uq.isCompleted) return NextResponse.json({ success: false, message: "Quest not completed." });
    if (uq.isClaimed) return NextResponse.json({ success: false, message: "Already claimed." });

    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { gold: { increment: questDef.goldReward } } }),
      prisma.userQuest.update({
        where: { id: uq.id },
        data: { isClaimed: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Claimed **${questDef.goldReward}** gold!`,
      goldGained: questDef.goldReward,
    });
  } catch (err) {
    console.error("[/api/quests/claim]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
