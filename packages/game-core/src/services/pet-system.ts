import { SKILL_HANDLERS, SKILL_EMOJIS } from "./skill-system";
import { enrichBeast } from "./pet-utils";

export function applyPetEffects(ctx: any, pets: any[], trigger: string, flags?: any): { triggered: string[], triggeredPetIds: string[] } {
  const triggered: string[] = [];
  const triggeredPetIds: string[] = [];
  if (!pets || pets.length === 0) return { triggered, triggeredPetIds };

  for (const pet of pets) {
    const enriched = enrichBeast(pet);

    if (enriched.trigger !== trigger) continue;

    const baseChance = 0.2;
    const powerModifier = pet.power * 0.001;
    const levelModifier = (pet.level - 1) * 0.01;
    const finalChance = Math.min(0.8, baseChance + powerModifier + levelModifier);

    if (Math.random() <= finalChance) {
      if (flags) {
        if (enriched.skillType === "CRIT") flags.petCrit = true;
        if (enriched.skillType === "BURN") flags.petBurn = true;
        if (enriched.skillType === "DOT" && enriched.name === "Cerberus") {
            flags.petBurn = true;
            flags.petPoison = true;
        } else if (enriched.skillType === "DOT" || enriched.skillType === "POISON") {
            flags.petPoison = true;
        }
        if (enriched.skillType === "SHIELD") flags.petShield = true;
        if (enriched.skillType === "HEAL" || enriched.skillType === "HEAL_BUFF") flags.petHeal = true;
        if (enriched.skillType === "DEBUFF") flags.petDebuff = true;
      }

      const handler = SKILL_HANDLERS[enriched.skillType];
      if (handler) {
        const skillObj = {
          name: pet.name,
          type: enriched.skillType,
          multiplier: enriched.skillPower,
          chance: finalChance,
          trigger: enriched.trigger
        };

        if (enriched.name === "Cerberus") {
            if (SKILL_HANDLERS["BURN"]) SKILL_HANDLERS["BURN"](ctx, skillObj, flags);
            if (SKILL_HANDLERS["POISON"]) SKILL_HANDLERS["POISON"](ctx, skillObj, flags);
        } else {
            handler(ctx, skillObj, flags);
        }

        const emoji = SKILL_EMOJIS[enriched.skillType] || "🐾";
        const logMsg = `${emoji} **${pet.name}** thi triển kỹ năng: **${enriched.skillType}**`;
        triggered.push(logMsg);
        triggeredPetIds.push(pet.id);
      }
    }
  }
  return { triggered, triggeredPetIds };
}
