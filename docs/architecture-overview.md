# 🏗️ Architecture Overview

Tài liệu này cung cấp cái nhìn tổng quan về cấu trúc kỹ thuật và tổ chức mã nguồn của dự án Idle RPG Bot.

---

## 🚀 Công Nghệ Sử Dụng
*   **Ngôn ngữ**: TypeScript
*   **Runtime**: Node.js
*   **Database**: SQLite
*   **ORM**: Prisma
*   **Discord Library**: Discord.js (v14+)
*   **Rendering**: Canvas (để tạo thẻ hồ sơ người chơi)
*   **Package Manager**: pnpm workspaces (monorepo)

---

## 📁 Cấu Trúc Thư Mục (Monorepo)

```
idle/
├── packages/
│   ├── game-core/              # Pure game logic — NO Discord.js, NO Prisma runtime
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   ├── combat.ts       # BattleResult, CombatContext, CombatParticipant
│   │   │   │   └── rpg-enums.ts   # Rarity, ItemType, SkillType unions
│   │   │   ├── constants/
│   │   │   │   ├── beasts.ts       # Beast definitions and spawn tables
│   │   │   │   ├── config.ts       # Timings, rates, multipliers
│   │   │   │   ├── pet-config.ts   # Pet stats, roles, skill types
│   │   │   │   ├── item-pool.ts    # Weapon/armor definitions
│   │   │   │   ├── accessory-config.ts  # Accessory effects and sets
│   │   │   │   ├── relic-pool.ts   # Relic types and definitions
│   │   │   │   ├── titles.ts       # Title bonuses
│   │   │   │   └── synergy-hints.ts # Pet synergy requirements
│   │   │   └── services/
│   │   │       ├── combat-engine.ts   # simulateCombat() — pure combat
│   │   │       ├── combat-utils.ts    # calculateDamage, applyDamage
│   │   │       ├── skill-system.ts    # 70+ skills, applySkills()
│   │   │       ├── pet-system.ts      # applyPetEffects()
│   │   │       ├── pet-synergy.ts     # getActiveSynergies()
│   │   │       ├── pet-utils.ts       # enrichBeast(), calculatePetStatBonus()
│   │   │       ├── stats-service.ts   # computeCombatStats() — stat pipeline
│   │   │       ├── leveling.ts        # requiredExpForLevel(), applyLevelUps()
│   │   │       ├── hunt-service.ts    # createWildBeast(), rollRarity()
│   │   │       ├── relic-system.ts    # applyRelicsBeforeCombat, applyRelicsOnTurn
│   │   │       ├── relic-engine.ts    # dealDamage, healUnit, executeUnit
│   │   │       ├── relic-synergy.ts   # SYNERGY_POOL
│   │   │       └── rng.ts             # randomInt, rollPercent, pickRandom
│   │   └── prisma/
│   │       └── schema.prisma       # SINGLE SOURCE OF TRUTH for DB schema
│   │
│   └── bot/                     # Discord bot — imports @game/core
│       ├── src/
│       │   ├── commands/            # 25+ Discord slash commands
│       │   ├── services/            # DB operations, Discord embeds, canvas cards
│       │   ├── utils/               # UI helpers (HP bars, canvas rendering)
│       │   ├── types/               # Command type definitions
│       │   └── index.ts             # Bot entry point
│       └── prisma/
│           └── schema -> ../game-core/prisma/schema.prisma
│
└── apps/
    └── web/                     # Next.js web app — imports @game/core
        └── (pages/routes)
```

---

### `packages/bot/src/commands/`
Chứa tất cả các định nghĩa lệnh Slash Command của Discord. Mỗi file đại diện cho một lệnh (ví dụ: `/hunt`, `/stats`, `/inven`).
*   `index.ts`: Đăng ký và xuất toàn bộ collection lệnh.

#### Nhóm Lệnh Chính:
**🏠 Cơ bản:**
*   `register.ts` — Tạo nhân vật
*   `profile.ts` — Xem thẻ thợ săn
*   `daily.ts` — Nhận thưởng hằng ngày
*   `quest.ts` — Nhiệm vụ & nhận thưởng
*   `setname.ts` — Đổi tên thợ săn (1 lần)
*   `quatanthu.ts` — Xem bảng xếp hạng

**⚔️ Chiến đấu:**
*   `hunt.ts` — Đi săn (manual/auto) & bắt Pet
*   `dungeon.ts` — Hầm ngục (chiến đấu tự động)
*   `practice.ts` — Luyện tập / xem log
*   `skills.ts` — Quản lý kỹ năng
*   `beasts.ts` — Quản lý thú cưng
*   `synergies.ts` — Xem tất cả bộ cộng hưởng
*   `synergy.ts` — Kiểm tra cộng hưởng của bản thân

