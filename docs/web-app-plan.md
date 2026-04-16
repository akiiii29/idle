# Web App Plan: Next.js + game-core

## Mục tiêu

Tạo Next.js App Router web app tại `apps/web` dùng chung game logic từ `packages/game-core`. User muốn đọc kế hoạch trước — không cần làm ngay.

---

## Tổng quan kiến trúc

```
apps/web/              # Next.js App Router
├── package.json       # depends on @game/core, next, react
├── next.config.js
└── src/
    ├── app/           # Next.js App Router pages
    │   ├── layout.tsx
    │   ├── page.tsx   # Landing/profile page
    │   ├── hunt/      # Hunt simulation page
    │   └── api/       # API routes (server-side game logic)
    └── lib/game/      # Adapters wrapping @game/core for React
        ├── simulate-battle.ts
        └── compute-stats.ts

packages/game-core/    # Pure game logic (đã extract sẵn)
```

---

## Bước 1: Scaffold Next.js cơ bản

**Mục tiêu**: Setup Next.js project, verify workspace resolution hoạt động.

1. Check `apps/web/package.json` đã tồn tại hay chưa
2. Nếu chưa có, tạo `apps/web/` directory structure
3. Chạy `pnpm install` để verify workspace resolution
4. Chạy `pnpm --filter @rpg/web dev` — confirm Next.js start được

**Lý do**: Scaffold đơn giản nhất, verify dependency resolution trước.

---

## Bước 2: Setup Prisma cho web app

**Mục tiêu**: Web app có thể query database thông qua Prisma.

1. Generate Prisma client: `pnpm --filter @rpg/web prisma:generate`
   - Schema file ở `../game-core/prisma/schema.prisma` (shared)
   - Output: `apps/web/node_modules/.prisma/client`
2. Tạo `apps/web/src/lib/prisma.ts` — singleton PrismaClient instance
3. Tạo `apps/web/.env` với `DATABASE_URL` (copy từ root `.env`)
4. Test: query 1 user từ database

**Lý do**: Cần database access để hiển thị user stats, inventory, v.v.

---

## Bước 3: Tạo API routes (server-side)

**Mục tiêu**: Tạo API endpoints gọi game-core logic phía server.

### 3a. `/api/user/[id]` — Lấy user profile
```
GET /api/user/493136888433999872
→ { username, level, gold, stats, equipment, skills }
```

### 3b. `/api/hunt` — Simulate hunt (ko cần Discord)
```
POST /api/hunt
Body: { userId, huntType: 'normal' | 'boss' }
→ { battleResult, gold, exp, loot }
```
- Gọi `createWildBeast()` và `simulateCombat()` từ `@game/core`

### 3c. `/api/stats/[id]` — Compute full stats
```
GET /api/stats/493136888433999872
→ { str, agi, luck, critChance, dodgeChance, maxHp, damage }
```
- Gọi `computeCombatStats()` từ `@game/core`

### 3d. `/api/shop` — Lấy shop listings
```
GET /api/shop?userId=xxx
→ { listings: [{ slot, itemKey, purchased }] }
```

**Lý do**: API routes giữ secret keys (DB connection) phía server, không expose xuống client.

---

## Bước 4: Tạo React UI components

**Mục tiêu**: Hiển thị data từ API, gọi game-core thông qua API.

### 4a. Landing page (`/`)
```
- User search/lookup by Discord ID
- Hoặc hardcoded demo user
- Show: username, level, gold, HP, last hunt time
```

### 4b. Hunt page (`/hunt/[userId]`)
```
- "Hunt" button → POST /api/hunt → show battle result
- Show: enemy name, damage dealt, gold/exp gained, loot
- Auto-refresh stats after hunt
```

### 4c. Stats page (`/stats/[userId]`)
```
- Full combat stats breakdown
- Equipment list with bonuses
- Active skills
```

### 4d. Inventory page (`/inventory/[userId]`)
```
- Grid of items (image + name)
- Equip/unequip buttons → call API
```

**Lý do**: UI đơn giản, tập trung vào việc demonstrate game-core integration.

---

## Bước 5: Cleanup & Verify

1. Chạy `pnpm --filter @rpg/web build` — verify no TypeScript errors
2. Chạy `pnpm --filter @rpg/web dev` — verify app hoạt động
3. Test full flow: lookup user → hunt → check stats → check inventory
4. Update `docs/architecture-overview.md` để reflect web app đã tạo

---

## Thứ tự ưu tiên khi làm

| Priority | Step | Lý do |
|----------|------|-------|
| 1 | Bước 1 (Scaffold) | Verify workspace setup |
| 2 | Bước 2 (Prisma) | Cần data để hiển thị |
| 3 | Bước 3a (User API) | Đơn giản nhất, validate DB connection |
| 4 | Bước 4a (Landing page) | UI đơn giản nhất |
| 5 | Bước 3b + 4b (Hunt) | Core game loop - show off game-core |
| 6 | Bước 3c + 4c (Stats) | computeCombatStats() từ game-core |
| 7 | Bước 3d + 4d (Inventory) | Bonus - nếu còn time |

---

## Files cần tạo mới

```
apps/web/
├── package.json
├── next.config.js / next.config.mjs
├── tsconfig.json
├── .env (DATABASE_URL)
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Landing
│   │   ├── hunt/
│   │   │   └── page.tsx
│   │   ├── stats/
│   │   │   └── [userId]/page.tsx
│   │   └── api/
│   │       ├── user/[id]/route.ts
│   │       ├── hunt/route.ts
│   │       └── stats/[userId]/route.ts
│   └── lib/
│       ├── prisma.ts
│       └── game/
│           └── simulate-battle.ts  # Server-side adapter
```

---

## Commands để chạy

```bash
# Setup
pnpm install

# Generate Prisma
pnpm --filter @rpg/web prisma:generate

# Dev
pnpm --filter @rpg/web dev

# Build
pnpm --filter @rpg/web build
```
