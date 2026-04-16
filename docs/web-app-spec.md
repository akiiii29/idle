# Web App Spec: Game-like RPG Interface

## Concept & Vision

Một **game interface**, không phải website. Mỗi action đều có feedback tức thì, animations mượt, damage numbers bay lên. UI phải cảm thấy như đang chơi game thật sự — không phải click nút chờ load.

**Mục tiêu**: Tái hiện trải nghiệm Discord bot thành một web game độc lập, dùng chung `@game/core` logic.

---

## Design Language

### Aesthetic
- Dark fantasy RPG — nền tối, accent gold/purple, card-based UI
- Font: `Rajdhani` (headings) + `JetBrains Mono` (numbers/stats)
- Animations: spring-based, snappy (150-300ms)

### Color Palette
```
--bg-primary:    #0a0b10
--bg-card:       #12141f
--bg-card-hover: #1a1d2e
--border:        #2a2d3e
--text:          #e8e8f0
--text-dim:      #6b6d7a
--accent-gold:   #f0c040
--accent-purple: #9b6dff
--hp-green:      #22c55e
--hp-yellow:     #eab308
--hp-red:        #ef4444
--damage-red:    #ff4757
--heal-green:    #2dd4bf
```

### Motion Philosophy
- **Damage numbers**: spawn → float up (translateY -60px) → scale 1→1.3→0 + fade out (600ms)
- **Button press**: scale 0.95 + brightness 0.9 (100ms), spring back
- **HP bar**: smooth width transition (300ms ease-out)
- **Card hover**: translateY -2px + shadow lift (150ms)
- **Turn indicator**: pulse glow on active combatant
- **Victory/defeat**: full-screen flash overlay (white/red, 200ms fade)

---

## Core Features (Mirror Bot)

### 1. Hunt System
- Normal Hunt: 1 enemy, quick (5-10 turns)
- Boss Hunt: 3x strength, harder enemy
- Auto-hunt: 10 consecutive hunts, collect results

**Combat UI**:
- Center stage: player (left) vs enemy (right)
- HP bars above each combatant with current/max HP
- Floating damage numbers (red for damage, green for heal, gold for crit)
- Battle log scrolling at bottom (last 5 lines visible)
- Skill icons light up when proc
- Turn indicator (glowing border) alternates player/enemy

**Hunt button states**:
- Ready: glowing gold border, "⚔️ HUNT" text
- In Combat: disabled, shows turn progress
- Cooldown: grayed, shows countdown timer (if applicable)

### 2. Combat Animation Timeline
```
Turn Start:
  → Attacker card glows
  → Attack animation (card shake, 100ms)
  → Damage number spawns on target (0ms delay)
  → Damage number floats up + fades (600ms)
  → HP bar animates down (300ms)
  → Defender shake (if hit, 50ms)

Turn End:
  → Check for death
  → If dead: death animation (fade + scale down, 400ms)
  → If DOT/buff: effect icon appears

Victory:
  → "VICTORY" text scales in (300ms spring)
  → Gold/exp numbers fly to player stats (staggered, 100ms each)
  → Loot cards slide in from bottom (if any)

Defeat:
  → "DEFEAT" text in red
  → Screen shake (50ms, 3 times)
  → "Hospitalized 30min" notification
```

### 3. Stats Panel (Right Sidebar / Bottom Drawer)
- Base stats: STR, AGI, LUCK, DEF, HP
- Computed stats: ATK, Crit%, Dodge%, Speed
- Equipment bonuses breakdown
- Active skills list with icons
- Pet slots (3) with mini avatars

### 4. Inventory
- Grid view: items as cards with rarity border color
- Hover: show full stats tooltip
- Click: equip/unequip with confirmation
- Filter tabs: All / Weapon / Armor / Accessory / Consumable

### 5. Shop
- 3 daily rotating slots
- Refresh button (if applicable)
- Purchase with gold
- Sold out state for purchased items

### 6. Pet Management
- List of captured pets
- Equip/unequip slots (max 3)
- Pet level and skill power
- Sacrifice pet for talent points

### 7. Dungeon (stretch)
- Harder encounters
- Better loot rates
- Entry cost

### 8. Achievements
- Progress bars
- Unlocked achievement cards
- Notification popup on unlock

### 9. Profile
- Username, level, titles
- Gold, exp progress bar
- Last hunt time
- Hospital timer if applicable

---

## Layout

