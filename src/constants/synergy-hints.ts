import { PET_CONFIGS } from "./pet-config";
import type { StatusFlags } from "../types/combat";

/** Flag dùng trong SYNERGY_LIST.req — gợi ý skill/pet cụ thể. */
export type SynergyFlag = keyof StatusFlags;

export interface ReqHint {
  /** Tên điều kiện (tiếng Việt) */
  label: string;
  /** Skill nhân vật (tên trùng DB / skill_shop) có thể tạo flag khi proc */
  playerSkills: string[];
  /** Ghi chú thêm (điều kiện đặc biệt) */
  note?: string;
}

/** Pet có skillType tương ứng (khi proc cùng pha với bạn). */
export const PET_FLAG_HINTS: Record<
  "petCrit" | "petBurn" | "petPoison" | "petShield" | "petHeal" | "petDebuff",
  { label: string; skillTypes: string[] }
> = {
  petCrit: { label: "Pet skill CRIT (khi pet đánh, pha ON_ATTACK)", skillTypes: ["CRIT"] },
  petBurn: { label: "Pet gây burn (skill BURN hoặc Cerberus)", skillTypes: ["BURN"] },
  petPoison: { label: "Pet gây độc (POISON / DOT / Cerberus)", skillTypes: ["POISON", "DOT"] },
  petShield: { label: "Pet lá chắn (SHIELD)", skillTypes: ["SHIELD"] },
  petHeal: { label: "Pet hồi máu (HEAL / HEAL_BUFF)", skillTypes: ["HEAL", "HEAL_BUFF"] },
  petDebuff: { label: "Pet giảm giáp (DEBUFF)", skillTypes: ["DEBUFF"] },
};

export function examplePetsForFlag(flag: keyof typeof PET_FLAG_HINTS): string[] {
  const out = new Set<string>();
  const types = PET_FLAG_HINTS[flag].skillTypes;
  for (const [name, cfg] of Object.entries(PET_CONFIGS)) {
    if (types.includes(cfg.skillType)) out.add(name);
  }
  if (flag === "petBurn" || flag === "petPoison") out.add("Cerberus");
  return [...out].sort().slice(0, 12);
}

/**
 * Map skill → flag khi skill **proc** (khớp logic `skill-system` + một số skill đặc biệt).
 */
export const SKILL_TO_SYNERGY_FLAGS: Record<string, SynergyFlag[]> = {
  "Critical Strike": ["didCrit"],
  "Savage Strike": ["didCrit"],
  "Phantom Step": ["didCrit", "didDodge"],
  "Heavy Blow": ["didHeavy"],
  "Brutal Force": ["didHeavy"],

  Bleed: ["didBleed"],
  "Deep Wound": ["didBleed"],
  "Toxic Bleed": ["didBleed"],
  "Hemorrhagic Burst": ["didBleed"],
  "Open Veins": ["didBleed"],

  "Double Strike": ["didMultiHit"],
  Flurry: ["didMultiHit"],
  "Blade Rush": ["didMultiHit"],
  "Hunter Instinct": ["didMultiHit"],
  "Sweeping Strike": ["didMultiHit"],
  "Rapid Jabs": ["didMultiHit"],

  Lifesteal: ["didLifesteal"],
  "Blood Feast": ["didLifesteal"],
  "Soul Siphon": ["didLifesteal"],

  "Iron Skin": ["didDamageReduction"],
  "Stone Skin": ["didDamageReduction"],
  Resilience: ["didDamageReduction"],
  "Flashbang": ["didDamageReduction"],
  "Tough Hide": ["didDamageReduction"],
  "Spiked Armor": ["didDamageReduction"],

  "Quick Reflex": ["didDodge"],
  "Evasion Mastery": ["didDodge"],
  "Mirror Image": ["didDodge"],
  Blur: ["didDodge"],

  Retaliation: ["didCounter"],
  "Counter Block": ["didCounter"],

  Precision: ["ignoreDef"],
  Overpower: ["ignoreDef"],
  "Crushing Blow": ["ignoreDef"],
  "Guard Break": ["ignoreDef"],
  Feint: ["ignoreDef"],

  Fireball: ["didBurn"],
  "Fire Blade": ["didBurn"],

  "Poison Sting": ["didPoison"],
  "Poison Strike": ["didPoison"],
  "Toxic Edge": ["didPoison"],
  "Venomous Touch": ["didPoison"],

  "Chaos Surge": ["chaosTriggered"],
  "Wild Surge": ["chaosTriggered"],
  "Entropy Field": ["chaosTriggered"],
  "Twist Fate": ["chaosTriggered"],
  "Miracle Proc": ["chaosTriggered"],

  Berserk: ["lowHp"],
  "Death Wish": ["lowHp"],
  "Last Stand": ["lowHp"],
  Adrenaline: ["lowHp"],
};