**🎒 Trang bị & Vật phẩm:**
*   `inven.ts` — Xem túi đồ
*   `equip.ts` — Mang vũ khí/giáp/phụ kiện
*   `unequip.ts` — Tháo trang bị
*   `use.ts` — Dùng thuốc hồi máu
*   `upgrade.ts` — Nâng cấp trang bị tại Lò Rèn
*   `scrap.ts` — Phân giải đồ lấy Scrap

**🏪 Cửa hàng & Dịch vụ:**
*   `shop.ts` — Cửa hàng (Vật phẩm hoặc Trang bị)
*   `skill-shop.ts` — Phòng tập kỹ năng (2000 vàng/skill)
*   `tavern.ts` — Quán trọ hồi HP
*   `revive.ts` — Thoát bệnh viện
*   `stats.ts` — Xem chỉ số & Breakdown

**🏆 Thành tựu & Danh hiệu:**
*   `achievements.ts` — Xem & nhận thành tựu
*   Trang bị danh hiệu để nhận buff chiến đấu

---

### `packages/bot/src/services/`
Tầng logic nghiệp vụ Discord-specific (gọi `@game/core` cho game logic thuần):
*   `combat-system.ts`: Gọi `simulateCombat()` từ `@game/core`, quản lý Discord embeds
*   `user-service.ts`: CRUD người dùng, tính HP recovery
*   `shop-service.ts`: Xử lý giao dịch và danh sách vật phẩm trong shop
*   `quest-service.ts`: Quản lý nhiệm vụ hàng ngày/tuần
*   `achievement-service.ts`: Theo dõi tiến độ và mở khóa thành tựu
*   `dungeon-service.ts`: Quản lý logic leo tầng và sự kiện trong ngục tối
*   `inventory-service.ts`: Quản lý túi đồ, trang bị, phân giải
*   `hunt-core.ts`: Logic săn bắn cốt lõi, tạo preview tokens
*   `encounter-service.ts`: Xử lý gặp gỡ quái vật và bắt pet
*   `itemEffects.ts`: Xử lý hiệu ứng vật phẩm trước/sau hunt
*   `equipment-service.ts`: Equip/unequip logic
*   `beast-service.ts`: Pet fusion logic
*   `chest-service.ts`: Chest opening logic
*   `pet-management.ts`: Pet upgrade, sell, dismantle, sacrifice
*   `offline-service.ts`: AFK income calculation
*   `command-sync.ts`: Discord command registration

---

### `packages/game-core/src/constants/`
Chứa các dữ liệu tĩnh (Static Data) của trò chơi — **không có Discord.js**:
*   `item-pool.ts`: Danh sách vũ khí, giáp, vật phẩm tiêu hao
*   `pet-config.ts`: Thông số và kỹ năng của sủng vật
*   `titles.ts`: Danh sách danh hiệu và buff tương ứng
*   `accessory-config.ts`: Cấu trúc trang sức và hiệu ứng bộ (Set Bonus)
*   `beasts.ts`: Cấu hình quái vật và pet encounters
*   `relic-pool.ts`: Pool thánh tích (Relic) cho dungeon
*   `synergy-hints.ts`: Gợi ý bộ cộng hưởng
*   `config.ts`: Configuration constants (cooldowns, timeouts, v.v.)

---

### `packages/game-core/src/types/`
Định nghĩa các interface và type TS dùng chung — **không có Prisma runtime**:
*   `combat.ts`: CombatContext, BattleResult, CombatParticipant
*   `rpg-enums.ts`: Rarity, ItemType, SkillType, SkillTrigger (string literal unions)

---

## 🔄 Vòng Đời Xử Lý Một Lệnh (Flow)

```
User runs /hunt
  → hunt.ts command handler
    → computeCombatStats() from @game/core   (tính player stats)
    → simulateCombat() from @game/core        (run pure combat loop)
      → applySkills() from @game/core        (skill triggers)
      → applyPetEffects() from @game/core    (pet passives)
      → applyPetSynergy() from @game/core    (pet combos)
      → applyRelicsBeforeCombat() from @game/core
    → Returns BattleResult with full logs
  → Discord embed updated each turn
  → Prisma DB update (gold, exp, HP, achievements)
```

---

## 🛡️ Database Schema (Prisma)
Schema DUY NHẤT tại `packages/game-core/prisma/schema.prisma`. Cả bot và web đều reference nó.

