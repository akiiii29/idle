import { type CombatContext, type SkillPhaseResult, type StatusFlags } from "../types/combat";
import { addEffect } from "./combat-utils";

export const SKILL_EMOJIS: Record<string, string> = {
  DAMAGE: "💥",
  DOT: "🔥",
  DODGE: "💨",
  HEAL: "💚",
  GOLD: "💰",
  REDUCE_DAMAGE: "🛡️",
  CHAOS: "🌀",
  TAME: "🐾",
  POISON: "🤢",
  BURN: "🌋",
  SHIELD: "🔮",
  COUNTER: "⚔️",
  BUFF: "✨",
  LIFESTEAL: "🩸"
};

export const SKILL_HANDLERS: Record<string, (ctx: CombatContext, skill: any, flags?: any) => void> = {
  DAMAGE: (ctx, skill, flags = {}) => {
    let addon = skill.multiplier;
    if (skill.scaleWithHp) addon += (1 - (ctx.player.hp / ctx.player.maxHp));
    if (skill.scaleWithPet) addon += (ctx.player.petPower * 0.01);
    
    // Skill specific checks
    if (skill.name === "Critical Strike" || skill.name === "Savage Strike") flags.didCrit = true;
    if (skill.name === "Heavy Blow" || skill.name === "Brutal Force") flags.didHeavy = true;
    if (skill.hpAboveThreshold && (ctx.player.hp / ctx.player.maxHp) < skill.hpAboveThreshold) addon = 0;
    if (skill.targetHpBelowThreshold && (ctx.enemy.hp / ctx.enemy.maxHp) > skill.targetHpBelowThreshold) addon = 0;

    ctx.player.multipliers.damage += addon;
    if (skill.ignoreDef || flags.ignoreDef) ctx.flags.player.ignoreDef = true;
    if (skill.extraHit) flags.didMultiHit = true;
  },

  DOT: (ctx, skill, flags = {}) => {
    const val = Math.max(1, Math.floor(ctx.player.atk * skill.multiplier));
    const turns = 3 + (skill.durationBonus || 0);
    addEffect(ctx.effects.enemy, {
      type: "dot", value: val,
      turns, name: skill.name, stacks: 1
    });
    flags.didBleed = true;
  },

  POISON: (ctx, skill, flags = {}) => {
    const baseMult = skill.dotMultiplier || skill.multiplier || 0.15;
    const val = Math.max(1, Math.floor(ctx.player.atk * baseMult));
    const duration = skill.duration || 3;
    addEffect(ctx.effects.enemy, {
      type: "poison", value: val,
      turns: duration, name: skill.name, stacks: 1
    }, 5); 
    flags.didPoison = true;
  },

  BURN: (ctx, skill, flags = {}) => {
    const baseMult = skill.dotMultiplier || skill.multiplier || 0.15;
    const val = Math.max(1, Math.floor(ctx.player.atk * baseMult));
    const duration = skill.duration || 2;
    addEffect(ctx.effects.enemy, {
      type: "burn", value: val, 
      turns: duration, name: skill.name, stacks: 1
    }, 1); 
    flags.didBurn = true;
    
    // Apply instant damage multiplier if present (e.g. Fireball/Fire Blade)
    if (skill.multiplier > 0) {
        ctx.player.multipliers.damage += skill.multiplier;
    }
  },

  SHIELD: (ctx, skill) => {
    const value = Math.floor(ctx.player.atk * skill.multiplier);
    ctx.player.shield += value;
  },

  DODGE: (ctx, skill, flags = {}) => {
    ctx.flags.player.dodged = true;
    flags.didDodge = true;
  },

  HEAL: (ctx, skill) => {
    const healAmount = Math.floor(ctx.player.atk * skill.multiplier);
    ctx.player.hp = Math.min(ctx.player.maxHp, ctx.player.hp + healAmount);
    ctx.extra.player.instantHeal += healAmount;
  },

  LIFESTEAL: (ctx, skill, flags = {}) => {
    flags.didLifesteal = true;
  },

  GOLD: (ctx, skill) => {
    ctx.player.multipliers.gold += skill.multiplier;
  },

  REDUCE_DAMAGE: (ctx, skill, flags = {}) => {
    addEffect(ctx.effects.player, {
      type: "buff",
      stat: "reduce_damage",
      value: skill.multiplier,
      turns: 3,
      name: skill.name,
      stacks: 1
    });
    flags.didDamageReduction = true;
  },

  COUNTER: (ctx, skill, flags = {}) => {
    flags.didCounter = true;
  },

  BUFF: (ctx, skill) => {
    if (skill.bonusSpeed) ctx.player.spd += skill.bonusSpeed;
    if (skill.statBonus) ctx.player.atk *= (1 + skill.statBonus);
  },

  CHAOS: (ctx, skill, flags = {}) => {
    flags.chaosTriggered = true;
    const roll = Math.random();
    if (roll < 0.33) {
      ctx.player.multipliers.damage += 0.5;
    } else if (roll < 0.66) {
      const heal = Math.floor(ctx.player.maxHp * 0.2);
      ctx.player.hp = Math.min(ctx.player.maxHp, ctx.player.hp + heal);
      ctx.extra.player.instantHeal += heal;
    } else {
      ctx.extra.player.bonusDamage += ctx.player.atk;
    }
  },

  REFLECT: (ctx, skill) => {
    // Handled in combat-utils or engine for damage received
  },

  BLEED: (ctx, skill, flags = {}) => {
    const val = Math.max(1, Math.floor(ctx.player.atk * skill.multiplier));
    addEffect(ctx.effects.enemy, {
      type: "dot", value: val, turns: 3, name: "Chảy máu", stacks: 1
    });
    flags.didBleed = true;
  },

  DEBUFF: (ctx, skill, flags = {}) => {
    addEffect(ctx.effects.enemy, {
      type: "debuff", stat: "def", value: skill.multiplier, turns: 3, name: "Giảm giáp", stacks: 1
    });
    flags.petDebuff = true;
  },

  CLEANSE: (ctx) => {
    ctx.effects.player = ctx.effects.player.filter(e => e.type !== "debuff" && e.type !== "poison" && e.type !== "burn" && e.type !== "dot");
    ctx.player.hp = Math.min(ctx.player.maxHp, ctx.player.hp + (ctx.player.maxHp * 0.05));
  },

  EXECUTE: (ctx, skill) => {
    if ((ctx.enemy.hp / ctx.enemy.maxHp) < 0.3) {
      ctx.extra.player.bonusDamage += (ctx.player.atk * skill.multiplier);
    }
  },

  HEAL_BUFF: (ctx, skill) => {
    const heal = Math.floor(ctx.player.maxHp * skill.multiplier);
    ctx.player.hp = Math.min(ctx.player.maxHp, ctx.player.hp + heal);
    ctx.player.atk *= 1.1;
    ctx.player.def *= 1.1;
  },

  CRIT: (ctx, skill, flags = {}) => {
    if (skill.name === "Griffin") {
        ctx.player.multipliers.damage += skill.multiplier; // Increase crit dmg
    } else {
        ctx.player.critRate += skill.multiplier;
    }
    flags.petCrit = true;
  },

  TAME: () => { }
};

