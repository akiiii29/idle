/**
 * combat-engine.ts
 * Pure combat engine - UI agnostic.
 */

import { applySkills } from "./skill-system";
import { type CombatContext, type CombatLog, type BattleResult } from "../types/combat";
import { resolveTurnEffects, cleanupEffects, calculateDamage, applyDamage, getBuffDamageReduction } from "./combat-utils";
import { applyPetEffects } from "./pet-system";
import { applyPetSynergy, applyPetPlayerSynergy, getActiveSynergies } from "./pet-synergy";
import { TITLES } from "../constants/titles";
import { applyRelicsBeforeCombat, applyRelicsOnTurn } from "./relic-system";

export async function simulateCombat(options: {
  player: { hp: number; maxHp: number; atk: number; def: number; spd: number; critRate: number; pets: any[]; skills: any[]; title?: string | null };
  enemy: { name: string; hp: number; maxHp: number; atk: number; def: number; spd: number; isBoss?: boolean };
  relics?: any[];
  accessories?: {
    effects: string[];
    uniquePowers: Record<string, number>;
    sets: string[];
  };
  maxTurns?: number;
  onTurnUpdate?: (state: { turn?: number; playerHp: number; enemyHp: number; logs: string[] }, ctx?: CombatContext) => Promise<void> | void;
}): Promise<BattleResult> {
  const { player, enemy, maxTurns = 30, onTurnUpdate } = options;

  const ctx: CombatContext = {
    player: {
      name: "Bạn",
      atk: player.atk, def: player.def, spd: player.spd, hp: player.hp, maxHp: player.maxHp, critRate: player.critRate,
      petPower: 0, shield: 0,
      multipliers: {
        damage: 1, gold: 1, exp: 1, defense: 1,
        critDamage: 1.5, burnDamage: 1, poisonDamage: 1, lifesteal: 1, procChance: 1,
        critRateBonus: 0, uniquePowers: {}, activeSets: [], heal: 1
      }
    },
    enemy: {
      name: enemy.name,
      atk: enemy.atk, def: enemy.def, spd: enemy.spd, hp: enemy.hp, maxHp: enemy.maxHp,
      petPower: 0, critRate: 0, shield: 0,
      multipliers: {
        damage: 1, gold: 1, exp: 1, defense: 1,
        critDamage: 1.5, burnDamage: 1, poisonDamage: 1, lifesteal: 1, procChance: 1,
        critRateBonus: 0, uniquePowers: {}, activeSets: [], heal: 1
      }
    },
    effects: { player: [], enemy: [] },
    flags: {
      player: { dodged: false, ignoreDef: false, extraHit: false },
      enemy: { dodged: false, ignoreDef: false, bossPhaseTriggered: false, isBoss: enemy.isBoss ?? false }
    },
    extra: { player: { instantHeal: 0, bonusDamage: 0, reduceDamage: 0 } },
    accessories: {
      effects: options.accessories?.effects || [],
      uniquePowers: options.accessories?.uniquePowers || {},
      sets: options.accessories?.sets || []
    },
    fullLogs: []
  };

  const fullLogs: CombatLog[] = [];

  if (options.player.title) {
    const titleDef = TITLES.find((t: any) => t.key === options.player.title);
    if (titleDef) {
       const type = titleDef.effectType;
       const val = titleDef.effectValue;
       if (type === "damage") ctx.player.multipliers.damage += val;
       else if (type === "critDamage") ctx.player.multipliers.critDamage += val;
       else if (type === "burnDamage") ctx.player.multipliers.burnDamage += val;
       else if (type === "poisonDamage") ctx.player.multipliers.poisonDamage += val;
       else if (type === "lifesteal") ctx.player.multipliers.lifesteal += val;
       else if (type === "goldGain") ctx.player.multipliers.gold += val;
       else if (type === "procChance") ctx.player.multipliers.procChance += val;
       else if (type === "petPower") ctx.player.petPower += val;
    }
  }

  const achievementTracking = {
    crits: 0,
    burns: 0,
    poisons: 0,
    lifesteals: 0,
    combos: 0,
  };

  const uiAccum = {
    skillCounts: {} as Record<string, number>,
    synergies: [] as string[],
    comboCount: 0,
    maxTurnDamage: 0,
    totalDamageDealt: 0,
    petExpPool: new Map<string, number>(),
  };

  const petPartySynLines = applyPetSynergy(ctx, player.pets);
  for (const syn of getActiveSynergies(player.pets)) {
    if (!uiAccum.synergies.includes(syn.name)) uiAccum.synergies.push(syn.name);
  }

  if (options.relics && options.relics.length > 0) {
    applyRelicsBeforeCombat(ctx, options.relics);
  }

  let turn = 1;

  const order = ctx.player.spd >= ctx.enemy.spd
    ? [{ side: 'user' }, { side: 'enemy' }]
    : [{ side: 'enemy' }, { side: 'user' }];

  const firstAttacker = order[0]!.side === "user" ? "Bạn" : ctx.enemy.name;
  const startLog = `👟 **Tốc độ:** Bạn (**${ctx.player.spd}**) vs ${ctx.enemy.name} (**${ctx.enemy.spd}**). **${firstAttacker}** ra đòn trước!`;

  if (onTurnUpdate) {
    const openLogs = [startLog];
    if (petPartySynLines.length > 0) {
      openLogs.push("📌 **Cộng hưởng đội pet (passive):**", ...petPartySynLines);
    }
    onTurnUpdate({
      playerHp: Math.floor(ctx.player.hp),
      enemyHp: Math.floor(ctx.enemy.hp),
      logs: openLogs
    });
  }

  while (turn <= maxTurns && ctx.player.hp > 0 && ctx.enemy.hp > 0) {
    const turnEvents: string[] = [];
    if (turn === 1) {
      turnEvents.push(startLog);
      if (petPartySynLines.length > 0) {
        turnEvents.push("📌 **Cộng hưởng đội pet (passive):**", ...petPartySynLines);
      }
    }

    turnEvents.push(`\n**[Lượt ${turn}]**`);

    resolveTurnEffects(ctx.player, ctx.effects.player, turnEvents);
    resolveTurnEffects(ctx.enemy, ctx.effects.enemy, turnEvents);

    if (options.relics && options.relics.length > 0) {
      applyRelicsOnTurn(ctx, options.relics, turnEvents);
    }

    if (ctx.enemy.hp <= 0 || ctx.player.hp <= 0) break;

    const turnStartFlags: any = {};
    const petStartResult = applyPetEffects(ctx, player.pets, "ON_TURN_START", turnStartFlags);
    if (petStartResult.triggered.length > 0) {
      turnEvents.push(...petStartResult.triggered);
      for (const pid of petStartResult.triggeredPetIds) {
        uiAccum.petExpPool.set(pid, (uiAccum.petExpPool.get(pid) || 0) + 1);
      }
    }
    const turnStartRes = applySkills(player.skills, "ON_TURN_START", ctx);

    const mergeTurnStartFlags = { ...turnStartRes.flags, ...turnStartFlags };
    const turnStartPetSyn = applyPetPlayerSynergy(ctx, mergeTurnStartFlags);

    if (turnStartRes.triggeredSkills.length > 0) {
      turnEvents.push(`✨ **Niệm chú:** ${turnStartRes.triggeredSkills.join(", ")}...`);

      if (ctx.extra.player.instantHeal > 0) {
        const totalHeal = Math.floor(ctx.extra.player.instantHeal * (ctx.player.multipliers.heal || 1));
        ctx.player.hp = Math.min(ctx.player.maxHp, ctx.player.hp + totalHeal);
        turnEvents.push(`💚 Hồi phục thêm **${totalHeal}** HP.`);
        ctx.extra.player.instantHeal = 0;
      }
      if (ctx.extra.player.bonusDamage > 0) {
        applyDamage(ctx.enemy, ctx.extra.player.bonusDamage, turnEvents);
        ctx.extra.player.bonusDamage = 0;
      }
    }

    if (turnStartRes.triggeredSynergies.length > 0) {
      turnEvents.push(`🔗 **Cộng hưởng (kỹ năng):** ${turnStartRes.triggeredSynergies.join(" · ")}`);
      for (const sy of turnStartRes.triggeredSynergies) {
        if (!uiAccum.synergies.includes(sy)) uiAccum.synergies.push(sy);
      }
    }

    if (turnStartPetSyn.logs.length > 0) {
      turnEvents.push(...turnStartPetSyn.logs);
      for (const n of turnStartPetSyn.names) {
        if (!uiAccum.synergies.includes(n)) uiAccum.synergies.push(n);
      }
    }

    if (ctx.enemy.hp <= 0) break;

    if (!ctx.flags.enemy.bossPhaseTriggered && ctx.enemy.hp <= ctx.enemy.maxHp * 0.5) {
      ctx.flags.enemy.bossPhaseTriggered = true;
      const isBoss = ctx.flags.enemy.isBoss;
      const boostPercent = isBoss ? 50 : 10;
      const boostMult = isBoss ? 1.5 : 1.1;

      turnEvents.push(`⚡ **CUỒNG NỘ:** ${ctx.enemy.name} gồng mình (Tăng ${boostPercent}% ATK)!`);
      ctx.enemy.atk *= boostMult;
    }

    for (const p of order) {
      if (ctx.player.hp <= 0 || ctx.enemy.hp <= 0) break;

      ctx.flags.player.dodged = false;
      ctx.flags.player.ignoreDef = false;
      ctx.flags.player.extraHit = false;
      ctx.player.multipliers.damage = 1;

      if (p.side === 'user') {
        const attackFlags: any = {};
        const petAttackResult = applyPetEffects(ctx, player.pets, "ON_ATTACK", attackFlags);
        if (petAttackResult.triggered.length > 0) {
          turnEvents.push(...petAttackResult.triggered);
          for (const pid of petAttackResult.triggeredPetIds) {
            uiAccum.petExpPool.set(pid, (uiAccum.petExpPool.get(pid) || 0) + 1);
          }
        }

        const attackRes = applySkills(player.skills, "ON_ATTACK", ctx);

        if (attackRes.triggeredSkills.length > 0) {
          turnEvents.push(`⚔️ **Thi triển:** ${attackRes.triggeredSkills.join(", ")}!`);
        }
        if (attackRes.triggeredSynergies.length > 0) {
          turnEvents.push(`🔗 **Cộng hưởng (kỹ năng):** ${attackRes.triggeredSynergies.join(" · ")}`);
        }
        if ((attackRes.triggeredSkills.length + attackRes.triggeredSynergies.length) >= 2) {
          achievementTracking.combos++;
          uiAccum.comboCount++;
        }

        for (const sk of attackRes.triggeredSkills) {
          uiAccum.skillCounts[sk] = (uiAccum.skillCounts[sk] || 0) + 1;
        }
        for (const sy of attackRes.triggeredSynergies) {
          if (!uiAccum.synergies.includes(sy)) uiAccum.synergies.push(sy);
        }

        const mergeAttackFlags = { ...attackRes.flags, ...attackFlags };

        const naturalCrit = Math.random() < ctx.player.critRate;
        if (naturalCrit) mergeAttackFlags.didCrit = true;

        if (attackRes.flags.didBurn || attackFlags.petBurn) achievementTracking.burns++;
        if (attackRes.flags.didPoison || attackFlags.petPoison) achievementTracking.poisons++;

        const attackPetSyn = applyPetPlayerSynergy(ctx, mergeAttackFlags);
        if (attackPetSyn.logs.length > 0) turnEvents.push(...attackPetSyn.logs);
        for (const n of attackPetSyn.names) {
          if (!uiAccum.synergies.includes(n)) uiAccum.synergies.push(n);
        }

        const isCrit = naturalCrit || attackRes.flags.didCrit || attackFlags.petCrit;
        if (isCrit) { achievementTracking.crits++; }

        let rawAtk = ctx.player.atk * ctx.player.multipliers.damage;

        if (ctx.accessories.effects.includes("UNIQUE_BERSERK_PERCENT")) {
           const missingHpPct = 1 - (ctx.player.hp / ctx.player.maxHp);
           const pwr = ctx.accessories.uniquePowers["UNIQUE_BERSERK_PERCENT"] || 0.01;
           rawAtk *= (1 + (missingHpPct * (pwr * 100)));
        }

        const enemyDef = ctx.flags.player.ignoreDef ? 0 : ctx.enemy.def;
        let baseDmg = calculateDamage(rawAtk, enemyDef);

        if (isCrit) {
            baseDmg *= ctx.player.multipliers.critDamage;
            if (ctx.accessories.effects.includes("UNIQUE_CRIT_EXECUTE") && (ctx.enemy.hp / ctx.enemy.maxHp) < 0.5) {
                baseDmg *= 1.3;
            }
        }

        const extraHits = (ctx.flags.player.extraHit || attackRes.flags.didMultiHit) ? 2 : 1;
        const totalBaseDmg = Math.floor(baseDmg * extraHits);

        const critText = isCrit ? "💥 **CHÍ MẠNG!** " : "";
        const bonusText = (ctx.flags.player.extraHit || attackRes.flags.didMultiHit) ? " (Đánh bồi!)" : "";
        const skillName = attackRes.triggeredSkills.length > 0 ? attackRes.triggeredSkills[0] : "Chém trúng mục tiêu";

        applyDamage(ctx.enemy, totalBaseDmg, turnEvents);
        turnEvents.push(`🔹 ${skillName}, gây ${critText}**${totalBaseDmg}** sát thương${bonusText}.`);
        uiAccum.totalDamageDealt += totalBaseDmg;

        if (ctx.extra.player.bonusDamage > 0) {
            const bonus = Math.floor(ctx.extra.player.bonusDamage);
            applyDamage(ctx.enemy, bonus, turnEvents);
            turnEvents.push(`✨ **Sát thương kỹ năng cộng thêm:** +**${bonus}**`);
            uiAccum.totalDamageDealt += bonus;
        }

        const totalTurnDmg = totalBaseDmg + ctx.extra.player.bonusDamage;
        if (totalTurnDmg > uiAccum.maxTurnDamage) uiAccum.maxTurnDamage = totalTurnDmg;

        const baseLifesteal = (ctx.player.multipliers.lifesteal || 1.0) - 1.0;
        const skillLifesteal = attackRes.flags.didLifesteal ? 0.3 : 0;
        const totalLifestealPct = baseLifesteal + skillLifesteal;

        if (totalLifestealPct > 0 && totalTurnDmg > 0) {
            achievementTracking.lifesteals++;
            let heal = Math.floor(totalTurnDmg * totalLifestealPct);
            heal = Math.floor(heal * (ctx.player.multipliers.heal || 1.0));

            if (heal > 0) {
                ctx.player.hp = Math.min(ctx.player.maxHp, ctx.player.hp + heal);
                turnEvents.push(`🩸 **Hút máu:** +**${heal}** HP! (${Math.round(totalLifestealPct * 100)}%)`);
            }
        }

        ctx.extra.player.bonusDamage = 0;
        turnEvents.push("───");
      } else {
        const defendFlags: any = {};
        const petDefendResult = applyPetEffects(ctx, player.pets, "ON_DEFEND", defendFlags);
        if (petDefendResult.triggered.length > 0) {
          turnEvents.push(...petDefendResult.triggered);
          for (const pid of petDefendResult.triggeredPetIds) {
            uiAccum.petExpPool.set(pid, (uiAccum.petExpPool.get(pid) || 0) + 1);
          }
        }

        const defendRes = applySkills(player.skills, "ON_DEFEND", ctx);

        const mergeDefendFlags = { ...defendRes.flags, ...defendFlags };
        const defendPetSyn = applyPetPlayerSynergy(ctx, mergeDefendFlags);

        if (defendRes.triggeredSkills.length > 0) {
          turnEvents.push(`🛡️ **Phòng thủ:** ${defendRes.triggeredSkills.join(", ")}...`);
        }
        if (defendRes.triggeredSynergies.length > 0) {
          turnEvents.push(`🔗 **Cộng hưởng (kỹ năng):** ${defendRes.triggeredSynergies.join(" · ")}`);
          for (const sy of defendRes.triggeredSynergies) {
            if (!uiAccum.synergies.includes(sy)) uiAccum.synergies.push(sy);
          }
        }

        if (defendPetSyn.logs.length > 0) turnEvents.push(...defendPetSyn.logs);
        for (const n of defendPetSyn.names) {
          if (!uiAccum.synergies.includes(n)) uiAccum.synergies.push(n);
        }

        if (ctx.flags.player.dodged || defendRes.flags.didDodge) {
          turnEvents.push(`> 💨 **${enemy.name}** ra chiêu nhưng bạn đã né được!`);
        } else {
          const rawAtk = ctx.enemy.atk;
          const playerDef = ctx.player.def;
          const dmgBeforeReduction = calculateDamage(rawAtk, playerDef);

          const buffReduction = getBuffDamageReduction(ctx.effects.player);
          const synergyBonus = (ctx.player.multipliers.defense || 1) - 1;
          const totalExtraReduction = Math.min(0.9, buffReduction + synergyBonus);

          let finalDmg = Math.floor(dmgBeforeReduction * (1 - totalExtraReduction));

          if (ctx.accessories.effects.includes("UNIQUE_BLOCK_HIT") && turn % 3 === 1) {
             finalDmg = 0;
             turnEvents.push(`> 🛡️ **Thánh Vật:** Chặn đứng đòn tấn công!`);
          }

          if (ctx.extra.player.reduceDamage > 0) {
            finalDmg = Math.max(1, finalDmg - ctx.extra.player.reduceDamage);
          }

          applyDamage(ctx.player, finalDmg, turnEvents);
          turnEvents.push(`> 🔸 **${enemy.name}** tấn công, gây **${finalDmg}** sát thương.`);

          const hasReflect = player.pets.some(p => p.name === "Nhím Châu Âu" || p.skillType === "REFLECT");
          if (hasReflect) {
            const reflected = Math.floor(finalDmg * 0.05);
            if (reflected > 0) {
                applyDamage(ctx.enemy, reflected, turnEvents);
                turnEvents.push(`> 🦔 **Nhím Châu Âu** phản lại **${reflected}** sát thương!`);
            }
          }
        }
        turnEvents.push("───");
      }
    }

    cleanupEffects(ctx.effects.player, turnEvents);
    cleanupEffects(ctx.effects.enemy, turnEvents);

    fullLogs.push({ turn, events: turnEvents });

    if (onTurnUpdate) {
      await onTurnUpdate({
        turn,
        playerHp: Math.max(0, Math.floor(ctx.player.hp)),
        enemyHp: Math.max(0, Math.floor(ctx.enemy.hp)),
        logs: turnEvents
      }, ctx);
    }

    if (ctx.enemy.hp <= 0 || ctx.player.hp <= 0) break;
    turn++;
  }

  return {
    isWin: ctx.enemy.hp <= 0,
    enemyName: enemy.name,
    fullLogs,
    finalHp: Math.max(0, Math.floor(ctx.player.hp)),
    finalEnemyHp: Math.max(0, Math.floor(ctx.enemy.hp)),
    enemyMaxHp: Math.floor(ctx.enemy.maxHp),
    isBossKill: ctx.flags.enemy.isBoss && ctx.enemy.hp <= 0,
    achievementTracking,
    combatSummary: {
      skillCounts: uiAccum.skillCounts,
      synergies: uiAccum.synergies,
      comboCount: uiAccum.comboCount,
      maxTurnDamage: Math.floor(uiAccum.maxTurnDamage),
      totalDamageDealt: Math.floor(uiAccum.totalDamageDealt),
      petExpPool: uiAccum.petExpPool,
    }
  };
}
