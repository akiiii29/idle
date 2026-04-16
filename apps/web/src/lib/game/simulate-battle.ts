/**
 * Server-side adapter: calls @game/core game logic
 */

import { simulateCombat, computeCombatStats, enrichBeast, type BattleResult } from "@game/core";

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function simulateHunt(userId: string, user: any, huntType: "normal" | "boss"): Promise<BattleResult> {
  const isBoss = huntType === "boss";
  const enemyStrengthMultiplier = isBoss ? 3 : 1;

  // Compute player combat stats
  const combatStats = computeCombatStats(
    {
      str: user.str,
      agi: user.agi,
      maxHp: user.maxHp,
      luck: user.luck ?? 0,
      talentDps: user.talentDps ?? 0,
      talentTank: user.talentTank ?? 0,
      talentSupport: user.talentSupport ?? 0,
      talentBurn: user.talentBurn ?? 0,
      talentPoison: user.talentPoison ?? 0,
      title: user.title ?? null,
    },
    [],
    user.beasts?.filter((b: any) => b.isEquipped).map((b: any) => enrichBeast(b)) ?? [],
    [],
    undefined
  );

  const lvl = Math.max(1, user.level - randomInt(0, 2));
  const isNewbie = lvl < 5;
  const enemyMaxHp = Math.floor((50 + lvl * 15) * enemyStrengthMultiplier * (isNewbie ? 0.7 : 1));
  const enemyName = `Quái thú cấp ${lvl}${isNewbie ? " (Yếu)" : ""}`;

  const player = {
    hp: user.currentHp,
    maxHp: combatStats.final.maxHp,
    atk: combatStats.final.attack,
    def: combatStats.final.defense,
    spd: combatStats.final.speed,
    critRate: (user.luck ?? 0) * 0.01,
    pets: user.beasts?.filter((b: any) => b.isEquipped).map((b: any) => enrichBeast(b)) ?? [],
    skills: user.skills?.filter((us: any) => us.isEquipped).map((us: any) => us.skill) ?? [],
    title: user.title ?? null,
  };

  const enemy = {
    name: enemyName,
    hp: enemyMaxHp,
    maxHp: enemyMaxHp,
    atk: (5 + lvl * 4) * enemyStrengthMultiplier,
    def: (2 + lvl * 2) * enemyStrengthMultiplier,
    spd: (5 + lvl * 2) * enemyStrengthMultiplier,
    isBoss,
  };

  const result = await simulateCombat({ player, enemy });

  return result;
}
