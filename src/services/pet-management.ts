import { prisma } from "./prisma";
import { Rarity } from "@prisma/client";
import { enrichBeast } from "./pet-utils";

export const ESSENCE_VALUES: Record<Rarity, number> = {
  [Rarity.COMMON]: 5,
  [Rarity.RARE]: 15,
  [Rarity.EPIC]: 40,
  [Rarity.LEGENDARY]: 100,
};

export const GOLD_VALUES: Record<Rarity, number> = {
  [Rarity.COMMON]: 10,
  [Rarity.RARE]: 30,
  [Rarity.EPIC]: 80,
  [Rarity.LEGENDARY]: 200,
};

export const UPGRADE_COSTS = [0, 0, 10, 20, 40, 80, 120, 180, 250, 350, 500]; // Level 1 is base, index is target level

export function calculateDismantleEssence(pet: any) {
  const base = ESSENCE_VALUES[pet.rarity as Rarity] || 0;
  const bonus = (pet.level > 1) ? (pet.level * 2) : 0;
  let total = base + bonus;
  if (pet.rarity === Rarity.EPIC || pet.rarity === Rarity.LEGENDARY) {
    total = Math.floor(total * 1.1);
  }
  return total;
}

export async function dismantlePet(userId: string, petId: string) {
  const pet = await prisma.beast.findUnique({
    where: { id: petId },
    include: { user: true }
  });

  if (!pet || pet.ownerId !== userId) throw new Error("Pet không tồn tại hoặc không thuộc về bạn.");
  if (pet.isEquipped) throw new Error("Không thể phân rã Pet đang xuất chiến.");

  const essenceGained = calculateDismantleEssence(pet);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { petEssence: { increment: essenceGained } } as any
    }),
    prisma.beast.delete({
      where: { id: petId }
    })
  ]);

  return { essenceGained };
}

export async function sellPet(userId: string, petId: string) {
  const pet = await prisma.beast.findUnique({
    where: { id: petId }
  });

  if (!pet || pet.ownerId !== userId) throw new Error("Pet không tồn tại hoặc không thuộc về bạn.");
  if (pet.isEquipped) throw new Error("Không thể bán Pet đang xuất chiến.");

  const goldGained = GOLD_VALUES[pet.rarity as Rarity] || 0;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { gold: { increment: goldGained } }
    }),
    prisma.beast.delete({
      where: { id: petId }
    })
  ]);

  return { goldGained };
}

export async function upgradePet(userId: string, petId: string) {
  const pet = await prisma.beast.findUnique({
    where: { id: petId }
  });

  if (!pet || pet.ownerId !== userId) throw new Error("Pet không tồn tại.");
  if (pet.level >= 10) throw new Error("Pet đã đạt cấp tối đa (10).");

  const nextLevel = pet.level + 1;
  const cost = UPGRADE_COSTS[nextLevel] || 0;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || (user as any).petEssence < cost) throw new Error(`Không đủ Tinh hoa sủng vật (${cost}).`);

  const updatedPet = await prisma.beast.update({
    where: { id: petId },
    data: { 
      level: nextLevel,
      // Increase skillPower by 5% per level (multiplicative)
      skillPower: { multiply: 1.05 } 
    }
  });

  await prisma.user.update({
    where: { id: userId },
    data: { petEssence: { decrement: cost } } as any
  });

  return { 
    petLevel: updatedPet.level, 
    upgradeCost: UPGRADE_COSTS[updatedPet.level + 1] || 0 
  };
}

export async function addPetExp(petId: string, expAmount: number, tx: any = prisma) {
  const pet = await tx.beast.findUnique({ where: { id: petId } });
  if (!pet || pet.level >= 10) return;

  let currentExp = pet.exp + expAmount;
  let currentLevel = pet.level;
  let currentSkillPower = pet.skillPower;

  let leveledUp = false;
  while (currentLevel < 10) {
    const nextLevel = currentLevel + 1;
    const cost = UPGRADE_COSTS[nextLevel];
    if (cost === undefined) break;
    if (currentExp >= cost) {
      currentExp -= cost;
      currentLevel = nextLevel;
      currentSkillPower *= 1.05;
      leveledUp = true;
    } else {
      break;
    }
  }

  await tx.beast.update({
    where: { id: petId },
    data: {
      exp: currentExp,
      level: currentLevel,
      skillPower: currentSkillPower
    }
  });

  return { leveledUp, newLevel: currentLevel };
}

