import { prisma } from "../services/prisma";
import { PET_CONFIGS } from "../constants/pet-config";

async function migrate() {
  console.log("Starting full pet reset and random redistribution...");

  // 1. Get all current beasts to know what to replace
  const oldBeasts = await prisma.beast.findMany();
  console.log(`Found ${oldBeasts.length} existing pets to replace.`);

  // 2. Delete all existing beasts
  await prisma.beast.deleteMany();
  console.log("All old pets dropped from database.");

  // 3. Categorize configs by rarity
  const configsByRarity: Record<string, any[]> = {
    COMMON: [], RARE: [], EPIC: [], LEGENDARY: []
  };
  for (const cfg of Object.values(PET_CONFIGS)) {
    const rarity = cfg.rarity as string;
    if (configsByRarity[rarity]) {
      configsByRarity[rarity].push(cfg);
    }
  }

  // 4. Re-add random pets for each old one
  let createdCount = 0;
  for (const old of oldBeasts) {
    const rarityKey = old.rarity as string;
    const list = configsByRarity[rarityKey];
    if (!list || list.length === 0) continue;

    const randomCfg = list[Math.floor(Math.random() * list.length)]!;
    
    await prisma.beast.create({
      data: {
        ownerId: old.ownerId,
        name: randomCfg.name,
        rarity: old.rarity,
        power: old.power, 
        level: 1,
        exp: 0,
        role: randomCfg.role,
        skillType: randomCfg.skillType,
        skillPower: randomCfg.skillPower,
        trigger: randomCfg.trigger
      } as any
    });
    createdCount++;
  }

  // 5. Set strongest pet as equipped (Slot 1) for everyone
  const users = await prisma.user.findMany({ include: { beasts: true } });
  for (const user of users) {
    if (user.beasts.length > 0) {
      const topPet = [...user.beasts].sort((a, b) => b.power - a.power)[0]!;
      await prisma.beast.update({
        where: { id: topPet.id },
        data: { isEquipped: true, equipSlot: 1 }
      });
    }
  }

  console.log(`Migration finished. Re-generated ${createdCount} pets randomly.`);
}

migrate()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
