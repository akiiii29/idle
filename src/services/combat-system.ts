// @ts-nocheck
import { EmbedBuilder } from "discord.js";
import { ItemType } from "@prisma/client";
import { prisma } from "./prisma";
import { getUserWithRelations } from "./user-service";
import { randomInt } from "./rng";
import { applyLevelUps } from "./leveling";

export interface CombatContext {
  player: { atk: number; def: number; spd: number; hp: number; maxHp: number; critRate: number; petPower: number; };
  enemy: { atk: number; def: number; spd: number; hp: number; };
  multipliers: { damage: number; gold: number; exp: number; };
  flags: { dodged: boolean; ignoreDef: boolean; extraHit: boolean; };
  extra: { bonusDamage: number; heal: number; reduceDamage: number; };
}

export const SKILL_HANDLERS: Record<string, (ctx: CombatContext, skill: any) => void> = {
  DAMAGE: (ctx, skill) => { 
    let addon = skill.multiplier;
    if (skill.scaleWithHp) addon += (1 - (ctx.player.hp / ctx.player.maxHp));
    if (skill.scaleWithPet) addon += (ctx.player.petPower * 0.01);
    ctx.multipliers.damage += addon; 
    if (skill.ignoreDef) ctx.flags.ignoreDef = true;
    if (skill.extraHit) ctx.flags.extraHit = true;
  },
  DOT: (ctx, skill) => { ctx.extra.bonusDamage += ctx.player.atk * skill.multiplier; },
  DODGE: (ctx) => { ctx.flags.dodged = true; },
  HEAL: (ctx, skill) => { ctx.extra.heal += ctx.player.atk * skill.multiplier; },
  GOLD: (ctx, skill) => { ctx.multipliers.gold += skill.multiplier; },
  REDUCE_DAMAGE: (ctx, skill) => { ctx.extra.reduceDamage += skill.multiplier; },
  CHAOS: (ctx, skill) => {
    const roll = Math.random();
    if (roll < 0.33) ctx.multipliers.damage += 0.5;
    else if (roll < 0.66) ctx.extra.heal += ctx.player.maxHp * 0.2;
    else ctx.extra.bonusDamage += ctx.player.atk;
  },
  TAME: () => {}
};

function applySkills(userSkills: any[], trigger: string, ctx: CombatContext): string[] {
  const activatedSkills: string[] = [];
  if (!userSkills || userSkills.length === 0) return activatedSkills;

  for (const us of userSkills) {
    const skill = us.skill;
    if (skill.trigger !== trigger) continue;
    if (Math.random() > skill.chance) continue;

    const handler = SKILL_HANDLERS[skill.type];
    if (handler) {
      if (skill.type === "DODGE" && ctx.flags.dodged) continue; // Prevent multiple dodge procs
      handler(ctx, skill);
      activatedSkills.push(skill.name);
    }
  }
  return activatedSkills;
}

export interface BattleResult {
  isWin: boolean;
  enemyName: string;
  battleLogs: string[];
  goldGained: number;
  expGained: number;
  hpLost: number;
  hospitalUntil?: Date;
  finalHp: number;
}

export interface HuntCombatModifiers {
  // Temporary stat overrides for this hunt only
  str?: number;
  agi?: number;
  luck?: number;

  // Combat modifiers
  playerDamageMultiplier?: number; // hunters_mark
  enemyStrengthMultiplier?: number; // golden_contract
  topPetBonusMultiplier?: number; // spirit_bond (base 0.5 => 0.8)

  // Reward multipliers
  goldMultiplier?: number; // risk_coin + golden_contract gold
  expMultiplier?: number; // golden_contract exp
}

