# Idle RPG Discord Bot

A Discord RPG bot with full combat system, pet management, dungeon crawling, and character progression.

## What This Project Does

### Core Features

**Combat & Hunting**
- Real-time turn-based combat with animated Discord embeds
- Wild beast encounters with rarity tiers (Common → Legendary)
- Boss fights, capture mechanics, and beast taming
- Auto-hunt for continuous farming

**Character Progression**
- Level, EXP, and talent systems (DPS, Tank, Support, Burn, Poison)
- Stats: STR, AGI, LUCK, HP, ATK, DEF, SPD, Crit Rate/Damage
- Titles with permanent passive bonuses
- Achievements and daily/weekly quests

**Equipment System**
- Weapon and Armor pools with rarity-based power
- Accessory system with unique effects and set bonuses
- Upgrade system with fail/success mechanics
- Scrap and salvage system

**Pet System**
- 30+ pet types with roles (DPS/Tank/Support)
- Pet leveling and evolution
- Pet synergy system (10+ combinations)
- Pet fusion, sacrifice, and essence rewards

**Dungeons**
- 10-floor roguelike dungeon with branching events
- Boss floors, rest events, loot drops
- Relic drops (damage, lifesteal, burn, poison, crit...)
- Relic synergy system

**Shops & Economy**
- Weapon/Armor shop with rotating stock
- Accessory shop
- Skill shop
- Daily rewards, tavern healing, gamble system

### Commands (25+)

| Command | Description |
|---------|-------------|
| `/hunt` | Hunt beasts, real-time combat with animated embeds |
| `/profile` | View hunter card, inventory, equipped pets |
| `/stats` | Detailed stat breakdown with multipliers |
| `/inventory` | View all items and equipment |
| `/equip` / `/unequip` | Equip or unequip items |
| `/shop` | Buy weapons and armor |
| `/skill-shop` | Purchase active skills |
| `/skills` | View owned skills |
| `/beasts` | Manage pets (upgrade, sell, fuse, sacrifice) |
| `/daily` | Claim daily rewards |
| `/tavern` | Heal HP over time |
| `/revive` | Pay gold to leave hospital immediately |
| `/dungeon` | 10-floor roguelike dungeon run |
| `/practice` | PvP practice battle |
| `/synergy` / `/synergies` | View pet synergy bonuses |
| `/quest` | View and claim daily/weekly quests |
| `/achievements` | Track and claim achievements |
| `/upgrade` | Upgrade equipment with risk/reward |
| `/use` | Use consumable items |
| `/scrap` | Convert items to scrap |
| `/register` | Create new account |
| `/setname` | Change username |
| `/quatanthu` | View server leaderboard |
| `/help-rpg` | Full command documentation |

---

## Project Structure (Monorepo)

```
idle/
├── packages/
│   └── game-core/              # Pure game logic — NO Discord.js, NO Prisma runtime
│       ├── src/
│       │   ├── types/
│       │   │   ├── combat.ts       # BattleResult, CombatContext, CombatParticipant
│       │   │   └── rpg-enums.ts   # Rarity, ItemType, SkillType, SkillTrigger unions
│       │   ├── constants/
│       │   │   ├── beasts.ts       # Beast definitions and spawn tables
│       │   │   ├── config.ts       # Timings, rates, multipliers
│       │   │   ├── pet-config.ts   # Pet stats, roles, skill types
│       │   │   ├── item-pool.ts    # Weapon/armor definitions
│       │   │   ├── accessory-config.ts  # Accessory effects and sets
│       │   │   ├── relic-pool.ts   # Relic types and definitions
│       │   │   ├── titles.ts       # Title bonuses
│       │   │   └── synergy-hints.ts # Pet synergy requirements
│       │   └── services/
│       │       ├── combat-engine.ts   # simulateCombat() — pure combat logic
│       │       ├── combat-utils.ts    # calculateDamage, applyDamage, effects
│       │       ├── skill-system.ts    # 70+ skills, applySkills(), SYNERGY_LIST
│       │       ├── pet-system.ts      # applyPetEffects()
│       │       ├── pet-synergy.ts     # getActiveSynergies(), applyPetSynergy()
│       │       ├── pet-utils.ts       # enrichBeast(), calculatePetStatBonus()
│       │       ├── stats-service.ts   # computeCombatStats() — main stat pipeline
│       │       ├── leveling.ts        # requiredExpForLevel(), applyLevelUps()
│       │       ├── hunt-service.ts    # createWildBeast(), rollRarity()
│       │       ├── relic-system.ts    # applyRelicsBeforeCombat, applyRelicsOnTurn
│       │       ├── relic-engine.ts    # dealDamage, healUnit, executeUnit
│       │       ├── relic-synergy.ts   # SYNERGY_POOL, applySynergyEffects()
│       │       └── rng.ts             # randomInt, rollPercent, pickRandom
│       └── prisma/
│           └── schema.prisma       # SINGLE SOURCE OF TRUTH for DB schema
│
├── packages/
│   └── bot/                     # Discord bot — imports @game/core
│       ├── src/
│       │   ├── commands/            # 25+ Discord slash commands
│       │   ├── services/            # DB operations, Discord embeds, canvas cards
│       │   ├── utils/               # UI helpers (HP bars, canvas rendering)
│       │   └── index.ts             # Bot entry point
│       └── prisma/
│           └── schema -> ../game-core/prisma/schema.prisma
│
└── apps/
    └── web/                     # Next.js web app — imports @game/core
        ├── src/
        │   ├── app/                # Next.js App Router pages
        │   └── lib/game/          # Server-side wrappers around @game/core
        └── prisma/
            └── schema -> ../../packages/game-core/prisma/schema.prisma
```

