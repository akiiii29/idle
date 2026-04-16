import { Rarity } from "@prisma/client";

export interface AccessoryEffect {
    type: "CRIT_CHANCE" | "CRIT_DMG" | "BURN_DMG" | "BURN_DUR" | "POISON_DMG" | "POISON_DUR" | "LIFESTEAL" | "MULTI_HIT" | "REDUCE_DMG" | "PROC_CHANCE" | "LOW_HP_DMG" | "PET_DMG" | "PET_CHANCE" | "PET_PLAYER_SYN" | "HYBRID_BURN_POISON" | "UNIQUE_CRIT_EXECUTE" | "UNIQUE_BURN_INSTANT" | "UNIQUE_POISON_BURST" | "UNIQUE_LIFE_DOUBLE" | "UNIQUE_BLOCK_HIT" | "UNIQUE_PROC_TWICE" | "UNIQUE_BERSERK_PERCENT";
    power: number;
}

export interface AccessoryConfig {
  name: string;
  rarity: Rarity;
  set: string;
  effects: AccessoryEffect[];
}

export const ACCESSORY_SETS: Record<string, { bonus2: AccessoryEffect[], bonus3: AccessoryEffect[] }> = {
    "Assassin": {
        bonus2: [{ type: "CRIT_CHANCE", power: 0.15 }],
        bonus3: [{ type: "CRIT_DMG", power: 0.5 }]
    },
    "Flame": {
        bonus2: [{ type: "BURN_DMG", power: 0.3 }],
        bonus3: [{ type: "PROC_CHANCE", power: 0.01 }] // burn stacks logic would be here
    },
    "Venom": {
        bonus2: [{ type: "POISON_DMG", power: 0.25 }],
        bonus3: [{ type: "PROC_CHANCE", power: 0.01 }] // poison stacks
    },
    "Blood": {
        bonus2: [{ type: "LIFESTEAL", power: 0.2 }],
        bonus3: [{ type: "LIFESTEAL", power: 1.0 }] // double efficiency near low HP
    },
    "Speed": {
        bonus2: [{ type: "MULTI_HIT", power: 0.2 }],
        bonus3: [{ type: "MULTI_HIT", power: 0.5 }] // extra damage
    },
    "Guardian": {
        bonus2: [{ type: "REDUCE_DMG", power: 0.15 }],
        bonus3: [{ type: "REDUCE_DMG", power: 0.2 }] // reflect logic
    },
    "Gambler": {
        bonus2: [{ type: "PROC_CHANCE", power: 0.15 }],
        bonus3: [{ type: "PROC_CHANCE", power: 0.5 }] // multiplier
    },
    "Berserker": {
        bonus2: [{ type: "LOW_HP_DMG", power: 0.25 }],
        bonus3: [{ type: "LIFESTEAL", power: 1.0 }]
    },
    "Beast": {
        bonus2: [{ type: "PET_DMG", power: 0.25 }],
        bonus3: [{ type: "PET_PLAYER_SYN", power: 1.0 }] // apply twice
    },
    "Elemental": {
        bonus2: [{ type: "HYBRID_BURN_POISON", power: 0.25 }],
        bonus3: [{ type: "HYBRID_BURN_POISON", power: 1.0 }] // double synergy
    }
};

