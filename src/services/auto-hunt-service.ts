import { prisma } from "./prisma";
import { User, ItemType } from "@prisma/client";

/**
 * REWARD SERVICE
 * Handles calculations for Gold, Exp with RNG variance, Jackpot, and Streaks.
 */
export class RewardCalculator {
  private static readonly VARIANCE_MIN = 0.85;
  private static readonly VARIANCE_MAX = 1.45;
  private static readonly JACKPOT_CHANCE = 0.05; // 5%
  private static readonly JACKPOT_MULT = 2.5;
  private static readonly STREAK_BONUS_X = 0.04; 
  private static readonly STREAK_CAP = 2.0;

  /**
   * Calculates the final reward for a single fight.
   */
  static calculate(options: {
    baseReward: number;
    streak: number;
    fightIndex: number; // 0 to 19
    isAuto: boolean;
  }) {
    const { baseReward, streak, fightIndex, isAuto } = options;

    // 1. Variance
    const variance = Math.random() * (this.VARIANCE_MAX - this.VARIANCE_MIN) + this.VARIANCE_MIN;
    
    // 2. Jackpot
    const isJackpot = Math.random() < this.JACKPOT_CHANCE;
    const jackpotMult = isJackpot ? this.JACKPOT_MULT : 1.0;

    // 3. Streak Bonus
    const streakBonus = Math.min(this.STREAK_CAP, 1 + (streak * this.STREAK_BONUS_X));

    // 4. Base Calculation
    let reward = baseReward * variance * jackpotMult * streakBonus;

    // 5. Anti-AFK Diminishing Returns (Auto Hunt only)
    if (isAuto) {
      // Efficiency factor (0.75 base) * Diminishing returns (2.5% per fight)
      const efficiency = 0.75;
      const diminishingFactor = Math.max(0.5, 1 - (fightIndex * 0.025));
      reward *= (efficiency * diminishingFactor);
    }

    return {
      amount: Math.floor(reward),
      isJackpot
    };
  }
}

/**
 * AUTO HUNT SERVICE
 * Optimized combat estimation with charge and cooldown management.
 */
export class AutoHuntService {
  private static readonly MAX_CHARGES = 3;
  private static readonly CHARGE_REFILL_MS = 2 * 60 * 60 * 1000; // 2 hours
  private static readonly MIN_COOLDOWN_MS = 60 * 1000; // 1 minute
  private static readonly MAX_COOLDOWN_MS = 120 * 1000; // 2 minutes
  private static readonly SCALING_FACTOR = 0.04;
  private static readonly DEATH_PENALTY = 0.4; // Lose 40%

