import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId } = body;

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const now = new Date();
  const isDead = user.currentHp <= 0;
  const isHospitalized = user.hospitalUntil && user.hospitalUntil > now;

  if (!isDead && !isHospitalized) {
    return NextResponse.json({ error: "Not in hospital and not dead" }, { status: 400 });
  }

  const maxHp = user.maxHp;
  const reviveCost = Math.ceil(maxHp * 1.2);

  if (user.gold < reviveCost) {
    return NextResponse.json({ error: `Not enough gold. Need ${reviveCost}, have ${user.gold}` }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        gold: { decrement: reviveCost },
        currentHp: maxHp,
        hospitalUntil: null,
        lastHpUpdatedAt: now,
      },
    }),
  ]);

  return NextResponse.json({ success: true, revivedAt: now, goldSpent: reviveCost });
}
