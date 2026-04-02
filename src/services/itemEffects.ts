import type { Item } from "@prisma/client";
import { ItemType } from "@prisma/client";
import { HOSPITAL_COOLDOWN_MS } from "../constants/config";
import { randomInt } from "./rng";
import { consumeAllInventoryItem, consumeInventoryItem } from "./inventory-service";

export type ScoutLensPredictedEvent = "combat" | "chest" | "catch";

export interface HuntItemEffectsContext {
  // Stat overrides (temporary for this hunt)
  str: number;
  agi: number;
  luck: number;

  // Combat modifiers
  playerDamageMultiplier: number; // hunters_mark
  enemyStrengthMultiplier: number; // golden_contract
  topPetBonusMultiplier: number; // spirit_bond (base 0.5 => 0.8)

  // Rewards modifiers
  goldMultiplier: number; // risk_coin + golden_contract gold
  expMultiplier: number; // golden_contract exp

  // Encounter modifiers (for beast generation)
  beastBaitLuckBonus: number;

  // Utility flags
  scoutLensActive: boolean;
}

export interface ApplyBeforeHuntResult {
  ctx: HuntItemEffectsContext;
  shouldStopHunt: boolean;
  stopMessage?: string;
  scoutLensPredictedEvent?: ScoutLensPredictedEvent;
}

function clampNonNegative(n: number): number {
  return Math.max(0, n);
}

function rollRiskCoinMultiplier(): number {
  // 0x, 1.5x, 2x, 5x
  const options = [0, 1.5, 2, 5];
  const idx = randomInt(0, options.length - 1);
  return options[idx] ?? options[0]!;
}

