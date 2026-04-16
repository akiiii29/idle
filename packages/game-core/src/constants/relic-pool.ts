// relic-pool-full.ts

export type RelicRarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

export type RelicType =
    | "DAMAGE_BOOST"
    | "GLASS_CANNON"
    | "LOW_HP_BONUS"
    | "REDUCE_DAMAGE"
    | "START_SHIELD"
    | "LIFESTEAL"
    | "ON_KILL_HEAL"
    | "TURN_HEAL"
    | "BURN_BOOST"
    | "POISON_BOOST"
    | "PET_BOOST"
    | "CHAOS"
    | "DOUBLE_OR_NOTHING"
    | "SPD_BOOST"
    | "CRIT_BOOST"
    | "GOLD_BOOST"
    | "UTILITY";

export type RelicTrigger =
    | "ON_ATTACK"
    | "ON_HIT"
    | "ON_KILL"
    | "TURN_START"
    | "LOW_HP"
    | "ON_CRIT";

export interface Relic {
    id: string;
    name: string;
    type: RelicType;
    value: number;
    rarity: RelicRarity;
    weight: number;
    desc: string;
    drawback?: number;
    trigger?: RelicTrigger;
}

export const RELIC_POOL: Relic[] = [

    /* ================= COMMON ================= */

    { id: "wooden_sword", name: "Wooden Sword", type: "DAMAGE_BOOST", value: 0.05, rarity: "COMMON", weight: 50, desc: "+5% damage" },
    { id: "leather_pad", name: "Leather Pad", type: "REDUCE_DAMAGE", value: 0.05, rarity: "COMMON", weight: 50, desc: "-5% damage taken" },
    { id: "buckler", name: "Buckler", type: "START_SHIELD", value: 10, rarity: "COMMON", weight: 50, desc: "Start with 10 shield" },
    { id: "leech_seed", name: "Leech Seed", type: "LIFESTEAL", value: 0.05, rarity: "COMMON", weight: 50, desc: "5% lifesteal" },
    { id: "regen_core", name: "Regen Core", type: "TURN_HEAL", value: 3, rarity: "COMMON", weight: 50, desc: "Heal 3 HP/turn" },
    { id: "matchstick", name: "Matchstick", type: "BURN_BOOST", value: 0.1, rarity: "COMMON", weight: 50, desc: "+10% burn" },
    { id: "toxic_vial", name: "Toxic Vial", type: "POISON_BOOST", value: 0.1, rarity: "COMMON", weight: 50, desc: "+10% poison" },
    { id: "pet_treat", name: "Pet Treat", type: "PET_BOOST", value: 0.1, rarity: "COMMON", weight: 50, desc: "+10% pet power" },
    { id: "swift_boots", name: "Swift Boots", type: "SPD_BOOST", value: 8, rarity: "COMMON", weight: 50, desc: "+8 speed" },
    { id: "sharp_stone", name: "Sharp Stone", type: "CRIT_BOOST", value: 0.05, rarity: "COMMON", weight: 50, desc: "+5% crit" },
    { id: "lucky_penny", name: "Lucky Penny", type: "GOLD_BOOST", value: 0.1, rarity: "COMMON", weight: 50, desc: "+10% gold" },
    { id: "bleed_dagger", name: "Bleed Dagger", type: "UTILITY", value: 5, rarity: "COMMON", weight: 50, desc: "Apply bleed on hit", trigger: "ON_ATTACK" },

    /* ================= RARE ================= */

    { id: "berserker_blade", name: "Berserker Blade", type: "DAMAGE_BOOST", value: 0.15, rarity: "RARE", weight: 30, desc: "+15% damage" },
    { id: "fragile_dagger", name: "Fragile Dagger", type: "GLASS_CANNON", value: 0.15, drawback: 0.1, rarity: "RARE", weight: 30, desc: "+15% dmg, -10% HP" },
    { id: "survivor_instinct", name: "Survivor Instinct", type: "LOW_HP_BONUS", value: 0.2, rarity: "RARE", weight: 30, desc: "More dmg at low HP" },
    { id: "knight_shield", name: "Knight Shield", type: "START_SHIELD", value: 30, rarity: "RARE", weight: 30, desc: "Start 30 shield" },
    { id: "blood_amulet", name: "Blood Amulet", type: "LIFESTEAL", value: 0.1, rarity: "RARE", weight: 30, desc: "10% lifesteal" },
    { id: "scavenger_kit", name: "Scavenger Kit", type: "ON_KILL_HEAL", value: 10, rarity: "RARE", weight: 30, desc: "Heal on kill", trigger: "ON_KILL" },
    { id: "healing_totem", name: "Healing Totem", type: "TURN_HEAL", value: 10, rarity: "RARE", weight: 30, desc: "Heal 10 HP/turn" },
    { id: "burning_heart", name: "Burning Heart", type: "BURN_BOOST", value: 0.25, rarity: "RARE", weight: 30, desc: "+25% burn" },
    { id: "venom_gland", name: "Venom Gland", type: "POISON_BOOST", value: 0.25, rarity: "RARE", weight: 30, desc: "+25% poison" },
    { id: "wind_feather", name: "Wind Feather", type: "SPD_BOOST", value: 15, rarity: "RARE", weight: 30, desc: "+15 speed" },
    { id: "lucky_charm", name: "Lucky Charm", type: "CRIT_BOOST", value: 0.1, rarity: "RARE", weight: 30, desc: "+10% crit" },
    { id: "thief_gloves", name: "Thief Gloves", type: "GOLD_BOOST", value: 0.25, rarity: "RARE", weight: 30, desc: "+25% gold" },
    { id: "execution_mark", name: "Execution Mark", type: "UTILITY", value: 0.15, rarity: "RARE", weight: 30, desc: "Execute below 15% HP" },

    /* ================= EPIC ================= */

    { id: "glass_cannon", name: "Glass Cannon", type: "GLASS_CANNON", value: 0.25, drawback: 0.2, rarity: "EPIC", weight: 15, desc: "+25% dmg, -20% HP" },
    { id: "executioner", name: "Executioner Ring", type: "LOW_HP_BONUS", value: 0.3, rarity: "EPIC", weight: 15, desc: "More dmg low HP" },
    { id: "adamantite_plate", name: "Adamantite Plate", type: "REDUCE_DAMAGE", value: 0.2, rarity: "EPIC", weight: 15, desc: "-20% damage" },
    { id: "dracula_cape", name: "Dracula Cape", type: "LIFESTEAL", value: 0.2, rarity: "EPIC", weight: 15, desc: "20% lifesteal" },
    { id: "vampire_fang", name: "Vampire Fang", type: "ON_KILL_HEAL", value: 20, rarity: "EPIC", weight: 15, desc: "Heal on kill", trigger: "ON_KILL" },
    { id: "phoenix_feather", name: "Phoenix Feather", type: "TURN_HEAL", value: 15, rarity: "EPIC", weight: 15, desc: "Heal 15 HP/turn" },
    { id: "hellfire_core", name: "Hellfire Core", type: "BURN_BOOST", value: 0.5, rarity: "EPIC", weight: 15, desc: "+50% burn" },
    { id: "plague_mask", name: "Plague Mask", type: "POISON_BOOST", value: 0.5, rarity: "EPIC", weight: 15, desc: "+50% poison" },
    { id: "hermes_sandals", name: "Hermes Sandals", type: "SPD_BOOST", value: 30, rarity: "EPIC", weight: 15, desc: "+30 speed" },
    { id: "assassin_mark", name: "Assassin Mark", type: "CRIT_BOOST", value: 0.2, rarity: "EPIC", weight: 15, desc: "+20% crit" },
    { id: "thorn_mail", name: "Thorn Mail", type: "UTILITY", value: 0.2, rarity: "EPIC", weight: 15, desc: "Reflect 20% damage", trigger: "ON_HIT" },
    { id: "time_fragment", name: "Time Fragment", type: "UTILITY", value: 0.2, rarity: "EPIC", weight: 15, desc: "20% chance extra turn", trigger: "ON_ATTACK" },

    /* ================= LEGENDARY ================= */

    { id: "dragon_slayer", name: "Dragon Slayer", type: "DAMAGE_BOOST", value: 0.35, rarity: "LEGENDARY", weight: 5, desc: "+35% damage" },
    { id: "cursed_skull", name: "Cursed Skull", type: "GLASS_CANNON", value: 0.5, drawback: 0.3, rarity: "LEGENDARY", weight: 5, desc: "+50% dmg, -30% HP" },
    { id: "undying_rage", name: "Undying Rage", type: "LOW_HP_BONUS", value: 0.6, rarity: "LEGENDARY", weight: 5, desc: "Huge dmg at low HP" },
    { id: "aegis", name: "Aegis", type: "START_SHIELD", value: 100, rarity: "LEGENDARY", weight: 5, desc: "Start 100 shield" },
    { id: "soul_reaper", name: "Soul Reaper", type: "ON_KILL_HEAL", value: 50, rarity: "LEGENDARY", weight: 5, desc: "Heal massive on kill", trigger: "ON_KILL" },
    { id: "beastmaster_whip", name: "Beastmaster Whip", type: "PET_BOOST", value: 0.5, rarity: "LEGENDARY", weight: 5, desc: "+50% pet power" },
    { id: "chaos_orb", name: "Chaos Orb", type: "CHAOS", value: 1, rarity: "LEGENDARY", weight: 5, desc: "Random effect each turn" },
    { id: "gamblers_coin", name: "Gambler's Coin", type: "DOUBLE_OR_NOTHING", value: 0.5, rarity: "LEGENDARY", weight: 5, desc: "50% double or miss" },
    { id: "midas_touch", name: "Midas Touch", type: "GOLD_BOOST", value: 0.5, rarity: "LEGENDARY", weight: 5, desc: "+50% gold" },
    { id: "reaper_threshold", name: "Reaper Threshold", type: "UTILITY", value: 0.2, rarity: "LEGENDARY", weight: 5, desc: "Execute below 20% HP" }

];

export function getRelicPoolByFloor(floor: number): Relic[] {
    if (floor < 4) return RELIC_POOL.filter(r => r.rarity === "COMMON");
    if (floor < 8) return RELIC_POOL.filter(r => r.rarity !== "LEGENDARY");
    return RELIC_POOL;
}

export function getRandomRelic(floor: number): Relic {
    const pool = getRelicPoolByFloor(floor);

    const totalWeight = pool.reduce((sum, r) => sum + r.weight, 0);
    let roll = Math.random() * totalWeight;

    for (const relic of pool) {
        if (roll < relic.weight) return relic;
        roll -= relic.weight;
    }

    return pool[0]!;
}
