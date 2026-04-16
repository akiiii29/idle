/**
 * combat-system.ts (Refactored)
 * This is the UI Layer / Handler for Discord.
 * It manages interaction, embeds, and database updates by calling the Combat Engine.
 */

import { EmbedBuilder } from "discord.js";
import { prisma } from "./prisma";
import { getUserWithRelations, formatDuration } from "./user-service";
import { randomInt } from "./rng";
import { updateQuestProgress } from "./quest-service";
import { applyLevelUps } from "./leveling";
import { buildHpBar } from "../utils/rpg-ui";
import { simulateCombat } from "./combat-engine";
import { type BattleResult as EngineResult } from "../types/combat";
import { computeCombatStats } from "./stats-service";
import { updateAchievementProgress, formatAchievementProgress, buildAchievementNotifications } from "./achievement-service";
import { TITLES } from "../constants/titles";
import { addPetExp } from "./pet-management";

export function getTitleGoldMultiplier(title: string | null): number {
  if (!title) return 1.0;
  let multiplier = 1.0;
  let keys: string[] = [];
  try {
    if (title.startsWith("[")) keys = JSON.parse(title);
    else keys = [title];
  } catch (e) {}

  for (const k of keys) {
    const d = TITLES.find(t => t.key === k);
    if (d && d.effectType === "goldGain") multiplier += d.effectValue;
  }
  return multiplier;
}

export interface HuntCombatModifiers {
  str?: number;
  agi?: number;
  luck?: number;
  playerDamageMultiplier?: number;
  enemyStrengthMultiplier?: number;
  topPetBonusMultiplier?: number;
  goldMultiplier?: number;
  expMultiplier?: number;
  isBoss?: boolean;
}

