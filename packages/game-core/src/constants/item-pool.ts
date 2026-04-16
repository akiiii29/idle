// item-pool.ts
// Expanded balanced item pool for roguelike Discord bot.
// Every item supports exactly ONE main build (STR / AGI / TANK) with an optional minor secondary stat.

import type { ItemType } from "../types/rpg-enums";

export type ItemRarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

export interface GameItem {
    id: string;
    name: string;
    type: ItemType;
    rarity: ItemRarity;
    build: "STR" | "AGI" | "TANK"; // clear identity tag
    power?: number;
    bonusStr?: number;
    bonusAgi?: number;
    bonusDef?: number;
    bonusHp?: number;
}

// ══════════════════════════════════════════════
// STAT BUDGET REFERENCE (per rarity)
//
//  COMMON    : main stat  +2~+5    secondary +0~+2
//  RARE      : main stat  +5~+10   secondary +0~+4
//  EPIC      : main stat  +10~+20  secondary +0~+8
//  LEGENDARY : main stat  +20~+35  secondary +0~+12
//
// Weapon power follows same scale separate from bonuses.
// ══════════════════════════════════════════════

// ──────────────────────────────────────────────
// ⚔️  WEAPON POOL
// ──────────────────────────────────────────────

export const WEAPON_POOL: GameItem[] = [

    // ── 🟢 COMMON ─────────────────────────────
    // STR builds
    { id: "rusty_sword",     name: "Rusty Sword",     type: "WEAPON", rarity: "COMMON", build: "STR", power: 5,  bonusStr: 3 },
    { id: "cracked_axe",     name: "Cracked Axe",     type: "WEAPON", rarity: "COMMON", build: "STR", power: 6,  bonusStr: 2 },
    { id: "stone_maul",      name: "Stone Maul",      type: "WEAPON", rarity: "COMMON", build: "STR", power: 7,  bonusStr: 2 },
    // AGI builds
    { id: "training_dagger", name: "Training Dagger", type: "WEAPON", rarity: "COMMON", build: "AGI", power: 3,  bonusAgi: 4 },
    { id: "wooden_spear",    name: "Wooden Spear",    type: "WEAPON", rarity: "COMMON", build: "AGI", power: 4,  bonusAgi: 3 },
    { id: "short_bow",       name: "Short Bow",       type: "WEAPON", rarity: "COMMON", build: "AGI", power: 4,  bonusAgi: 4 },

    // ── 🔵 RARE ───────────────────────────────
    // STR builds
    { id: "iron_sword",      name: "Iron Sword",      type: "WEAPON", rarity: "RARE",   build: "STR", power: 10, bonusStr: 8 },
    { id: "battle_axe",      name: "Battle Axe",      type: "WEAPON", rarity: "RARE",   build: "STR", power: 13, bonusStr: 6 },
    { id: "war_club",        name: "War Club",        type: "WEAPON", rarity: "RARE",   build: "STR", power: 11, bonusStr: 7 },
    // AGI builds
    { id: "hunter_bow",      name: "Hunter Bow",      type: "WEAPON", rarity: "RARE",   build: "AGI", power: 8,  bonusAgi: 9 },
    { id: "twin_daggers",    name: "Twin Daggers",    type: "WEAPON", rarity: "RARE",   build: "AGI", power: 7,  bonusAgi: 10 },
    { id: "swift_lance",     name: "Swift Lance",     type: "WEAPON", rarity: "RARE",   build: "AGI", power: 9,  bonusAgi: 8 },

    // ── 🟣 EPIC ───────────────────────────────
    // STR builds
    { id: "knight_blade",    name: "Knight Blade",    type: "WEAPON", rarity: "EPIC",   build: "STR", power: 18, bonusStr: 15 },
    { id: "warhammer",       name: "Warhammer",       type: "WEAPON", rarity: "EPIC",   build: "STR", power: 22, bonusStr: 12 },
    { id: "executioner_axe", name: "Executioner Axe", type: "WEAPON", rarity: "EPIC",   build: "STR", power: 20, bonusStr: 14 },
    // AGI builds
    { id: "shadow_dagger",   name: "Shadow Dagger",   type: "WEAPON", rarity: "EPIC",   build: "AGI", power: 14, bonusAgi: 18 },
    { id: "storm_bow",       name: "Storm Bow",       type: "WEAPON", rarity: "EPIC",   build: "AGI", power: 16, bonusAgi: 17 },
    { id: "wind_rapier",     name: "Wind Rapier",     type: "WEAPON", rarity: "EPIC",   build: "AGI", power: 13, bonusAgi: 20 },

    // ── 🟡 LEGENDARY ──────────────────────────
    // STR builds
    { id: "dragon_slayer",   name: "Dragon Slayer",   type: "WEAPON", rarity: "LEGENDARY", build: "STR", power: 30, bonusStr: 28 },
    { id: "titan_crusher",   name: "Titan Crusher",   type: "WEAPON", rarity: "LEGENDARY", build: "STR", power: 35, bonusStr: 22 },
    { id: "ruinbringer",     name: "Ruinbringer",     type: "WEAPON", rarity: "LEGENDARY", build: "STR", power: 32, bonusStr: 25 },
    // AGI builds
    { id: "phantom_blade",   name: "Phantom Blade",   type: "WEAPON", rarity: "LEGENDARY", build: "AGI", power: 25, bonusAgi: 32 },
    { id: "wind_reaver",     name: "Wind Reaver",     type: "WEAPON", rarity: "LEGENDARY", build: "AGI", power: 26, bonusAgi: 30 },
    { id: "voidstep",        name: "Voidstep",        type: "WEAPON", rarity: "LEGENDARY", build: "AGI", power: 24, bonusAgi: 33 },
];

