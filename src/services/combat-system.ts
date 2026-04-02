// @ts-nocheck
import { EmbedBuilder } from "discord.js";
import { ItemType } from "@prisma/client";
import { prisma } from "./prisma";
import { getUserWithRelations } from "./user-service";
import { randomInt } from "./rng";
import { applyLevelUps } from "./leveling";

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
  let userCurrentHp = user.currentHp;
  let isWin = false;
  let turn = 1;

  battleLogs.push(`⚔️ **${enemyName} xuất hiện!** (HP: ${enemyMaxHp})`);

  while (turn <= 20 && userCurrentHp > 0 && enemyHp > 0) {
    battleLogs.push(`\n**[Lượt ${turn}]**`);
    
    // SPD determines who hits first
    const participants = playerSpd >= enemySpd 
      ? [{ name: "Player", side: "user" }, { name: enemyName, side: "enemy" }]
      : [{ name: enemyName, side: "enemy" }, { name: "Player", side: "user" }];

    for (const p of participants) {
      if (userCurrentHp <= 0 || enemyHp <= 0) break;

      if (p.side === "user") {
        // Player's turn
        let multiplier = 1.0;
        let skillUsed = "";
        
        // Random Skill Check
        if (user.skills.length > 0) {
          const us = user.skills[randomInt(0, user.skills.length - 1)];
          if (Math.random() < us.skill.chance) {
            multiplier = us.skill.multiplier;
            skillUsed = us.skill.name;
          }
        }

        const isCrit = Math.random() < critRate;
        const baseDamage =
          playerAtk * (isCrit ? 1.5 : 1.0) * multiplier * playerDamageMultiplier;
        const damage = Math.max(1, Math.floor(baseDamage - enemyDef));
        
        enemyHp -= damage;
        const critText = isCrit ? "💥 **ĐÁNH CHÍ MẠNG!** " : "";
        const skillText = skillUsed ? ` khi dùng **${skillUsed}**` : "";
        battleLogs.push(`🔹 Bạn tấn công${skillText} gây ${critText}${damage} sát thương. (HP quái: ${Math.max(0, enemyHp)})`);
      } else {
        // Enemy's turn
        const damage = Math.max(1, Math.floor(enemyAtk - playerDef));
        userCurrentHp -= damage;
        battleLogs.push(`🔸 **${enemyName}** đánh trúng bạn gây ${damage} sát thương. (HP của bạn: ${Math.max(0, userCurrentHp)})`);
      }
    }
    
    turn++;
  }

  isWin = enemyHp <= 0;
  if (!isWin && userCurrentHp > 0) {
    battleLogs.push("\n⏳ **Trận đấu kết thúc hòa!** (Đã chạm giới hạn 20 lượt)");
  }

  // 4. Rewards & Stats
  const goldGainedBase = isWin ? randomInt(20, 50) + (lvl * 10) : 0;
  const expGainedBase = isWin ? 10 + (lvl * 5) : 0;
  const goldGained = Math.max(0, Math.floor(goldGainedBase * goldMultiplier));
  const expGained = Math.max(0, Math.floor(expGainedBase * expMultiplier));
  const hpLost = user.currentHp - userCurrentHp;

  let hospitalUntil: Date | undefined;
  if (userCurrentHp <= 0) {
    userCurrentHp = 0;
    hospitalUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 mins
    battleLogs.push("\n🚑 **Bạn gục ngã và được đưa đến bệnh viện!**");
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
    finalHp: userCurrentHp
  };

  await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        gold: { increment: goldGained },
        exp: { increment: expGained },
        currentHp: userCurrentHp,
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