export async function handleHunt(
  interaction: any,
  userId: string,
  modifiers: HuntCombatModifiers = {}
) {
  const user = await getUserWithRelations(userId);
  if (!user) return "Không tìm thấy người chơi.";

  if (user.hospitalUntil && user.hospitalUntil > new Date()) {
    return "Bạn vẫn đang hồi phục ở bệnh viện.";
  }
  if (user.currentHp <= 0) {
    return "Bạn không còn HP! Hãy đợi hồi phục hoặc dùng vật phẩm.";
  }

  // 1. Prepare Stats via Stat Pipeline
  const effectiveStr = modifiers.str ?? user.str;
  const effectiveAgi = modifiers.agi ?? user.agi;
  const effectiveLuck = modifiers.luck ?? user.luck;

  // Create an artificial user for pipeline calculation overriding local hunt modifiers
  const pipedUser = {
    str: effectiveStr,
    agi: effectiveAgi,
    maxHp: user.maxHp,
    luck: effectiveLuck
  };

  const equippedItems = user.inventory.filter((i: any) => i.isEquipped);
  const equippedPets = user.beasts.filter((b: any) => b.isEquipped);

  // Custom Buffs translation (from hunt modifiers)
  const tempBuffs: any[] = [];
  if (modifiers.playerDamageMultiplier && modifiers.playerDamageMultiplier !== 1) {
    tempBuffs.push({ type: "STR_PERCENT_BUFF", power: (modifiers.playerDamageMultiplier - 1) * 100 });
  }

  // Handle Spirit Bond pet multipliers override
  const petMultipliers = modifiers.topPetBonusMultiplier ? [1.0, 0.7, modifiers.topPetBonusMultiplier] : undefined;

  // Compute truth via Service!
  const combatStats = computeCombatStats(pipedUser, equippedItems, equippedPets, tempBuffs, petMultipliers);

  const enemyStrengthMultiplier = modifiers.enemyStrengthMultiplier ?? 1;

  const baseLvl = user.level;
  const lvl = Math.max(1, baseLvl - randomInt(0, 2));
  const isNewbie = lvl < 5;
  const enemyMaxHp = (50 + (lvl * 15)) * enemyStrengthMultiplier * (isNewbie ? 0.7 : 1);
  const enemyName = `Quái thú cấp ${lvl}${isNewbie ? " (Yếu)" : ""}`;

  const displayedLogs: string[] = [];

  // 2. RUN ENGINE
  const engineResult: EngineResult = await simulateCombat({
    player: {
      hp: user.currentHp,
      maxHp: combatStats.final.maxHp,
      atk: combatStats.final.attack,
      def: combatStats.final.defense,
      spd: combatStats.final.speed,
      critRate: (effectiveLuck * 0.005) + (combatStats.extra?.critRateBonus || 0),
      pets: equippedPets,
      skills: user.skills.filter((s: any) => s.isEquipped),
      title: user.title
    },
    enemy: {
      name: enemyName,
      hp: enemyMaxHp,
      maxHp: enemyMaxHp,
      atk: (5 + (lvl * 4)) * enemyStrengthMultiplier,
      def: (2 + (lvl * 2)) * enemyStrengthMultiplier,
      spd: (5 + (lvl * 2)) * enemyStrengthMultiplier,
      isBoss: modifiers.isBoss ?? false
    },
    accessories: {
      effects: combatStats.extra?.activeUniqueEffects || [],
      uniquePowers: (combatStats.extra as any)?.uniquePowers || {},
      sets: combatStats.extra?.activeSets || []
    },
    onTurnUpdate: async (state) => {
      displayedLogs.push(...state.logs);
      const logText = displayedLogs.slice(-8).join("\n");
      const playerBar = buildHpBar(state.playerHp, user.maxHp, 8);
      const enemyBar = buildHpBar(state.enemyHp, Math.floor(enemyMaxHp), 8);

      const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle("⚔️ Đang đi săn...")
        .setDescription(`👩 **Bạn:** ${playerBar}\n👹 **${enemyName}:** ${enemyBar}\n\n${logText}`);

      try {
        if (interaction) await interaction.editReply({ embeds: [embed] });
        await new Promise(resolve => setTimeout(resolve, 800)); // Sleep between turns for visibility
      } catch (e) { }
    }
  });

  // 3. Post-Combat Logic
  const isWin = engineResult.isWin;
  const newbieRewardMult = user.level < 5 ? 2 : 1;
  const goldGainedBase = isWin ? randomInt(20, 50) + (lvl * 10) : 0;
  const expGainedBase = isWin ? 10 + (lvl * 5) : 0;
  const goldTitleMult = getTitleGoldMultiplier(user.title);
  const goldGained = Math.floor(goldGainedBase * (modifiers.goldMultiplier ?? 1) * newbieRewardMult * goldTitleMult);
  const expGained = Math.floor(expGainedBase * (modifiers.expMultiplier ?? 1) * newbieRewardMult);

  let hospitalUntil: Date | null = null;
  if (engineResult.finalHp <= 0) {
    hospitalUntil = new Date(Date.now() + 30 * 60 * 1000);
  }

  let levelsGained = 0;
  let finalStats: any = null;

  // 4. DB UPDATES
  const battleLogsStr = engineResult.fullLogs.flatMap((l: any) => l.events).join("\n");

  let updatedAchievements: any[] = [];

  await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        gold: { increment: goldGained },
        exp: { increment: expGained },
        currentHp: engineResult.finalHp,
        hospitalUntil: hospitalUntil
      }
    });

    const levelUpData = applyLevelUps({
      level: updatedUser.level, exp: updatedUser.exp, str: updatedUser.str, agi: updatedUser.agi, luck: updatedUser.luck, currentHp: updatedUser.currentHp, maxHp: updatedUser.maxHp
    });

    if (levelUpData.levelsGained > 0) {
      levelsGained = levelUpData.levelsGained;
      const leveledUser = await tx.user.update({
        where: { id: userId },
        data: {
          level: levelUpData.updated.level, exp: levelUpData.updated.exp, str: levelUpData.updated.str,
          agi: levelUpData.updated.agi, luck: levelUpData.updated.luck, maxHp: levelUpData.updated.maxHp, currentHp: levelUpData.updated.maxHp
        }
      });
      finalStats = leveledUser;
    }

    await tx.combatLog.create({
      data: {
        userId, enemyName, isWin, goldGained, expGained,
        logDetails: battleLogsStr.substring(0, 5000)
      }
    });

    const pushUpdates = async (prefix: string, amount: number, isSet: boolean = false) => {
      const res = await updateAchievementProgress(userId, prefix, amount, isSet, tx);
      updatedAchievements.push(...res);
    };

    if (isWin) {
      await updateQuestProgress(userId, "kill_beast", 1, false, tx);
      await pushUpdates("hunt", 1, false);
      await pushUpdates("slayer", 1, false);
      if (modifiers.isBoss) await pushUpdates("boss", 1, false);
      if (engineResult.finalHp < combatStats.final.maxHp * 0.2) await pushUpdates("survive", 1, false);
    }

    if (goldGained > 0) await pushUpdates("gold", goldGained, false);

    // Tracking from engine
    const track = engineResult.achievementTracking;
    if (track) {
      if (track.crits > 0) await pushUpdates("crit", track.crits, false);
      if (track.burns > 0) await pushUpdates("burn", track.burns, false);
      if (track.poisons > 0) await pushUpdates("poison", track.poisons, false);
      if (track.lifesteals > 0) await pushUpdates("lifesteal", track.lifesteals, false);
      if (track.combos > 0) await pushUpdates("combo", track.combos, false);
    }

    if (user.beasts && user.beasts.length > 0) {
      await pushUpdates("pet", user.beasts.length, true);
      const legendaryCount = user.beasts.filter((b: any) => b.rarity === "LEGENDARY").length;
      await pushUpdates("petlegendary", legendaryCount, true);
    }

    // ─── PET EXP GAIN ───
    if (engineResult.combatSummary.petExpPool) {
      for (const [petId, amount] of engineResult.combatSummary.petExpPool.entries()) {
        const res = await addPetExp(petId, amount, tx);
        if (res && res.leveledUp) {
          const pet = user.beasts.find((b: any) => b.id === petId);
          if (pet) displayedLogs.push(`🎊 **${pet.name}** đã thăng lên **Cấp ${res.newLevel}**!`);
        }
      }
    }
  });

  const notifications = buildAchievementNotifications(updatedAchievements);
  const formattedProgress = formatAchievementProgress(updatedAchievements);

  return {
    isWin,
    enemyName,
    battleLogs: engineResult.fullLogs.flatMap((l: any) => l.events),
    goldGained,
    expGained,
    hpLost: user.currentHp - engineResult.finalHp,
    hospitalUntil: hospitalUntil || undefined,
    finalHp: engineResult.finalHp,
    playerMaxHp: combatStats.final.maxHp,
    finalEnemyHp: engineResult.finalEnemyHp,
    enemyMaxHp: engineResult.enemyMaxHp,
    levelsGained,
    newStats: finalStats,
    combatSummary: engineResult.combatSummary,
    achievementData: {
      updatedAchievements,
      completedAchievements: notifications.completedAchievements,
      notificationSent: notifications.notificationSent,
      embedPayload: notifications.embedPayload,
      formattedProgress
    }
  };
}