  /**
   * Updates and returns the current available charges for a user.
   */
  static async getUpdatedCharges(user: any): Promise<number> {
    const lastChargeAt = user.lastAutoHuntChargeAt?.getTime() || user.createdAt.getTime();
    const elapsed = Date.now() - lastChargeAt;
    
    if (elapsed < this.CHARGE_REFILL_MS) return user.autoHuntCharges ?? this.MAX_CHARGES;

    const newChargesGained = Math.floor(elapsed / this.CHARGE_REFILL_MS);
    if (newChargesGained <= 0) return user.autoHuntCharges ?? this.MAX_CHARGES;

    const updatedCharges = Math.min(this.MAX_CHARGES, (user.autoHuntCharges ?? 0) + newChargesGained);
    const newChargeTime = new Date(lastChargeAt + (newChargesGained * this.CHARGE_REFILL_MS));

    // Update DB silently
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        autoHuntCharges: updatedCharges,
        lastAutoHuntChargeAt: newChargeTime
      } as any
    });

    return updatedCharges;
  }

  /**
   * Main Auto Hunt Session Logic
   */
  static async runSession(
    user: any, 
    stats: any, // CombatStatsBlock from computeCombatStats
    baseEnemy: { atk: number, hp: number, def: number, lvl: number }
  ) {
    // 1. Validations (Charges & Cooldown)
    const charges = await this.getUpdatedCharges(user);
    if (charges <= 0) throw new Error("Bạn không còn lượt Săn tự động. (1 lượt mỗi 2 giờ)");

    const lastHuntAt = user.lastAutoHuntAt?.getTime() || 0;
    const cooldownNeeded = this.MIN_COOLDOWN_MS + Math.random() * (this.MAX_COOLDOWN_MS - this.MIN_COOLDOWN_MS);
    if (Date.now() - lastHuntAt < cooldownNeeded) {
      throw new Error("Hệ thống đang nghỉ ngơi, vui lòng chờ trong giây lát.");
    }

    // 2. Consume Charge
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        autoHuntCharges: charges - 1,
        lastAutoHuntAt: new Date()
      } as any
    });

    const playerFinalAtk = stats.final.attack;
    const playerFinalDef = stats.final.defense;
    const playerFinalMaxHp = stats.final.maxHp;

    // Incorporation of Crit into Power calculation
    const critRate = (stats.base.luck * 0.005) + (stats.extra?.critRateBonus || 0);
    const critDamageMult = stats.multiplier.critDamage || 1.5;
    const effectiveAtk = playerFinalAtk * (1 + (critRate * (critDamageMult - 1)));

    // 3. Simulation Loop
    let accumulatedGold = 0;
    let accumulatedExp = 0;
    let currentHp = user.currentHp;
    let potionsUsed = 0;
    let streak = 0;
    const maxFights = 20;
    const summary = [];

    const potionStack = user.inventory.find((i: any) => i.type === "POTION" || i.type === ItemType.POTION);

    for (let n = 0; n < maxFights; n++) {
      // Difficulty Scaling
      const enemyAtk = baseEnemy.atk * (1 + n * this.SCALING_FACTOR);
      const enemyHp = baseEnemy.hp * (1 + n * this.SCALING_FACTOR);
      const enemyLvl = baseEnemy.lvl;

      // Probability check (Using Effective ATK including Crit)
      const powerRatio = (effectiveAtk / enemyAtk) * 0.7 + (playerFinalMaxHp / enemyHp) * 0.3;
      const winRate = Math.min(0.95, Math.max(0.05, powerRatio / 1.5));
      
      const isAmbush = Math.random() < 0.10;
      const isWin = Math.random() < winRate;

      if (!isWin) {
        return this.finalize(user, accumulatedGold, accumulatedExp, n, 0, potionsUsed, "DIED", potionStack);
      }

      // Damage Estimation (Using Pipeline Defense logic)
      const reduction = playerFinalDef / (playerFinalDef + 100);
      const cappedReduction = Math.min(0.75, Math.max(0, reduction));
      const baseTurnDmg = (enemyAtk * 4) * (1 - cappedReduction);
      
      let damage = baseTurnDmg * (1.1 - winRate);
      
      // Incorporate Lifesteal (Reduces effective damage taken by HP sustain)
      const lifestealFactor = (stats.multiplier.lifesteal - 1.0); // e.g. 1.2 LS -> 0.2
      if (lifestealFactor > 0) {
        // Heal back a portion based on damage dealt
        const healEffective = (effectiveAtk / enemyAtk) * 50 * lifestealFactor; 
        damage = Math.max(0, damage - healEffective);
      }

      if (isAmbush) damage *= 1.5;
      currentHp -= damage;

      // Potion Usage (< 30% HP)
      const currentAvailablePotions = (potionStack?.quantity || 0) - potionsUsed;
      if (currentHp < playerFinalMaxHp * 0.3 && currentAvailablePotions > 0 && potionsUsed < 10) {
        const healPct = (potionStack?.power || 25) / 100;
        currentHp = Math.min(playerFinalMaxHp, currentHp + (playerFinalMaxHp * healPct));
        potionsUsed++;
      }

      if (currentHp <= 0) {
        return this.finalize(user, accumulatedGold, accumulatedExp, n, 0, potionsUsed, "DIED", potionStack);
      }

      // Reward Calculation
      const gold = RewardCalculator.calculate({ baseReward: enemyLvl * 50, streak: ++streak, fightIndex: n, isAuto: true });
      const exp = RewardCalculator.calculate({ baseReward: enemyLvl * 10, streak: streak, fightIndex: n, isAuto: true });
      
      accumulatedGold += gold.amount;
      accumulatedExp += exp.amount;

      summary.push({ n: n+1, gold: gold.amount, jackpot: gold.isJackpot, hp: Math.floor(currentHp) });
    }

    return this.finalize(user, accumulatedGold, accumulatedExp, maxFights, currentHp, potionsUsed, "COMPLETED", summary);
  }

  private static async finalize(user: any, gold: number, exp: number, fights: number, hp: number, potions: number, status: string, extra: any) {
    const finalGold = status === "DIED" ? Math.floor(gold * (1 - this.DEATH_PENALTY)) : gold;
    const finalExp = status === "DIED" ? Math.floor(exp * (1 - this.DEATH_PENALTY)) : exp;

    const potionStack = (status === "DIED" || status === "COMPLETED") ? extra : user.inventory.find((i: any) => i.type === "POTION" || i.type === ItemType.POTION);

    // Apply DB changes
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          gold: { increment: finalGold },
          exp: { increment: finalExp },
          currentHp: Math.max(0, Math.floor(hp)),
        }
      }),
      // Decrement potions if used
      ...(potions > 0 && potionStack ? [
        prisma.item.update({
          where: { id: potionStack.id },
          data: { quantity: { decrement: potions } }
        })
      ] : [])
    ]);

    return {
      status,
      fightsCompleted: fights,
      goldGained: finalGold,
      expGained: finalExp,
      hpRemaining: hp,
      potionsUsed: potions,
      logs: status === "COMPLETED" ? extra : [] // Using extra as summary/logs container
    };
  }
}