export function applySkills(userSkills: any[], trigger: string, ctx: CombatContext): SkillPhaseResult {
  const triggeredSkills: string[] = [];
  const triggeredSynergies: string[] = [];
  const flags: StatusFlags = {
    didCrit: false, didHeavy: false, didBleed: false, didDodge: false,
    didMultiHit: false, didLifesteal: false, didDamageReduction: false,
    didCounter: false, didBurn: false, didPoison: false, ignoreDef: false,
    lowHp: (ctx.player.hp / ctx.player.maxHp) < 0.3,
    chaosTriggered: false
  };

  if (!userSkills || userSkills.length === 0) {
    return { triggeredSkills, triggeredSynergies, totalDamage: 0, healAmount: 0, flags, burnStacks: 0, poisonStacks: 0 };
  }

  // 1. Roll skill procs
  const rolled: any[] = [];
  for (const us of userSkills) {
    const skill = us.skill || us;
    
    // Berserk always active
    if (skill.name === "Berserk") {
        rolled.push(skill);
        continue;
    }
    
    if (skill.trigger !== trigger) continue;

    let chance = skill.chance || 0.1;
    // Death Wish check
    if (skill.name === "Death Wish" && flags.lowHp) chance = 1.0;
    
    if (Math.random() <= chance) {
      rolled.push(skill);
    } else if (skill.rerollFailedProc && Math.random() <= 0.5) {
      // Twist Fate reroll (simplified)
      rolled.push(skill);
    }
  }

  // 2. Apply base effects & Set flags
  for (const skill of rolled) {
    const handler = SKILL_HANDLERS[skill.type];
    if (handler) {
      if (skill.type === "DODGE" && ctx.flags.player.dodged) continue;
      handler(ctx, skill, flags);
      const emoji = SKILL_EMOJIS[skill.type] || "✨";
      triggeredSkills.push(`${emoji} **${skill.name}**`);
    }
    
    // Special handling for Relentless
    if (skill.name === "Relentless") {
        ctx.player.multipliers.damage += (rolled.length * 0.05);
    }
    
    if (skill.name === "Precision") flags.ignoreDef = true;
    if (skill.isCritGuaranteed) flags.didCrit = true;
  }

  // 3. Apply Synergy
  applySynergy(ctx, flags, triggeredSynergies, triggeredSkills.length);

  const burnStacks = ctx.effects.enemy.filter(e => e.type === "burn").reduce((acc, curr) => acc + (curr.stacks || 0), 0);
  const poisonStacks = ctx.effects.enemy.filter(e => e.type === "poison").reduce((acc, curr) => acc + (curr.stacks || 0), 0);

  return { 
    triggeredSkills, 
    triggeredSynergies, 
    totalDamage: ctx.extra.player.bonusDamage, 
    healAmount: ctx.extra.player.instantHeal, 
    flags,
    burnStacks,
    poisonStacks
  };
}

