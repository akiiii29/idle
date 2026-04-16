import { prisma } from "../services/prisma";
import { PET_CONFIGS } from "../constants/pet-config";
import { Rarity } from "@prisma/client";

async function surgicalMigrate() {
  console.log("Starting surgical pet update (only patching missing roles/skills)...");

  // 1. Find all pets that have null role or name not in PET_CONFIGS
  const allBeasts = await prisma.beast.findMany();
  let updatedCount = 0;

  // Group PET_CONFIGS by rarity for fallback random picking
  const configsByRarity: Record<Rarity, any[]> = {
    [Rarity.COMMON]: [], [Rarity.RARE]: [], [Rarity.EPIC]: [], [Rarity.LEGENDARY]: []
  };
  for (const cfg of Object.values(PET_CONFIGS)) {
    configsByRarity[cfg.rarity].push(cfg);
  }

  for (const pet of allBeasts) {
    const config = PET_CONFIGS[pet.name];
    
    if (config) {
      // If name matches, just fill missing stats
      if (!pet.role || !pet.skillType) {
        await prisma.beast.update({
          where: { id: pet.id },
          data: {
            role: config.role,
            skillType: config.skillType,
            skillPower: config.skillPower,
            trigger: config.trigger
          }
        });
        updatedCount++;
      }
    } else {
      // If name doesn't match (old "Slime", etc.), pick a random one from same rarity
      const list = configsByRarity[pet.rarity];
      if (list && list.length > 0) {
        const randomCfg = list[Math.floor(Math.random() * list.length)]!;
        console.log(`Replacing old pet "${pet.name}" with "${randomCfg.name}" for user ${pet.ownerId}`);
        
        await prisma.beast.update({
          where: { id: pet.id },
          data: {
            name: randomCfg.name,
            role: randomCfg.role,
            skillType: randomCfg.skillType,
            skillPower: randomCfg.skillPower,
            trigger: randomCfg.trigger
          }
        });
        updatedCount++;
      }
    }
  }

  console.log(`Surgical migration finished. Updated ${updatedCount} pets.`);
}

surgicalMigrate()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
