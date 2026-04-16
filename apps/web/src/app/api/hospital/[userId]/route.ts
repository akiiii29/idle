import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const HOSPITAL_COOLDOWN_MS = 30 * 60 * 1000;

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const now = new Date();
  const hospUntil = user.hospitalUntil;
  const inHospital = hospUntil && hospUntil > now;
  const remainingMs = inHospital && hospUntil ? hospUntil.getTime() - now.getTime() : 0;

  // Compute maxHp
  const stats: any = { final: { maxHp: user.maxHp } };
  const maxHp = stats.final.maxHp;
  const reviveCost = Math.ceil(maxHp * 1.2);

  return NextResponse.json({
    inHospital,
    hospitalUntil: hospUntil,
    remainingMs,
    currentHp: user.currentHp,
    maxHp,
    reviveCost,
    cooldownMs: HOSPITAL_COOLDOWN_MS,
  });
}
