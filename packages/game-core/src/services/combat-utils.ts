/**
 * combat-utils.ts
 * Pure combat logic utilities.
 */

import { type CombatParticipant, type CombatEffect } from "../types/combat";

/**
 * Scalable Damage Formula
 * rawDmg = atk
 * finalDamage = rawDamage * (1 - damageReduction)
 */
export function calculateDamage(attackerFinalAtk: number, defenderFinalDef: number): number {
  const reduction = defenderFinalDef / (defenderFinalDef + 100);
  const cappedReduction = Math.min(0.75, Math.max(0, reduction));
  const dmg = Math.floor(attackerFinalAtk * (1 - cappedReduction));
  return Math.max(1, dmg);
}

/**
 * Buff-based mitigation (Extra flat % reduction, kept isolated from raw defense formula)
 */
export function getBuffDamageReduction(effects: CombatEffect[]): number {
  const reductionBuffs = effects.filter(e => e.type === "buff" && e.stat === "reduce_damage");
  const totalReduction = reductionBuffs.reduce((acc, curr) => acc + (curr.value || 0), 0);
  return totalReduction;
}

/**
 * Core Damage Application
 * Damage is absorbed by shield first. Remaining damage reduces HP.
 */
export function applyDamage(target: CombatParticipant, damage: number, events: string[]) {
  if (target.shield > 0) {
    const absorbed = Math.min(target.shield, damage);
    target.shield -= absorbed;
    const remainingDmg = damage - absorbed;

    events.push(`🛡️ **Giáp ảo** hấp thụ **${absorbed}**! (Còn lại: ${Math.floor(target.shield)})`);

    if (remainingDmg > 0) {
      target.hp -= remainingDmg;
      events.push(`🩸 **${target.name}** chịu thêm **${Math.floor(remainingDmg)}** sát thương vào HP.`);
    }
  } else {
    target.hp -= damage;
    events.push(`🩸 **${target.name}** chịu **${Math.floor(damage)}** sát thương.`);
  }

  if (target.hp < 0) target.hp = 0;
}

/**
 * Advanced Effect Stacking
 * Strategy: Increase stacks up to limit, and REFRESH duration to the new value if it's higher.
 */
export function addEffect(effects: CombatEffect[], newEffect: CombatEffect, maxStacks: number = 5) {
  const existing = effects.find(e => e.name === newEffect.name && e.type === newEffect.type);
  if (existing) {
    existing.stacks = Math.min(maxStacks, existing.stacks + 1);
    existing.turns = Math.max(existing.turns, newEffect.turns);
  } else {
    effects.push({ ...newEffect, stacks: 1 });
  }
}

/**
 * Turn-Start Effect Resolution
 */
export function resolveTurnEffects(target: CombatParticipant, effects: CombatEffect[], events: string[]) {
  if (!effects) return;

  for (const e of effects) {
    if (e.turns <= 0) continue;

    switch (e.type) {
      case "hot":
        const heal = (e.value || 0) * (e.stacks || 1);
        target.hp = Math.min(target.maxHp, target.hp + heal);
        events.push(`🟢 **${e.name}** hồi phục **${Math.floor(heal)}** HP.`);
        break;
      case "dot":
        const dotDmg = (e.value || 0) * (e.stacks || 1);
        applyDamage(target, dotDmg, events);
        break;
      case "poison":
        const poisonDmg = (e.value || 0) * (e.stacks || 1);
        applyDamage(target, poisonDmg, events);
        events.push(`🤢 **Độc tố** (x${e.stacks}) gây thêm áp lực.`);
        break;
      case "burn":
        const burnDmg = Math.floor(target.maxHp * ((e.value || 0) / 100)) * (e.stacks || 1);
        applyDamage(target, burnDmg, events);
        events.push(`🌋 **Vết bỏng** gây sát thương % Máu.`);
        break;
    }
  }
}

/**
 * Post-Turn Cleanup
 * Reduce duration and remove expired.
 */
export function cleanupEffects(effects: CombatEffect[], events: string[]) {
  if (!effects) return;
  for (let i = effects.length - 1; i >= 0; i--) {
    const e = effects[i];
    if (!e) continue;

    e.turns--;
    if (e.turns <= 0) {
      events.push(`⏳ Hiệu ứng **${e.name}** đã hết tác dụng.`);
      effects.splice(i, 1);
    }
  }
}
