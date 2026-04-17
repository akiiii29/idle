# Idle RPG — Web App

A standalone Next.js 15 web interface for a Discord RPG game. No Discord dependency required — user identifies by Discord User ID stored in `localStorage`.

## Tech Stack

- **Framework**: Next.js 15 App Router (`apps/web`)
- **Styling**: CSS Modules with global CSS variables (game-like theme)
- **Database**: PostgreSQL via Prisma ORM
- **Game Logic**: `@game/core` TypeScript package (`packages/game-core`) — zero Prisma/runtime deps

## Project Structure

```
apps/web/
  src/
    app/
      page.tsx                      # Main game page (login + panel routing)
      globals.css                   # Global CSS variables + animations
      api/
        user/[id]/route.ts         # GET user by Discord ID
        hunt/route.ts               # POST hunt action
        auto-hunt/[userId]/route.ts # GET auto-hunt status
        hospital/[userId]/route.ts  # GET hospital status
        hospital/revive/route.ts    # POST revive
        shop/route.ts               # GET 6-category shop
        shop/buy/route.ts           # POST buy from shop
        item/scrap/route.ts         # POST scrap items
        item/sell/route.ts          # POST sell items
        item/upgrade/[itemId]/route.ts # GET preview / POST upgrade
        item/use/route.ts           # POST use consumable
        pets/[petId]/route.ts       # POST pet actions
        pets/bulk/route.ts          # POST bulk pet actions
        skills/route.ts             # GET owned + daily skills
        skills/buy/[skillId]/route.ts # POST buy skill
        skills/equip/route.ts       # POST equip/unequip skill
        quests/route.ts              # GET quests with progress
        quests/claim/[questKey]/route.ts # POST claim reward
        achievements/route.ts        # GET all titles
        tavern/[userId]/route.ts    # GET rest/gamble status
        stats/[userId]/route.ts     # GET computed combat stats
        practice/[userId]/route.ts  # GET practice info
    components/
      Header.tsx / Header.module.css
      SidebarNav.tsx / SidebarNav.module.css
      CombatArena.tsx               # Hunt panel
      StatsPanel.tsx                # Full stats breakdown
      InventoryPanel.tsx            # Item inventory + scrap/sell
      PetsPanel.tsx                 # Pet management + modal
      ShopPanel.tsx                # 6-category shop
      HospitalPanel.tsx             # HP recovery + revive
      TavernPanel.tsx               # Rest + gamble
      PracticePanel.tsx             # Practice dummy
      AutoHuntPanel.tsx            # Auto-hunt charges
      UpgradePanel.tsx             # Scrap + upgrade gear
      SkillsPanel.tsx              # Daily skills shop + owned
      QuestsPanel.tsx              # Daily/Weekly/Achievement quests
      AchievementsPanel.tsx        # Title equip system
      ToastContainer.tsx

packages/game-core/
  src/
    constants/
      item-pool.ts        # ITEM_POOL, WEAPON_POOL, ARMOR_POOL
      pet-config.ts       # PET_CONFIGS (all pet types by name)
      beasts.ts           # BEAST_POOL (wild beasts for hunts)
      config.ts           # Misc constants
      accessory-config.ts # ACCESSORY_CONFIGS
      titles.ts           # TITLES (all achievement titles)
      relic-pool.ts       # RELIC_POOL
      synergy-hints.ts    # PET_SYNERGIES
    services/
      upgrade-service.ts  # Scrap value, upgrade cost, success rate, pity
      shop-service.ts     # SHOP_CATALOG, CHEST_CATALOG, DUNGEON_BUFF_ITEMS, getDailySkills
      quest-service.ts    # QUESTS (all quest definitions)
      hunt-service.ts     # Hunt logic, beast encounters, rewards
      pet-utils.ts        # Pet stat computation
      time.ts             # getVnDate, getVnDayString, isDifferentVnDay, msUntilNextVnMidnight
    types/
      rpg-enums.ts        # Rarity, ItemType, etc.
    index.ts              # Re-exports all public APIs
```

## Database Schema

All models live in `prisma/schema.prisma`.

