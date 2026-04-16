/**
 * combat.ts
 * Core types and interfaces for the RPG combat system.
 * Separated to avoid circular dependencies.
 */

export interface CombatEffect {
  type: "dot" | "hot" | "buff" | "debuff" | "poison" | "burn" | "shield";
  stat?: string;
  value: number;
  turns: number;
  name: string;
  stacks: number;
}

export interface CombatParticipant {
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  spd: number;
  critRate: number;
  petPower: number;
  shield: number;
  isBoss?: boolean;
  multipliers: { 
    damage: number; 
    gold: number; 
    exp: number; 
    defense: number; 
    critDamage: number; 
    burnDamage: number; 
    poisonDamage: number; 
    lifesteal: number;
    procChance: number;
    critRateBonus: number;
    uniquePowers: Record<string, number>;
    activeSets: string[];
    heal: number;
  };
}

export interface CombatContext {
  player: CombatParticipant;
  enemy: CombatParticipant;
  effects: { player: CombatEffect[]; enemy: CombatEffect[]; };
  flags: { 
    player: { dodged: boolean; ignoreDef: boolean; extraHit: boolean; }; 
    enemy: { dodged: boolean; ignoreDef: boolean; bossPhaseTriggered: boolean; isBoss: boolean; }; 
  };
  extra: { player: { instantHeal: number; bonusDamage: number; reduceDamage: number; }; };
  accessories: {
    effects: string[]; // List of active unique effect types
    uniquePowers: Record<string, number>; // Maps effect type to its scaled power
    sets: string[];    // List of active set names (2+ items)
  };
  fullLogs: CombatLog[];
}

export interface CombatLog {
  turn: number;
  events: string[];
}

export interface StatusFlags {
  didCrit: boolean;
  didHeavy: boolean;
  didBleed: boolean;
  didDodge: boolean;
  didMultiHit: boolean;
  didLifesteal: boolean;
  didDamageReduction: boolean;
  didCounter: boolean;
  didBurn: boolean;
  didPoison: boolean;
  ignoreDef: boolean;
  lowHp: boolean;
  chaosTriggered: boolean;
  petCrit?: boolean;
  petBurn?: boolean;
  petPoison?: boolean;
  petShield?: boolean;
  petHeal?: boolean;
  petDebuff?: boolean;
}

export interface SkillPhaseResult {
  triggeredSkills: string[];
  triggeredSynergies: string[];
  totalDamage: number;
  healAmount: number;
  flags: StatusFlags;
  burnStacks: number;
  poisonStacks: number;
}

export interface BattleResult {
  isWin: boolean;
  enemyName: string;
  fullLogs: CombatLog[];
  finalHp: number;
  finalEnemyHp: number;
  enemyMaxHp: number;
  achievementTracking?: {
    crits: number;
    burns: number;
    poisons: number;
    lifesteals: number;
    combos: number;
  };
  isBossKill?: boolean;
  combatSummary: {
    /** Skill name → number of times it activated across the whole fight */
    skillCounts: Record<string, number>;
    /** Unique synergy names that triggered (deduped) */
    synergies: string[];
    /** Number of turns where a combo (≥2 skills+synergies) triggered */
    comboCount: number;
    /** Highest single-turn player damage */
    maxTurnDamage: number;
    /** Total player damage dealt across all turns */
    totalDamageDealt: number;
    /** Pet ID -> number of times it used a skill in the fight */
    petExpPool?: Map<string, number>;
  };
}