export const SYNERGY_LIST = [
  { 
    name: "⚡ Sát Thương Thần Thánh", 
    desc: "Crit + Heavy Blow", 
    bonus: "+50% sát thương đòn đánh",
    req: ["didCrit", "didHeavy"] as (keyof StatusFlags)[],
    tips: "Cần: Critical Strike, Savage Strike + Heavy Blow, Brutal Force"
  },
  { 
    name: "⚔️ Liên Hoàn Chí Mạng", 
    desc: "Crit + Multi-Hit", 
    bonus: "+20% sát thương bồi thêm",
    req: ["didCrit", "didMultiHit"] as (keyof StatusFlags)[],
    tips: "Cần: Critical Strike, Savage Strike + Double Strike, Flurry"
  },
  { 
    name: "🍷 Yến Tiệc Máu", 
    desc: "Bleed + Lifesteal", 
    bonus: "Hồi máu tăng thêm +50%",
    req: ["didBleed", "didLifesteal"] as (keyof StatusFlags)[],
    tips: "Cần: Bleed, Toxic Bleed + Lifesteal, Blood Feast"
  },
  { 
    name: "🎯 Đột Phá Giáp", 
    desc: "Multi-Hit + Xuyên Giáp", 
    bonus: "Tất cả các đòn đánh bồi đều xuyên 100% thủ",
    req: ["didMultiHit", "ignoreDef"] as (keyof StatusFlags)[],
    tips: "Cần: Double Strike, Flurry + Precision, Overpower"
  },
  { 
    name: "🔄 Phản Công Nhanh", 
    desc: "Dodge + Counter", 
    bonus: "+50% sát thương đòn phản công",
    req: ["didDodge", "didCounter"] as (keyof StatusFlags)[],
    tips: "Cần: Quick Reflex, Evasion Mastery + Retaliation, Spiked Armor"
  },
  { 
    name: "🔥 Hỏa Ngục", 
    desc: "Burn + Crit/Multi/Heavy", 
    bonus: "Tăng sát thương thiêu đốt và sát hưởng nổ",
    req: ["didBurn"] as (keyof StatusFlags)[],
    tips: "Cần: Fireball, Fire Blade + Các kỹ năng Crit/Multi-hit/Heavy"
  },
  { 
    name: "☠️ Thiên Diệp Độc", 
    desc: "Poison + Crit/Multi-Hit", 
    bonus: "Kích nổ sát thương độc hoặc tích tầng cực nhanh",
    req: ["didPoison"] as (keyof StatusFlags)[],
    tips: "Cần: Poison Strike, Toxic Edge + Multi-hit"
  },
  { 
    name: "⚛️ Hợp Kích Nguyên Tố", 
    desc: "Burn + Poison", 
    bonus: "Gây sát thương nổ hỗn hợp 30-50%",
    req: ["didBurn", "didPoison"] as (keyof StatusFlags)[],
    tips: "Kích hoạt đồng thời cả Lửa và Độc"
  },
  { 
    name: "🩸 Hút Máu Nguyên Tố", 
    desc: "Burn/Poison + Lifesteal", 
    bonus: "Tăng 30-50% lượng máu hút được",
    req: ["didLifesteal"] as (keyof StatusFlags)[],
    tips: "Cần kỹ năng Hút máu trên mục tiêu đang bị Lửa hoặc Độc"
  },
  { 
    name: "☣️ Tuyệt Diệt", 
    desc: "Poison + Mục tiêu thấp máu", 
    bonus: "Cộng thêm 60% sát thương cơ bản",
    req: ["didPoison"] as (keyof StatusFlags)[],
    tips: "Hành quyết đối thủ khi chúng đang bị nhiễm độc"
  },
  { 
    name: "🐾 Cộng hưởng Pet (Chí Mạng)", 
    desc: "Player Crit + Pet Crit", 
    bonus: "+20% sát thương đòn đánh",
    req: ["didCrit", "petCrit"] as (keyof StatusFlags)[],
    tips: "Pet và Player cùng gây chí mạng"
  },
  { 
    name: "🌋 Cộng hưởng Pet (Hỏa Hiện)", 
    desc: "Player Burn + Pet Burn", 
    bonus: "+50% sát thương thiêu đốt",
    req: ["didBurn", "petBurn"] as (keyof StatusFlags)[],
    tips: "Pet và Player cùng thiêu cháy mục tiêu"
  },
  { 
    name: "🤢 Cộng hưởng Pet (Độc Tố)", 
    desc: "Player Poison + Pet Poison", 
    bonus: "Tăng thêm 1 tầng độc tích tụ",
    req: ["didPoison", "petPoison"] as (keyof StatusFlags)[],
    tips: "Pet và Player cùng đầu độc mục tiêu"
  },
  { 
    name: "⚛️ Cộng hưởng Pet (Nguyên Tố)", 
    desc: "Pet Burn + Pet Poison", 
    bonus: "+25% tổng sát thương",
    req: ["petBurn", "petPoison"] as (keyof StatusFlags)[],
    tips: "Pet kích hoạt cả hiệu ứng Lửa và Độc"
  },
  { 
    name: "🛡️ Cộng hưởng Pet (Phòng Thủ)", 
    desc: "Player Reduce + Pet Shield", 
    bonus: "+20% chỉ số giảm thương",
    req: ["didDamageReduction", "petShield"] as (keyof StatusFlags)[],
    tips: "Kết hợp lá chắn pet và kỹ năng giảm thương"
  },
  { 
    name: "🩸 Cộng hưởng Pet (Hút Máu)", 
    desc: "Player Lifesteal + Pet Heal", 
    bonus: "+50% lượng máu hút được",
    req: ["didLifesteal", "petHeal"] as (keyof StatusFlags)[],
    tips: "Pet hồi máu khi Player đang hút máu"
  },
  { 
    name: "🎯 Cộng hưởng Pet (Xuyên Giáp)", 
    desc: "Player Crit + Pet Debuff", 
    bonus: "Đòn chí mạng xuyên 100% thủ",
    req: ["didCrit", "petDebuff"] as (keyof StatusFlags)[],
    tips: "Pet giảm giáp giúp đòn chí mạng xuyên thấu"
  },
  { 
    name: "💀 Cộng hưởng Pet (Hành Quyết)", 
    desc: "Pet Crit + Mục tiêu <30% HP", 
    bonus: "+30% sát thương đòn kết liễu",
    req: ["petCrit"] as (keyof StatusFlags)[],
    tips: "Pet tung chí mạng khi kẻ thù yếu máu"
  },
];

