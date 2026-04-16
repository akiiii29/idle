import { PrismaClient, SkillType, SkillTrigger } from "@prisma/client";

const prisma = new PrismaClient();

const skills = [
    // --- EXISTING / CORE (12) ---
    { name: "Critical Strike", type: SkillType.DAMAGE, trigger: SkillTrigger.ON_ATTACK, chance: 0.25, multiplier: 0.5 },
    { name: "Heavy Blow", type: SkillType.DAMAGE, trigger: SkillTrigger.ON_ATTACK, chance: 0.1, multiplier: 1.0 },
    { name: "Bleed", type: SkillType.DOT, trigger: SkillTrigger.ON_ATTACK, chance: 0.3, multiplier: 0.3 },
    { name: "Berserk", type: SkillType.DAMAGE, trigger: SkillTrigger.ON_ATTACK, chance: 1.0, multiplier: 0.0, scaleWithHp: true },
    { name: "Iron Skin", type: SkillType.REDUCE_DAMAGE, trigger: SkillTrigger.ON_DEFEND, chance: 0.3, multiplier: 0.3 },
    { name: "Quick Reflex", type: SkillType.DODGE, trigger: SkillTrigger.ON_DEFEND, chance: 0.2, multiplier: 0.0 },
    { name: "Lifesteal", type: SkillType.LIFESTEAL, trigger: SkillTrigger.ON_ATTACK, chance: 0.25, multiplier: 0.3 },
    { name: "Last Stand", type: SkillType.HEAL, trigger: SkillTrigger.ON_DEFEND, chance: 0.1, multiplier: 1.0, hpBelowThreshold: 0.3 },
    { name: "Double Strike", type: SkillType.DAMAGE, trigger: SkillTrigger.ON_ATTACK, chance: 0.2, multiplier: 0.5, extraHit: true },
    { name: "Evasion Mastery", type: SkillType.DODGE, trigger: SkillTrigger.ON_DEFEND, chance: 0.35, multiplier: 0.0 },
    { name: "Precision", type: SkillType.DAMAGE, trigger: SkillTrigger.ON_ATTACK, chance: 0.2, multiplier: 0.0, ignoreDef: true },
    { name: "Chaos Surge", type: SkillType.CHAOS, trigger: SkillTrigger.ON_TURN_START, chance: 0.2, multiplier: 0.0 },

    // --- STR / DAMAGE (9) ---
    { name: "Savage Strike", type: SkillType.DAMAGE, trigger: SkillTrigger.ON_ATTACK, chance: 0.2, multiplier: 0.3 },
    { name: "Brutal Force", type: SkillType.DAMAGE, trigger: SkillTrigger.ON_ATTACK, chance: 0.15, multiplier: 0.7, hpAboveThreshold: 0.7 },
    { name: "Crushing Blow", type: SkillType.DAMAGE, trigger: SkillTrigger.ON_ATTACK, chance: 0.12, multiplier: 0.0, ignoreDef: true }, // Simplified
    { name: "Executioner", type: SkillType.DAMAGE, trigger: SkillTrigger.ON_ATTACK, chance: 0.15, multiplier: 0.8, targetHpBelowThreshold: 0.3 },
    { name: "Overpower", type: SkillType.DAMAGE, trigger: SkillTrigger.ON_ATTACK, chance: 0.1, multiplier: 0.0, ignoreDef: true },
    { name: "Blood Strike", type: SkillType.DAMAGE, trigger: SkillTrigger.ON_ATTACK, chance: 0.2, multiplier: 0.4 }, // Condition handled in handler
    { name: "War Cry", type: SkillType.BUFF, trigger: SkillTrigger.ON_TURN_START, chance: 0.3, statBonus: 0.1, stackMax: 3 },
    { name: "Relentless", type: SkillType.DAMAGE, trigger: SkillTrigger.ON_ATTACK, chance: 0.2, multiplier: 0.0 }, // 5% per triggered skill
    { name: "Final Blow", type: SkillType.DAMAGE, trigger: SkillTrigger.ON_ATTACK, chance: 0.1, multiplier: 1.0, targetHpBelowThreshold: 0.2 },

    // --- BLEED / DOT (6) ---
    { name: "Deep Wound", type: SkillType.DOT, trigger: SkillTrigger.ON_ATTACK, chance: 0.25, multiplier: 0.3, durationBonus: 2 },
    { name: "Toxic Bleed", type: SkillType.DOT, trigger: SkillTrigger.ON_ATTACK, chance: 0.2, multiplier: 0.45 },
    { name: "Blood Feast", type: SkillType.LIFESTEAL, trigger: SkillTrigger.ON_ATTACK, chance: 0.2, multiplier: 0.45 },
    { name: "Hemorrhagic Burst", type: SkillType.DOT, trigger: SkillTrigger.ON_ATTACK, chance: 0.15, multiplier: 0.3, instantBleedTick: true },
    { name: "Pain Amplifier", type: SkillType.DAMAGE, trigger: SkillTrigger.ON_ATTACK, chance: 0.2, multiplier: 0.25 },
    { name: "Open Veins", type: SkillType.DOT, trigger: SkillTrigger.ON_ATTACK, chance: 0.15, multiplier: 0.3 },

    // --- AGI / SPEED (5) ---
    { name: "Swift Strike", type: SkillType.DAMAGE, trigger: SkillTrigger.ON_ATTACK, chance: 0.2, multiplier: 0.3, extraProcChance: 0.1 },
    { name: "Phantom Step", type: SkillType.DODGE, trigger: SkillTrigger.ON_DEFEND, chance: 0.2, multiplier: 0.0, isCritGuaranteed: true },
    { name: "Flurry", type: SkillType.DAMAGE, trigger: SkillTrigger.ON_ATTACK, chance: 0.2, multiplier: 1.0, extraHit: true, extraHitDmgMultiplier: 1.0 },
    { name: "Quick Slash", type: SkillType.DAMAGE, trigger: SkillTrigger.ON_ATTACK, chance: 0.25, multiplier: 0.2, extraProcChance: 0.15 },
    { name: "Blade Rush", type: SkillType.DAMAGE, trigger: SkillTrigger.ON_ATTACK, chance: 0.15, multiplier: 0.5, isTripleHit: true },

    // --- DEF / SURVIVAL (6) ---
    { name: "Stone Skin", type: SkillType.REDUCE_DAMAGE, trigger: SkillTrigger.ON_DEFEND, chance: 0.25, multiplier: 0.0, flatReduction: 20 },
    { name: "Guardian Shield", type: SkillType.SHIELD, trigger: SkillTrigger.ON_DEFEND, chance: 0.15, multiplier: 1.0 },
    { name: "Retaliation", type: SkillType.COUNTER, trigger: SkillTrigger.ON_DEFEND, chance: 0.2, counterAtkPct: 0.5 },
    { name: "Second Wind", type: SkillType.HEAL, trigger: SkillTrigger.ON_TURN_START, chance: 0.2, multiplier: 0.05 },
    { name: "Resilience", type: SkillType.REDUCE_DAMAGE, trigger: SkillTrigger.ON_DEFEND, chance: 0.25, multiplier: 0.2 },
    { name: "Spiked Armor", type: SkillType.REDUCE_DAMAGE, trigger: SkillTrigger.ON_DEFEND, chance: 0.2, reflectPct: 0.3 },

    // --- HP / RISK (4) ---
    { name: "Blood Pact", type: SkillType.DAMAGE, trigger: SkillTrigger.ON_ATTACK, chance: 0.2, multiplier: 0.4, selfDamage: 0.1 },
    { name: "Death Wish", type: SkillType.DAMAGE, trigger: SkillTrigger.ON_ATTACK, chance: 1.0, multiplier: 0.0, bonusCritChance: 0.5, hpBelowThreshold: 0.3 },
    { name: "Adrenaline", type: SkillType.BUFF, trigger: SkillTrigger.ON_TURN_START, chance: 0.3, bonusSpeed: 30, hpBelowThreshold: 0.3 },
    { name: "Reckless Fury", type: SkillType.DAMAGE, trigger: SkillTrigger.ON_ATTACK, chance: 0.2, multiplier: 0.6, damageTakenIncrease: 0.3 },

    // --- CHAOS (4) ---
    { name: "Wild Surge", type: SkillType.CHAOS, trigger: SkillTrigger.ON_ATTACK, chance: 0.2, multiplier: 0.5 },
    { name: "Entropy Field", type: SkillType.CHAOS, trigger: SkillTrigger.ON_TURN_START, chance: 0.2, multiplier: 0.0 },
    { name: "Twist Fate", type: SkillType.CHAOS, trigger: SkillTrigger.ON_ATTACK, chance: 0.1, rerollFailedProc: true },
    { name: "Miracle Proc", type: SkillType.CHAOS, trigger: SkillTrigger.ON_ATTACK, chance: 0.05, multiplier: 2.0 },

    // --- PET (3) ---
    { name: "Pack Fury", type: SkillType.DAMAGE, trigger: SkillTrigger.ON_ATTACK, chance: 0.2, multiplier: 0.3, scaleWithPet: true },
    { name: "Beast Bond", type: SkillType.BUFF, trigger: SkillTrigger.ON_TURN_START, chance: 0.2, statBonus: 0.1, scaleWithPet: true },
    { name: "Hunter Instinct", type: SkillType.DAMAGE, trigger: SkillTrigger.ON_ATTACK, chance: 0.15, multiplier: 0.0, extraHit: true, scaleWithPet: true },

    // --- EXTRA / FILLER (22) ---
    { name: "Might of the Bull", type: SkillType.DAMAGE, trigger: SkillTrigger.ON_ATTACK, chance: 0.4, multiplier: 0.15 },
    { name: "Giant Slayer", type: SkillType.DAMAGE, trigger: SkillTrigger.ON_ATTACK, chance: 0.3, multiplier: 0.4 },
    { name: "Bone Breaker", type: SkillType.DAMAGE, trigger: SkillTrigger.ON_ATTACK, chance: 0.2, multiplier: 0.1 },
    { name: "Sweeping Strike", type: SkillType.DAMAGE, trigger: SkillTrigger.ON_ATTACK, chance: 0.15, multiplier: 0.3, extraHit: true },
    { name: "Guard Break", type: SkillType.DAMAGE, trigger: SkillTrigger.ON_ATTACK, chance: 0.25, multiplier: 0.1, ignoreDef: true },
    { name: "Tough Hide", type: SkillType.REDUCE_DAMAGE, trigger: SkillTrigger.ON_DEFEND, chance: 0.4, multiplier: 0.1 },
    { name: "Counter Block", type: SkillType.COUNTER, trigger: SkillTrigger.ON_DEFEND, chance: 0.25, counterAtkPct: 0.3 },
    { name: "Fortifying Brew", type: SkillType.BUFF, trigger: SkillTrigger.ON_TURN_START, chance: 0.15, statBonus: 0.1 },
    { name: "Mirror Image", type: SkillType.DODGE, trigger: SkillTrigger.ON_DEFEND, chance: 0.1, multiplier: 0.0 },
    { name: "Unyielding Spirit", type: SkillType.HEAL, trigger: SkillTrigger.ON_DEFEND, chance: 0.05, multiplier: 0.5 },
    { name: "Wind Walker", type: SkillType.BUFF, trigger: SkillTrigger.ON_TURN_START, chance: 0.2, bonusSpeed: 20 },
    { name: "Blur", type: SkillType.DODGE, trigger: SkillTrigger.ON_DEFEND, chance: 0.25, multiplier: 0.0 },
    { name: "Rapid Jabs", type: SkillType.DAMAGE, trigger: SkillTrigger.ON_ATTACK, chance: 0.1, multiplier: 0.2, extraHit: true }, // Simplified multihit
    { name: "Feint", type: SkillType.DAMAGE, trigger: SkillTrigger.ON_ATTACK, chance: 0.2, multiplier: 0.0, ignoreDef: true },
    { name: "Reflex Boost", type: SkillType.BUFF, trigger: SkillTrigger.ON_TURN_START, chance: 0.3, statBonus: 0.05 }, // Use statBonus as crit proxy
    { name: "Poison Sting", type: SkillType.POISON as any, trigger: SkillTrigger.ON_ATTACK, chance: 0.3, dotMultiplier: 0.2, duration: 5 },
    { name: "Fire Blade", type: SkillType.BURN as any, trigger: SkillTrigger.ON_ATTACK, chance: 0.25, multiplier: 0.8, dotMultiplier: 0.15, duration: 3 },
    { name: "Venomous Touch", type: SkillType.POISON as any, trigger: SkillTrigger.ON_ATTACK, chance: 0.2, dotMultiplier: 0.3, duration: 4 },
    { name: "Flashbang", type: SkillType.REDUCE_DAMAGE, trigger: SkillTrigger.ON_DEFEND, chance: 0.15, multiplier: 0.2 },
    { name: "Web Spray", type: SkillType.BUFF as any, trigger: SkillTrigger.ON_TURN_START, chance: 0.2, bonusSpeed: -10 },
    { name: "Curse of Weakness", type: SkillType.DAMAGE, trigger: SkillTrigger.ON_ATTACK, chance: 0.15, multiplier: -0.15 },
    { name: "Soul Siphon", type: SkillType.LIFESTEAL as any, trigger: SkillTrigger.ON_ATTACK, chance: 0.05, multiplier: 0.1 },
    { name: "Fireball", type: SkillType.BURN as any, trigger: SkillTrigger.ON_ATTACK, chance: 0.2, multiplier: 1.0, dotMultiplier: 0.2, duration: 2 },
    { name: "Poison Strike", type: SkillType.POISON as any, trigger: SkillTrigger.ON_ATTACK, chance: 0.25, dotMultiplier: 0.15, duration: 3 },
    { name: "Toxic Edge", type: SkillType.POISON as any, trigger: SkillTrigger.ON_ATTACK, chance: 0.2, dotMultiplier: 0.3, duration: 3 },
];

async function seedSkills() {
    console.log(`Seeding ${skills.length} skills...`);
    for (const s of skills) {
        await prisma.skill.upsert({
            where: { name: s.name },
            update: s,
            create: s,
        });
    }
    console.log("Seeding complete!");
}

seedSkills()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
