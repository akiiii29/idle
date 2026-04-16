import { prisma } from "../services/prisma";

async function run() {
  const users = await prisma.user.findMany({ where: { username: null } });
  console.log(`Updating ${users.length} users with null usernames...`);
  
  // Since we can't easily fetch their current discord name from here without client, 
  // let's set a placeholder or use their ID temporarily. 
  // They will be updated properly when they run /profile.
  for (const u of users) {
    await prisma.user.update({
      where: { id: u.id },
      data: { username: `Hunter_${u.id.substring(0, 5)}` }
    });
  }
  console.log("Migration finished.");
}

run().catch(console.error).finally(() => prisma.$disconnect());
