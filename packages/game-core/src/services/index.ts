export { clamp, randomInt, rollPercent, pickRandom, weightedPick } from "./rng";
export { calculateDamage, applyDamage, addEffect, resolveTurnEffects, cleanupEffects, getBuffDamageReduction } from "./combat-utils";
export { requiredExpForLevel, applyLevelUps } from "./leveling";
export { rollRarity, createWildBeast } from "./hunt-service";
export { enrichBeast, calculatePetStatBonus, calculatePetStatBonusDetailed } from "./pet-utils";
export { applyPetEffects } from "./pet-system";
export { getActiveSynergies, calculateSynergyMultipliers, applyPetSynergy, applyPetPlayerSynergy } from "./pet-synergy";
export { SKILL_EMOJIS, SKILL_HANDLERS, applySkills, getSkillDescription, SYNERGY_LIST } from "./skill-system";
export { computeCombatStats, calculatePipelineDamage, type StatValuePart, type MultDeltaPart } from "./stats-service";
export { applyRelicsBeforeCombat, applyRelicsOnTurn, applyRelicsOnKill } from "./relic-system";
export { dealDamage, processDamage, applyBleed, healUnit, reflectDamage, grantExtraTurn, executeUnit, applyRelicEffect, handleRelicTrigger } from "./relic-engine";
export { SYNERGY_POOL, getActiveSynergies as getActiveRelicSynergies, applySynergyEffects } from "./relic-synergy";
export { simulateCombat } from "./combat-engine";
export {
  SCRAP_VALUE_IN_GOLD,
  MAX_UPGRADE_LEVEL,
  GEAR_TYPES,
  getRarityMultiplier,
  getUpgradeCost,
  getBaseSuccessRate,
  getUpgradeSuccessRate,
  getEffectiveSuccessRate,
  previewUpgradePayment,
  calculateScrapValue,
  sortGearKeepBestFirst,
} from "./upgrade-service";
export {
  SHOP_CATALOG,
  CHEST_CATALOG,
  DUNGEON_BUFF_ITEMS,
  SHOP_REFRESH_GOLD,
  getCatalogEntry,
  getChestEntry,
  rollEquipmentRarityFn,
  getEqPrice,
  getAccessoryPrice,
  PET_SHOP_PRICES,
  getDailySkills,
  type ShopCatalogEntry,
  type EqShopEntry,
} from "./shop-service";
export { QUESTS, getQuest, getQuestsByType, type QuestDefinition } from "./quest-service";
export { getVnDayString, msUntilNextVnMidnight, isDifferentVnDay, msUntilNextVnMidnightFrom } from "../utils/time";
