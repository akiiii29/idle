import { ItemType, Prisma, PrismaClient, type User } from "@prisma/client";

import { HP_RECOVERY_INTERVAL_MS, XP_BAR_SIZE } from "../constants/config";
import { prisma } from "./prisma";

type DbClient = PrismaClient | Prisma.TransactionClient;

export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    beasts: true;
    inventory: true;
  };
}>;

export interface HpUpdateResult {
  hp: number;
  lastHpUpdatedAt: Date;
  recovered: number;
}

export function getUpdatedHP(
  user: Pick<User, "hp" | "maxHp" | "lastHpUpdatedAt" | "hospitalUntil">,
  now = new Date()
): HpUpdateResult {
  const lastUpdated = user.lastHpUpdatedAt ?? now;

  if (user.hp >= user.maxHp) {
    return {
      hp: user.maxHp,
      lastHpUpdatedAt: lastUpdated,
      recovered: 0
    };
  }

  if (user.hospitalUntil && user.hospitalUntil > now) {
    return {
      hp: user.hp,
      lastHpUpdatedAt: lastUpdated,
      recovered: 0
    };
  }

  const elapsedMs = now.getTime() - lastUpdated.getTime();
  const recovered = Math.floor(elapsedMs / HP_RECOVERY_INTERVAL_MS);

  if (recovered <= 0) {
    return {
      hp: user.hp,
      lastHpUpdatedAt: lastUpdated,
      recovered: 0
    };
  }

  const hp = Math.min(user.maxHp, user.hp + recovered);
  const consumedMs = recovered * HP_RECOVERY_INTERVAL_MS;
  const timestamp = new Date(lastUpdated.getTime() + consumedMs);

  return {
    hp,
    lastHpUpdatedAt: hp >= user.maxHp ? now : timestamp,
    recovered: hp - user.hp
  };
}

export async function normalizeUserState(user: User, now = new Date()): Promise<User> {
  const data: Prisma.UserUpdateInput = {};
  const hpState = getUpdatedHP(user, now);

  if (hpState.hp !== user.hp || hpState.lastHpUpdatedAt.getTime() !== user.lastHpUpdatedAt.getTime()) {
    data.hp = hpState.hp;
    data.lastHpUpdatedAt = hpState.lastHpUpdatedAt;
  }

  if (user.hospitalUntil && user.hospitalUntil <= now) {
    data.hospitalUntil = null;
  }

  if (user.isBusy && (!user.busyUntil || user.busyUntil <= now)) {
    data.isBusy = false;
    data.busyUntil = null;
  }

  if (Object.keys(data).length === 0) {
    return user;
  }

  return prisma.user.update({
    where: { id: user.id },
    data
  });
}

export async function getUser(userId: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    return null;
  }

  return normalizeUserState(user);
}

export async function getUserWithRelations(userId: string): Promise<UserWithRelations | null> {
  const user = await getUser(userId);
  if (!user) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      beasts: true,
      inventory: true
    }
  });
}

export function getRemainingCooldown(lastUsed: Date | null | undefined, cooldownMs: number, now = new Date()): number {
  if (!lastUsed) {
    return 0;
  }

  const elapsed = now.getTime() - lastUsed.getTime();
  return Math.max(0, cooldownMs - elapsed);
}

export function formatDuration(ms: number): string {
  const safeMs = Math.max(0, ms);
  const totalSeconds = Math.ceil(safeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

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
    where: {
      ownerId_name_type: {
        ownerId,
        name: item.name,
        type: item.type
      }
    },
    create: {
      ownerId,
      name: item.name,
      type: item.type,
      power: item.power,
      quantity: item.quantity ?? 1
    },
    update: {
      quantity: {
        increment: item.quantity ?? 1
      },
      power: item.power
    }
  });
}
