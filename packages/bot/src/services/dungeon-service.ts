/**
 * dungeon-service.ts
 * Implements a full multi-floor dungeon system.
 * Minimum 10 floors, events, scaling, and restraints.
 */

import { simulateCombat, computeCombatStats, calculatePetStatBonus, applyRelicsOnKill } from "@game/core";
import { type BattleResult } from "@game/core";
import { getUserWithRelations } from "./user-service";
import { Relic, getRandomRelic } from "@game/core";
import { useItem } from "./item-system";
import { updateAchievementProgress } from "./achievement-service";

export type PreBossEvent = "fight" | "rest" | "grind";

export interface DungeonState {
  currentFloor: number;
  hp: number;
  potion: {
    type: string | null;
    qty: number;
  };
  buffs: any[];
  relics: Relic[];
  results: BattleResult[];
  floorLogs: string[];
  isDead: boolean;
  goldGathered: number;
  expGathered: number;
  grindCount: number;
}

export interface DungeonRunOptions {
  potionType?: string;
  potionQty?: number;
  preBossChoices?: PreBossEvent[];
}

export const DUNGEON_CONFIG = {
  totalFloors: 10,
  bossFloors: [4, 8, 10],
  eventFloors: [9] // Floor 9 is literally an event floor before boss 10
};

// 5. SCALING LOGIC
export function generateEnemy(floor: number, isBoss: boolean, isElite: boolean, grindCount: number) {
  let hp = 100;
  let atk = 15;
  let def = 5;
  let spd = 10;
  let name = `Quái vật (Tầng ${floor})`;

  if (isBoss) {
    hp = 400;
    atk = 35;
    def = 25;
    spd = 18;
    name = `BOSS Tầng ${floor}`;
  } else if (isElite) {
    hp = 250;
    atk = 25;
    def = 15;
    spd = 15;
    name = `Tinh Nhuệ (Tầng ${floor})`;
  }

  // Base floor scaling
  const floorScale = 1 + floor * 0.1;
  const floorAtkScale = 1 + floor * 0.08;

  // Grind scaling
  const grindScale = 1 + grindCount * 0.15; // 15% stronger per repeat

  return {
    name,
    hp: Math.floor(hp * floorScale * grindScale),
    maxHp: Math.floor(hp * floorScale * grindScale),
    atk: Math.floor(atk * floorAtkScale * grindScale),
    def: Math.floor(def * floorScale * grindScale),
    spd: Math.floor(spd * (isBoss ? 1.2 : 1)),
    isBoss
  };
}

export function generateFloorEnemies(floor: number, isBoss: boolean, grindCount: number) {
  if (isBoss) {
    return [generateEnemy(floor, true, false, grindCount)];
  }
  const count = Math.floor(Math.random() * 3) + 3; // 3 to 5 enemies
  const enemies = [];
  for (let i = 0; i < count; i++) {
    enemies.push(generateEnemy(floor, false, false, grindCount));
  }
  return enemies;
}

// 4. POTION SYSTEM
export function usePotion(state: DungeonState, maxHp: number) {
  useItem(state, { id: "potion", name: "Bình Máu", type: "heal", value: Math.floor(maxHp * 0.3) }, maxHp);
}

export function applyRandomRelic(state: DungeonState) {
  const relic = getRandomRelic(state.currentFloor);
  state.relics.push(relic);
  state.floorLogs.push(`Nhận được thánh tích mới: [${relic.rarity}] ${relic.name} - ${relic.desc}`);
}

