/**
 * Migrate data from SQLite (dev.db) to Supabase (PostgreSQL)
 * Usage: npx tsx scripts/migrate-sqlite-to-supabase.ts
 */

import initSqlJs, { Database as SqlJsDatabase } from 'sql.js'
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const postgres = new PrismaClient()

async function getSqliteDb(): Promise<SqlJsDatabase> {
  const SQL = await initSqlJs()
  const filePath = path.resolve('./prisma/dev.db')
  const fileBuffer = fs.readFileSync(filePath)
  return new SQL.Database(fileBuffer)
}

function getAll(db: SqlJsDatabase, table: string) {
  const results = db.exec(`SELECT * FROM ${table}`)
  if (results.length === 0) return []

  const { columns, values } = results[0]
  return values.map(row => {
    const obj: any = {}
    columns.forEach((col, i) => {
      obj[col] = row[i]
    })
    return obj
  })
}

// Convert SQLite integer booleans (0/1) to PostgreSQL booleans
function convertBooleans<T extends Record<string, any>>(obj: T): T {
  const boolFields = ['hasChangedUsername', 'isBusy', 'hasReceivedNewbieGift', 'isEquipped', 'isCompleted', 'isClaimed', 'purchased']
  const result = { ...obj }
  for (const field of boolFields) {
    if (field in result && (result[field] === 0 || result[field] === 1)) {
      result[field] = result[field] === 1
    }
  }
  return result
}

// Convert Unix timestamps (ms) to ISO strings for PostgreSQL DateTime
function convertTimestamps<T extends Record<string, any>>(obj: T): T {
  const timestampFields = ['lastHunt', 'lastDaily', 'lastHpUpdatedAt', 'hospitalUntil', 'busyUntil', 'tavernUntil', 'lastActiveAt', 'lastAutoHuntChargeAt', 'lastAutoHuntAt', 'createdAt', 'updatedAt', 'capturedAt', 'refreshedAt', 'resetAt']
  const result = { ...obj }
  for (const field of timestampFields) {
    if (field in result && result[field] !== null) {
      const val = result[field]
      // If it's a number (Unix timestamp in ms), convert to Date
      if (typeof val === 'number' && val > 0) {
        result[field] = new Date(val).toISOString()
      }
    }
  }
  return result
}

function convert<T extends Record<string, any>>(obj: T): T {
  return convertTimestamps(convertBooleans(obj))
}

async function migrate() {
  console.log('🚀 Starting migration from SQLite to Supabase...\n')

  const db = await getSqliteDb()

  // Clear existing data
  console.log('🧹 Clearing existing data...')
  await postgres.quest.deleteMany()
  await postgres.shopListing.deleteMany()
  await postgres.userQuest.deleteMany()
  await postgres.combatLog.deleteMany()
  await postgres.userSkill.deleteMany()
  await postgres.item.deleteMany()
  await postgres.beast.deleteMany()
  await postgres.user.deleteMany()
  console.log('  ✓ Cleared existing data')

  // Migrate Quest
  console.log('\n📜 Migrating Quests...')
  const quests = getAll(db, 'Quest') as any[].map(convert)
  await postgres.quest.createMany({ data: quests, skipDuplicates: true })
  console.log(`  ✓ ${quests.length} quests migrated`)

  // Migrate Users
  console.log('\n👤 Migrating Users...')
  const users = getAll(db, 'User') as any[].map(convert)
  await postgres.user.createMany({ data: users, skipDuplicates: true })
  console.log(`  ✓ ${users.length} users migrated`)

  // Migrate Skills
  console.log('\n⚔️ Migrating Skills...')
  const skills = getAll(db, 'Skill') as any[].map(convert)
  await postgres.skill.createMany({ data: skills, skipDuplicates: true })
  console.log(`  ✓ ${skills.length} skills migrated`)

  // Migrate Beasts
  console.log('\n🐾 Migrating Beasts...')
  const beasts = getAll(db, 'Beast') as any[].map(convert)
  await postgres.beast.createMany({ data: beasts, skipDuplicates: true })
  console.log(`  ✓ ${beasts.length} beasts migrated`)

  // Migrate Items
  console.log('\n🎒 Migrating Items...')
  const items = getAll(db, 'Item') as any[].map(convert)
  await postgres.item.createMany({ data: items, skipDuplicates: true })
  console.log(`  ✓ ${items.length} items migrated`)

  // Migrate UserSkills
  console.log('\n✨ Migrating UserSkills...')
  const userSkills = getAll(db, 'UserSkill') as any[].map(convert)
  await postgres.userSkill.createMany({ data: userSkills, skipDuplicates: true })
  console.log(`  ✓ ${userSkills.length} userSkills migrated`)

  // Migrate CombatLogs
  console.log('\n📊 Migrating CombatLogs...')
  const combatLogs = getAll(db, 'CombatLog') as any[].map(convert)
  await postgres.combatLog.createMany({ data: combatLogs, skipDuplicates: true })
  console.log(`  ✓ ${combatLogs.length} combatLogs migrated`)

  // Migrate UserQuests
  console.log('\n📋 Migrating UserQuests...')
  const userQuests = getAll(db, 'UserQuest') as any[].map(convert)
  await postgres.userQuest.createMany({ data: userQuests, skipDuplicates: true })
  console.log(`  ✓ ${userQuests.length} userQuests migrated`)

  // Migrate ShopListings
  console.log('\n🏪 Migrating ShopListings...')
  const shopListings = getAll(db, 'ShopListing') as any[].map(convert)
  await postgres.shopListing.createMany({ data: shopListings, skipDuplicates: true })
  console.log(`  ✓ ${shopListings.length} shopListings migrated`)

  db.close()
  console.log('\n✅ Migration complete!')
}

migrate()
  .catch(console.error)
  .finally(() => {
    postgres.$disconnect()
    process.exit(0)
  })
