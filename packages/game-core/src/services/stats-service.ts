import type { ItemType } from "../types/rpg-enums";
import { getActiveSynergies } from "./pet-synergy";
import { calculatePetStatBonusDetailed } from "./pet-utils";
import { ACCESSORY_CONFIGS, ACCESSORY_SETS, type AccessoryEffect } from "../constants/accessory-config";
import { TITLES } from "../constants/titles";

export interface StatValuePart {
    source: string;
    value: number;
}

export interface MultDeltaPart {
    source: string;
    delta: number;
}

export interface CombatStatsBreakdown {
    attackParts: StatValuePart[];
    defenseParts: StatValuePart[];
    hpParts: StatValuePart[];
    speedParts: StatValuePart[];
    critChanceParts: StatValuePart[];
    damageMultDeltas: MultDeltaPart[];
    defenseMultDeltas: MultDeltaPart[];
    hpMultDeltas: MultDeltaPart[];
    gearFlatLines: string[];
    petContributions: ReturnType<typeof calculatePetStatBonusDetailed>["contributions"];
    petTitlePowerMult: number;
    accessoryEffectLines: string[];
    buffLines: string[];
}

export interface BaseStats {
    str: number;
    agi: number;
    hp: number;
    luck: number;
}

export interface FlatStats {
    str: number;
    agi: number;
    def: number;
    hp: number;
    weaponPower: number;
    petAtk: number;
    petDef: number;
}

export interface DerivedStats {
    attack: number;
    defense: number;
    maxHp: number;
    speed: number;
}

export interface MultiplierStats {
    damageMult: number;
    defenseMult: number;
    hpMult: number;
    critDamage: number;
    burnDamage: number;
    poisonDamage: number;
    lifesteal: number;
    procChance: number;
    critRateBonus: number;
    uniquePowers: Record<string, number>;
    activeSets: string[];
}

export interface FinalStats {
    attack: number;
    defense: number;
    maxHp: number;
    speed: number;
}

export interface CombatStatsBlock {
    base: BaseStats;
    flat: FlatStats;
    derived: DerivedStats;
    multiplier: MultiplierStats;
    final: FinalStats;
    breakdown: CombatStatsBreakdown;
    extra?: {
        activeUniqueEffects: string[];
        activeSets: string[];
        critRateBonus: number;
        uniquePowers?: Record<string, number>;
    };
}

