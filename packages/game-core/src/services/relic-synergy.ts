import type { RelicType } from "../constants/relic-pool";
import type { CombatEvent } from "./relic-engine";

export interface SynergyRequirement {
    types?: RelicType[];
    ids?: string[];
}

export interface RelicSynergy {
    id: string;
    name: string;
    desc: string;
    requirement: SynergyRequirement;
    trigger?: CombatEvent;
    effect: (unit: any, context: any) => void;
}

export const SYNERGY_POOL: RelicSynergy[] = [
    {
        id: "syn_toxic_inferno",
        name: "Toxic Inferno",
        desc: "Combines Burn and Poison. Attacks apply devastating bleed stacks.",
        requirement: { types: ["BURN_BOOST", "POISON_BOOST"] },
        trigger: "ON_ATTACK",
        effect: (unit, context) => {
            if (context.defender) {
                context.defender.statusEffects = context.defender.statusEffects || {};
                context.defender.statusEffects.bleed = { stacks: (context.defender.statusEffects.bleed?.stacks || 0) + 10 };
            }
        }
    },
    {
        id: "syn_blood_shield",
        name: "Blood Shielding",
        desc: "Overheals from Lifesteal are converted to Shields.",
        requirement: { types: ["LIFESTEAL", "GLASS_CANNON"] },
        trigger: "ON_ATTACK",
        effect: (unit) => {
            if (unit.hp >= unit.maxHp) {
                unit.shield += 5;
            }
        }
    },
    {
        id: "syn_first_strike",
        name: "First Strike",
        desc: "Guaranteed critical hit on your very first turn.",
        requirement: { types: ["SPD_BOOST", "CRIT_BOOST"] },
        trigger: "TURN_START",
        effect: (unit, context) => {
            if (context.turn === 1) {
                console.log(`[Synergy: First Strike] ${unit.id}'s first attack will critically strike!`);
            }
        }
    },
    {
        id: "syn_desperation_surge",
        name: "Desperation Surge",
        desc: "Double damage modifier when below 30% HP.",
        requirement: { types: ["DAMAGE_BOOST", "LOW_HP_BONUS"] },
        trigger: "ON_ATTACK",
        effect: (unit, context) => {
            const healthPercentage = unit.hp / unit.maxHp;
            if (healthPercentage <= 0.3) {
                if (context.damage) {
                    context.damage *= 2;
                }
            }
        }
    },
    {
        id: "syn_plague_bearer",
        name: "Plague Bearer",
        desc: "Killing an enemy grants you max HP up to a limit.",
        requirement: { types: ["POISON_BOOST", "ON_KILL_HEAL"] },
        trigger: "ON_KILL",
        effect: (unit) => {
            unit.maxHp += 10;
            unit.hp += 10;
        }
    },
    {
        id: "syn_time_lord",
        name: "Time Lord",
        desc: "Specific combo: Time Fragment + Hermes Sandals randomly gives immense shields.",
        requirement: { ids: ["time_fragment", "hermes_sandals"] },
        trigger: "TURN_START",
        effect: (unit) => {
            if (Math.random() < 0.25) {
                unit.shield += 50;
            }
        }
    }
];

export function getActiveSynergies(unit: any): RelicSynergy[] {
    if (!unit.relics || unit.relics.length === 0) return [];

    const activeSynergies: RelicSynergy[] = [];

    const relicIdSet = new Set(unit.relics.map((r: any) => r.id));
    const relicTypeSet = new Set(unit.relics.map((r: any) => r.type));

    for (const synergy of SYNERGY_POOL) {
        let reqIdsMet = true;
        let reqTypesMet = true;
        let hasAnyRequirement = false;

        if (synergy.requirement.ids && synergy.requirement.ids.length > 0) {
            hasAnyRequirement = true;
            for (const reqId of synergy.requirement.ids) {
                if (!relicIdSet.has(reqId)) {
                    reqIdsMet = false;
                    break;
                }
            }
        }

        if (synergy.requirement.types && synergy.requirement.types.length > 0) {
            hasAnyRequirement = true;
            for (const reqType of synergy.requirement.types) {
                if (!relicTypeSet.has(reqType)) {
                    reqTypesMet = false;
                    break;
                }
            }
        }

        if (hasAnyRequirement && reqIdsMet && reqTypesMet) {
             activeSynergies.push(synergy);
        }
    }

    return activeSynergies;
}

export function applySynergyEffects(
    unit: any,
    event: CombatEvent,
    context: any,
    cachedSynergies?: RelicSynergy[]
): void {

    const synergies = cachedSynergies || getActiveSynergies(unit);
    if (synergies.length === 0) return;

    for (const synergy of synergies) {
        if (synergy.trigger === event) {
            synergy.effect(unit, context);
        }
    }
}
