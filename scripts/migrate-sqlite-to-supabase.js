/**
 * Migrate data from SQLite (dev.db) to Supabase (PostgreSQL)
 * Usage: node scripts/migrate-sqlite-to-supabase.js
 */

import initSqlJs from 'sql.js'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const postgres = new PrismaClient()

async function getSqliteDb() {
  const SQL = await initSqlJs()
  const filePath = path.resolve(__dirname, '../prisma/dev.db')
  const fileBuffer = fs.readFileSync(filePath)
  return new SQL.Database(fileBuffer)
}

function getAll(db, table) {
  const results = db.exec(`SELECT * FROM ${table}`)
  if (results.length === 0) return []

  const { columns, values } = results[0]
  return values.map(row => {
    const obj = {}
    columns.forEach((col, i) => {
      obj[col] = row[i]
    })
    return obj
  })
}

const boolFields = ['hasChangedUsername', 'isBusy', 'hasReceivedNewbieGift', 'isEquipped', 'isCompleted', 'isClaimed', 'purchased', 'ignoreDef', 'extraHit', 'scaleWithHp', 'scaleWithPet', 'instantBleedTick', 'rerollFailedProc', 'isCritGuaranteed', 'isTripleHit', 'isWin']
const timestampFields = ['lastHunt', 'lastDaily', 'lastHpUpdatedAt', 'hospitalUntil', 'busyUntil', 'tavernUntil', 'lastActiveAt', 'lastAutoHuntChargeAt', 'lastAutoHuntAt', 'createdAt', 'updatedAt', 'capturedAt', 'refreshedAt', 'resetAt']

function convert(obj) {
  const result = { ...obj }

  // Convert integer booleans to actual booleans
  for (const field of boolFields) {
    if (field in result && (result[field] === 0 || result[field] === 1)) {
      result[field] = result[field] === 1
    }
  }

  // Convert Unix timestamps (ms) to ISO strings
  for (const field of timestampFields) {
    if (field in result && result[field] !== null) {
      const val = result[field]
      // If it's a Unix timestamp number (ms), convert to ISO
      if (typeof val === 'number' && val > 0) {
        result[field] = new Date(val).toISOString()
      }
      // If it's a date string like "2026-04-04 12:09:08", convert to ISO
      else if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
        result[field] = new Date(val.replace(' ', 'T') + '.000Z').toISOString()
      }
    }
  }

  return result
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
  const quests = getAll(db, 'Quest').map(convert)
  await postgres.quest.createMany({ data: quests, skipDuplicates: true })
  console.log(`  ✓ ${quests.length} quests migrated`)

  // Migrate Users
  console.log('\n👤 Migrating Users...')
  const users = getAll(db, 'User').map(convert)
  await postgres.user.createMany({ data: users, skipDuplicates: true })
  console.log(`  ✓ ${users.length} users migrated`)

  // Migrate Skills
  console.log('\n⚔️ Migrating Skills...')
  const skills = getAll(db, 'Skill').map(convert)
  await postgres.skill.createMany({ data: skills, skipDuplicates: true })
  console.log(`  ✓ ${skills.length} skills migrated`)

  // Migrate Beasts
  console.log('\n🐾 Migrating Beasts...')
  const beasts = getAll(db, 'Beast').map(convert)
  await postgres.beast.createMany({ data: beasts, skipDuplicates: true })
  console.log(`  ✓ ${beasts.length} beasts migrated`)

  // Migrate Items
  console.log('\n🎒 Migrating Items...')
  const items = getAll(db, 'Item').map(convert)
  await postgres.item.createMany({ data: items, skipDuplicates: true })
  console.log(`  ✓ ${items.length} items migrated`)

  // Migrate UserSkills
  console.log('\n✨ Migrating UserSkills...')
  const userSkills = getAll(db, 'UserSkill').map(convert)
  await postgres.userSkill.createMany({ data: userSkills, skipDuplicates: true })
  console.log(`  ✓ ${userSkills.length} userSkills migrated`)

  // Migrate CombatLogs
  console.log('\n📊 Migrating CombatLogs...')
  const combatLogs = getAll(db, 'CombatLog').map(convert)
  await postgres.combatLog.createMany({ data: combatLogs, skipDuplicates: true })
  console.log(`  ✓ ${combatLogs.length} combatLogs migrated`)

  // Migrate UserQuests
  console.log('\n📋 Migrating UserQuests...')
  const userQuests = getAll(db, 'UserQuest').map(convert)
  await postgres.userQuest.createMany({ data: userQuests, skipDuplicates: true })
  console.log(`  ✓ ${userQuests.length} userQuests migrated`)

  // Migrate ShopListings
  console.log('\n🏪 Migrating ShopListings...')
  const shopListings = getAll(db, 'ShopListing').map(convert)
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