/** Gợi ý theo từng flag (thiếu gì thì học gì). */
export const REQ_HINTS: Partial<Record<SynergyFlag, ReqHint>> = {
  didCrit: {
    label: "Chí mạng từ skill (pha hiện tại)",
    playerSkills: ["Critical Strike", "Savage Strike"],
    note:
      "Thêm: **Phantom Step** (ON_DEFEND) cũng gán chí mạng khi proc ở pha thủ. **Chí mạng tự nhiên** (Luck, xem `/stats`) nếu nổ đúng lượt vẫn tính — không cần skill.",
  },
  didHeavy: {
    label: "Đòn Heavy Blow–style",
    playerSkills: ["Heavy Blow", "Brutal Force"],
  },
  didBleed: {
    label: "Chảy máu (Bleed / DOT bleed)",
    playerSkills: ["Bleed", "Deep Wound", "Toxic Bleed", "Hemorrhagic Burst", "Open Veins"],
  },
  didMultiHit: {
    label: "Đánh nhiều nhát / bồi",
    playerSkills: ["Double Strike", "Flurry", "Blade Rush", "Hunter Instinct", "Sweeping Strike", "Rapid Jabs"],
  },
  didLifesteal: {
    label: "Hút máu (Lifesteal)",
    playerSkills: ["Lifesteal", "Blood Feast", "Soul Siphon"],
  },
  didDamageReduction: {
    label: "Giảm sát thương nhận vào",
    playerSkills: ["Iron Skin", "Stone Skin", "Resilience", "Flashbang", "Tough Hide", "Spiked Armor"],
  },
  didDodge: {
    label: "Né đòn",
    playerSkills: ["Quick Reflex", "Evasion Mastery", "Mirror Image", "Blur", "Phantom Step"],
  },
  didCounter: {
    label: "Phản công / counter",
    playerSkills: ["Retaliation", "Counter Block"],
    note: "Một số skill giảm thương có thể kèm phản damage; trong DB hiện có **Retaliation**, **Counter Block**.",
  },
  ignoreDef: {
    label: "Xuyên giáp (ignore DEF)",
    playerSkills: ["Precision", "Overpower", "Crushing Blow", "Guard Break", "Feint"],
  },
  didBurn: {
    label: "Thiêu đốt (Burn)",
    playerSkills: ["Fireball", "Fire Blade"],
  },
  didPoison: {
    label: "Độc (Poison)",
    playerSkills: ["Poison Sting", "Poison Strike", "Toxic Edge", "Venomous Touch"],
  },
  chaosTriggered: {
    label: "Hỗn mang (Chaos proc)",
    playerSkills: ["Chaos Surge", "Wild Surge", "Entropy Field", "Twist Fate", "Miracle Proc"],
  },
  lowHp: {
    label: "Trạng thái / skill máu thấp",
    playerSkills: ["Berserk", "Death Wish", "Last Stand", "Adrenaline"],
    note: "Trong trận, **HP bạn < 30%** cũng được tính là lowHp cho một số hiệu ứng.",
  },
  petCrit: {
    label: "Pet CRIT (khi pet proc ON_ATTACK)",
    playerSkills: [],
  },
  petBurn: {
    label: "Pet Burn",
    playerSkills: [],
  },
  petPoison: {
    label: "Pet Poison",
    playerSkills: [],
  },
  petShield: {
    label: "Pet Shield",
    playerSkills: [],
  },
  petHeal: {
    label: "Pet hồi máu",
    playerSkills: [],
  },
  petDebuff: {
    label: "Pet Debuff (giảm giáp địch)",
    playerSkills: [],
  },
};

export function flagsFromPlayerSkillNames(skillNames: string[]): Set<SynergyFlag> {
  const s = new Set<SynergyFlag>();
  for (const name of skillNames) {
    const fs = SKILL_TO_SYNERGY_FLAGS[name];
    if (fs) fs.forEach((f) => s.add(f));
  }
  return s;
}

/** Pet đang mang có **khả năng** tạo flag khi proc (theo skillType). */
export function flagsFromEquippedPets(pets: { name: string; isEquipped?: boolean }[]): Set<SynergyFlag> {
  const s = new Set<SynergyFlag>();
  for (const p of pets) {
    if (!p.isEquipped) continue;
    if (p.name === "Cerberus") {
      s.add("petBurn");
      s.add("petPoison");
      continue;
    }
    const cfg = PET_CONFIGS[p.name];
    if (!cfg) continue;
    const t = cfg.skillType;
    if (t === "CRIT") s.add("petCrit");
    if (t === "BURN") s.add("petBurn");
    if (t === "POISON" || t === "DOT") s.add("petPoison");
    if (t === "SHIELD") s.add("petShield");
    if (t === "HEAL" || t === "HEAL_BUFF") s.add("petHeal");
    if (t === "DEBUFF") s.add("petDebuff");
  }
  return s;
}

export function ownedPetNamesByFlag(
  allPets: { name: string; isEquipped?: boolean }[]
): Map<SynergyFlag, { equipped: string[]; inventory: string[] }> {
  const map = new Map<SynergyFlag, { equipped: string[]; inventory: string[] }>();
  const add = (flag: SynergyFlag, name: string, equipped: boolean) => {
    if (!map.has(flag)) map.set(flag, { equipped: [], inventory: [] });
    const b = map.get(flag)!;
    (equipped ? b.equipped : b.inventory).push(name);
  };

  for (const p of allPets) {
    if (p.name === "Cerberus") {
      add("petBurn", p.name, !!p.isEquipped);
      add("petPoison", p.name, !!p.isEquipped);
      continue;
    }
    const cfg = PET_CONFIGS[p.name];
    if (!cfg) continue;
    const t = cfg.skillType;
    if (t === "CRIT") add("petCrit", p.name, !!p.isEquipped);
    if (t === "BURN") add("petBurn", p.name, !!p.isEquipped);
    if (t === "POISON" || t === "DOT") add("petPoison", p.name, !!p.isEquipped);
    if (t === "SHIELD") add("petShield", p.name, !!p.isEquipped);
    if (t === "HEAL" || t === "HEAL_BUFF") add("petHeal", p.name, !!p.isEquipped);
    if (t === "DEBUFF") add("petDebuff", p.name, !!p.isEquipped);
  }
  return map;
}