---

## Architecture

### 3-Layer Combat System

```
┌─────────────────────────────────────────────┐
│  Layer 1: Commands (Discord UI)              │
│  /hunt, /dungeon, /practice — Discord.js    │
│  Buttons, embeds, autocomplete              │
└────────────────────┬────────────────────────┘
                     │ calls
┌────────────────────▼────────────────────────┐
│  Layer 2: Combat Engine (pure logic)         │
│  simulateCombat() in game-core               │
│  - No Discord.js, no Prisma                  │
│  - Returns BattleResult with full logs        │
│  - Applies skills, pets, relics, synergies   │
└────────────────────┬────────────────────────┘
                     │ computed
┌────────────────────▼────────────────────────┐
│  Layer 3: Stats Pipeline                     │
│  computeCombatStats()                        │
│  STR→ATK, AGI→SPD, LUCK→CRIT, items, pets   │
└─────────────────────────────────────────────┘
```

### Data Flow for `/hunt`

```
User runs /hunt
  → hunt.ts command handler
    → computeCombatStats() from @game/core  (calculate player stats)
    → simulateCombat() from @game/core      (run pure combat loop)
      → applySkills() from @game/core       (skill triggers)
      → applyPetEffects() from @game/core   (pet passives)
      → applyPetSynergy() from @game/core   (pet combos)
      → applyRelicsBeforeCombat() from @game/core
    → Returns BattleResult with full logs
  → Discord embed updated each turn
  → Prisma DB update (gold, exp, HP, achievements)
```

---

## Key Technical Decisions

### Why String Literal Unions Instead of Prisma Enums?

`game-core` has **zero runtime dependencies**. Prisma enums require `@prisma/client` which has a runtime component. Instead:

```typescript
// packages/game-core/src/types/rpg-enums.ts
export type Rarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
export type ItemType = "WEAPON" | "ARMOR" | "ACCESSORY" | "CONSUMABLE" | ...;
export type SkillType = "DAMAGE" | "DOT" | "DODGE" | "HEAL" | ...;
export type SkillTrigger = "ON_ATTACK" | "ON_DEFEND" | "ON_TURN_START";
```

Both `packages/bot` and `apps/web` import these from `@game/core` instead of `@prisma/client`.

### Why Prisma Schema in game-core?

Schema lives in `packages/game-core/prisma/schema.prisma` as the **single source of truth**. Both `bot` and `web` reference it:

```json
// packages/bot/package.json
"prisma": { "schema": "../game-core/prisma/schema.prisma" }

// packages/web/package.json
"prisma": { "schema": "../game-core/prisma/schema.prisma" }
```

### RARITY_COLORS/BADGE/BANNER Stay in Bot

These are Discord-specific UI constants. `game-core` only exports game data, not UI.

---

## Running the Project

```bash
# Install all dependencies
pnpm install

# Generate Prisma client (reads schema from game-core)
pnpm --filter @rpg/bot prisma:generate

# Run bot in development
pnpm --filter @rpg/bot dev

# Run web app in development
pnpm --filter @rpg/web dev

# Build all packages
pnpm --filter @rpg/core build
pnpm --filter @rpg/bot build
pnpm --filter @rpg/web build
```

### Environment Variables

```env
# packages/bot/.env
DATABASE_URL="file:./dev.db"
DISCORD_TOKEN="your-bot-token"
```

---

## Database Schema (Prisma)

Main models: `User`, `Beast`, `Item`, `Skill`, `UserSkill`, `CombatLog`, `Quest`, `UserQuest`, `ShopListing`

Notable features:
- `User` has `beasts[]`, `inventory[]`, `skills[]`, `quests[]` relations
- `Beast` supports RPG fields: `role`, `skillType`, `skillPower`, `trigger`
- `Skill` has 30+ fields for 70+ unique skills
- `User.unlockedTitles` stored as JSON string array
- Daily shop rotation with `ShopListing` model

---

## Public API (game-core)

```typescript
// All exports from packages/game-core/src/index.ts

// Types
export type { Rarity, ItemType, SkillType, SkillTrigger, QuestType }
export type { CombatParticipant, CombatContext, BattleResult, CombatLog }

// Constants
export { RARITY_BASE_RATES, HP_RECOVERY_INTERVAL_MS, TAVERN_HEAL_INTERVAL_MS, ... }
export { PET_CONFIGS, WEAPON_POOL, ARMOR_POOL, ALL_ITEMS, ... }
export { TITLES, SYNERGY_HINTS, PET_FLAG_HINTS, ... }

// Services
export { simulateCombat }              // Main combat engine
export { computeCombatStats }         // Stat pipeline
export { applySkills }                // Skill system
export { getActiveSynergies }         // Pet synergies
export { calculatePetStatBonus }      // Pet stat calculations
export { applyPetEffects }            // Pet on-turn triggers
export { enrichBeast, createWildBeast, rollRarity }
export { requiredExpForLevel, applyLevelUps }
export { rollLootDrop, getItemsByRarity, pickRandomItem }
export { getSkillDescription, SYNERGY_LIST }
export { clamp, randomInt, rollPercent, pickRandom, weightedPick }
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Bot Framework | discord.js v14 |
| Database | SQLite via Prisma |
| Game Logic | TypeScript (game-core package) |
| Web Framework | Next.js 15 (App Router) |
| Package Manager | pnpm workspaces |
| TypeScript | Strict mode, composite projects |

---

## Last Refactored

April 2026 — Split into pnpm monorepo with `packages/game-core`, `packages/bot`, `apps/web`.
