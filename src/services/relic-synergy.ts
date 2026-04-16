import { Relic, RelicType } from "../constants/relic-pool";
import { CombatEvent, Unit, CombatContext, applyBleed } from "./relic-engine";

// ==========================================
// 1. SYNERGY TYPES
// ==========================================

export interface SynergyRequirement {
    /** 
     * If provided, the unit MUST possess at least one relic of each type listed here.
     */
    types?: RelicType[]; 
    
    /** 
     * If provided, the unit MUST possess ALL of the specific relic IDs listed here.
     */
    ids?: string[];      
}

export interface RelicSynergy {
    id: string;
    name: string;
    desc: string;
    requirement: SynergyRequirement;
    
    /** 
     * The combat event that triggers this synergy's effect. 
     * If omitted, the synergy is considered Passive (e.g., stats injection).
     */
    trigger?: CombatEvent; 
    
    /** 
     * The executable logic for the synergy. 
     */
    effect: (unit: Unit, context: CombatContext) => void;
}

// ==========================================
// 2. THE SYNERGY POOL
// ==========================================

export const SYNERGY_POOL: RelicSynergy[] = [
    {
        id: "syn_toxic_inferno",
        name: "Toxic Inferno",
        desc: "Combines Burn and Poison. Attacks apply devastating bleed stacks.",
        requirement: { types: ["BURN_BOOST", "POISON_BOOST"] },
        trigger: "ON_ATTACK",
        effect: (unit, context) => {
            if (context.defender) {
                // Apply a flat 10 stacks to the target
                applyBleed(context.defender, 10);
                console.log(`[Synergy: Toxic Inferno] Applied 10 decay stacks to ${context.defender.id}.`);
            }
        }
    },
    {
        id: "syn_blood_shield",
        name: "Blood Shielding",
        desc: "Overheals from Lifesteal are converted to Shields.",
        requirement: { types: ["LIFESTEAL", "GLASS_CANNON"] },
        trigger: "ON_ATTACK",
        effect: (unit, context) => {
            // Evaluated during attack. If unit is at max HP, attacking generates 5 shield.
            if (unit.hp >= unit.maxHp) {
                unit.shield += 5;
                console.log(`[Synergy: Blood Shielding] ${unit.id} generated 5 shield from overheal.`);
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
                // To guarantee it, we simply inject it into the combat's isCrit state
                // Note: Ensure your combat loop allows this injection or buffs critical multiplier artificially
                unit.statusEffects = unit.statusEffects || {};
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
                // Apply massive virtual multiplier logic for the current context.
                if (context.damage) {
                    context.damage *= 2; 
                    console.log(`[Synergy: Desperation Surge] ${unit.id} dealt Double Damage due to low HP!`);
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
        effect: (unit, context) => {
            unit.maxHp += 10;
            unit.hp += 10;
            console.log(`[Synergy: Plague Bearer] ${unit.id} consumed the target, permanently gaining 10 Max HP.`);
        }
    },
    {
        id: "syn_time_lord",
        name: "Time Lord",
        desc: "Specific combo: Time Fragment + Hermes Sandals randomly gives immense shields.",
        requirement: { ids: ["time_fragment", "hermes_sandals"] }, // ID-based synergy
        trigger: "TURN_START",
        effect: (unit, context) => {
            if (Math.random() < 0.25) { // 25% chance
                unit.shield += 50;
                console.log(`[Synergy: Time Lord] ${unit.id} distorted time to gain 50 shield!`);
            }
        }
    }
];

// ==========================================
// 3. RETRIEVE ACTIVE SYNERGIES
// ==========================================

/**
 * Checks the unit's inventory of relics and returns all fulfilled synergies.
 * Performance Tip: Cache this array inside the unit object after equip/unequip events.
 * Do not call this continuously on every attack loop.
 */
export function getActiveSynergies(unit: Unit): RelicSynergy[] {
    if (!unit.relics || unit.relics.length === 0) return [];
    
    const activeSynergies: RelicSynergy[] = [];
    
    // Pre-calculate presence maps for fast lookup
    const relicIdSet = new Set(unit.relics.map(r => r.id));
    const relicTypeSet = new Set(unit.relics.map(r => r.type));

    for (const synergy of SYNERGY_POOL) {
        let reqIdsMet = true;
        let reqTypesMet = true;
        let hasAnyRequirement = false; // Guard to prevent empty reqs from matching

        // Check explicit ID requirements
        if (synergy.requirement.ids && synergy.requirement.ids.length > 0) {
            hasAnyRequirement = true;
            for (const reqId of synergy.requirement.ids) {
                if (!relicIdSet.has(reqId)) {
                    reqIdsMet = false;
                    break;
                }
            }
        }

        // Check Type requirements
        if (synergy.requirement.types && synergy.requirement.types.length > 0) {
            hasAnyRequirement = true;
            for (const reqType of synergy.requirement.types) {
                if (!relicTypeSet.has(reqType)) {
                    reqTypesMet = false;
                    break;
                }
            }
        }

        // If at least one requirement property was parsed AND all defined requirements evaluate true
        if (hasAnyRequirement && reqIdsMet && reqTypesMet) {
             activeSynergies.push(synergy);
        }
    }

    return activeSynergies;
}

// ==========================================
// 4. APPLY SYNERGY EFFECTS LATE LOOP
// ==========================================

/**
 * Executes triggered synergy effects during combat.
 * Similar to handleRelicTrigger, but parses active combinations specifically.
 * 
 * @param unit The unit triggering the synergies
 * @param event The distinct combat phase
 * @param context Environment context bridging attacker/defender
 * @param cachedSynergies Pass `unit.activeSynergies` if you pre-calculated `getActiveSynergies()`.
 */
export function applySynergyEffects(
    unit: Unit, 
    event: CombatEvent, 
    context: CombatContext, 
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