// 6. EXAMPLE INTEGRATION WITH COMBAT ENGINE
async function runCombat(state: DungeonState, user: any, enemyObj: any) {
  state.floorLogs.push(`Bắt đầu chiến đấu với ${enemyObj.name} (HP: ${enemyObj.hp})...`);

  const equippedPets = user.beasts?.filter((b: any) => b.isEquipped) || [];
  const equippedItems = user.inventory?.filter((i: any) => i.isEquipped) || [];
  const combatStats = computeCombatStats(user, equippedItems, equippedPets);

  const playerStats = {
    hp: state.hp,
    maxHp: combatStats.final.maxHp,
    atk: combatStats.final.attack,
    def: combatStats.final.defense,
    spd: combatStats.final.speed,
    critRate: (user.luck * 0.005) + (combatStats.extra?.critRateBonus || 0),
    pets: equippedPets,
    skills: user.skills?.filter((s: any) => s.isEquipped) || [],
    title: user.title
  };

  const result = await simulateCombat({
    player: playerStats,
    enemy: enemyObj,
    maxTurns: 50,
    relics: state.relics,
    accessories: {
      effects: combatStats.extra?.activeUniqueEffects || [],
      uniquePowers: (combatStats.extra as any)?.uniquePowers || {},
      sets: combatStats.extra?.activeSets || []
    },
    onTurnUpdate: (ctx_update, fullCtx) => {
      // Auto potion under 30% HP
      if (fullCtx && fullCtx.player.hp < fullCtx.player.maxHp * 0.3) {
         if (state.potion.qty > 0) {
            const heal = Math.floor(user.maxHp * 0.3);
            state.potion.qty--;
            state.hp = Math.min(user.maxHp, state.hp + heal);
            fullCtx.player.hp = Math.min(fullCtx.player.maxHp, fullCtx.player.hp + heal);
            state.floorLogs.push(`🧪 [Auto-Potion] Hồi phục **${heal}** HP! (Còn lại: ${state.potion.qty})`);
            
            // Add to engine logs for visibility
            const lastLog = fullCtx.fullLogs[fullCtx.fullLogs.length - 1];
            if (lastLog) {
              lastLog.events.push(`🧪 Tự động dùng Potion, hồi **${heal}** HP!`);
            }
         }
      }
    }
  });

  state.hp = result.finalHp;
  state.results.push(result);

  if (!result.isWin) {
    state.isDead = true;
    state.hp = 0;
    state.floorLogs.push(`Thất bại trước ${enemyObj.name}. Bị loại khỏi hầm ngục!`);
  } else {
    state.floorLogs.push(`Chiến thắng ${enemyObj.name}! HP còn lại: ${state.hp}/${user.maxHp}`);
  }
}

