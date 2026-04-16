import { PET_CONFIGS, type PetConfig } from "../constants/pet-config";
import { Rarity } from "@prisma/client";

export function enrichBeast(beast: any): any {
  // Try to find in config by name
  let config = PET_CONFIGS[beast.name];
  
  if (!config) {
    // Basic fallback based on rarity if not in config
    const isDps = beast.id.charCodeAt(0) % 3 === 0;
    const isTank = beast.id.charCodeAt(0) % 3 === 1;
    
    config = {
      name: beast.name,
      role: isDps ? "DPS" : (isTank ? "TANK" : "SUPPORT"),
      skillType: isDps ? "DAMAGE" : (isTank ? "REDUCE_DAMAGE" : "HEAL"),
      skillPower: beast.rarity === Rarity.LEGENDARY ? 0.3 : (beast.rarity === Rarity.EPIC ? 0.15 : 0.05),
      trigger: isDps ? "ON_ATTACK" : (isTank ? "ON_DEFEND" : "ON_TURN_START"),
      rarity: beast.rarity,
      description: "Một sinh vật hoang dã bí ẩn chưa được phân loại."
    };
  }

  return {
    ...beast,
    role: beast.role ?? config.role,
    skillType: beast.skillType ?? config.skillType,
    skillPower: beast.skillPower ?? config.skillPower,
    trigger: beast.trigger ?? config.trigger,
    config
  };
}

export function calculatePetStatBonus(pets: any[], customMultipliers?: number[]) {
  let bonusAtk = 0;
  let bonusDef = 0;
  
  // Sorted by power descending for maximal bonus
  const sortedPets = [...pets].sort((a, b) => b.power - a.power);
  
  const multipliers = customMultipliers || [1.0, 0.7, 0.5]; // Default: 100%, 70%, 50%
  
  sortedPets.forEach((pet, index) => {
    if (index >= multipliers.length) return;
    const mult = multipliers[index]!;
    
    // Enrich to get role for specific bonuses
    const enriched = enrichBeast(pet);
    
    // Base contribution
    bonusAtk += (pet.power * 0.3) * mult;
    bonusDef += (pet.power * 0.2) * mult;
    
    // Role-based specialty bonus
    if (enriched.role === "DPS") bonusAtk += (pet.power * 0.1) * mult;
    if (enriched.role === "TANK") bonusDef += (pet.power * 0.1) * mult;
  });
  
  return { bonusAtk, bonusDef };
}

export interface PetStatContribution {
  name: string;
  role: string;
  power: number;
  slotMult: number;
  atk: number;
  def: number;
}

/** Chi tiết từng pet (tổng atk/def khớp `calculatePetStatBonus`). */
export function calculatePetStatBonusDetailed(
  pets: any[],
  customMultipliers?: number[]
): { contributions: PetStatContribution[]; totalAtk: number; totalDef: number } {
  const sortedPets = [...pets].sort((a, b) => b.power - a.power);
  const multipliers = customMultipliers || [1.0, 0.7, 0.5];
  const contributions: PetStatContribution[] = [];
  let bonusAtk = 0;
  let bonusDef = 0;

  sortedPets.forEach((pet, index) => {
    if (index >= multipliers.length) return;
    const mult = multipliers[index]!;
    const enriched = enrichBeast(pet);
    let atk = (pet.power * 0.3) * mult;
    let def = (pet.power * 0.2) * mult;
    if (enriched.role === "DPS") atk += (pet.power * 0.1) * mult;
    if (enriched.role === "TANK") def += (pet.power * 0.1) * mult;
    bonusAtk += atk;
    bonusDef += def;
    contributions.push({
      name: pet.name,
      role: enriched.role || "?",
      power: pet.power,
      slotMult: mult,
      atk,
      def,
    });
  });

  return { contributions, totalAtk: bonusAtk, totalDef: bonusDef };
}
