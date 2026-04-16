import type { Relic, RelicType, RelicTrigger } from "../constants/relic-pool";

export type CombatEvent = RelicType | RelicTrigger;

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

    lifesteal?: number;
    damageMultiplier?: number;

    statusEffects?: {
        bleed?: StatusEffect;
    };

    extraTurnGranted?: boolean;
    isExecuted?: boolean;
}

export interface CombatContext {
    attacker: Unit;
    defender?: Unit;
    damage?: number;
    isCrit?: boolean;
    turn?: number;
}

export function dealDamage(target: Unit, amount: number): number {
    if (target.hp <= 0 || amount <= 0) return 0;

    let remainingDamage = amount;

    if (target.shield > 0) {
        if (target.shield >= remainingDamage) {
            target.shield -= remainingDamage;
            return 0;
        } else {
            remainingDamage -= target.shield;
            target.shield = 0;
        }
    }

    const previousHp = target.hp;
    target.hp = Math.max(0, target.hp - remainingDamage);
    const hpLost = previousHp - target.hp;

    return hpLost;
}

export function processDamage(attacker: Unit, defender: Unit, baseDamage: number): number {
    if (attacker.hp <= 0 || defender.hp <= 0) return 0;
    if (attacker === defender) return 0;

    const mult = attacker.damageMultiplier || 1;
    const finalIncoming = baseDamage * mult;

    const hpLost = dealDamage(defender, finalIncoming);

    return hpLost;
}

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

    dealDamage(attacker, reflectionAmount);
}

export function grantExtraTurn(unit: Unit): void {
    if (unit.hp <= 0 || unit.extraTurnGranted) return;
    unit.extraTurnGranted = true;
}

export function executeUnit(target: Unit): void {
    if (target.hp <= 0 || target.isExecuted) return;

    target.hp = 0;
    target.shield = 0;
    target.isExecuted = true;
}

export function applyRelicEffect(unit: Unit, relic: Relic, context: CombatContext): void {
    if (unit.hp <= 0) return;

    switch (relic.id) {

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

        case "scavenger_kit":
        case "vampire_fang":
        case "soul_reaper":
            if (context.defender && context.defender.hp <= 0) {
                healUnit(unit, relic.value);
            }
            break;

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

        default:
            break;
    }
}

export function handleRelicTrigger(unit: Unit, event: CombatEvent, context: CombatContext): void {
    if (unit.hp <= 0) return;

    if (!unit.relics || unit.relics.length === 0) return;

    for (const relic of unit.relics) {
        if (relic.trigger === event) {
            applyRelicEffect(unit, relic, context);
        }
    }
}