// 2. MAIN DUNGEON RUN & 3. PRE-BOSS EVENT HANDLER
export async function handleDungeonRun(userId: string, dungeonId: string, options: DungeonRunOptions = {}) {
  const user = await getUserWithRelations(userId);
  if (!user) throw new Error("User not found");

  const state: DungeonState = {
    currentFloor: 1,
    hp: user.currentHp || user.maxHp,
    potion: {
      type: options.potionType || null,
      qty: Math.min(options.potionQty || 0, 10)
    },
    buffs: [],
    relics: [],
    results: [],
    floorLogs: [],
    isDead: false,
    goldGathered: 0,
    expGathered: 0,
    grindCount: 0
  };

  const choices = options.preBossChoices || ["rest", "fight", "rest"];
  let choiceIndex = 0;

  // Pre-Boss Event Handler
  const handleEvent = async (floorLabel: number) => {
    const choice = choices[choiceIndex++] || "rest";
    state.floorLogs.push(`--- SỰ KIỆN TRƯỚC BOSS (Tầng ${floorLabel}) ---`);
    state.floorLogs.push(`Lựa chọn: ${choice.toUpperCase()}`);

    if (choice === "fight") {
      const eliteEnemy = generateEnemy(floorLabel, false, true, state.grindCount);
      await runCombat(state, user, eliteEnemy);
      if (!state.isDead) {
        state.goldGathered += 500;
        applyRandomRelic(state);
      }
    } else if (choice === "rest") {
      const heal = Math.floor(user.maxHp * 0.4);
      state.hp = Math.min(user.maxHp, state.hp + heal);
      state.floorLogs.push(`Nghỉ ngơi, hồi ${heal} HP. HP hiện tại: ${state.hp}/${user.maxHp}`);
    } else if (choice === "grind") {
      state.currentFloor--;
      state.grindCount++;
      state.floorLogs.push(`Quyết định cày cuốc! Trở lại tầng ${state.currentFloor}. Kẻ địch sẽ mạnh hơn!`);
    }
  };

  const eventsDone: Record<number, boolean> = { 4: false, 8: false, 10: false };

  while (state.currentFloor <= 10 && !state.isDead) {
    state.floorLogs.push(`===== BẮT ĐẦU TẦNG ${state.currentFloor} =====`);
    
    // Potion usage between floors if injured
    if (state.hp < user.maxHp * 0.5) {
      usePotion(state, user.maxHp);
    }

    if (state.currentFloor === 4 && !eventsDone[4]) {
      eventsDone[4] = true;
      await handleEvent(4);
      if (state.currentFloor < 4) continue;
    }

    if (state.currentFloor === 8 && !eventsDone[8]) {
      eventsDone[8] = true;
      await handleEvent(8);
      if (state.currentFloor < 8) continue;
    }

    if (state.currentFloor === 9) {
      // Floor 9 is exclusively the event before Floor 10 Boss
      if (!eventsDone[10]) {
        eventsDone[10] = true;
        await handleEvent(10);
        if (state.currentFloor < 9) continue;
      }
      state.currentFloor++;
      continue;
    }

    const isBossFloor = state.currentFloor === 4 || state.currentFloor === 8 || state.currentFloor === 10;
    const enemies = generateFloorEnemies(state.currentFloor, isBossFloor, state.grindCount);

    for (const enemy of enemies) {
      await runCombat(state, user, enemy);
      if (state.isDead) break;
      
      // On kill relic triggers
      applyRelicsOnKill(state, state.relics, user.maxHp);

      // Non-boss: allow item use after enemy dies
      if (!isBossFloor && state.potion.qty > 0 && state.hp < user.maxHp * 0.5) {
        usePotion(state, user.maxHp);
      }
    }

    if (state.isDead) break;

    // Floor Clear Rewards
    const goldReward = 100 * state.currentFloor;
    const expReward = 50 * state.currentFloor;
    state.goldGathered += goldReward;
    state.expGathered += expReward;
    state.floorLogs.push(`Hoàn thành tầng ${state.currentFloor}! Nhận ${goldReward} vàng, ${expReward} EXP.`);
    
    if (Math.random() < 0.2) {
      applyRandomRelic(state);
    }

    state.currentFloor++;
  }

  // Achievement bulk updates for dungeon results
  try {
     let trackCrits = 0; let trackBurns = 0; let trackPoisons = 0; let trackLifesteals = 0; let trackCombos = 0; let slays = 0; let bossSlays = 0;
     for (const res of state.results) {
         if (res.isWin) slays++;
         if (res.isBossKill) bossSlays++;
         if (res.achievementTracking) {
            trackCrits += res.achievementTracking.crits;
            trackBurns += res.achievementTracking.burns;
            trackPoisons += res.achievementTracking.poisons;
            trackLifesteals += res.achievementTracking.lifesteals;
            trackCombos += res.achievementTracking.combos;
         }
     }
     
     if (slays > 0) await updateAchievementProgress(userId, "slayer", slays);
     if (bossSlays > 0) await updateAchievementProgress(userId, "boss", bossSlays);
     if (trackCrits > 0) await updateAchievementProgress(userId, "crit", trackCrits);
     if (trackBurns > 0) await updateAchievementProgress(userId, "burn", trackBurns);
     if (trackPoisons > 0) await updateAchievementProgress(userId, "poison", trackPoisons);
     if (trackLifesteals > 0) await updateAchievementProgress(userId, "lifesteal", trackLifesteals);
     if (trackCombos > 0) await updateAchievementProgress(userId, "combo", trackCombos);
     if (state.goldGathered > 0) await updateAchievementProgress(userId, "gold", state.goldGathered);
     
     if (state.currentFloor > 10 && !state.isDead) { // Cleared dungeon
        await updateAchievementProgress(userId, "dungeon", 1);
        if (user.level === 50) await updateAchievementProgress(userId, "ultimate", 1);
     }
  } catch (e) {
     console.error("Dungeon achievements tracking error", e);
  }

  state.floorLogs.push(`--- KẾT THÚC HẦM NGỤC ---`);
  if (state.isDead) {
    state.floorLogs.push(`Thất bại: Chết tại tầng ${state.currentFloor}.`);
  } else {
    state.floorLogs.push(`Thành công: Đã vượt qua 10 tầng!`);
  }

  return {
    isSuccess: state.currentFloor > 10 && !state.isDead,
    finalHp: state.hp,
    gold: state.goldGathered,
    exp: state.expGathered,
    state
  };
}