function applySynergy(ctx: CombatContext, flags: StatusFlags, synergies: string[], totalProcs: number) {
    const baseDamage = ctx.player.atk;
    const targetHasBurn = ctx.effects.enemy.some(e => e.type === "burn");
    const targetHasPoison = ctx.effects.enemy.some(e => e.type === "poison");
    const burnStacks = ctx.effects.enemy.filter(e => e.type === "burn").reduce((acc, curr) => acc + (curr.stacks || 0), 0);
    const poisonStacks = ctx.effects.enemy.filter(e => e.type === "poison").reduce((acc, curr) => acc + (curr.stacks || 0), 0);

    // --- ELEMENTAL SYNERGIES ---
    
    // BURN SYNERGY
    if (flags.didBurn) {
        if (flags.didCrit) {
            const effect = ctx.effects.enemy.find(e => e.type === "burn");
            if (effect) effect.value *= 1.5;
            if (!synergies.includes("🔥 Hỏa Ngục")) synergies.push("🔥 Hỏa Ngục");
        }
        if (flags.didMultiHit) {
            const effect = ctx.effects.enemy.find(e => e.type === "burn");
            if (effect) effect.stacks = (effect.stacks || 1) + 1;
            if (!synergies.includes("🔥 Hỏa Ngục")) synergies.push("🔥 Hỏa Ngục");
        }
        if (burnStacks >= 2) {
            ctx.extra.player.bonusDamage += baseDamage * 0.4;
            synergies.push("🔥 Hỏa Ngục");
        }
        if (flags.didHeavy) {
            ctx.extra.player.bonusDamage += baseDamage * 0.5;
            if (!synergies.includes("🔥 Hỏa Ngục")) synergies.push("🔥 Hỏa Ngục");
        }
    }

    // POISON SYNERGY
    if (flags.didPoison) {
        if (flags.didCrit) {
            const effect = ctx.effects.enemy.find(e => e.type === "poison");
            if (effect) effect.value *= 1.4;
            if (!synergies.includes("☠️ Thiên Diệp Độc")) synergies.push("☠️ Thiên Diệp Độc");
        }
        if (flags.didMultiHit) {
            const effect = ctx.effects.enemy.find(e => e.type === "poison");
            if (effect) effect.stacks = (effect.stacks || 1) + 1;
            if (!synergies.includes("☠️ Thiên Diệp Độc")) synergies.push("☠️ Thiên Diệp Độc");
        }
        if (poisonStacks >= 3) {
            ctx.extra.player.bonusDamage += baseDamage * 0.5;
            synergies.push("☠️ Thiên Diệp Độc");
        }
    }

    // ELEMENT COMBO
    if (targetHasBurn && targetHasPoison) {
        ctx.extra.player.bonusDamage += baseDamage * 0.3;
        synergies.push("⚛️ Hợp Kích Nguyên Tố");
    }
    if (flags.didBurn && flags.didPoison) {
        ctx.player.multipliers.damage += 0.2;
        if (!synergies.includes("⚛️ Hợp Kích Nguyên Tố")) synergies.push("⚛️ Hợp Kích Nguyên Tố");
    }

    // LIFESTEAL SYNERGIES
    if (flags.didLifesteal) {
        if (targetHasBurn) {
            ctx.extra.player.instantHeal += (ctx.extra.player.instantHeal * 0.5);
            synergies.push("🩸 Hút Máu Nguyên Tố");
        } else if (targetHasPoison) {
            ctx.extra.player.instantHeal += (ctx.extra.player.instantHeal * 0.3);
            synergies.push("🩸 Hút Máu Nguyên Tố");
        }
    }

    // LOW HP / EXECUTION
    if (flags.lowHp && flags.didBurn) {
        ctx.player.multipliers.damage += 0.3;
        if (!synergies.includes("🔥 Hỏa Ngục")) synergies.push("🔥 Hỏa Ngục");
    }
    if (targetHasPoison && (ctx.enemy.hp / ctx.enemy.maxHp) < 0.3) {
        ctx.extra.player.bonusDamage += baseDamage * 0.6;
        synergies.push("☣️ Tuyệt Diệt");
    }

    // CHAOS + ELEMENT
    if (flags.chaosTriggered && (flags.didBurn || flags.didPoison)) {
        const randomMultiplier = 1.5 + (Math.random() * 1.0);
        ctx.player.multipliers.damage *= randomMultiplier;
        synergies.push("🌀 Hỗn Mang Bùng Nổ");
    }

    // --- CLASSIC SYNERGIES ---
    if (flags.didCrit && flags.didHeavy) {
        ctx.player.multipliers.damage += 0.5;
        synergies.push("⚡ Sát Thương Thần Thánh");
    }
    if (flags.didCrit && flags.didMultiHit) {
        ctx.player.multipliers.damage += 0.2;
        synergies.push("⚔️ Liên Hoàn Chí Mạng");
    }
}

