import type { PrismaClient } from "@prisma/client";

const UPGRADE_COSTS = [0, 0, 10, 20, 40, 80, 120, 180, 250, 350, 500];

export async function addPetExp(
  petId: string,
  expAmount: number,
  tx: any
) {
  const pet = await tx.beast.findUnique({ where: { id: petId } });
  if (!pet || pet.level >= 10) return;

  let currentExp = pet.exp + expAmount;
  let currentLevel = pet.level;
  let currentSkillPower = pet.skillPower ?? 0;

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
      skillPower: currentSkillPower,
    },
  });

  return { leveledUp, newLevel: currentLevel };
}
