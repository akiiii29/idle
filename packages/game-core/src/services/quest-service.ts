/**
 * quest-service.ts — pure quest definitions and helpers, no Prisma.
 */

import type { QuestType } from "../types/rpg-enums";

export interface QuestDefinition {
  key: string;
  description: string;
  type: QuestType;
  target: number;
  goldReward: number;
  emoji: string;
}

export const QUESTS: QuestDefinition[] = [
  // DAILY
  { key: "hunt_count", description: "Hunt 5 times", type: "DAILY", target: 5, goldReward: 50, emoji: "⚔️" },
  { key: "catch_pet", description: "Tame 2 pets", type: "DAILY", target: 2, goldReward: 100, emoji: "🐾" },
  { key: "win_pvp", description: "Win 1 PvP match", type: "DAILY", target: 1, goldReward: 200, emoji: "🏟️" },
  { key: "use_item", description: "Use 3 items", type: "DAILY", target: 3, goldReward: 30, emoji: "📦" },
  { key: "earn_gold", description: "Earn 1000 gold", type: "DAILY", target: 1000, goldReward: 75, emoji: "💰" },
  // WEEKLY
  { key: "open_chest", description: "Open 5 chests", type: "WEEKLY", target: 5, goldReward: 500, emoji: "📦" },
  { key: "kill_beast", description: "Kill 20 beasts for meat", type: "WEEKLY", target: 20, goldReward: 1000, emoji: "🍖" },
  { key: "hunt_50", description: "Hunt 50 times", type: "WEEKLY", target: 50, goldReward: 800, emoji: "⚔️" },
  // ACHIEVEMENT (never resets)
  { key: "first_hunt", description: "Complete your first hunt", type: "ACHIEVEMENT", target: 1, goldReward: 0, emoji: "🎯" },
  { key: "reach_level_10", description: "Reach level 10", type: "ACHIEVEMENT", target: 10, goldReward: 0, emoji: "⭐" },
  { key: "own_5_pets", description: "Own 5 pets", type: "ACHIEVEMENT", target: 5, goldReward: 0, emoji: "🐾" },
];

export function getQuest(key: string): QuestDefinition | undefined {
  return QUESTS.find((q) => q.key === key);
}

export function getQuestsByType(type: QuestType): QuestDefinition[] {
  return QUESTS.filter((q) => q.type === type);
}
