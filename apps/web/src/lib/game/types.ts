/**
 * Shared types for the web app — mirrors game-core enums.
 */

export const ItemType = {
  WEAPON: "WEAPON",
  ARMOR: "ARMOR",
  ACCESSORY: "ACCESSORY",
  CONSUMABLE: "CONSUMABLE",
  POTION: "POTION",
  TRAP: "TRAP",
  LUCK_BUFF: "LUCK_BUFF",
  MEAT: "MEAT",
  UTILITY: "UTILITY",
  GAMBLE: "GAMBLE",
  BUFF: "BUFF",
  SITUATIONAL: "SITUATIONAL",
  PERMANENT: "PERMANENT",
  ENCOUNTER: "ENCOUNTER",
  RISK: "RISK",
  CHAOS: "CHAOS",
  PET_BUFF: "PET_BUFF",
} as const;

export type ItemType = typeof ItemType[keyof typeof ItemType];