export async function handleHunt(
  interaction: any,
  userId: string,
  modifiers: HuntCombatModifiers = {}
): Promise<BattleResult | string> {
  const user = await getUserWithRelations(userId);
  if (!user) return "Không tìm thấy người chơi.";
  
  if (user.hospitalUntil && user.hospitalUntil > new Date()) {
    return "Bạn vẫn đang hồi phục ở bệnh viện.";
  }

  if (user.currentHp <= 0) {
    return "Bạn không còn HP! Hãy đợi hồi phục hoặc dùng vật phẩm.";
  }

  // 1. Calculate Final Stats
  const equippedItems = user.inventory.filter((i: any) => i.isEquipped);
  const bonusStr = equippedItems.reduce((acc: number, i: any) => acc + i.bonusStr, 0);
  const bonusAgi = equippedItems.reduce((acc: number, i: any) => acc + i.bonusAgi, 0);
  const bonusDef = equippedItems.reduce((acc: number, i: any) => acc + i.bonusDef, 0);
  const bonusHp = equippedItems.reduce((acc: number, i: any) => acc + i.bonusHp, 0);

  const topBeast = user.beasts.length > 0 ? [...user.beasts].sort((a,b) => b.power - a.power)[0] : null;

  const effectiveStr = modifiers.str ?? user.str;
  const effectiveAgi = modifiers.agi ?? user.agi;
  const effectiveLuck = modifiers.luck ?? user.luck;

  const playerDamageMultiplier = modifiers.playerDamageMultiplier ?? 1;
  const enemyStrengthMultiplier = modifiers.enemyStrengthMultiplier ?? 1;
  const topPetBonusMultiplier = modifiers.topPetBonusMultiplier ?? 0.5;

  const goldMultiplier = modifiers.goldMultiplier ?? 1;
  const expMultiplier = modifiers.expMultiplier ?? 1;

  const playerAtk = effectiveStr + bonusStr + (topBeast ? topBeast.power * topPetBonusMultiplier : 0);
  const playerDef = (effectiveAgi * 0.5) + bonusDef;
  const playerSpd = effectiveAgi + bonusAgi;
  const critRate = effectiveLuck * 0.005;

  // 2. Monster Generation
  const lvl = user.level;
  const enemyMaxHp = (50 + (lvl * 15)) * enemyStrengthMultiplier;
  let enemyHp = enemyMaxHp;
  const enemyAtk = (5 + (lvl * 4)) * enemyStrengthMultiplier;
  const enemyDef = (2 + (lvl * 2)) * enemyStrengthMultiplier;
  const enemySpd = (5 + (lvl * 2)) * enemyStrengthMultiplier;
  const enemyName = `Quái thú cấp ${lvl}`;

  // 3. Combat Loop
  const battleLogs: string[] = [];
  let isWin = false;
  let turn = 1;

  const ctx: CombatContext = {
    player: { atk: playerAtk, def: playerDef, spd: playerSpd, hp: user.currentHp, maxHp: user.maxHp, critRate, petPower: topBeast ? topBeast.power : 0 },
    enemy: { atk: enemyAtk, def: enemyDef, spd: enemySpd, hp: enemyHp },
    multipliers: { damage: playerDamageMultiplier, gold: goldMultiplier, exp: expMultiplier },
    flags: { dodged: false, ignoreDef: false, extraHit: false },
    extra: { bonusDamage: 0, heal: 0, reduceDamage: 0 }
  };

  const equippedSkills = user.skills.filter((s: any) => s.isEquipped);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  const displayedLogs: string[] = [];

  const pushLog = async (newLogs: string[]) => {
    displayedLogs.push(...newLogs);
    battleLogs.push(...newLogs);
    const fullLog = displayedLogs.join("\n");
    const textToDisplay = fullLog.length > 3500 ? "..." + fullLog.substring(fullLog.length - 3500) : fullLog;
    
    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle("⚔️ Đang chiến đấu...")
      .setDescription(textToDisplay);
      
    try {
      if (interaction) await interaction.editReply({ embeds: [embed], components: [] });
    } catch (e) {
      console.error("Progressive log edit failed", e);
    }
  };

  await pushLog([`⚔️ **${enemyName} xuất hiện!** (HP: ${enemyMaxHp})`]);

  while (turn <= 20 && ctx.player.hp > 0 && ctx.enemy.hp > 0) {
    const turnLogs: string[] = [];
    turnLogs.push(`\n**[Lượt ${turn}]**`);
    
    // ON_TURN_START skills
    const turnStartSkills = applySkills(equippedSkills, "ON_TURN_START", ctx);
    if (turnStartSkills.length > 0) {
      turnLogs.push(`🌟 Kỹ năng đầu lượt kích hoạt: ${turnStartSkills.join(", ")}`);
      // Since it's turn start, we can apply heal now if generated
      if (ctx.extra.heal > 0) {
        ctx.player.hp += Math.floor(ctx.extra.heal);
        ctx.player.hp = Math.min(ctx.player.hp, user.maxHp);
        turnLogs.push(`💚 Bạn hồi phục ${Math.floor(ctx.extra.heal)} HP.`);
        ctx.extra.heal = 0; // reset after applying
      }
      if (ctx.extra.bonusDamage > 0) {
        ctx.enemy.hp -= Math.floor(ctx.extra.bonusDamage);
        turnLogs.push(`🔥 Quái thú bị thiêu đốt chịu ${Math.floor(ctx.extra.bonusDamage)} sát thương. (HP quái: ${Math.max(0, ctx.enemy.hp)})`);
        ctx.extra.bonusDamage = 0; // reset after applying
      }
    }

    if (ctx.enemy.hp <= 0) break;

    // SPD determines who hits first
    const participants = ctx.player.spd >= ctx.enemy.spd 
      ? [{ name: "Player", side: "user" }, { name: enemyName, side: "enemy" }]
      : [{ name: enemyName, side: "enemy" }, { name: "Player", side: "user" }];

    for (const p of participants) {
      if (ctx.player.hp <= 0 || ctx.enemy.hp <= 0) break;

      // 1. Before attack: reset
      ctx.flags.dodged = false;
      ctx.flags.ignoreDef = false;
      ctx.flags.extraHit = false;
      ctx.multipliers.damage = playerDamageMultiplier;
      ctx.extra.bonusDamage = 0;
      ctx.extra.heal = 0;
      ctx.extra.reduceDamage = 0;

      let activatedSkills: string[] = [];

      // 2. Apply skill effects by timing
      if (p.side === "user") {
        activatedSkills = applySkills(equippedSkills, "ON_ATTACK", ctx);
      } else {
        activatedSkills = applySkills(equippedSkills, "ON_DEFEND", ctx);
      }

      const skillsStr = activatedSkills.length > 0 ? ` (kỹ năng: **${activatedSkills.join(", ")}**)` : "";

      // 3. If dodged: skip damage
      if (ctx.flags.dodged) {
        if (p.side === "enemy") {
          turnLogs.push(`🔸 **${enemyName}** tấn công nhưng bạn đã né được!${skillsStr}`);
        } else {
          turnLogs.push(`🔹 Bạn tấn công nhưng bị né!${skillsStr}`);
        }
      } else {
        // 4. Apply damage
        if (p.side === "user") {
          const isCrit = Math.random() < ctx.player.critRate;
          const baseDamage = ctx.player.atk * (isCrit ? 1.5 : 1.0) * ctx.multipliers.damage;
          
          const enemyDef = ctx.flags.ignoreDef ? 0 : ctx.enemy.def;
          let hitDamage = Math.max(1, Math.floor(baseDamage - enemyDef));
          
          const hits = ctx.flags.extraHit ? 2 : 1;
          const totalDamage = hitDamage * hits + Math.floor(ctx.extra.bonusDamage);
          
          ctx.enemy.hp -= totalDamage;
          const critText = isCrit ? "💥 **ĐÁNH CHÍ MẠNG!** " : "";
          const extraText = ctx.flags.extraHit ? " (Đánh bồi!)" : "";
          turnLogs.push(`🔹 Bạn tấn công${skillsStr} gây ${critText}${totalDamage} sát thương${extraText}. (HP quái: ${Math.max(0, ctx.enemy.hp)})`);
        } else {
          // Enemy's turn
          let damage = Math.max(1, ctx.enemy.atk - ctx.player.def);
          if (ctx.extra.reduceDamage > 0) {
            const reduction = Math.min(0.9, ctx.extra.reduceDamage);
            damage = damage * (1 - reduction);
          }
          damage = Math.floor(damage);

          ctx.player.hp -= damage;
          turnLogs.push(`🔸 **${enemyName}** đánh trúng bạn gây ${damage} sát thương. (HP của bạn: ${Math.max(0, ctx.player.hp)})`);
        }
      }

      // 5. After attack: apply heal
      if (ctx.extra.heal > 0) {
        ctx.player.hp += Math.floor(ctx.extra.heal);
        ctx.player.hp = Math.min(ctx.player.hp, user.maxHp);
        turnLogs.push(`💚 Bạn hồi phục ${Math.floor(ctx.extra.heal)} HP.`);
      }
    }
    
    await pushLog(turnLogs);
    if (ctx.player.hp > 0 && ctx.enemy.hp > 0) {
      await sleep(800); // progressive update per turn
    }
    turn++;
  }

  const finalLogs: string[] = [];
  isWin = ctx.enemy.hp <= 0;
  if (!isWin && ctx.player.hp > 0) {
    finalLogs.push("\n⏳ **Trận đấu kết thúc hòa!** (Đã chạm giới hạn 20 lượt)");
  }

  // 4. Rewards & Stats
  const goldGainedBase = isWin ? randomInt(20, 50) + (lvl * 10) : 0;
  const expGainedBase = isWin ? 10 + (lvl * 5) : 0;
  const goldGained = Math.max(0, Math.floor(goldGainedBase * ctx.multipliers.gold));
  const expGained = Math.max(0, Math.floor(expGainedBase * ctx.multipliers.exp));
  const hpLost = user.currentHp - ctx.player.hp;

  let hospitalUntil: Date | undefined;
  if (ctx.player.hp <= 0) {
    ctx.player.hp = 0;
    hospitalUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 mins
    finalLogs.push("\n🚑 **Bạn gục ngã và được đưa đến bệnh viện!**");
  }

  if (finalLogs.length > 0) {
    await pushLog(finalLogs);
    await sleep(400); // mini buffer before rendering the final result
  }

  // 5. Update Database
  const result: BattleResult = {
    isWin,
    enemyName,
    battleLogs,
    goldGained,
    expGained,
    hpLost,
    hospitalUntil,
    finalHp: ctx.player.hp
  };

  await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        gold: { increment: goldGained },
        exp: { increment: expGained },
        currentHp: ctx.player.hp,
        hospitalUntil: hospitalUntil || null
      }
    });

    // Check for level up
    const levelUpData = applyLevelUps({
      level: updatedUser.level,
      exp: updatedUser.exp,
      str: updatedUser.str,
      agi: updatedUser.agi,
      luck: updatedUser.luck,
      hp: updatedUser.currentHp,
      maxHp: updatedUser.maxHp
    });

    if (levelUpData.levelsGained > 0) {
      await tx.user.update({
        where: { id: userId },
        data: {
          level: levelUpData.updated.level,
          exp: levelUpData.updated.exp,
          str: levelUpData.updated.str,
          agi: levelUpData.updated.agi,
          luck: levelUpData.updated.luck,
          maxHp: levelUpData.updated.maxHp,
          currentHp: levelUpData.updated.maxHp // Full heal on level up
        }
      });
      battleLogs.push(`\n🎊 **LÊN CẤP!** Bạn đã lên cấp ${levelUpData.updated.level}!`);
    }

    // Save Combat Log
    await tx.combatLog.create({
      data: {
        userId,
        enemyName,
        isWin,
        logDetails: battleLogs.join("\n"),
        goldGained,
        expGained
      }
    });
  });

  return result;
}