// ──────────────────────────────────────────────
// 🛡️  ARMOR POOL
// ──────────────────────────────────────────────

export const ARMOR_POOL: GameItem[] = [

    // ── 🟢 COMMON ─────────────────────────────
    // TANK builds
    { id: "cloth_armor",     name: "Cloth Armor",     type: "ARMOR", rarity: "COMMON", build: "TANK", bonusHp: 20 },
    { id: "leather_armor",   name: "Leather Armor",   type: "ARMOR", rarity: "COMMON", build: "TANK", bonusDef: 3 },
    { id: "padded_vest",     name: "Padded Vest",     type: "ARMOR", rarity: "COMMON", build: "TANK", bonusDef: 2, bonusHp: 10 },
    // AGI builds
    { id: "traveler_coat",   name: "Traveler Coat",   type: "ARMOR", rarity: "COMMON", build: "AGI",  bonusAgi: 3, bonusHp: 8 },
    { id: "scout_garb",      name: "Scout Garb",      type: "ARMOR", rarity: "COMMON", build: "AGI",  bonusAgi: 4 },

    // ── 🔵 RARE ───────────────────────────────
    // TANK builds
    { id: "chainmail",       name: "Chainmail",       type: "ARMOR", rarity: "RARE",   build: "TANK", bonusDef: 7, bonusHp: 30 },
    { id: "guard_plate",     name: "Guard Plate",     type: "ARMOR", rarity: "RARE",   build: "TANK", bonusDef: 9 },
    { id: "fortress_vest",   name: "Fortress Vest",   type: "ARMOR", rarity: "RARE",   build: "TANK", bonusDef: 6, bonusHp: 35 },
    // AGI builds
    { id: "hunter_armor",    name: "Hunter Armor",    type: "ARMOR", rarity: "RARE",   build: "AGI",  bonusAgi: 7, bonusHp: 15 },
    { id: "rogue_leathers",  name: "Rogue Leathers",  type: "ARMOR", rarity: "RARE",   build: "AGI",  bonusAgi: 9 },

    // ── 🟣 EPIC ───────────────────────────────
    // TANK builds
    { id: "knight_armor",    name: "Knight Armor",    type: "ARMOR", rarity: "EPIC",   build: "TANK", bonusDef: 14, bonusHp: 60 },
    { id: "war_plate",       name: "War Plate",       type: "ARMOR", rarity: "EPIC",   build: "TANK", bonusDef: 18 },
    { id: "bulwark_mail",    name: "Bulwark Mail",    type: "ARMOR", rarity: "EPIC",   build: "TANK", bonusDef: 12, bonusHp: 80 },
    // AGI builds
    { id: "shadow_cloak",    name: "Shadow Cloak",    type: "ARMOR", rarity: "EPIC",   build: "AGI",  bonusAgi: 16, bonusHp: 35 },
    { id: "phantom_wrap",    name: "Phantom Wrap",    type: "ARMOR", rarity: "EPIC",   build: "AGI",  bonusAgi: 18 },

    // ── 🟡 LEGENDARY ──────────────────────────
    // TANK builds
    { id: "dragon_armor",    name: "Dragon Armor",    type: "ARMOR", rarity: "LEGENDARY", build: "TANK", bonusDef: 22, bonusHp: 100 },
    { id: "titan_armor",     name: "Titan Armor",     type: "ARMOR", rarity: "LEGENDARY", build: "TANK", bonusDef: 28 },
    { id: "aegis_plate",     name: "Aegis Plate",     type: "ARMOR", rarity: "LEGENDARY", build: "TANK", bonusDef: 20, bonusHp: 120 },
    // AGI builds
    { id: "phantom_cloak",   name: "Phantom Cloak",   type: "ARMOR", rarity: "LEGENDARY", build: "AGI",  bonusAgi: 25, bonusHp: 60 },
    { id: "void_mantle",     name: "Void Mantle",     type: "ARMOR", rarity: "LEGENDARY", build: "AGI",  bonusAgi: 30 },
];