| Model | Description |
|-------|-------------|
| `User` | Profile, gold, stats (str/agi/luck), HP, talents, auto-hunt charges, inventory limit, title, pet essence, scrap |
| `Beast` | Pets owned — name, rarity, level, exp, role, skillType/skillPower, isEquipped, upgradeLevel |
| `Item` | Equipment/consumables — name, type, power, rarity, isEquipped, upgradeLevel, failCount, set bonuses |
| `Skill` | Skill definitions (seeded from `@game/core` at bot init) |
| `UserSkill` | Per-user: which skills owned + isEquipped |
| `Quest` | Quest definitions (seeded from `@game/core` at bot init) — key, type (DAILY/WEEKLY/ACHIEVEMENT), target, goldReward |
| `UserQuest` | Per-user: progress, isCompleted, isClaimed, resetAt |
| `ShopListing` | Per-user consumable (slot 1-5), accessory (slot 21-25), dungeon (slot 11-14) |
| `CombatLog` | Combat history for stats page |

## Game-Core: Data Sources

**NOT stored in DB** — pure TypeScript constants, generated at runtime:

| Pool | Usage |
|------|-------|
| `SHOP_CATALOG` | Consumable shop items (potions, traps, etc.) |
| `CHEST_CATALOG` | 3 chest types: Wooden/Steel/Golden |
| `DUNGEON_BUFF_ITEMS` | Dungeon prep shop items |
| `PET_CONFIGS` | All pet definitions (keyed by name, filter by rarity) |
| `ITEM_POOL` / `WEAPON_POOL` / `ARMOR_POOL` | Equipment generation — level-seeded, not stored |
| `ACCESSORY_CONFIGS` | Accessory shop configs |
| `BEAST_POOL` | Wild beasts that spawn in hunts |
| `SKILL_CONFIGS` | 70+ skill definitions → seeded into `Skill` table at bot init |
| `TITLES` | All achievement/title definitions |
| `QUESTS` | Quest definitions → seeded into `Quest` table at bot init |
| `UPGRADE_COSTS` | Upgrade cost array (index = target level) |

## Shop System

6 categories — daily VN reset (VN = UTC+7 midnight):

| Category | Source | Storage |
|----------|--------|---------|
| Consumables | `SHOP_CATALOG` → rolls 5 items | DB `ShopListing` slots 1-5 |
| Equipment | `WEAPON_POOL` + level-seeded rarity | Not stored — regenerated each view |
| Accessories | `ACCESSORY_CONFIGS` | DB `ShopListing` slots 21-25 |
| Chests | `CHEST_CATALOG` (3 types) | Not stored |
| Dungeon Prep | `DUNGEON_BUFF_ITEMS` | DB `ShopListing` slots 11-14 |
| Pets | `PET_CONFIGS` filtered by rarity | Creates `Beast` record on purchase |

## Pet System

`Beast` model. Actions via `/api/pets/[petId]` and `/api/pets/bulk`:

- **Upgrade** — costs pet essence, levels 1-10, uses `UPGRADE_COSTS` array
- **Sell** — gold by rarity: COMMON=10, RARE=30, EPIC=80, LEGENDARY=200
- **Dismantle** — essence by rarity: COMMON=5, RARE=15, EPIC=40, LEGENDARY=100 + level bonus
- **Sacrifice** — increments `talentDps` counter
- **Unequip** — sets `isEquipped: false`
- **Bulk** — all above by rarity filter

## Upgrade System

- `calculateScrapValue(item)` — stat score × rarity multiplier
- `getBaseSuccessRate(level)` — 100%/80%/60%/40%/20% for levels 1-5+
- Pity: +10% per fail, guaranteed after 5 consecutive fails
- `getUpgradeCost(level, rarity)` — (level+1) × 300 × rarity multiplier
- Scrap offsets gold at 1:5 ratio

## Quest System

`Quest` model seeded from `QUESTS` in game-core:

- **DAILY** — resets at VN midnight
- **WEEKLY** — resets Monday VN
- **ACHIEVEMENT** — never resets

Progress tracked on hunt, auto-hunt, practice, chest open. Claim rewards gold.

## Title / Achievement System

Titles from `TITLES` in game-core, stored in `User.unlockedTitles` (JSON array).

Equip limits by rarity: COMMON×3, RARE×3, EPIC×2, LEGENDARY×1.

Bonuses applied in `computeCombatStats` via `TITLES` lookup.

## Skills System

- Daily 5 skills via seeded shuffle: `hash(userId + VN-date)` → deterministic selection
- 2000 gold each, max 5 equipped
- 70+ skills from `SKILL_CONFIGS` seeded into DB at bot init

## Time System

All daily resets use **Vietnam Time (UTC+7)**:

- `getVnDayString()` → `"2026-04-17"` format
- `isDifferentVnDay(date)` → `true` if now is a different VN day
- `msUntilNextVnMidnight()` → milliseconds until next VN midnight

## VN Environment

Requires `DATABASE_URL` env var pointing to PostgreSQL. Game-core has zero runtime Prisma dependencies.
