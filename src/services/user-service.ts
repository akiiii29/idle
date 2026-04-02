// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { ItemType, PrismaClient } from "@prisma/client";

import {
  HP_RECOVERY_INTERVAL_MS,
  TAVERN_HEAL_INTERVAL_MS,
  XP_BAR_SIZE
} from "../constants/config";
import { prisma } from "./prisma";

type DbClient = PrismaClient | Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export interface HpUpdateResult {
  currentHp: number;
  lastHpUpdatedAt: Date;
  recovered: number;
}

export function getUpdatedHP(
  user: {
    currentHp: number;
    maxHp: number;
    lastHpUpdatedAt: Date;
    hospitalUntil: Date | null;
    tavernUntil?: Date | null;
  },
  now = new Date()
): HpUpdateResult {
  const lastUpdated = user.lastHpUpdatedAt ?? now;
  const currentHp = user.currentHp;

  if (currentHp >= user.maxHp) {
    return { currentHp: user.maxHp, lastHpUpdatedAt: lastUpdated, recovered: 0 };
  }

  // Still in hospital — HP doesn't regen
  if (user.hospitalUntil && user.hospitalUntil > now) {
    return { currentHp: currentHp, lastHpUpdatedAt: lastUpdated, recovered: 0 };
  }

  let hp = currentHp;
  let lastHpUpdatedAt = lastUpdated;

  // Tavern rest: 4 HP per minute (1 HP every 15 seconds).
  if (user.tavernUntil) {
    const tavernEnd = user.tavernUntil;
    const tavernEffectiveNow = tavernEnd.getTime() < now.getTime() ? tavernEnd : now;

    // Heal at tavern rate up to tavernEffectiveNow.
    if (tavernEffectiveNow.getTime() > lastUpdated.getTime() && hp < user.maxHp) {
      const elapsedMs = tavernEffectiveNow.getTime() - lastUpdated.getTime();
      const recoveredAtTavern = Math.floor(elapsedMs / TAVERN_HEAL_INTERVAL_MS);
      if (recoveredAtTavern > 0) {
        hp = Math.min(user.maxHp, hp + recoveredAtTavern);
        const consumedMs = recoveredAtTavern * TAVERN_HEAL_INTERVAL_MS;
        lastHpUpdatedAt = new Date(lastUpdated.getTime() + consumedMs);
      }
    }

    // If tavern is finished, passive regen starts from tavernEnd (not the last tick).
    if (tavernEnd.getTime() <= now.getTime() && hp < user.maxHp) {
      lastHpUpdatedAt = tavernEnd;
    }

    if (tavernEnd.getTime() > now.getTime()) {
      // Tavern still ongoing: no passive regen while resting.
      if (hp === currentHp) {
        return { currentHp: hp, lastHpUpdatedAt, recovered: 0 };
      }
      return { currentHp: hp, lastHpUpdatedAt: hp >= user.maxHp ? now : lastHpUpdatedAt, recovered: hp - currentHp };
    }
  }

  // Passive HP recovery restores 1 HP every 2 minutes.
  const elapsedMs = now.getTime() - lastHpUpdatedAt.getTime();
  const recovered = Math.floor(elapsedMs / HP_RECOVERY_INTERVAL_MS);

  if (recovered <= 0) {
    return { currentHp: hp, lastHpUpdatedAt, recovered: 0 };
  }

  hp = Math.min(user.maxHp, hp + recovered);
  const consumedMs = recovered * HP_RECOVERY_INTERVAL_MS;
  const timestamp = new Date(lastHpUpdatedAt.getTime() + consumedMs);

  return {
    currentHp: hp,
    lastHpUpdatedAt: hp >= user.maxHp ? now : timestamp,
    recovered: hp - currentHp
  };
}

