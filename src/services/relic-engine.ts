import { Relic, RelicTrigger } from "../constants/relic-pool";

// ==========================================
// 1. CORE TYPES & INTERFACES
// ==========================================

export type CombatEvent = RelicTrigger;

export interface StatusEffect {
    stacks: number;
}

export interface Unit {
    id: string;
    hp: number;
    maxHp: number;
    shield: number;
    speed: number;
    relics: Relic[];

    // Combat Stats Modifiers
    lifesteal?: number;
    damageMultiplier?: number; // e.g. from buffs or passive synergies

    // Ephemeral States
    statusEffects?: {
        bleed?: StatusEffect; // Scalable { stacks } instead of raw numbers
    };
    
    // Safety Flags
    extraTurnGranted?: boolean; // Must be reset by the combat engine at end of turn
    isExecuted?: boolean;       // Prevent multiple execute triggers firing simultaneously
}

export interface CombatContext {
    attacker: Unit;
    defender?: Unit;
    damage?: number;     // Extent of damage (e.g., used for reflection math)
    isCrit?: boolean;
    turn?: number;
}


// ==========================================
// 2. DAMAGE PIPELINE
// ==========================================

/**
 * Low-level underlying function to apply damage directly to a unit.
 * Safely drains shield BEFORE removing HP.
 * 
 * @returns The actual amount of HP drained (ignoring shield hits)
 */
export function dealDamage(target: Unit, amount: number): number {
    if (target.hp <= 0 || amount <= 0) return 0; // Guard dead targets & zero damage

    let remainingDamage = amount;

    // 1. Hit shield first
    if (target.shield > 0) {
        if (target.shield >= remainingDamage) {
            target.shield -= remainingDamage;
            return 0; // Fully blocked, 0 HP lost
        } else {
            remainingDamage -= target.shield;
            target.shield = 0;
        }
    }

    // 2. Bleed remaining damage into HP
    const previousHp = target.hp;
    target.hp = Math.max(0, target.hp - remainingDamage);
    const hpLost = previousHp - target.hp;

    return hpLost;
}

/**
 * Mid-level combat function to process an attack layer.
 * Applies pre-requisite multipliers and fires the actual dealDamage.
 * 
 * @returns The calculated HP lost by the defender.
 */
export function processDamage(attacker: Unit, defender: Unit, baseDamage: number): number {
    if (attacker.hp <= 0 || defender.hp <= 0) return 0; // Ensure units are alive
    if (attacker === defender) return 0; // Avoid self targeting bugs logic

    const mult = attacker.damageMultiplier || 1;
    const finalIncoming = baseDamage * mult;

    // Apply the configured pipeline layer
    const hpLost = dealDamage(defender, finalIncoming);

    return hpLost;
}


// ==========================================
// 3. HELPER FUNCTIONS
// ==========================================

export function applyBleed(target: Unit, stacks: number): void {
    if (target.hp <= 0 || stacks <= 0) return;
    
    target.statusEffects = target.statusEffects || {};
    target.statusEffects.bleed = target.statusEffects.bleed || { stacks: 0 };
    target.statusEffects.bleed.stacks += stacks;
}

export function healUnit(unit: Unit, amount: number): void {
    if (unit.hp <= 0 || amount <= 0) return;

    const healCapacity = unit.maxHp - unit.hp;
    const actualHeal = Math.min(amount, healCapacity);
    
    if (actualHeal > 0) {
        unit.hp += actualHeal;
    }
}

export function reflectDamage(attacker: Unit, defender: Unit, reflectionAmount: number): void {
    if (reflectionAmount <= 0) return;

    // Reflection now respects shields properly instead of raw HP draining
    dealDamage(attacker, reflectionAmount);
}

export function grantExtraTurn(unit: Unit): void {
    if (unit.hp <= 0 || unit.extraTurnGranted) return; // Prevent indefinite stacking loop
    unit.extraTurnGranted = true;
}

export function executeUnit(target: Unit): void {
    // Check if target is already dead or execute has triggered to prevent loops logic
    if (target.hp <= 0 || target.isExecuted) return;
    
    // Force pierce shields and execute
    target.hp = 0;
    target.shield = 0;
    target.isExecuted = true; 
}


// ==========================================
// 4. RELIC ENGINE LOGIC
// ==========================================

export function applyRelicEffect(unit: Unit, relic: Relic, context: CombatContext): void {
    // Master guard: Dead units cannot trigger relic effects
    if (unit.hp <= 0) return; 

    switch (relic.id) {
        
        // ---- ON ATTACK (Target: Defender) ----
        case "bleed_dagger":
            if (context.defender && context.defender.hp > 0 && context.defender !== unit) {
                applyBleed(context.defender, relic.value);
            }
            break;

        case "time_fragment":
            if (context.defender && !unit.extraTurnGranted) {
                if (Math.random() < relic.value) {
                    grantExtraTurn(unit);
                }
            }
            break;

        case "execution_mark":
        case "reaper_threshold":
            if (context.defender && context.defender.hp > 0 && context.defender !== unit) {
                const healthPercentage = context.defender.hp / context.defender.maxHp;
                if (healthPercentage <= relic.value) {
                    executeUnit(context.defender);
                }
            }
            break;

        // ---- ON KILL (Target: Self getting buffed. Defender dead) ----
        case "scavenger_kit":
        case "vampire_fang":
        case "soul_reaper":
            // Strict guard: Validate the target is actually dead
            if (context.defender && context.defender.hp <= 0) {
                healUnit(unit, relic.value);
            }
            break;

        // ---- ON HIT (Target: Self took damage) ----
        case "thorn_mail":
            if (context.attacker && context.damage && context.attacker !== unit) {
                if (context.attacker.hp > 0) {
                    const reflected = Math.floor(context.damage * relic.value);
                    if (reflected > 0) {
                        reflectDamage(context.attacker, unit, reflected);
                    }
                }
            }
            break;

        // Untriggered passive items gracefully ignored
        default:
            break;
    }
}

/**
 * Main combat event processing loop for triggering unit relics securely.
 */
export function handleRelicTrigger(unit: Unit, event: CombatEvent, context: CombatContext): void {
    // Only living units trigger events
    if (unit.hp <= 0) return; 
    
    // Fast exit
    if (!unit.relics || unit.relics.length === 0) return;

    for (const relic of unit.relics) {
        if (relic.trigger === event) {
            applyRelicEffect(unit, relic, context);
        }
    }
}
