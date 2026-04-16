import type { Relic } from "../constants/relic-pool";
import type { CombatContext } from "../types/combat";

export function applyRelicsBeforeCombat(ctx: CombatContext, relics: Relic[]) {
  let totalDamageBoost = 0;
  let totalDamageReduction = 0;

  for (const r of relics) {
    switch (r.type) {
      case "DAMAGE_BOOST":
        totalDamageBoost += r.value;
        break;
      case "GLASS_CANNON":
        totalDamageBoost += r.value;
        ctx.player.maxHp = Math.floor(ctx.player.maxHp * (1 - (r.drawback || 0)));
        ctx.player.hp = Math.min(ctx.player.hp, ctx.player.maxHp);
        break;
      case "REDUCE_DAMAGE":
        totalDamageReduction += r.value;
        break;
      case "SPD_BOOST":
        ctx.player.spd += r.value;
        break;
      case "CRIT_BOOST":
        ctx.player.critRate += r.value;
        break;
      case "START_SHIELD":
        ctx.player.shield += r.value;
        break;
      case "PET_BOOST":
        ctx.player.petPower += r.value;
        break;
    }
  }

  totalDamageBoost = Math.min(0.5, totalDamageBoost);
  totalDamageReduction = Math.min(0.9, totalDamageReduction);

  ctx.player.atk = Math.floor(ctx.player.atk * (1 + totalDamageBoost));
  ctx.extra.player.reduceDamage = totalDamageReduction;
}

export function applyRelicsOnTurn(ctx: CombatContext, relics: Relic[], turnEvents: string[]) {
  for (const r of relics) {
    if (r.type === "TURN_HEAL") {
      const heal = r.value;
      ctx.player.hp = Math.min(ctx.player.maxHp, ctx.player.hp + heal);
      turnEvents.push(`✨ [Thánh tích] ${r.name} hồi phục ${heal} HP.`);
    } else if (r.type === "CHAOS") {
      const roll = Math.random();
      if (roll < 0.33) {
        ctx.extra.player.bonusDamage += 25;
        turnEvents.push(`🔮 [Chaos Orb] Bộc phát năng lượng! (+25 sát thương thêm)`);
      } else if (roll < 0.66) {
        const heal = 15;
        ctx.player.hp = Math.min(ctx.player.maxHp, ctx.player.hp + heal);
        turnEvents.push(`🔮 [Chaos Orb] Luồng sáng bí ẩn! (Hồi ${heal} HP)`);
      } else {
        turnEvents.push(`🔮 [Chaos Orb] Quả cầu im lặng.`);
      }
    } else if (r.type === "DOUBLE_OR_NOTHING") {
      const roll = Math.random();
      if (roll < r.value) {
        ctx.player.multipliers.damage *= 2;
        turnEvents.push(`🎲 [Gambler's Coin] Mặt ngửa! Sát thương nhân đôi!`);
      } else {
        ctx.player.multipliers.damage = 0;
        turnEvents.push(`🎲 [Gambler's Coin] Mặt sấp... Đòn tấn công trượt!`);
      }
    } else if (r.type === "LOW_HP_BONUS") {
      if (ctx.player.hp / ctx.player.maxHp < 0.3) {
        ctx.player.multipliers.damage *= (1 + r.value);
        turnEvents.push(`🩸 [Executioner Ring] Bạo kích khi nguy kịch!`);
      }
    }
  }
}

export function applyRelicsOnKill(state: any, relics: Relic[], maxHp: number) {
  for (const r of relics) {
    if (r.type === "ON_KILL_HEAL") {
      state.hp = Math.min(maxHp, state.hp + r.value);
      state.floorLogs.push(`🧛 [${r.name}] Hấp thụ sinh khí, hồi ${r.value} HP! (HP: ${state.hp}/${maxHp})`);
    }
  }
}