### 👤 User
Lưu trữ thông tin người chơi:
*   **Cơ bản**: level, exp, gold, STR, AGI, LUCK
*   **HP**: currentHp, maxHp, hospitalUntil, lastHpUpdatedAt
*   **Trạng thái**: isBusy, busyUntil, lastActiveAt
*   **Inventory**: inventoryLimit, scrap
*   **Pets**: petEssence (tinh hoa pet)
*   **Talents**: talentDps, talentTank, talentSupport, talentBurn, talentPoison
*   **Auto Hunt**: autoHuntCharges, lastAutoHuntChargeAt, lastAutoHuntAt
*   **Khác**: title, spiritBondHuntsLeft, gambleStreak, tavernUntil

### 🐾 Beast
Quan hệ 1-N với User, lưu trữ sủng vật:
*   **Cơ bản**: name, rarity, power, level, exp
*   **Trang bị**: isEquipped, equipSlot (1, 2, or 3)
*   **Skills**: role (DPS/TANK/SUPPORT), skillType, skillPower, trigger

### 🎒 Item
Quan hệ 1-N với User, lưu trữ vật phẩm:
*   **Cơ bản**: name, type, power, quantity, rarity
*   **Stats**: bonusStr, bonusAgi, bonusDef, bonusHp
*   **Trang bị**: isEquipped, equipSlot, set (cho set bonuses)
*   **Nâng cấp**: upgradeLevel, failCount

### ⚔️ Skill & UserSkill
Hệ thống kỹ năng:
*   **Skill**: name, type, trigger, multiplier, chance và các trường nâng cao
*   **UserSkill**: Quan hệ N-N giữa User và Skill, lưu isEquipped

### 📜 Quest & UserQuest
Hệ thống nhiệm vụ:
*   **Quest**: key, description, type (DAILY/WEEKLY/ACHIEVEMENT), target, rewards
*   **UserQuest**: progress, isCompleted, isClaimed, resetAt

### 📊 CombatLog
Lưu lịch sử các trận đấu để hiển thị lại khi cần.

### 🏪 ShopListing
Daily shop rotation — 3 slots per user, refreshed each day.

---

## 🎮 Hệ Thống Game Chính

### 1. Combat System
*   Turn-based combat với SPD-based turn order
*   Skill system với 3 trigger types (ON_ATTACK, ON_DEFEND, ON_TURN_START)
*   Critical hit, dodge, lifesteal, reflect mechanics
*   DoT effects (Burn, Poison, Bleed)
*   Auto-potion khi HP < 30%

### 2. Pet System
*   3 roles: DPS, TANK, SUPPORT
*   4 rarities: Common, Rare, Epic, Legendary
*   Pet với kỹ năng độc quyền
*   Pet leveling với Essence
*   Pet sacrifice cho Talent points
*   Synergy system (role combos, player-pet combos)

### 3. Equipment System
*   1 Weapon + 1 Armor + 2 Accessories
*   Upgrade system (+1 to +10) với fail counting
*   Scrap system (by item/rarity/duplicates)
*   Set bonuses từ equipment sets

### 4. Title & Achievement System
*   Multiple titles equip được cùng lúc
*   Slot limits: 3 Common, 3 Rare, 2 Epic, 1 Legendary
*   Achievements unlock titles
*   All title stats stack additively

### 5. Quest System
*   Daily quests (reset 00:00 UTC+7)
*   Weekly quests
*   Achievement quests
*   Auto progress tracking

### 6. Auto Hunt System
*   Charge-based system (max 3 charges)
*   Auto-recharge over time
*   Up to 20 battles per run
*   Monsters scale với player level (+1~3)

### 7. Dungeon System
*   Auto cinematic combat
*   Floor-based progression
*   Boss floors at 4, 8, 10
*   Relic drops với increasing chance
*   Auto-potion support

### 8. Shop & Economy
*   Daily gold/item rewards
*   Shop với daily rotation (3 slots)
*   Skill shop (2000 gold/skill)
*   Tavern for HP recovery
*   Gamble system với streak tracking

### 9. AFK/Offline Income
*   50 gold/hour passive income
*   Max 12 hours accumulation
*   Pet buffs (DPS/TANK: +10% gold, SUPPORT: +1 hour limit)
*   Minimum 10 minutes offline để nhận

---

## 🚀 Development Setup
1.  `pnpm install`
2.  Configure `.env` với Discord credentials (`packages/bot/.env`)
3.  `pnpm --filter @rpg/bot prisma:generate`
4.  `pnpm --filter @rpg/bot prisma db push`
5.  `pnpm --filter @rpg/bot dev`

Commands tự động sync khi startup.