export async function applyBeforeHuntItemEffects(params: {
  db: any;
  now: Date;
  user: any; // getUserWithRelations() result (includes inventory)
  scoutLensToUse?: number; // how many Scout Lens to consume for this hunt
}): Promise<ApplyBeforeHuntResult> {
  const { db, now, user } = params;

  // Defaults: base stats and no modifiers.
  let effectiveStr = user.str;
  let effectiveAgi = user.agi;
  let effectiveLuck = user.luck;

  let playerDamageMultiplier = 1;
  let enemyStrengthMultiplier = 1;
  let topPetBonusMultiplier = 0.5;

  let goldMultiplier = 1;
  let expMultiplier = 1;

  let beastBaitLuckBonus = 0;
  let scoutLensActive = false;

  const inv: Item[] = user.inventory ?? [];

  const findByName = (name: string): Item | undefined => inv.find((i) => i.name === name);
  const take = {
    scout_lens: findByName("Scout Lens"),
    risk_coin: findByName("Risk Coin"),
    blood_vial: findByName("Blood Vial"),
    hunters_mark: findByName("Hunter's Mark"),
    bag_upgrade: findByName("Reinforced Bag"),
    beast_bait: findByName("Beast Bait"),
    golden_contract: findByName("Golden Contract"),
    chaos_orb: findByName("Chaos Orb"),
    spirit_bond: findByName("Spirit Bond"),
  };

  // spirit_bond duration: stored on User.spiritBondHuntsLeft (DB)
  const beforeSpiritLeft: number = user.spiritBondHuntsLeft ?? 0;
  if (beforeSpiritLeft > 0) {
    topPetBonusMultiplier = 0.8;
  }

  return db.$transaction(async (tx: any) => {
    let shouldStopHunt = false;
    let stopMessage: string | undefined = undefined;

    // Scout Lens: only consume when explicitly requested by hunt option.
    const toUse = Math.max(0, params.scoutLensToUse ?? 0);
    if (take.scout_lens && toUse > 0 && take.scout_lens.quantity > 0) {
      const consumeCount = Math.min(toUse, take.scout_lens.quantity);
      await consumeInventoryItem(tx, take.scout_lens, consumeCount);
      scoutLensActive = true;
    }

    // Spirit Bond: add duration (consumed per purchase quantity)
    // Each Spirit Bond item gives +3 hunts of top pet bonus.
    const spiritQty = take.spirit_bond?.quantity ?? 0;
    let spiritLeft = beforeSpiritLeft;
    if (spiritQty > 0) {
      spiritLeft += spiritQty * 3;
      await consumeAllInventoryItem(tx, take.spirit_bond!);
      await tx.user.update({
        where: { id: user.id },
        data: { spiritBondHuntsLeft: spiritLeft },
      });
    }

    // Recompute top pet multiplier based on updated spiritLeft,
    // then decrement by 1 for this hunt invocation.
    if (spiritLeft > 0) topPetBonusMultiplier = 0.8;
    if (spiritLeft > 0) {
      await tx.user.update({
        where: { id: user.id },
        data: { spiritBondHuntsLeft: spiritLeft - 1 },
      });
      spiritLeft = spiritLeft - 1;
    }

    // Risk Coin: consume per hunt and roll gold multiplier now.
    if (take.risk_coin && take.risk_coin.quantity > 0) {
      const rolled = rollRiskCoinMultiplier();
      await consumeInventoryItem(tx, take.risk_coin, 1);
      goldMultiplier *= rolled;
    }

    // Blood Vial: lose 10 HP, gain +5 STR (consumed per hunt)
    if (take.blood_vial && take.blood_vial.quantity > 0) {
      await consumeInventoryItem(tx, take.blood_vial, 1);
      effectiveStr += take.blood_vial.power; // +5 STR

      const hpAfter = user.currentHp - 10;
      if (hpAfter <= 0) {
        shouldStopHunt = true;
        stopMessage = "Máu của bạn đã xuống quá thấp khi dùng Bình Máu. Bạn bị ngất và đang hồi phục tại bệnh viện.";
        await tx.user.update({
          where: { id: user.id },
          data: {
            currentHp: 1,
            lastHpUpdatedAt: now,
            hospitalUntil: new Date(now.getTime() + HOSPITAL_COOLDOWN_MS),
          },
        });
        return { shouldStopHunt, stopMessage };
      }

      await tx.user.update({
        where: { id: user.id },
        data: { currentHp: hpAfter, lastHpUpdatedAt: now },
      });
    }

    if (shouldStopHunt) return { shouldStopHunt, stopMessage };

    // Hunter's Mark: +30% player damage in this hunt.
    if (take.hunters_mark && take.hunters_mark.quantity > 0) {
      await consumeInventoryItem(tx, take.hunters_mark, 1);
      playerDamageMultiplier *= 1 + take.hunters_mark.power / 100;
    }

    // Beast Bait: luck bonus for rare beast generation.
    if (take.beast_bait && take.beast_bait.quantity > 0) {
      await consumeInventoryItem(tx, take.beast_bait, 1);
      // Tuned to make rare tiers show more often without breaking balance too much.
      beastBaitLuckBonus += take.beast_bait.power * 20;
    }

    // Golden Contract: enemies x2 and rewards +200% (gold+exp).
    if (take.golden_contract && take.golden_contract.quantity > 0) {
      await consumeInventoryItem(tx, take.golden_contract, 1);
      enemyStrengthMultiplier *= take.golden_contract.power; // power=2 => x2
      goldMultiplier *= 3; // +200% => x3
      expMultiplier *= 3;
    }

    // Chaos Orb: random +/-10 to STR/AGI/LUCK
    if (take.chaos_orb && take.chaos_orb.quantity > 0) {
      await consumeInventoryItem(tx, take.chaos_orb, 1);
      const sign = Math.random() < 0.5 ? 1 : -1;
      const delta = sign * take.chaos_orb.power; // power=10

      effectiveStr = clampNonNegative(effectiveStr + delta);
      effectiveAgi = clampNonNegative(effectiveAgi + delta);
      effectiveLuck = clampNonNegative(effectiveLuck + delta);
    }

    // Bag upgrade: permanent capacity increase (+5 per item), consumed on use.
    if (take.bag_upgrade && take.bag_upgrade.quantity > 0) {
      const qty = take.bag_upgrade.quantity;
      await consumeAllInventoryItem(tx, take.bag_upgrade);
      await tx.user.update({
        where: { id: user.id },
        data: { inventoryLimit: (user.inventoryLimit ?? 50) + qty * take.bag_upgrade.power },
      });
    }

    const ctx: HuntItemEffectsContext = {
      str: effectiveStr,
      agi: effectiveAgi,
      luck: effectiveLuck,
      playerDamageMultiplier,
      enemyStrengthMultiplier,
      topPetBonusMultiplier,
      goldMultiplier,
      expMultiplier,
      beastBaitLuckBonus,
      scoutLensActive
    };

    return { ctx, shouldStopHunt, stopMessage };
  }) as any;
}

