import { QuestType, Prisma } from "@prisma/client";
import { EmbedBuilder } from "discord.js";
import { prisma } from "./prisma";
import { TITLES } from "@game/core";

export async function syncAchievements() {
  for (const t of TITLES) {
    await prisma.quest.upsert({
      where: { key: t.key },
      create: {
        key: t.key,
        description: t.description,
        type: QuestType.ACHIEVEMENT,
        target: t.target,
        titleReward: t.key, // store the key of the title
        effectType: t.effectType,
        effectValue: t.effectValue,
        rarity: t.rarity
      },
      update: {
        description: t.description,
        target: t.target,
        titleReward: t.key,
        effectType: t.effectType,
        effectValue: t.effectValue,
        rarity: t.rarity
      }
    });
  }

  const validKeys = TITLES.map((t) => t.key);
  const stale = await prisma.quest.findMany({
    where: {
      type: QuestType.ACHIEVEMENT,
      NOT: { key: { in: validKeys } },
    },
  });
  for (const q of stale) {
    await prisma.userQuest.deleteMany({ where: { questId: q.id } });
    await prisma.quest.delete({ where: { id: q.id } });
  }
}

/** Điều kiện quest theo prefix; tránh `pet_` khớp nhầm `petlegendary_*` (cùng bắt đầu bằng "pet_"). */
function achievementKeyWhereClause(keyPrefix: string): Prisma.QuestWhereInput {
  const starts = { key: { startsWith: `${keyPrefix}_` } } as const;
  if (keyPrefix === "pet") {
    return {
      AND: [starts, { NOT: { key: { startsWith: "petlegendary_" } } }],
    };
  }
  return starts;
}

export async function getOrCreateUserAchievements(userId: string) {
  const allAchievements = await prisma.quest.findMany({
    where: { type: QuestType.ACHIEVEMENT },
    orderBy: { key: "asc" }
  });
  
  const userQuests = await Promise.all(
    allAchievements.map(async (q) => {
      return prisma.userQuest.upsert({
        where: { userId_questId: { userId, questId: q.id } },
        create: {
          userId,
          questId: q.id,
          resetAt: new Date(2100, 0, 1)
        },
        update: {},
        include: { quest: true }
      });
    })
  );

  return userQuests;
}

export async function updateAchievementProgress(
  userId: string,
  keyPrefix: string, // e.g. "slayer" will update all slayer_1, slayer_2 etc.
  amount: number = 1,
  isSet: boolean = false,
  tx?: Prisma.TransactionClient
): Promise<any[]> {
  const client = tx || prisma;
  
  // Find all achievement quests matching the prefix pattern (e.g. key starts with keyPrefix_)
  const quests = await client.quest.findMany({
    where: {
      type: QuestType.ACHIEVEMENT,
      ...achievementKeyWhereClause(keyPrefix),
    },
  });

  // Calculate highest existing progress for this prefix for this user to keep tiered achievements synced
  const existingUserQuests = await client.userQuest.findMany({
    where: {
      userId,
      quest: {
        type: QuestType.ACHIEVEMENT,
        ...achievementKeyWhereClause(keyPrefix),
      },
    },
  });
  const maxExistingProgress = existingUserQuests.reduce((max, uq) => Math.max(max, uq.progress), 0);

  const results = [];

  for (const quest of quests) {
    const existingUq = existingUserQuests.find(u => u.questId === quest.id);
    const uq = existingUq || await client.userQuest.upsert({
      where: { userId_questId: { userId, questId: quest.id } },
      create: {
        userId,
        questId: quest.id,
        progress: isSet ? Math.min(quest.target, amount) : Math.min(quest.target, maxExistingProgress),
        resetAt: new Date(2100, 0, 1)
      },
      update: {}
    });

    const oldProgress = uq.progress;
    const newProgress = isSet 
      ? Math.min(quest.target, amount)
      : Math.min(quest.target, oldProgress + amount);
      
    // If it was already completed and we are NOT resetting/reducing via isSet, skip
    if (uq.isCompleted && !isSet) continue;
    
    // If progress hasn't changed AND completion state hasn't changed, skip
    const willBeCompleted = newProgress >= quest.target;
    if (newProgress === oldProgress && uq.isCompleted === willBeCompleted) continue;
      
    await client.userQuest.update({
      where: { id: uq.id },
      data: {
        progress: newProgress,
        isCompleted: willBeCompleted
      }
    });

    results.push({
      quest,
      oldProgress,
      newProgress,
      justCompleted: willBeCompleted && !uq.isCompleted
    });
  }
  
  return results;
}

export function formatAchievementProgress(updates: any[]): string {
  if (!updates || updates.length === 0) return "Không có tiến trình mới.";

  const sorted = [...updates].sort((a, b) => {
    if (a.justCompleted && !b.justCompleted) return -1;
    if (!a.justCompleted && b.justCompleted) return 1;
    const pctA = a.newProgress / a.quest.target;
    const pctB = b.newProgress / b.quest.target;
    return pctB - pctA;
  });

  const top = sorted.slice(0, 3);
  
  return top.map(u => {
    const isDone = u.justCompleted ? " ✅" : "";
    const name = u.quest.titleReward || u.quest.key;
    return `- ${name} (${u.oldProgress} → ${u.newProgress}) ${isDone}`;
  }).join("\n");
}

export function buildAchievementNotifications(updates: any[]) {
  const completed = updates.filter(u => u.justCompleted).slice(0, 2); // max 2
  const REWARD_COLORS: Record<string, number> = {
    COMMON: 0x808080,
    RARE: 0x3498db,
    EPIC: 0x9b59b6,
    LEGENDARY: 0xf1c40f
  };

  const embeds = completed.map(c => {
    const rarity = c.quest.rarity || "COMMON";
    return new EmbedBuilder()
      .setTitle("🏆 Achievement Unlocked!")
      .setDescription(`You have completed **${c.quest.titleReward || c.quest.key}**`)
      .setColor(REWARD_COLORS[rarity] || 0x808080)
      .addFields(
        { name: "Requirement", value: c.quest.description },
        { name: "Reward", value: "Title: " + (c.quest.titleReward || "None") }
      )
      .setFooter({ text: "Use /achievements to claim your reward" });
  });

  return {
    completedAchievements: completed,
    embedPayload: embeds.length > 0 ? embeds : undefined,
    notificationSent: embeds.length > 0
  };
}

export async function claimAchievementReward(userId: string, userQuestId: string) {
  return prisma.$transaction(async (tx) => {
    const uq = await tx.userQuest.findUnique({
      where: { id: userQuestId },
      include: { quest: true }
    });

    if (!uq || !uq.isCompleted || uq.isClaimed) {
      throw new Error("Thưởng danh hiệu không khả dụng.");
    }

    if (uq.quest.titleReward) {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (user) {
        let unlocked: string[] = [];
        try {
          unlocked = JSON.parse(user.unlockedTitles || "[]");
        } catch(e) {}
        
        if (!unlocked.includes(uq.quest.titleReward)) {
          unlocked.push(uq.quest.titleReward);
        }

        await tx.user.update({
          where: { id: userId },
          data: { unlockedTitles: JSON.stringify(unlocked) }
        });
      }
    }

    await tx.userQuest.update({
      where: { id: uq.id },
      data: { isClaimed: true }
    });

    return uq.quest;
  });
}
