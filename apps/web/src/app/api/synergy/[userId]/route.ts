import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SYNERGY_LIST } from "@game/core";
import { flagsFromPlayerSkillNames, flagsFromEquippedPets, REQ_HINTS, PET_FLAG_HINTS } from "@game/core/constants";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      skills: { include: { skill: true } },
      beasts: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const ownedSkillNames = new Set(user.skills.map((s) => s.skill?.name).filter(Boolean));
  const skillFlags = flagsFromPlayerSkillNames([...ownedSkillNames]);
  const petFlags = flagsFromEquippedPets(user.beasts ?? []);

  const active: any[] = [];
  const potential: any[] = [];

  for (const syn of SYNERGY_LIST) {
    const missing = syn.req.filter((r) => !hasFlag(r, skillFlags, petFlags));
    const met = syn.req.filter((r) => hasFlag(r, skillFlags, petFlags));

    if (missing.length === 0) {
      active.push({ ...syn, met, missing: [] });
    } else if (missing.length < syn.req.length || syn.req.length === 1) {
      potential.push({ ...syn, met, missing });
    }
  }

  // Pet-skill combo synergies (require both a pet flag + a skill flag to be possible)
  const petComboSyns = [
    {
      name: "🐾 Cộng hưởng Pet (Chí Mạng)",
      desc: "Pet Crit + Player Crit",
      bonus: "+20% sát thương đòn đánh",
      req: ["didCrit", "petCrit"],
      met: skillFlags.has("didCrit") && petFlags.has("petCrit") ? ["didCrit", "petCrit"] : [],
      missing: skillFlags.has("didCrit") && petFlags.has("petCrit") ? [] : (!skillFlags.has("didCrit") ? ["didCrit"] : []).concat(!petFlags.has("petCrit") ? ["petCrit"] : []),
    },
    {
      name: "🌋 Cộng hưởng Pet (Hỏa Hiện)",
      desc: "Pet Burn + Player Burn",
      bonus: "+50% sát thương thiêu đốt",
      req: ["didBurn", "petBurn"],
      met: skillFlags.has("didBurn") && petFlags.has("petBurn") ? ["didBurn", "petBurn"] : [],
      missing: skillFlags.has("didBurn") && petFlags.has("petBurn") ? [] : (!skillFlags.has("didBurn") ? ["didBurn"] : []).concat(!petFlags.has("petBurn") ? ["petBurn"] : []),
    },
    {
      name: "🤢 Cộng hưởng Pet (Độc Tố)",
      desc: "Pet Poison + Player Poison",
      bonus: "Tăng thêm 1 tầng độc tích tụ",
      req: ["didPoison", "petPoison"],
      met: skillFlags.has("didPoison") && petFlags.has("petPoison") ? ["didPoison", "petPoison"] : [],
      missing: skillFlags.has("didPoison") && petFlags.has("petPoison") ? [] : (!skillFlags.has("didPoison") ? ["didPoison"] : []).concat(!petFlags.has("petPoison") ? ["petPoison"] : []),
    },
    {
      name: "⚛️ Cộng hưởng Pet (Nguyên Tố)",
      desc: "Pet Burn + Pet Poison",
      bonus: "+25% tổng sát thương",
      req: ["petBurn", "petPoison"],
      met: petFlags.has("petBurn") && petFlags.has("petPoison") ? ["petBurn", "petPoison"] : [],
      missing: petFlags.has("petBurn") && petFlags.has("petPoison") ? [] : (!petFlags.has("petBurn") ? ["petBurn"] : []).concat(!petFlags.has("petPoison") ? ["petPoison"] : []),
    },
    {
      name: "🛡️ Cộng hưởng Pet (Phòng Thủ)",
      desc: "Player Reduce + Pet Shield",
      bonus: "+20% chỉ số giảm thương",
      req: ["didDamageReduction", "petShield"],
      met: skillFlags.has("didDamageReduction") && petFlags.has("petShield") ? ["didDamageReduction", "petShield"] : [],
      missing: skillFlags.has("didDamageReduction") && petFlags.has("petShield") ? [] : (!skillFlags.has("didDamageReduction") ? ["didDamageReduction"] : []).concat(!petFlags.has("petShield") ? ["petShield"] : []),
    },
    {
      name: "🩸 Cộng hưởng Pet (Hút Máu)",
      desc: "Player Lifesteal + Pet Heal",
      bonus: "+50% lượng máu hút được",
      req: ["didLifesteal", "petHeal"],
      met: skillFlags.has("didLifesteal") && petFlags.has("petHeal") ? ["didLifesteal", "petHeal"] : [],
      missing: skillFlags.has("didLifesteal") && petFlags.has("petHeal") ? [] : (!skillFlags.has("didLifesteal") ? ["didLifesteal"] : []).concat(!petFlags.has("petHeal") ? ["petHeal"] : []),
    },
    {
      name: "🎯 Cộng hưởng Pet (Xuyên Giáp)",
      desc: "Player Crit + Pet Debuff",
      bonus: "Đòn chí mạng xuyên 100% thủ",
      req: ["didCrit", "petDebuff"],
      met: skillFlags.has("didCrit") && petFlags.has("petDebuff") ? ["didCrit", "petDebuff"] : [],
      missing: skillFlags.has("didCrit") && petFlags.has("petDebuff") ? [] : (!skillFlags.has("didCrit") ? ["didCrit"] : []).concat(!petFlags.has("petDebuff") ? ["petDebuff"] : []),
    },
    {
      name: "💀 Cộng hưởng Pet (Hành Quyết)",
      desc: "Pet Crit + Mục tiêu <30% HP",
      bonus: "+30% sát thương đòn kết liễu",
      req: ["petCrit"],
      met: petFlags.has("petCrit") ? ["petCrit"] : [],
      missing: petFlags.has("petCrit") ? [] : ["petCrit"],
    },
  ];

  // Active pet combos (all reqs met)
  const petSkillCombos = petComboSyns.filter(s => s.missing.length === 0);

  return NextResponse.json({
    ownedSkillNames: [...ownedSkillNames],
    active,
    potential,
    total: SYNERGY_LIST.length + petComboSyns.length,
    petSkillCombos,
  });
}

function hasFlag(flag: string, skillFlags: Set<string>, petFlags: Set<string>): boolean {
  const petOnlyFlags = ["petCrit", "petBurn", "petPoison", "petShield", "petHeal", "petDebuff"];
  if (petOnlyFlags.includes(flag)) return petFlags.has(flag);
  return skillFlags.has(flag);
}