// ──────────────────────────────────────────────
// 🔧 HELPERS
// ──────────────────────────────────────────────

/** Get all items combined */
export const ALL_ITEMS: GameItem[] = [...WEAPON_POOL, ...ARMOR_POOL];

/** Get items of a specific rarity from a pool */
export function getItemsByRarity(pool: GameItem[], rarity: ItemRarity): GameItem[] {
    return pool.filter(i => i.rarity === rarity);
}

/** Pick a random item from a pool (for dungeon drops etc.) */
export function pickRandomItem(pool: GameItem[]): GameItem | undefined {
    if (pool.length === 0) return undefined;
    return pool[Math.floor(Math.random() * pool.length)];
}

/** Rarity drop weights for dungeon floor-based loot:
 *  Lower floors → more COMMON. Higher floors → chance for EPIC/LEGENDARY. */
export function rollItemRarity(floor: number, luckBonus: number = 0): ItemRarity {
    const r = (Math.random() * 100) - luckBonus;
    const epicChance       = Math.min(30, floor * 3);
    const legendaryChance  = Math.min(10, floor * 0.8);
    const rareChance       = Math.min(40, floor * 5);

    if (r < legendaryChance)                              return "LEGENDARY";
    if (r < legendaryChance + epicChance)                 return "EPIC";
    if (r < legendaryChance + epicChance + rareChance)    return "RARE";
    return "COMMON";
}

/** Roll a random floor-appropriate item drop (weapon or armor 50/50) */
export function rollLootDrop(floor: number, luckBonus: number = 0): GameItem | undefined {
    const rarity = rollItemRarity(floor, luckBonus);
    const useWeapon = Math.random() < 0.5;
    const pool = useWeapon ? WEAPON_POOL : ARMOR_POOL;
    const filtered = getItemsByRarity(pool, rarity);
    const target = filtered.length > 0 ? filtered : getItemsByRarity(pool, "COMMON");
    return pickRandomItem(target);
}
