/**
 * Migrate data from SQLite (dev.db) to Supabase (PostgreSQL)
 * Usage: npx tsx scripts/migrate-sqlite-to-supabase.ts
 */

import Database from 'better-sqlite3'
import { PrismaClient } from '@prisma/client'

const sqlite = new Database('D:/works/idle/idle/prisma/dev.db')
const postgres = new PrismaClient()

function getAll(table: string) {
  const stmt = sqlite.prepare(`SELECT * FROM ${table}`)
  return stmt.all()
}

async function migrate() {
  console.log('🚀 Starting migration from SQLite to Supabase...\n')

  // Migrate Quest first (no dependencies)
  console.log('📜 Migrating Quests...')
  const quests = getAll('Quest') as any[]
  for (const quest of quests) {
    await postgres.quest.upsert({
      where: { id: quest.id },
      create: quest,
      update: quest,
    })
  }
  console.log(`  ✓ ${quests.length} quests migrated`)

  // Migrate Users
  console.log('\n👤 Migrating Users...')
  const users = getAll('User') as any[]
  for (const user of users) {
    await postgres.user.upsert({
      where: { id: user.id },
      create: user,
      update: user,
    })
  }
  console.log(`  ✓ ${users.length} users migrated`)

  // Migrate Skills
  console.log('\n⚔️ Migrating Skills...')
  const skills = getAll('Skill') as any[]
  for (const skill of skills) {
    await postgres.skill.upsert({
      where: { id: skill.id },
      create: skill,
      update: skill,
    })
  }
  console.log(`  ✓ ${skills.length} skills migrated`)

  // Migrate Beasts
  console.log('\n🐾 Migrating Beasts...')
  const beasts = getAll('Beast') as any[]
  for (const beast of beasts) {
    await postgres.beast.upsert({
      where: { id: beast.id },
      create: beast,
      update: beast,
    })
  }
  console.log(`  ✓ ${beasts.length} beasts migrated`)

  // Migrate Items
  console.log('\n🎒 Migrating Items...')
  const items = getAll('Item') as any[]
  for (const item of items) {
    await postgres.item.upsert({
      where: { id: item.id },
      create: item,
      update: item,
    })
  }
  console.log(`  ✓ ${items.length} items migrated`)

  // Migrate UserSkills
  console.log('\n✨ Migrating UserSkills...')
  const userSkills = getAll('UserSkill') as any[]
  for (const us of userSkills) {
    await postgres.userSkill.upsert({
      where: { id: us.id },
      create: us,
      update: us,
    })
  }
  console.log(`  ✓ ${userSkills.length} userSkills migrated`)

  // Migrate CombatLogs
  console.log('\n📊 Migrating CombatLogs...')
  const combatLogs = getAll('CombatLog') as any[]
  for (const log of combatLogs) {
    await postgres.combatLog.upsert({
      where: { id: log.id },
      create: log,
      update: log,
    })
  }
  console.log(`  ✓ ${combatLogs.length} combatLogs migrated`)

  // Migrate UserQuests
  console.log('\n📋 Migrating UserQuests...')
  const userQuests = getAll('UserQuest') as any[]
  for (const uq of userQuests) {
    await postgres.userQuest.upsert({
      where: { id: uq.id },
      create: uq,
      update: uq,
    })
  }
  console.log(`  ✓ ${userQuests.length} userQuests migrated`)

  // Migrate ShopListings
  console.log('\n🏪 Migrating ShopListings...')
  const shopListings = getAll('ShopListing') as any[]
  for (const sl of shopListings) {
    await postgres.shopListing.upsert({
      where: { id: sl.id },
      create: sl,
      update: sl,
    })
  }
  console.log(`  ✓ ${shopListings.length} shopListings migrated`)

  console.log('\n✅ Migration complete!')
}

migrate()
  .catch(console.error)
  .finally(() => {
    sqlite.close()
    postgres.$disconnect()
    process.exit(0)
  })
