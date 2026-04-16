import { ItemType, Prisma, QuestType } from "@prisma/client";
import { prisma } from "./prisma";
import { upsertItem } from "./user-service";

export interface QuestDefinition {
  key: string;
  description: string;
  type: QuestType;
  target: number;
  goldReward: number;
  itemReward?: {
    name: string;
    type: ItemType;
    power: number;
  };
  titleReward?: string;
}

export const QUESTS: QuestDefinition[] = [
  { key: "hunt_count", description: "Đi săn 5 lần", type: QuestType.DAILY, target: 5, goldReward: 50 },
  { key: "catch_pet", description: "Thuần phục thành công 2 quái thú", type: QuestType.DAILY, target: 2, goldReward: 100 },
  { key: "open_chest", description: "Tìm và mở 5 rương kho báu", type: QuestType.WEEKLY, target: 5, goldReward: 500 },
  { key: "kill_beast", description: "Hạ gục 20 quái thú để lấy thịt", type: QuestType.WEEKLY, target: 20, goldReward: 1000 }
];

export async function syncQuests() {
  for (const q of QUESTS) {
    await prisma.quest.upsert({
      where: { key: q.key },
      create: {
        key: q.key,
        description: q.description,
        type: q.type,
        target: q.target,
        goldReward: q.goldReward,
        itemRewardName: q.itemReward?.name ?? null,
        itemRewardType: q.itemReward?.type ?? null,
        itemRewardPower: q.itemReward?.power ?? null,
        titleReward: q.titleReward ?? null,
      },
      update: {
        description: q.description,
        target: q.target,
        goldReward: q.goldReward,
        itemRewardName: q.itemReward?.name ?? null,
        itemRewardType: q.itemReward?.type ?? null,
        itemRewardPower: q.itemReward?.power ?? null,
        titleReward: q.titleReward ?? null,
      }
    });
  }
}

import { msUntilNextVnMidnight, getVnDate } from "../utils/time";

export function getNextResetDate(type: QuestType): Date {
  const now = new Date();

  if (type === QuestType.DAILY) {
    return new Date(now.getTime() + msUntilNextVnMidnight());
  }
  
  if (type === QuestType.WEEKLY) {
    const vnNow = getVnDate(now);
    const day = vnNow.getUTCDay(); // 0: Sun, 1: Mon, ...
    const diff = (day === 1) ? 7 : (day === 0 ? 1 : 8 - day);
    
    const nextMonVN = new Date(Date.UTC(
      vnNow.getUTCFullYear(),
      vnNow.getUTCMonth(),
      vnNow.getUTCDate() + diff,
      0, 0, 0
    ));
    // Convert back to UTC
    return new Date(nextMonVN.getTime() - (7 * 60 * 60 * 1000));
  }
  return new Date(2100, 0, 1); 
}

export async function checkAndResetQuests(userId: string) {
  const now = new Date();
  const userQuests = await prisma.userQuest.findMany({
    where: { userId },
    include: { quest: true }
  });

  for (const uq of userQuests) {
    if (uq.quest.type === QuestType.ACHIEVEMENT) continue;

    if (now >= uq.resetAt) {
      await prisma.userQuest.update({
        where: { id: uq.id },
        data: {
          progress: 0,
          isCompleted: false,
          isClaimed: false,
          resetAt: getNextResetDate(uq.quest.type)
        }
      });
    }
  }
}

export async function getOrCreateUserQuests(userId: string) {
  await checkAndResetQuests(userId);
  const allQuests = await prisma.quest.findMany({
    where: { type: { in: [QuestType.DAILY, QuestType.WEEKLY] } }
  });
  
  const userQuests = await Promise.all(
    allQuests.map(async (q) => {
      return prisma.userQuest.upsert({
        where: { userId_questId: { userId, questId: q.id } },
        create: {
          userId,
          questId: q.id,
          resetAt: getNextResetDate(q.type)
        },
        update: {},
        include: { quest: true }
      });
    })
  );

  return userQuests;
}

export async function updateQuestProgress(
  userId: string, 
  key: string, 
  amount: number = 1, 
  isSet: boolean = false,
  tx?: Prisma.TransactionClient
) {
  const client = tx || prisma;
  const quest = await client.quest.findUnique({ where: { key } });
  if (!quest) return;

  const uq = await client.userQuest.upsert({
    where: { userId_questId: { userId, questId: quest.id } },
    create: {
      userId,
      questId: quest.id,
      progress: isSet ? Math.min(quest.target, amount) : 0,
      resetAt: getNextResetDate(quest.type)
    },
    update: {}
  });

  if (uq.isCompleted) return;

  const newProgress = isSet 
    ? Math.min(quest.target, amount)
    : Math.min(quest.target, uq.progress + amount);
    
  await client.userQuest.update({
    where: { id: uq.id },
    data: {
      progress: newProgress,
      isCompleted: newProgress >= quest.target
    }
  });
}

export async function claimQuestReward(userId: string, userQuestId: string) {
  return prisma.$transaction(async (tx) => {
    const uq = await tx.userQuest.findUnique({
      where: { id: userQuestId },
      include: { quest: true }
    });

    if (!uq || !uq.isCompleted || uq.isClaimed) {
      throw new Error("Thưởng nhiệm vụ không khả dụng.");
    }

    // Award gold
    if (uq.quest.goldReward > 0) {
      await tx.user.update({
        where: { id: userId },
        data: { gold: { increment: uq.quest.goldReward } }
      });
    }

    // Award item
    if (uq.quest.itemRewardName && uq.quest.itemRewardType) {
      await upsertItem(tx, userId, {
        name: uq.quest.itemRewardName,
        type: uq.quest.itemRewardType,
        power: uq.quest.itemRewardPower ?? 1,
        quantity: 1
      });
    }

    // Award title
    if (uq.quest.titleReward) {
      await tx.user.update({
        where: { id: userId },
        data: { title: uq.quest.titleReward }
      });
    }

    // Mark claimed
    await tx.userQuest.update({
      where: { id: uq.id },
      data: { isClaimed: true }
    });

    return uq.quest;
  });
}
