import { PrismaClient, SkillType, SkillTrigger } from "@prisma/client";

const prisma = new PrismaClient();

const skills = [
  // STR / DAMAGE
  { name: "Critical Strike", type: SkillType.DAMAGE, trigger: SkillTrigger.ON_ATTACK, chance: 0.25, multiplier: 0.5 },
  { name: "Heavy Blow", type: SkillType.DAMAGE, trigger: SkillTrigger.ON_ATTACK, chance: 0.1, multiplier: 1.0 },
  { name: "Bleed", type: SkillType.DOT, trigger: SkillTrigger.ON_ATTACK, chance: 0.3, multiplier: 0.3 },
  { name: "Berserk", type: SkillType.DAMAGE, trigger: SkillTrigger.ON_ATTACK, chance: 1.0, multiplier: 0.0, scaleWithHp: true }, // custom scale handled in handler

  // DEF
  { name: "Iron Skin", type: SkillType.REDUCE_DAMAGE, trigger: SkillTrigger.ON_DEFEND, chance: 0.3, multiplier: 0.3 },
  { name: "Quick Reflex", type: SkillType.DODGE, trigger: SkillTrigger.ON_DEFEND, chance: 0.2, multiplier: 0.0 },
  { name: "Lifesteal", type: SkillType.HEAL, trigger: SkillTrigger.ON_ATTACK, chance: 0.25, multiplier: 0.3 },
  { name: "Last Stand", type: SkillType.HEAL, trigger: SkillTrigger.ON_DEFEND, chance: 0.1, multiplier: 1.0 },

  // AGI
  { name: "Double Strike", type: SkillType.DAMAGE, trigger: SkillTrigger.ON_ATTACK, chance: 0.2, multiplier: 0.5, extraHit: true },
  { name: "Evasion Mastery", type: SkillType.DODGE, trigger: SkillTrigger.ON_DEFEND, chance: 0.35, multiplier: 0.0 },
  { name: "Precision", type: SkillType.DAMAGE, trigger: SkillTrigger.ON_ATTACK, chance: 0.2, multiplier: 0.0, ignoreDef: true },

  // LUCK
  { name: "Lucky Find", type: SkillType.GOLD, trigger: SkillTrigger.ON_ATTACK, chance: 0.2, multiplier: 1.0 }, // +100% -> 1.0 additive
  { name: "Treasure Hunter", type: SkillType.GOLD, trigger: SkillTrigger.ON_TURN_START, chance: 0.15, multiplier: 0.5 }, // +50% -> 0.5 additive
  { name: "Chaos Surge", type: SkillType.CHAOS, trigger: SkillTrigger.ON_TURN_START, chance: 0.2, multiplier: 0.0 },

  // HYBRID
  { name: "Predator Instinct", type: SkillType.DAMAGE, trigger: SkillTrigger.ON_ATTACK, chance: 0.25, multiplier: 0.0, scaleWithPet: true }
];

async function seedSkills() {
  console.log("Seeding skills...");
  for (const s of skills) {
    await prisma.skill.upsert({
      where: { name: s.name },
      update: {
        type: s.type,
        trigger: s.trigger,
        chance: s.chance,
        multiplier: s.multiplier,
        ignoreDef: s.ignoreDef ?? false,
        extraHit: s.extraHit ?? false,
        scaleWithHp: s.scaleWithHp ?? false,
        scaleWithPet: s.scaleWithPet ?? false
      },
      create: {
        name: s.name,
        type: s.type,
        trigger: s.trigger,
        chance: s.chance,
        multiplier: s.multiplier,
        ignoreDef: s.ignoreDef ?? false,
        extraHit: s.extraHit ?? false,
        scaleWithHp: s.scaleWithHp ?? false,
        scaleWithPet: s.scaleWithPet ?? false
      }
    });
  }
  console.log("Seeded", skills.length, "skills successfully!");
}

seedSkills().catch(e => {
  console.error("Failed to seed skills", e);
}).finally(async () => {
  await prisma.$disconnect();
});
