import type { Rarity } from "../types/rpg-enums";

import { BEAST_LIBRARY } from "../constants/beasts";
import { PET_CONFIGS } from "../constants/pet-config";
import { RARITY_BASE_RATES, RARITY_POWER_RANGES } from "../constants/config";
import { clamp, pickRandom, randomInt, weightedPick } from "./rng";

export function rollRarity(luck: number): Rarity {
  const commonReduction = clamp(luck * 0.5, 0, 30);
  const rareBonus = commonReduction * 0.6;
  const epicBonus = commonReduction * 0.3;
  const legendaryBonus = commonReduction * 0.1;

  const legendaryRate = clamp(RARITY_BASE_RATES["LEGENDARY"] + legendaryBonus, 0, 10);
  const commonRate = clamp(RARITY_BASE_RATES["COMMON"] - commonReduction, 5, 100);

  let rareRate = RARITY_BASE_RATES["RARE"] + rareBonus;
  let epicRate = RARITY_BASE_RATES["EPIC"] + epicBonus;
  const totalBeforeNormalize = commonRate + rareRate + epicRate + legendaryRate;
  const diff = 100 - totalBeforeNormalize;

  rareRate += diff * 0.67;
  epicRate += diff * 0.33;

  return weightedPick<Rarity>({
    COMMON: commonRate,
    RARE: rareRate,
    EPIC: epicRate,
    LEGENDARY: legendaryRate
  });
}

export function createWildBeast(level: number, luck: number): {
  name: string; rarity: Rarity; power: number;
  role?: string | undefined; skillType?: string | undefined; skillPower?: number | undefined; trigger?: string | undefined;
} {
  const rarity = rollRarity(luck);
  const name = pickRandom(BEAST_LIBRARY[rarity]);
  const config = PET_CONFIGS[name];
  const powerRange = RARITY_POWER_RANGES[rarity];
  const levelBonus = Math.max(0, Math.floor(level / 2));
  const power = randomInt(powerRange.min, powerRange.max) + levelBonus;

  return {
    name,
    rarity,
    power,
    role: config?.role,
    skillType: config?.skillType,
    skillPower: config?.skillPower,
    trigger: config?.trigger
  };
}