export async function normalizeUserState(user: any, now = new Date()): Promise<any> {
  const data: Record<string, any> = {};
  const hpState = getUpdatedHP(user, now);
  const currentHp = user.currentHp;

  if (hpState.currentHp !== currentHp || hpState.lastHpUpdatedAt.getTime() !== user.lastHpUpdatedAt.getTime()) {
    data.currentHp = hpState.currentHp;
    data.lastHpUpdatedAt = hpState.lastHpUpdatedAt;
  }

  // If tavern healing already reached max HP early, stop resting immediately.
  if (user.tavernUntil && user.tavernUntil > now && hpState.currentHp >= user.maxHp) {
    data.tavernUntil = null;
    if (user.isBusy) {
      data.isBusy = false;
      data.busyUntil = null;
    }
  }

  // Hospital discharged — full heal both hp fields
  if (user.hospitalUntil && user.hospitalUntil <= now) {
    data.hospitalUntil = null;
    data.currentHp = user.maxHp;
    data.lastHpUpdatedAt = now;
  }

  if (user.isBusy && (!user.busyUntil || user.busyUntil <= now)) {
    data.isBusy = false;
    data.busyUntil = null;
  }

  if (user.tavernUntil && user.tavernUntil <= now) {
    data.tavernUntil = null;
  }

  if (Object.keys(data).length === 0) {
    return user;
  }

  return prisma.user.update({
    where: { id: user.id },
    data
  });
}

/** Pay Gold equal to maxHp to instantly revive from hospital */
export async function reviveUser(userId: string): Promise<{ success: boolean; message: string }> {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, message: "Không tìm thấy người chơi." };

    if (!user.hospitalUntil || user.hospitalUntil <= new Date()) {
      return { success: false, message: "Bạn không ở trong bệnh viện!" };
    }

    const cost = user.maxHp;
    if (user.gold < cost) {
      return {
        success: false,
        message: `❌ Bạn cần **${cost} vàng** để thanh toán chi phí bệnh viện. Bạn hiện có **${user.gold} vàng**.`
      };
    }

    await tx.user.update({
      where: { id: userId },
      data: {
        gold: { decrement: cost },
        currentHp: user.maxHp,
        hospitalUntil: null,
        lastHpUpdatedAt: new Date()
      }
    });

    return {
      success: true,
      message: `🚑 **Tái sinh khẩn cấp!** Bạn đã trả **${cost} vàng** và hiện ở trạng thái máu đầy (**${user.maxHp}/${user.maxHp}**)!`
    };
  });
}

export async function getUser(userId: string): Promise<any | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  return normalizeUserState(user);
}

export async function getUserWithRelations(userId: string): Promise<any | null> {
  const user = await getUser(userId);
  if (!user) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      beasts: true,
      inventory: true,
      skills: { include: { skill: true } }
    }
  });
}

export function getRemainingCooldown(lastUsed: Date | null | undefined, cooldownMs: number, now = new Date()): number {
  if (!lastUsed) return 0;
  const elapsed = now.getTime() - lastUsed.getTime();
  return Math.max(0, cooldownMs - elapsed);
}

export function formatDuration(ms: number): string {
  const safeMs = Math.max(0, ms);
  const totalSeconds = Math.ceil(safeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function buildXpBar(currentExp: number, requiredExp: number): string {
  const filled = Math.max(0, Math.min(XP_BAR_SIZE, Math.round((currentExp / requiredExp) * XP_BAR_SIZE)));
  return `${"🟩".repeat(filled)}${"⬜".repeat(XP_BAR_SIZE - filled)}`;
}

export async function upsertItem(
  db: DbClient,
  ownerId: string,
  item: { name: string; type: ItemType; power: number; quantity?: number }
): Promise<void> {
  await db.item.upsert({
    where: { ownerId_name_type: { ownerId, name: item.name, type: item.type } },
    create: { ownerId, name: item.name, type: item.type, power: item.power, quantity: item.quantity ?? 1 },
    update: { quantity: { increment: item.quantity ?? 1 }, power: item.power }
  });
}
