import type { User } from "@prisma/client";

import { HOSPITAL_COOLDOWN_MS } from "../constants/config";
import { applyLevelUps, type LevelUpSummary } from "./leveling";
import { randomInt } from "./rng";

export interface CombatResult {
  victory: boolean;
  monsterDef: number;
  playerRoll: number;
  expGained: number;
  goldGained: number;
  damageTaken: number;
  expLost: number;
  hospitalUntil: Date | null;
  updatedStats: {
    level: number;
    exp: number;
    gold: number;
    str: number;
    agi: number;
    luck: number;
    hp: number;
    maxHp: number;
  };
  levelUp: LevelUpSummary | null;
}

export function resolveCombat(
  user: Pick<User, "level" | "exp" | "gold" | "str" | "agi" | "luck" | "hp" | "maxHp">,
  now = new Date(),
  bonusStr = 0
): CombatResult {
  const monsterDef = randomInt(5, 15) + user.level;
  const playerRoll = user.str + bonusStr + randomInt(0, 10);

  if (playerRoll >= monsterDef) {
    const expGained = randomInt(10, 20);
    const goldGained = randomInt(20, 40);
    const levelUp = applyLevelUps({
      level: user.level,
      exp: user.exp + expGained,
      str: user.str,
      agi: user.agi,
      luck: user.luck,
      hp: user.hp,
      maxHp: user.maxHp
    });

    return {
      victory: true,
      monsterDef,
      playerRoll,
      expGained,
      goldGained,
      damageTaken: 0,
      expLost: 0,
      hospitalUntil: null,
      updatedStats: {
        level: levelUp.updated.level,
        exp: levelUp.updated.exp,
        gold: user.gold + goldGained,
        str: levelUp.updated.str,
        agi: levelUp.updated.agi,
        luck: levelUp.updated.luck,
        hp: levelUp.updated.hp,
        maxHp: levelUp.updated.maxHp
      },
      levelUp
    };
  }

  const damageTaken = randomInt(10, 20);
  const hpAfterHit = user.hp - damageTaken;
  const knockedOut = hpAfterHit <= 0;
  const expLost = knockedOut ? Math.min(50, user.exp) : 0;

  return {
    victory: false,
    monsterDef,
    playerRoll,
    expGained: 0,
    goldGained: 0,
    damageTaken,
    expLost,
    hospitalUntil: knockedOut ? new Date(now.getTime() + HOSPITAL_COOLDOWN_MS) : null,
    updatedStats: {
      level: user.level,
      exp: Math.max(0, user.exp - expLost),
      gold: user.gold,
      str: user.str,
      agi: user.agi,
      luck: user.luck,
      hp: knockedOut ? 1 : Math.max(1, hpAfterHit),
      maxHp: user.maxHp
    },
    levelUp: null
  };
}
