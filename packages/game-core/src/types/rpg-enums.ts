/**
 * rpg-enums.ts
 * Game enums as string literal union types — no Prisma dependency needed.
 * Replaces imports from @prisma/client so game-core has zero runtime deps.
 */

export type Rarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
export type ItemType = "WEAPON" | "ARMOR" | "ACCESSORY" | "CONSUMABLE" | "POTION" | "TRAP" | "LUCK_BUFF" | "MEAT" | "UTILITY" | "GAMBLE" | "BUFF" | "SITUATIONAL" | "PERMANENT" | "ENCOUNTER" | "RISK" | "CHAOS" | "PET_BUFF";
export type SkillType = "DAMAGE" | "DOT" | "DODGE" | "HEAL" | "GOLD" | "TAME" | "REDUCE_DAMAGE" | "CHAOS" | "COUNTER" | "BUFF" | "SHIELD" | "POISON" | "BURN" | "LIFESTEAL" | "REFLECT";
export type SkillTrigger = "ON_ATTACK" | "ON_DEFEND" | "ON_TURN_START";
export type QuestType = "DAILY" | "WEEKLY" | "ACHIEVEMENT";