export async function sacrificePet(userId: string, petId: string) {
  const pet = await prisma.beast.findUnique({
    where: { id: petId }
  });

  if (!pet || pet.ownerId !== userId) throw new Error("Pet không tồn tại.");
  if (pet.isEquipped) throw new Error("Không thể hiến tế Pet đang xuất chiến.");

  const enriched = enrichBeast(pet);
  const updateData: any = {};

  if (enriched.role === "DPS") updateData.talentDps = { increment: 1 };
  else if (enriched.role === "TANK") updateData.talentTank = { increment: 1 };
  else if (enriched.role === "SUPPORT") updateData.talentSupport = { increment: 1 };

  if (enriched.skillType === "BURN") updateData.talentBurn = { increment: 1 };
  else if (enriched.skillType === "POISON") updateData.talentPoison = { increment: 1 };

  const [updatedUser] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: updateData
    }),
    prisma.beast.delete({
      where: { id: petId }
    })
  ]);

  const u = updatedUser as any;
  return {
    talentProgress: {
        dps: u.talentDps,
        tank: u.talentTank,
        support: u.talentSupport,
        burn: u.talentBurn,
        poison: u.talentPoison
    }
  };
}

export async function bulkDismantlePets(userId: string, rarity: Rarity) {
  const pets = await prisma.beast.findMany({
    where: { ownerId: userId, rarity, isEquipped: false }
  });
  if (pets.length === 0) return { count: 0, essenceGained: 0 };
  let totalEssence = 0;
  for (const pet of pets) {
    totalEssence += calculateDismantleEssence(pet);
  }
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { petEssence: { increment: totalEssence } } as any }),
    prisma.beast.deleteMany({ where: { id: { in: pets.map(p => p.id) } } })
  ]);
  return { count: pets.length, essenceGained: totalEssence };
}

export async function bulkSellPets(userId: string, rarity: Rarity) {
  const pets = await prisma.beast.findMany({
      where: { ownerId: userId, rarity, isEquipped: false }
  });
  if (pets.length === 0) return { count: 0, goldGained: 0 };
  const basePrice = GOLD_VALUES[rarity] || 0;
  const totalGold = pets.length * basePrice;
  await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { gold: { increment: totalGold } } }),
      prisma.beast.deleteMany({ where: { id: { in: pets.map(p => p.id) } } })
  ]);
  return { count: pets.length, goldGained: totalGold };
}

export async function bulkSacrificePets(userId: string, rarity: Rarity) {
    const pets = await prisma.beast.findMany({
        where: { ownerId: userId, rarity, isEquipped: false }
    });
    if (pets.length === 0) return { count: 0 };

    const updateData: any = {};
    for (const pet of pets) {
        const enriched = enrichBeast(pet);
        if (enriched.role === "DPS") updateData.talentDps = { increment: (updateData.talentDps?.increment || 0) + 1 };
        else if (enriched.role === "TANK") updateData.talentTank = { increment: (updateData.talentTank?.increment || 0) + 1 };
        else if (enriched.role === "SUPPORT") updateData.talentSupport = { increment: (updateData.talentSupport?.increment || 0) + 1 };

        if (enriched.skillType === "BURN") updateData.talentBurn = { increment: (updateData.talentBurn?.increment || 0) + 1 };
        else if (enriched.skillType === "POISON") updateData.talentPoison = { increment: (updateData.talentPoison?.increment || 0) + 1 };
    }

    await prisma.$transaction([
        prisma.user.update({ where: { id: userId }, data: updateData }),
        prisma.beast.deleteMany({ where: { id: { in: pets.map(p => p.id) } } })
    ]);

    return { count: pets.length };
}