export function getSkillDescription(skill: any): string {
    const chance = `${Math.round((skill.chance || 0.1) * 100)}%`;
    let trigger = "";
    switch (skill.trigger) {
      case "ON_ATTACK": trigger = "Khi tấn công"; break;
      case "ON_DEFEND": trigger = "Khi phòng thủ"; break;
      case "ON_TURN_START": trigger = "Đầu mỗi lượt"; break;
      default: trigger = "Khi kích hoạt";
    }
  
    let effect = "";
    switch (skill.type) {
      case "DAMAGE":
        effect = `tăng ${Math.round(skill.multiplier * 100)}% sát thương`;
        if (skill.ignoreDef) effect += ", xuyên giáp";
        if (skill.extraHit) effect += ", đánh bồi";
        if (skill.scaleWithHp) effect += ", mạnh hơn khi thấp máu";
        break;
      case "DOT":
        effect = `gây sát thương duy trì (${Math.round(skill.multiplier * 100)}% ATK)`;
        break;
      case "HEAL":
        effect = `hồi phục ${Math.round(skill.multiplier * 100)}% ATK lượng máu`;
        break;
      case "REDUCE_DAMAGE":
        effect = `giảm sát thương nhận vào ${Math.round(skill.multiplier * 100)}%`;
        break;
      case "DODGE":
        effect = "né tránh đòn tấn công";
        break;
      case "SHIELD":
        effect = `tạo khiên ${Math.round(skill.multiplier * 100)}% ATK`;
        break;
      default:
        effect = "hiệu ứng đặc biệt";
    }
  
    return `*${trigger}, tỉ lệ ${chance}: ${effect}.*`;
}