export const ACCESSORY_CONFIGS: Record<string, AccessoryConfig> = {
    // Assassin Set
    "Nhẫn Sát Thủ": { name: "Nhẫn Sát Thủ", rarity: Rarity.RARE, set: "Assassin", effects: [{ type: "CRIT_CHANCE", power: 0.1 }] },
    "Dây Chuyền Bóng Tối": { name: "Dây Chuyền Bóng Tối", rarity: Rarity.EPIC, set: "Assassin", effects: [{ type: "CRIT_DMG", power: 0.25 }] },
    "Mặt Nạ Đâm Lén": { name: "Mặt Nạ Đâm Lén", rarity: Rarity.LEGENDARY, set: "Assassin", effects: [{ type: "UNIQUE_CRIT_EXECUTE", power: 0.3 }] },

    // Flame Set
    "Nhẫn Lửa": { name: "Nhẫn Lửa", rarity: Rarity.RARE, set: "Flame", effects: [{ type: "BURN_DMG", power: 0.25 }] },
    "Bùa Tro Tàn": { name: "Bùa Tro Tàn", rarity: Rarity.EPIC, set: "Flame", effects: [{ type: "BURN_DUR", power: 1 }] },
    "Trái Tim Hỏa Ngục": { name: "Trái Tim Hỏa Ngục", rarity: Rarity.LEGENDARY, set: "Flame", effects: [{ type: "UNIQUE_BURN_INSTANT", power: 0.2 }] },

    // Venom Set
    "Trâm Độc": { name: "Trâm Độc", rarity: Rarity.RARE, set: "Venom", effects: [{ type: "POISON_DMG", power: 0.2 }] },
    "Bình Độc Cổ": { name: "Bình Độc Cổ", rarity: Rarity.EPIC, set: "Venom", effects: [{ type: "POISON_DUR", power: 2 }] },
    "Nanh Rắn Vua": { name: "Nanh Rắn Vua", rarity: Rarity.LEGENDARY, set: "Venom", effects: [{ type: "UNIQUE_POISON_BURST", power: 0 }] },

    // Blood Set
    "Nhẫn Huyết": { name: "Nhẫn Huyết", rarity: Rarity.RARE, set: "Blood", effects: [{ type: "LIFESTEAL", power: 0.15 }] },
    "Bùa Hút Sinh Lực": { name: "Bùa Hút Sinh Lực", rarity: Rarity.EPIC, set: "Blood", effects: [{ type: "LIFESTEAL", power: 0.25 }] },
    "Tim Quỷ": { name: "Tim Quỷ", rarity: Rarity.LEGENDARY, set: "Blood", effects: [{ type: "UNIQUE_LIFE_DOUBLE", power: 0.5 }] },

    // Speed Set
    "Nhẫn Tốc Độ": { name: "Nhẫn Tốc Độ", rarity: Rarity.RARE, set: "Speed", effects: [{ type: "MULTI_HIT", power: 0.1 }] },
    "Giày Gió": { name: "Giày Gió", rarity: Rarity.EPIC, set: "Speed", effects: [{ type: "MULTI_HIT", power: 0.3 }] },
    "Linh Hồn Gió": { name: "Linh Hồn Gió", rarity: Rarity.LEGENDARY, set: "Speed", effects: [{ type: "MULTI_HIT", power: 0.15 }] },

    // Guardian Set
    "Khiên Cổ": { name: "Khiên Cổ", rarity: Rarity.RARE, set: "Guardian", effects: [{ type: "REDUCE_DMG", power: 0.1 }] },
    "Dây Chuyền Thép": { name: "Dây Chuyền Thép", rarity: Rarity.EPIC, set: "Guardian", effects: [{ type: "REDUCE_DMG", power: 0.2 }] },
    "Trái Tim Titan": { name: "Trái Tim Titan", rarity: Rarity.LEGENDARY, set: "Guardian", effects: [{ type: "UNIQUE_BLOCK_HIT", power: 1 }] },

    // Gambler Set
    "Xúc Xắc Hỗn Loạn": { name: "Xúc Xắc Hỗn Loạn", rarity: Rarity.RARE, set: "Gambler", effects: [{ type: "PROC_CHANCE", power: 0.1 }] },
    "Đồng Xu May Rủi": { name: "Đồng Xu May Rủi", rarity: Rarity.EPIC, set: "Gambler", effects: [{ type: "PROC_CHANCE", power: 0.2 }] },
    "Mặt Nạ Điên Loạn": { name: "Mặt Nạ Điên Loạn", rarity: Rarity.LEGENDARY, set: "Gambler", effects: [{ type: "UNIQUE_PROC_TWICE", power: 0.2 }] },

    // Berserker Set
    "Nhẫn Tử Chiến": { name: "Nhẫn Tử Chiến", rarity: Rarity.RARE, set: "Berserker", effects: [{ type: "LOW_HP_DMG", power: 0.2 }] },
    "Huyết Ấn": { name: "Huyết Ấn", rarity: Rarity.EPIC, set: "Berserker", effects: [{ type: "LOW_HP_DMG", power: 0.3 }] },
    "Linh Hồn Cuồng Nộ": { name: "Linh Hồn Cuồng Nộ", rarity: Rarity.LEGENDARY, set: "Berserker", effects: [{ type: "UNIQUE_BERSERK_PERCENT", power: 0.01 }] },

    // Beast Set
    "Dây Xích Thú": { name: "Dây Xích Thú", rarity: Rarity.RARE, set: "Beast", effects: [{ type: "PET_DMG", power: 0.2 }] },
    "Ấn Thú": { name: "Ấn Thú", rarity: Rarity.EPIC, set: "Beast", effects: [{ type: "PET_CHANCE", power: 0.15 }] },
    "Trái Tim Hoang Dã": { name: "Trái Tim Hoang Dã", rarity: Rarity.LEGENDARY, set: "Beast", effects: [{ type: "PET_PLAYER_SYN", power: 0.2 }] },

    // Elemental Set
    "Nhẫn Nguyên Tố": { name: "Nhẫn Nguyên Tố", rarity: Rarity.RARE, set: "Elemental", effects: [{ type: "HYBRID_BURN_POISON", power: 0.15 }] },
    "Mặt Dây Nguyên Tố": { name: "Mặt Dây Nguyên Tố", rarity: Rarity.EPIC, set: "Elemental", effects: [{ type: "HYBRID_BURN_POISON", power: 0.3 }] },
    "Lõi Nguyên Tố": { name: "Lõi Nguyên Tố", rarity: Rarity.LEGENDARY, set: "Elemental", effects: [{ type: "HYBRID_BURN_POISON", power: 0.5 }] },
};

const PCT = (x: number) => `${(x * 100).toFixed(x >= 0.1 && x < 10 ? 0 : 1)}%`;