export function computeCombatStats(
    user: {
        str: number; agi: number; maxHp: number; luck: number;
        talentDps?: number; talentTank?: number; talentSupport?: number;
        talentBurn?: number; talentPoison?: number;
        title?: string | null;
    },
    items: { name: string; type: string | ItemType; power: number; bonusStr?: number; bonusAgi?: number; bonusDef?: number; bonusHp?: number; isEquipped?: boolean; set?: string | null }[],
    pets: any[] = [],
    buffs: { type: string; power?: number }[] = [],
    petMultipliers?: number[]
): CombatStatsBlock {
    const base: BaseStats = {
        str: user.str,
        agi: user.agi,
        hp: user.maxHp,
        luck: user.luck || 0
    };

    const flat: FlatStats = { str: 0, agi: 0, def: 0, hp: 0, weaponPower: 0, petAtk: 0, petDef: 0 };

    const itemsWithLevel = items as any[];
    const equipped = itemsWithLevel.filter(i => i.isEquipped !== false);

    const accessories: any[] = [];
    const activeUniqueEffects: string[] = [];
    const gearFlatLines: string[] = [];
    const damageMultDeltas: MultDeltaPart[] = [];
    const defenseMultDeltas: MultDeltaPart[] = [];
    const hpMultDeltas: MultDeltaPart[] = [];
    const accessoryEffectLines: string[] = [];
    const buffLines: string[] = [];

    for (const item of equipped) {
        const upgradeLevel = item.upgradeLevel || 0;
        const scale = 1 + (upgradeLevel * 0.1);

        const bStr = Math.floor((item.bonusStr || 0) * scale);
        const bAgi = Math.floor((item.bonusAgi || 0) * scale);
        const bDef = Math.floor((item.bonusDef || 0) * scale);
        const bHp = Math.floor((item.bonusHp || 0) * scale);
        flat.str += bStr;
        flat.agi += bAgi;
        flat.def += bDef;
        flat.hp += bHp;
        let wPow = 0;
        const isAccessory = item.type === "ACCESSORY" || item.type === ("ACCESSORY" as ItemType);
        const isWeapon = item.type === "WEAPON" || item.type === ("WEAPON" as ItemType);
        if (isWeapon) {
            wPow = Math.floor((item.power || 0) * scale);
            flat.weaponPower += wPow;
        }
        accessories.push({ ...item, upgradeLevel });
        const tag = isWeapon ? "⚔️" : isAccessory ? "💍" : "🛡️";
        const bits = [
            wPow ? `WP ${wPow}` : null,
            bStr ? `STR+${bStr}` : null,
            bAgi ? `AGI+${bAgi}` : null,
            bDef ? `DEF+${bDef}` : null,
            bHp ? `HP+${bHp}` : null,
        ].filter(Boolean) as string[];
        gearFlatLines.push(
            `${tag} **${item.name}** [+${upgradeLevel}] — ${bits.length ? bits.join(", ") : "không cộng chỉ số phẳng"}`
        );
    }

    const petDetail = calculatePetStatBonusDetailed(pets, petMultipliers);
    flat.petAtk = petDetail.totalAtk;
    flat.petDef = petDetail.totalDef;

    const multiplier: MultiplierStats = {
        damageMult: 1.0, defenseMult: 1.0, hpMult: 1.0,
        critDamage: 1.5, burnDamage: 1.0, poisonDamage: 1.0, lifesteal: 1.0, procChance: 1.0,
        critRateBonus: 0, uniquePowers: {} as Record<string, number>, activeSets: []
    };

    let petTitlePowerMult = 1.0;

    if (user.title) {
        let equippedKeys: string[] = [];
        try {
            if (user.title.startsWith("[")) {
                equippedKeys = JSON.parse(user.title);
            } else {
                equippedKeys = [user.title];
            }
        } catch (e) {}

        for (const key of equippedKeys) {
            const def = TITLES.find((t: any) => t.key === key);
            if (!def) continue;
            const tag = `Danh hiệu «${def.name}»`;

            if (def.effectType === "damage") {
                multiplier.damageMult += def.effectValue;
                damageMultDeltas.push({ source: tag, delta: def.effectValue });
            } else if (def.effectType === "critDamage") {
                multiplier.critDamage += def.effectValue;
                accessoryEffectLines.push(`${tag}: hệ số ST chí mạng +${(def.effectValue * 100).toFixed(0)}% (nền 1.5)`);
            } else if (def.effectType === "burnDamage") {
                multiplier.burnDamage += def.effectValue;
                accessoryEffectLines.push(`${tag}: ST đốt +${(def.effectValue * 100).toFixed(0)}%`);
            } else if (def.effectType === "poisonDamage") {
                multiplier.poisonDamage += def.effectValue;
                accessoryEffectLines.push(`${tag}: ST độc +${(def.effectValue * 100).toFixed(0)}%`);
            } else if (def.effectType === "lifesteal") {
                multiplier.lifesteal += def.effectValue;
                accessoryEffectLines.push(`${tag}: hút máu +${(def.effectValue * 100).toFixed(0)}%`);
            } else if (def.effectType === "procChance") {
                multiplier.procChance += def.effectValue;
                accessoryEffectLines.push(`${tag}: tỉ lệ proc skill +${(def.effectValue * 100).toFixed(0)}%`);
            } else if (def.effectType === "goldGain") {
                accessoryEffectLines.push(`${tag}: vàng nhận +${(def.effectValue * 100).toFixed(0)}% (ngoài combat)`);
            } else if (def.effectType === "petPower") {
                petTitlePowerMult += def.effectValue;
                accessoryEffectLines.push(`${tag}: +${(def.effectValue * 100).toFixed(0)}% vào hệ số sức pet (ATK/DEF pet)`);
            }
        }
        flat.petAtk *= petTitlePowerMult;
        flat.petDef *= petTitlePowerMult;
    }

    const totalStr = base.str + flat.str;
    const totalAgi = base.agi + flat.agi;
    const attack = totalStr * 0.5 + flat.weaponPower + totalAgi * 0.3 + flat.petAtk;
    const defense = flat.def + flat.petDef;
    const maxHp = base.hp + flat.hp;
    const speed = totalAgi;
    const derived: DerivedStats = { attack, defense, maxHp, speed };

    const activeSynergies = getActiveSynergies(pets);
    for (const syn of activeSynergies) {
        const src = `Pet · ${syn.name}`;
        if (syn.name === "Double DPS") {
            multiplier.damageMult += 0.15;
            damageMultDeltas.push({ source: src, delta: 0.15 });
        }
        if (syn.name === "Kiên Định") {
            multiplier.defenseMult += 0.15;
            defenseMultDeltas.push({ source: src, delta: 0.15 });
        }
        if (syn.name.startsWith("Three Body Problem")) {
            multiplier.damageMult += 0.1;
            multiplier.defenseMult += 0.1;
            damageMultDeltas.push({ source: src, delta: 0.1 });
            defenseMultDeltas.push({ source: src, delta: 0.1 });
        }
        if (syn.name === "All Balance") {
            multiplier.damageMult += 0.12;
            multiplier.defenseMult += 0.12;
            damageMultDeltas.push({ source: src, delta: 0.12 });
            defenseMultDeltas.push({ source: src, delta: 0.12 });
        }
    }

    if (user.talentDps) {
        const d = user.talentDps * 0.01;
        multiplier.damageMult += d;
        damageMultDeltas.push({ source: `Thiên phú DPS (${user.talentDps} điểm → +${user.talentDps}% ST)`, delta: d });
    }
    if (user.talentTank) {
        const d = user.talentTank * 0.01;
        multiplier.defenseMult += d;
        defenseMultDeltas.push({ source: `Thiên phú Tank (${user.talentTank} điểm)`, delta: d });
    }
    if (user.talentSupport) {
        const d = user.talentSupport * 0.01;
        multiplier.hpMult += d;
        hpMultDeltas.push({ source: `Thiên phú Support (${user.talentSupport} điểm → +${user.talentSupport}% HP)`, delta: d });
    }
    if (user.talentBurn) {
        const d = user.talentBurn * 0.02;
        multiplier.burnDamage += d;
        accessoryEffectLines.push(`Thiên phú Burn (${user.talentBurn}): ST đốt +${(d * 100).toFixed(0)}%`);
    }
    if (user.talentPoison) {
        const d = user.talentPoison * 0.02;
        multiplier.poisonDamage += d;
        accessoryEffectLines.push(`Thiên phú Poison (${user.talentPoison}): ST độc +${(d * 100).toFixed(0)}%`);
    }

    const setCounts: Record<string, number> = {};
    const applyAccEffect = (eff: AccessoryEffect, upgradeLevel: number, sourceLabel: string) => {
        const scale = 1 + (upgradeLevel * 0.05);
        const power = eff.power * scale;
        const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

        if (eff.type === "CRIT_CHANCE") {
            multiplier.critRateBonus += power;
            accessoryEffectLines.push(`${sourceLabel}: tỉ lệ chí mạng +${pct(power)}`);
        } else if (eff.type === "CRIT_DMG") {
            multiplier.critDamage += power;
            accessoryEffectLines.push(`${sourceLabel}: ST chí mạng (hệ số) +${pct(power)}`);
        } else if (eff.type === "BURN_DMG") {
            multiplier.burnDamage += power;
            accessoryEffectLines.push(`${sourceLabel}: ST đốt +${pct(power)}`);
        } else if (eff.type === "POISON_DMG") {
            multiplier.poisonDamage += power;
            accessoryEffectLines.push(`${sourceLabel}: ST độc +${pct(power)}`);
        } else if (eff.type === "LIFESTEAL") {
            multiplier.lifesteal += power;
            accessoryEffectLines.push(`${sourceLabel}: hút máu +${pct(power)}`);
        } else if (eff.type === "REDUCE_DMG") {
            multiplier.defenseMult += power;
            defenseMultDeltas.push({ source: `${sourceLabel} (giảm ST nhận)`, delta: power });
        } else if (eff.type === "PROC_CHANCE") {
            multiplier.procChance += power;
            accessoryEffectLines.push(`${sourceLabel}: tỉ lệ kích hoạt skill +${pct(power)}`);
        } else if (eff.type.startsWith("UNIQUE_")) {
            activeUniqueEffects.push(eff.type);
            multiplier.uniquePowers[eff.type] = Math.max(multiplier.uniquePowers[eff.type] || 0, power);
            accessoryEffectLines.push(`${sourceLabel}: \`${eff.type}\` (power ${power.toFixed(2)})`);
        } else {
            accessoryEffectLines.push(`${sourceLabel}: ${eff.type} (${power.toFixed(3)})`);
        }
    };

    for (const acc of accessories) {
        const config = ACCESSORY_CONFIGS[acc.name];
        if (config) {
            const ul = acc.upgradeLevel || 0;
            const label = `💍 ${acc.name} [+${ul}]`;
            config.effects.forEach((e) => applyAccEffect(e, ul, label));
            if (config.set) setCounts[config.set] = (setCounts[config.set] || 0) + 1;
        } else {
            accessoryEffectLines.push(`💍 ${acc.name}: chưa có trong ACCESSORY_CONFIGS`);
        }
    }

    for (const [setName, count] of Object.entries(setCounts)) {
        const setBonus = ACCESSORY_SETS[setName];
        if (!setBonus) continue;
        if (count >= 2) {
            setBonus.bonus2.forEach((e) => applyAccEffect(e, 0, `📦 Bộ ${setName} (≥2 món)`));
            multiplier.activeSets.push(setName);
        }
        if (count >= 3) {
            setBonus.bonus3.forEach((e) => applyAccEffect(e, 0, `📦 Bộ ${setName} (≥3 món)`));
        }
    }

    for (const buff of buffs) {
        if (buff.type === "STR_PERCENT_BUFF" && buff.power != null) {
            const d = buff.power / 100;
            multiplier.damageMult += d;
            damageMultDeltas.push({ source: "Buff tạm (STR%)", delta: d });
            buffLines.push(`Buff STR +${buff.power}% ST`);
        }
        if (buff.type === "HP_PERCENT_BUFF" && buff.power != null) {
            const d = buff.power / 100;
            multiplier.hpMult += d;
            hpMultDeltas.push({ source: "Buff tạm (HP%)", delta: d });
            buffLines.push(`Buff HP +${buff.power}% máu tối đa`);
        }
    }

    const attackParts: StatValuePart[] = [
        { source: `STR nhân vật (${base.str}) × 0.5`, value: base.str * 0.5 },
        { source: `STR trang bị (+${flat.str}) × 0.5`, value: flat.str * 0.5 },
        { source: `AGI nhân vật (${base.agi}) × 0.3`, value: base.agi * 0.3 },
        { source: `AGI trang bị (+${flat.agi}) × 0.3`, value: flat.agi * 0.3 },
        { source: "Sức vũ khí (Power, đã nhân cấp +)", value: flat.weaponPower },
        { source: `Pet (sau danh hiệu pet ×${petTitlePowerMult.toFixed(2)})`, value: flat.petAtk },
    ];

    const defenseParts: StatValuePart[] = [
        { source: "DEF từ vũ khí/giáp", value: flat.def },
        { source: `DEF từ pet (sau ×${petTitlePowerMult.toFixed(2)})`, value: flat.petDef },
    ];

    const hpParts: StatValuePart[] = [
        { source: "HP gốc nhân vật", value: base.hp },
        { source: "HP từ trang bị", value: flat.hp },
    ];

    const speedParts: StatValuePart[] = [
        { source: `SPD = AGI tổng (${totalAgi})`, value: speed },
    ];

    const critChanceParts: StatValuePart[] = [
        { source: `LUCK (${base.luck}) × 0.005 (công thức combat)`, value: base.luck * 0.005 },
        { source: "Cộng từ phụ kiện / bộ (crit chance)", value: multiplier.critRateBonus },
    ];

    const breakdown: CombatStatsBreakdown = {
        attackParts,
        defenseParts,
        hpParts,
        speedParts,
        critChanceParts,
        damageMultDeltas,
        defenseMultDeltas,
        hpMultDeltas,
        gearFlatLines,
        petContributions: petDetail.contributions,
        petTitlePowerMult,
        accessoryEffectLines,
        buffLines,
    };

    const final: FinalStats = {
        attack: Math.floor(derived.attack * multiplier.damageMult),
        defense: Math.floor(derived.defense * multiplier.defenseMult),
        maxHp: Math.floor(derived.maxHp * multiplier.hpMult),
        speed: derived.speed,
    };

    return {
        base,
        flat,
        derived,
        multiplier,
        final,
        breakdown,
        extra: {
            activeUniqueEffects,
            uniquePowers: multiplier.uniquePowers,
            activeSets: multiplier.activeSets,
            critRateBonus: multiplier.critRateBonus,
        },
    };
}

export function calculatePipelineDamage(
    attackerFinalAttack: number,
    defenderFinalDefense: number
): number {
    const damageReduction = defenderFinalDefense / (defenderFinalDefense + 100);
    const clampedReduction = Math.min(0.75, Math.max(0, damageReduction));
    const finalDamage = Math.floor(attackerFinalAttack * (1 - clampedReduction));
    return Math.max(1, finalDamage);
}
