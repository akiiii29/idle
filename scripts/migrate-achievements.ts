import { PrismaClient } from "@prisma/client";
import { TITLES } from "../src/constants/titles";

const prisma = new PrismaClient();

async function run() {
  console.log("Checking legacy achievements...");
  
  // Find old achievement quests
  const oldQuests = await prisma.quest.findMany({
    where: { type: "ACHIEVEMENT" }
  });
  
  console.log("Old achievements found:", oldQuests.map(q => q.id));

  const usersWithClaimed = await prisma.userQuest.findMany({
    where: {
      quest: { type: "ACHIEVEMENT" },
      isClaimed: true
    },
    include: {
      user: true,
      quest: true
    }
  });

  console.log(`Found ${usersWithClaimed.length} claimed records for achievements.`);
  
  if (usersWithClaimed.length === 0) {
     console.log("No users to migrate.");
     return;
  }

  // Group by user
  for (const record of usersWithClaimed) {
    let unlocked = record.user.unlockedTitles ? JSON.parse(record.user.unlockedTitles as string) : [];
    
    // We attempt to match the old titleReward with the new TITLES.key
    // Because maybe the old title was direct string mapping
    const titleAwarded = record.quest.titleReward;
    if (titleAwarded) {
      if (!unlocked.includes(titleAwarded)) {
        unlocked.push(titleAwarded);
        await prisma.user.update({
          where: { id: record.user.id },
          data: { unlockedTitles: JSON.stringify(unlocked) }
        });
        console.log(`Migrated title "${titleAwarded}" for user ${record.user.id}`);
      }
    }
  }
  
  console.log("Migration check complete.");
}

run().catch(console.error).finally(() => prisma.$disconnect());