### Single-Page Layout (Game-like)
```
┌─────────────────────────────────────────────────────────┐
│  HEADER: Logo | Gold | Level | HP Bar | Quick Actions    │
├──────────────┬─────────────────────────┬────────────────┤
│              │                         │                │
│  SIDEBAR     │   MAIN STAGE            │   RIGHT PANEL  │
│  - Hunt      │   (Combat Arena)        │   - Stats      │
│  - Inventory │   Player vs Enemy       │   - Skills     │
│  - Pets     │   HP Bars               │   - Pets       │
│  - Shop     │   Damage Numbers        │   - Equipment  │
│  - Dungeon  │   Battle Log            │                │
│  - Profile  │                         │                │
│              │                         │                │
└──────────────┴─────────────────────────┴────────────────┘
```

- Sidebar: icon buttons with tooltips, active state highlighted
- Main stage: the combat arena — largest area
- Right panel: collapsible stats drawer

**Mobile**: Bottom tab navigation, combat arena fills screen

---

## Technical Stack

```
Next.js 15 (App Router, Turbopack)
@game/core (shared game logic)
Prisma + Supabase (data)
CSS Modules (scoped styles, no Tailwind)
Framer Motion or CSS animations (combat animations)
```

### API Design

All endpoints return `{ data, error }` envelope.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/[id]` | Full user profile |
| POST | `/api/hunt` | `{ userId, type: 'normal'\|'boss' }` → combat result |
| GET | `/api/stats/[userId]` | Computed combat stats |
| GET | `/api/inventory/[userId]` | User's items |
| POST | `/api/equip` | `{ userId, itemId, slot }` → equip item |
| POST | `/api/unequip` | `{ userId, itemId }` → unequip item |
| GET | `/api/shop/[userId]` | Shop listings for user |
| POST | `/api/shop/buy` | `{ userId, listingId }` → purchase |
| GET | `/api/pets/[userId]` | User's pets |
| POST | `/api/pets/equip` | `{ userId, petId }` → equip pet |
| POST | `/api/pets/sacrifice` | `{ userId, petId }` → sacrifice |
| GET | `/api/achievements/[userId]` | Achievement progress |
| GET | `/api/combat-logs/[userId]` | Recent combat history |

---

## Component Inventory

### `<HuntButton>`
- States: ready (gold glow), hunting (spinner), cooldown (gray + timer)
- Press: scale 0.95, release: spring back
- Click triggers combat sequence

### `<CombatArena>`
- Player card (left): avatar, name, HP bar, shield icon if active
- Enemy card (right): avatar, name, HP bar, level badge
- Center: turn indicator / action text
- Floating layer: damage numbers spawn here

### `<DamageNumber>`
- Props: `value`, `type: 'damage' | 'heal' | 'crit' | 'miss'`
- Animation: spawn at 0ms → float up 60px + scale 1→1.3→0 → fade out by 600ms
- Color: damage=red, heal=green, crit=gold+bold, miss=gray

### `<HpBar>`
- Smooth width transition (300ms)
- Color changes: >50% green, 20-50% yellow, <20% red
- Shows current/max text

### `<BattleLog>`
- Scrolling text area, last 5 lines visible
- Auto-scrolls on new entries
- Monospace font, timestamped

### `<StatCard>`
- Icon + label + value
- Animated number change (count up/down)

### `<ItemCard>`
- Rarity border glow (common=gray, rare=blue, epic=purple, legendary=gold)
- Hover: lift + show tooltip
- Click: equip/unequip action

### `<SidebarNav>`
- Icon buttons: Hunt, Inventory, Pets, Shop, Dungeon, Profile
- Active: accent color + glow
- Tooltip on hover

### `<ToastNotification>`
- Appears top-right
- Slide in from right (200ms)
- Auto-dismiss after 3s
- Types: success (green), error (red), info (purple), loot (gold)

---

## Implementation Priority

1. **Hunt (full)** — combat arena + animations + damage numbers
2. **Stats Panel** — real-time computed stats display
3. **Profile Header** — gold, level, HP overview
4. **Inventory** — grid + equip/unequip
5. **Shop** — daily listings + purchase
6. **Pets** — equip slots + sacrifice
7. **Achievements** — progress + notifications
8. **Dungeon** — harder content
9. **Mobile layout** — bottom nav

---

## Performance

- Combat simulation runs server-side (API call), not client
- Client receives only final result → renders animations
- Preload next potential action while animating
- Use CSS transforms (GPU-accelerated) for all animations
- Avoid layout thrash — use `will-change` sparingly