/** Hiệu ứng tại +0. Mỗi cấp + trên đồ: hệ số `1 + 0.05 × cấp` (trừ UNIQUE tùy combat). */
export function describeAccessoryEffect(
  eff: AccessoryEffect,
  upgradeLevel: number = 0
): string {
  const scale = 1 + upgradeLevel * 0.05;
  const p = eff.power * scale;

  switch (eff.type) {
    case "CRIT_CHANCE":
      return `Tỉ lệ **chí mạng** +${PCT(p)} (cộng vào xác suất crit trong trận)`;
    case "CRIT_DMG":
      return `**Sát thương khi chí mạng** (hệ số nhân) +${PCT(p)} — cộng dồn lên nền 1.5`;
    case "BURN_DMG":
      return `**Sát thương Đốt** (hệ số nhân DOT) +${PCT(p)}`;
    case "BURN_DUR":
      return `**Thời lượng / cường độ đốt** +${eff.power * scale} (theo hệ combat)`;
    case "POISON_DMG":
      return `**Sát thương Độc** (hệ số nhân DOT) +${PCT(p)}`;
    case "POISON_DUR":
      return `**Thời lượng / cường độ độc** +${Math.floor(eff.power * scale)} (theo hệ combat)`;
    case "LIFESTEAL":
      return `**Hút máu** (hệ số nhân) +${PCT(p)} — hồi HP theo % ST gây ra`;
    case "MULTI_HIT":
      return `**Đánh kép / đa đòn** — cơ hội gây thêm đòn (power ${p.toFixed(2)})`;
    case "REDUCE_DMG":
      return `**Giảm sát thương nhận** (hệ số defenseMult) +${PCT(p)}`;
    case "PROC_CHANCE":
      return `**Tỉ lệ kích hoạt skill** (proc) +${PCT(p)}`;
    case "LOW_HP_DMG":
      return `**Sát thương tăng khi máu thấp** (power ${p.toFixed(2)})`;
    case "PET_DMG":
      return `**Sát thương từ pet** +${PCT(p)}`;
    case "PET_CHANCE":
      return `**Tỉ lệ pet kích hoạt** +${PCT(p)}`;
    case "PET_PLAYER_SYN":
      return `**Đồng bộ pet ↔ nhân vật** (synergy, power ${p.toFixed(2)})`;
    case "HYBRID_BURN_POISON":
      return `**Cộng hưởng Đốt + Độc** (hybrid, power ${p.toFixed(2)})`;
    case "UNIQUE_CRIT_EXECUTE":
      return `**Nội tại:** ST chí mạng thêm **+${PCT(p)}** khi kẻ địch dưới **50%** máu (theo combat)`;
    case "UNIQUE_BURN_INSTANT":
      return `**Nội tại:** đốt có thể gây **bùng nổ / tick tức thì** (power ${p.toFixed(2)})`;
    case "UNIQUE_POISON_BURST":
      return `**Nội tại:** cơ chế **nổ độc** / burst poison khi đủ điều kiện`;
    case "UNIQUE_LIFE_DOUBLE":
      return `**Nội tại:** tăng hiệu quả **hút máu** khi máu thấp (power ${p.toFixed(2)})`;
    case "UNIQUE_BLOCK_HIT":
      return `**Nội tại:** có cơ hội **chặn hoàn toàn** một đòn (theo lượt)`;
    case "UNIQUE_PROC_TWICE":
      return `**Nội tại:** skill có thể **kích hoạt kép** / proc nhân (power ${p.toFixed(2)})`;
    case "UNIQUE_BERSERK_PERCENT":
      return `**Nội tại:** ST tăng theo **% máu đã mất** (hệ số ${p.toFixed(3)} × 100 mỗi 1% máu thiếu — xem combat)`;
    default:
      return `${eff.type} (power ${p.toFixed(3)})`;
  }
}

function describeSetBonusEffects(effects: AccessoryEffect[], label: string): string {
  if (!effects.length) return "";
  const lines = effects.map((e) => `  · ${describeAccessoryEffect(e, 0)}`);
  return `**${label}**\n${lines.join("\n")}`;
}

/** Mô tả đầy đủ để hiển thị shop / tooltip. */
export function describeAccessoryForShop(config: AccessoryConfig): string {
  const lines: string[] = [];

  lines.push(`📦 **Bộ:** ${config.set}`);
  lines.push("");
  lines.push("**Hiệu ứng món này (+0):**");
  for (const e of config.effects) {
    lines.push(`• ${describeAccessoryEffect(e, 0)}`);
  }

  const setDef = ACCESSORY_SETS[config.set];
  if (setDef) {
    lines.push("");
    lines.push("**Khi gom đủ bộ (cùng tên bộ, các slot phụ kiện khác nhau):**");
    lines.push(describeSetBonusEffects(setDef.bonus2, "🎯 2 món trở lên"));
    lines.push("");
    lines.push(describeSetBonusEffects(setDef.bonus3, "🎯 3 món (full bộ)"));
  }

  lines.push("");
  lines.push(
    "_Mỗi **+cấp** trên phụ kiện: hiệu ứng số nhân thêm **+5%** (×(1 + 0,05×cấp))._"
  );

  return lines.join("\n");
}