export async function handleAutoHunt(
  userId: string,
  potionCount: number = 0
) {
  const user = await getUserWithRelations(userId);
  if (!user) throw new Error("Không tìm thấy người chơi.");

  if (user.hospitalUntil && user.hospitalUntil > new Date()) {
    throw new Error("Bạn vẫn đang hồi phục ở bệnh viện.");
  }
  if (user.currentHp <= 0) {
    throw new Error("Bạn không còn HP! Hãy đợi hồi phục hoặc dùng vật phẩm.");
  }

  // ── Charge Check & Deduction ──
  const lastChargeAt = user.lastAutoHuntChargeAt?.getTime() || user.createdAt.getTime();
  const elapsed = Date.now() - lastChargeAt;
  let charges = user.autoHuntCharges ?? 3;
  if (elapsed >= 2 * 60 * 60 * 1000) {
    const gained = Math.floor(elapsed / (2 * 60 * 60 * 1000));
    charges = Math.min(3, charges + gained);
  }
  if (charges <= 0) {
    throw new Error("Bạn không còn lượt Săn tự động. (1 lượt mỗi 2 giờ)");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      autoHuntCharges: charges - 1,
      lastAutoHuntChargeAt: user.lastAutoHuntChargeAt ?? new Date(),
      lastAutoHuntAt: new Date(),
    },
  });

  // 1. Prepare Stats
  const equippedItems = user.inventory.filter((i: any) => i.isEquipped);
  const equippedPets = user.beasts.filter((b: any) => b.isEquipped);
  const combatStats = computeCombatStats(user, equippedItems, equippedPets);

  const maxFights = 20;
  let currentHp = user.currentHp;
  const potionItemOwned = user.inventory.find((i: any) => i.name === "Potion");
  let potionLeft = Math.min(potionCount, (potionItemOwned?.quantity || 0));
  const initialPotions = potionLeft;

  let totalGold = 0;
  let totalExp = 0;
  let totalKills = 0;
  let totalTurns = 0;
  const combatLogs: string[] = [];

  // Tracking for bulk updates
  const tracking = {
    crits: 0,
    burns: 0,
    poisons: 0,
    lifesteals: 0,
    combos: 0,
    petExpPool: new Map<string, number>()
  };

  let currentUserState = {
    level: user.level,
    exp: user.exp,
    str: user.str,
    agi: user.agi,
    luck: user.luck,
    maxHp: user.maxHp
  };

  for (let i = 0; i < maxFights; i++) {
    // A. Generate Monster
    const lvl = Math.max(1, currentUserState.level + randomInt(1, 3));
    const isNewbie = lvl < 5;
    const enemyMaxHp = (50 + (lvl * 15)) * (isNewbie ? 0.7 : 1);
    const enemyName = `Quái thú cấp ${lvl}`;

    // B. Simulate Combat
    const engineResult = await simulateCombat({
      player: {
        hp: currentHp,
        maxHp: currentUserState.maxHp,
        atk: combatStats.final.attack,
        def: combatStats.final.defense,
        spd: combatStats.final.speed,
        critRate: (currentUserState.luck * 0.005) + (combatStats.extra?.critRateBonus || 0),
        pets: equippedPets,
        skills: user.skills.filter((s: any) => s.isEquipped),
        title: user.title
      },
      enemy: {
        name: enemyName,
        hp: enemyMaxHp,
        maxHp: enemyMaxHp,
        atk: 5 + (lvl * 4),
        def: 2 + (lvl * 2),
        spd: 5 + (lvl * 2)
      },
      accessories: {
        effects: combatStats.extra?.activeUniqueEffects || [],
        uniquePowers: (combatStats.extra as any)?.uniquePowers || {},
        sets: combatStats.extra?.activeSets || []
      }
    });

    // C. Results Logic
    const isWin = engineResult.isWin;
    const turns = engineResult.fullLogs.length;
    currentHp = engineResult.finalHp;

    if (isWin) {
      const goldTitleMult = getTitleGoldMultiplier(user.title);
      const newbieRewardMult = currentUserState.level < 5 ? 2 : 1;
      const g = Math.floor((randomInt(20, 50) + (lvl * 10)) * newbieRewardMult * goldTitleMult);
      const e = Math.floor((10 + (lvl * 5)) * newbieRewardMult);

      totalGold += g;
      totalExp += e;
      totalKills++;
      totalTurns += turns;

      if (combatLogs.length < 10) {
        combatLogs.push(`🐺 ${enemyName} - ${turns} lượt → +${e} EXP, +${g} vàng`);
      }

      if (engineResult.achievementTracking) {
        tracking.crits += engineResult.achievementTracking.crits;
        tracking.burns += engineResult.achievementTracking.burns;
        tracking.poisons += engineResult.achievementTracking.poisons;
        tracking.lifesteals += engineResult.achievementTracking.lifesteals;
        tracking.combos += engineResult.achievementTracking.combos;

        if (engineResult.combatSummary.petExpPool) {
          for (const [pid, amt] of engineResult.combatSummary.petExpPool.entries()) {
            tracking.petExpPool.set(pid, (tracking.petExpPool.get(pid) || 0) + amt);
          }
        }
      }

      const lvlData = applyLevelUps({ ...currentUserState, currentHp, exp: currentUserState.exp + e });
      if (lvlData.levelsGained > 0) {
        currentUserState = { ...lvlData.updated };
        currentHp = currentUserState.maxHp;
      } else {
        currentUserState.exp += e;
      }
    } else {
      // Lost or tied — force HP to 0 if dead
      currentHp = currentHp <= 0 ? 0 : currentHp;
      break;
    }

    // D. Auto Potion Logic
    if (currentHp <= currentUserState.maxHp * 0.3) {
      if (potionLeft > 0) {
        currentHp = Math.min(currentUserState.maxHp, currentHp + 50);
        potionLeft--;
      } else {
        break;
      }
    }

    if (currentHp <= 0) break;
  }

  let updatedAchievements: any[] = [];
  await prisma.$transaction(async (tx) => {
    if (initialPotions - potionLeft > 0 && potionItemOwned) {
      if (potionItemOwned.quantity <= (initialPotions - potionLeft)) {
        await tx.item.delete({ where: { id: potionItemOwned.id } });
      } else {
        await tx.item.update({
          where: { id: potionItemOwned.id },
          data: { quantity: { decrement: (initialPotions - potionLeft) } }
        });
      }
    }

    await tx.user.update({
      where: { id: userId },
      data: {
        gold: { increment: totalGold },
        exp: currentUserState.exp,
        level: currentUserState.level,
        str: currentUserState.str,
        agi: currentUserState.agi,
        luck: currentUserState.luck,
        maxHp: currentUserState.maxHp,
        currentHp: currentHp,
        hospitalUntil: currentHp <= 0 ? new Date(Date.now() + 30 * 60 * 1000) : null
      }
    });

    const pushUpdates = async (prefix: string, amount: number, isSet: boolean = false) => {
      const res = await updateAchievementProgress(userId, prefix, amount, isSet, tx);
      updatedAchievements.push(...res);
    };

    if (totalKills > 0) {
      await updateQuestProgress(userId, "kill_beast", totalKills, false, tx);
      await pushUpdates("hunt", totalKills, false);
      await pushUpdates("slayer", totalKills, false);
    }
    if (totalGold > 0) await pushUpdates("gold", totalGold, false);
    if (tracking.crits > 0) await pushUpdates("crit", tracking.crits, false);
    if (tracking.burns > 0) await pushUpdates("burn", tracking.burns, false);
    if (tracking.poisons > 0) await pushUpdates("poison", tracking.poisons, false);
    if (tracking.lifesteals > 0) await pushUpdates("lifesteal", tracking.lifesteals, false);
    if (tracking.combos > 0) await pushUpdates("combo", tracking.combos, false);

    if (user.beasts?.length > 0) {
      await pushUpdates("pet", user.beasts.length, true);
      const legendaryCount = user.beasts.filter((b: any) => b.rarity === "LEGENDARY").length;
      await pushUpdates("petlegendary", legendaryCount, true);
    }

    // ─── PET EXP GAIN (Auto Hunt) ───
    for (const [petId, amount] of tracking.petExpPool.entries()) {
      const res = await addPetExp(petId, amount, tx);
      if (res && res.leveledUp) {
        const pet = user.beasts.find((b: any) => b.id === petId);
        if (pet) combatLogs.push(`🎊 **${pet.name}** đã thăng lên **Cấp ${res.newLevel}**!`);
      }
    }
  });

  const notifications = buildAchievementNotifications(updatedAchievements);

  return {
    totalKills,
    totalGold,
    totalExp,
    potionsUsed: initialPotions - potionLeft,
    logs: combatLogs,
    achievements: notifications.completedAchievements,
    finalHp: currentHp,
    maxHp: currentUserState.maxHp,
    newLevel: currentUserState.level,
    levelsGained: currentUserState.level - user.level
  };
}
