import { enrichBeast } from "./pet-utils";

export interface SynergyInfo {
  name: string;
  description: string;
  icon: string;
}

/** Tên trùng `SYNERGY_LIST` trong skill-system (hiển thị /help & /synergies). */
export const PET_PLAYER_SYNERGY_NAMES = {
  critBoth: "🐾 Cộng hưởng Pet (Chí Mạng)",
  burnBoth: "🌋 Cộng hưởng Pet (Hỏa Hiện)",
  poisonBoth: "🤢 Cộng hưởng Pet (Độc Tố)",
  elementPet: "⚛️ Cộng hưởng Pet (Nguyên Tố)",
  defenseBoth: "🛡️ Cộng hưởng Pet (Phòng Thủ)",
  lifestealHeal: "🩸 Cộng hưởng Pet (Hút Máu)",
  critDebuff: "🎯 Cộng hưởng Pet (Xuyên Giáp)",
  executeLowHp: "💀 Cộng hưởng Pet (Hành Quyết)",
} as const;

export interface PetPlayerSynergyResult {
  logs: string[];
  /** Tên cộng hưởng (đồng bộ bảng synergy kỹ năng). */
  names: string[];
}

export function getActiveSynergies(pets: any[]): SynergyInfo[] {
  if (pets.length < 2) return [];

  const synergies: SynergyInfo[] = [];
  const enrichedPets = pets.map(p => enrichBeast(p));
  const roles = enrichedPets.map(p => p.role);
  const rarities = enrichedPets.map(p => p.rarity);

  const dpsCount = roles.filter(r => r === "DPS").length;
  const tankCount = roles.filter(r => r === "TANK").length;
  const supportCount = roles.filter(r => r === "SUPPORT").length;

  if (dpsCount >= 2) {
    synergies.push({ icon: "🔥", name: "Double DPS", description: "+15% Sát thương" });
  }

  if (tankCount >= 1 && supportCount >= 1) {
    synergies.push({ icon: "🛡️", name: "Kiên Định", description: "+15% Giảm sát thương & +15% Hồi máu" });
  }

  if (pets.length === 3) {
    if (rarities.every(r => r === rarities[0])) {
      const rarity = rarities[0] as string;
      synergies.push({ icon: "✨", name: `Three Body Problem (${rarity})`, description: `+10% Toàn bộ chỉ số` });
    }
  }

  if (pets.length === 3 && dpsCount === 1 && tankCount === 1 && supportCount === 1) {
    synergies.push({ icon: "☯️", name: "All Balance", description: "+12% Công và Thủ" });
  }

  return synergies;
}

export function calculateSynergyMultipliers(pets: any[]) {
  const active = getActiveSynergies(pets);
  let damage = 1.0;
  let defense = 1.0;
  let heal = 1.0;

  active.forEach(syn => {
    if (syn.name === "Double DPS") damage += 0.15;
    if (syn.name === "Kiên Định") {
      defense += 0.15;
      heal += 0.15;
    }
    if (syn.name.startsWith("Three Body Problem")) {
      const bonus = 0.1;
      damage += bonus;
      defense += bonus;
    }
    if (syn.name === "All Balance") {
      damage += 0.12;
      defense += 0.12;
    }
  });

  return { damage, defense, heal };
}

/** Áp chỉ số đội pet; trả về dòng log (tên bộ cộng hưởng đội hình). */
export function applyPetSynergy(ctx: any, pets: any[]): string[] {
  const mults = calculateSynergyMultipliers(pets);
  const active = getActiveSynergies(pets);

  ctx.player.multipliers.damage = mults.damage;
  ctx.player.multipliers.defense = mults.defense;
  if (!ctx.player.multipliers.heal) ctx.player.multipliers.heal = 1.0;
  ctx.player.multipliers.heal *= mults.heal;

  if (active.length === 0) return [];
  return active.map(syn => `${syn.icon} **${syn.name}** — ${syn.description}`);
}

/**
 * PET + PLAYER SYNERGY RULES
 * Apply AFTER both player and pet skills are processed.
 */
export function applyPetPlayerSynergy(ctx: any, flags: any): PetPlayerSynergyResult {
  const {
    didCrit, didHeavy, didBurn, didPoison, didMultiHit, didLifesteal, didDamageReduction,
    petCrit, petBurn, petPoison, petShield, petHeal, petDebuff
  } = flags;

  const logs: string[] = [];
  const names: string[] = [];
  const N = PET_PLAYER_SYNERGY_NAMES;

  const add = (title: string, line: string) => {
    names.push(title);
    logs.push(`🔗 **${title}** — ${line}`);
  };

  if (petCrit && didCrit) {
    ctx.player.multipliers.damage *= 1.2;
    add(N.critBoth, "Tăng 20% sát thương.");
  }

  if (petBurn && didBurn) {
    const burn = ctx.effects.enemy.find((e: any) => e.type === "burn");
    if (burn) {
      burn.value *= 1.5;
      add(N.burnBoth, "Tăng 50% sát thương thiêu đốt.");
    }
  }

  if (petPoison && didPoison) {
    const poison = ctx.effects.enemy.find((e: any) => e.type === "poison");
    if (poison) {
      poison.stacks = (poison.stacks || 1) + 1;
      add(N.poisonBoth, "Tăng thêm 1 tầng độc.");
    }
  }

  if (petBurn && petPoison) {
    ctx.player.multipliers.damage *= 1.25;
    add(N.elementPet, "Tăng 25% tổng sát thương.");
  }

  if (petShield && didDamageReduction) {
    ctx.extra.player.reduceDamage += (ctx.extra.player.reduceDamage || 0) * 0.2;
    ctx.player.multipliers.defense += 0.2;
    add(N.defenseBoth, "Tăng 20% giảm sát thương.");
  }

  if (petHeal && didLifesteal) {
    const healAmount = ctx.extra.player.instantHeal || 0;
    ctx.extra.player.instantHeal += healAmount * 0.5;
    add(N.lifestealHeal, "Tăng 50% lượng hồi máu (hút máu).");
  }

  if (petDebuff && didCrit) {
    ctx.flags.player.ignoreDef = true;
    add(N.critDebuff, "Đòn chí mạng xuyên 100% giáp.");
  }

  const targetHpRatio = ctx.enemy.hp / ctx.enemy.maxHp;
  if (petCrit && targetHpRatio < 0.3) {
    ctx.player.multipliers.damage *= 1.3;
    add(N.executeLowHp, "Tăng 30% sát thương lên kẻ địch thấp máu.");
  }

  return { logs, names };
}
