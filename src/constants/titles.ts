export type TitleEffectType =
  | "damage"
  | "critDamage"
  | "burnDamage"
  | "poisonDamage"
  | "lifesteal"
  | "goldGain"
  | "petPower"
  | "procChance";

export type TitleRarity =
  | "COMMON"
  | "RARE"
  | "EPIC"
  | "LEGENDARY";

export interface TitleDefinition {
  key: string;
  name: string;
  description: string;
  rarity: TitleRarity;
  effectType: TitleEffectType;
  effectValue: number;
  target: number;
}

export const TITLES: TitleDefinition[] = [

/* ========================
   COMMON TITLES
======================== */

{
  key: "slayer_1",
  name: "Slayer",
  description: "Defeat 100 enemies",
  rarity: "COMMON",
  effectType: "damage",
  effectValue: 0.05,
  target: 100
},

{
  key: "burn_1",
  name: "Flame Adept",
  description: "Apply burn 50 times",
  rarity: "COMMON",
  effectType: "burnDamage",
  effectValue: 0.05,
  target: 50
},

{
  key: "poison_1",
  name: "Toxic Initiate",
  description: "Apply poison 50 times",
  rarity: "COMMON",
  effectType: "poisonDamage",
  effectValue: 0.05,
  target: 50
},

{
  key: "crit_1",
  name: "Sharp Eye",
  description: "Trigger crit 50 times",
  rarity: "COMMON",
  effectType: "critDamage",
  effectValue: 0.05,
  target: 50
},

{
  key: "gold_1",
  name: "Gold Seeker",
  description: "Earn 1000 gold",
  rarity: "COMMON",
  effectType: "goldGain",
  effectValue: 0.05,
  target: 1000
},

{
  key: "pet_1",
  name: "Pet Keeper",
  description: "Own 5 pets",
  rarity: "COMMON",
  effectType: "petPower",
  effectValue: 0.05,
  target: 5
},

{
  key: "lifesteal_1",
  name: "Blood Drinker",
  description: "Trigger lifesteal 50 times",
  rarity: "COMMON",
  effectType: "lifesteal",
  effectValue: 0.05,
  target: 50
},

{
  key: "combo_1",
  name: "Combo Starter",
  description: "Trigger 2 skills in one turn",
  rarity: "COMMON",
  effectType: "damage",
  effectValue: 0.04,
  target: 20
},

{
  key: "hunt_1",
  name: "Hunter",
  description: "Complete 50 hunts",
  rarity: "COMMON",
  effectType: "damage",
  effectValue: 0.04,
  target: 50
},

{
  key: "survive_1",
  name: "Survivor",
  description: "Win with HP below 20%",
  rarity: "COMMON",
  effectType: "lifesteal",
  effectValue: 0.05,
  target: 10
},

/* ========================
   RARE TITLES
======================== */

{
  key: "slayer_2",
  name: "Executioner",
  description: "Defeat 500 enemies",
  rarity: "RARE",
  effectType: "damage",
  effectValue: 0.08,
  target: 500
},

{
  key: "burn_2",
  name: "Flame Lord",
  description: "Apply burn 200 times",
  rarity: "RARE",
  effectType: "burnDamage",
  effectValue: 0.1,
  target: 200
},

{
  key: "poison_2",
  name: "Plague Bringer",
  description: "Apply poison 200 times",
  rarity: "RARE",
  effectType: "poisonDamage",
  effectValue: 0.1,
  target: 200
},

{
  key: "crit_2",
  name: "Deadeye",
  description: "Trigger crit 200 times",
  rarity: "RARE",
  effectType: "critDamage",
  effectValue: 0.1,
  target: 200
},

{
  key: "gold_2",
  name: "Wealth Collector",
  description: "Earn 10000 gold",
  rarity: "RARE",
  effectType: "goldGain",
  effectValue: 0.1,
  target: 10000
},

{
  key: "pet_2",
  name: "Beast Trainer",
  description: "Own 15 pets",
  rarity: "RARE",
  effectType: "petPower",
  effectValue: 0.1,
  target: 15
},

{
  key: "combo_2",
  name: "Combo Expert",
  description: "Trigger 3 skills in one turn",
  rarity: "RARE",
  effectType: "damage",
  effectValue: 0.08,
  target: 50
},

{
  key: "lifesteal_2",
  name: "Blood Reaver",
  description: "Lifesteal 200 times",
  rarity: "RARE",
  effectType: "lifesteal",
  effectValue: 0.1,
  target: 200
},

{
  key: "boss_1",
  name: "Boss Hunter",
  description: "Defeat 10 bosses",
  rarity: "RARE",
  effectType: "damage",
  effectValue: 0.08,
  target: 10
},

{
  key: "dungeon_1",
  name: "Dungeon Raider",
  description: "Clear 5 dungeons",
  rarity: "RARE",
  effectType: "damage",
  effectValue: 0.08,
  target: 5
},

/* ========================
   EPIC TITLES
======================== */

{
  key: "slayer_3",
  name: "Mass Slayer",
  description: "Defeat 2000 enemies",
  rarity: "EPIC",
  effectType: "damage",
  effectValue: 0.12,
  target: 2000
},

{
  key: "burn_3",
  name: "Inferno Master",
  description: "Apply burn 500 times",
  rarity: "EPIC",
  effectType: "burnDamage",
  effectValue: 0.15,
  target: 500
},

{
  key: "poison_3",
  name: "Toxic Overlord",
  description: "Apply poison 500 times",
  rarity: "EPIC",
  effectType: "poisonDamage",
  effectValue: 0.15,
  target: 500
},

{
  key: "crit_3",
  name: "Critical King",
  description: "Trigger crit 500 times",
  rarity: "EPIC",
  effectType: "critDamage",
  effectValue: 0.15,
  target: 500
},

{
  key: "combo_3",
  name: "Combo Master",
  description: "Trigger 4 skills in one turn",
  rarity: "EPIC",
  effectType: "damage",
  effectValue: 0.12,
  target: 100
},

{
  key: "lifesteal_3",
  name: "Soul Drinker",
  description: "Lifesteal 500 times",
  rarity: "EPIC",
  effectType: "lifesteal",
  effectValue: 0.15,
  target: 500
},

{
  key: "petlegendary_1",
  name: "Alpha Master",
  description: "Own 3 legendary pets",
  rarity: "EPIC",
  effectType: "petPower",
  effectValue: 0.15,
  target: 3
},

{
  key: "gold_3",
  name: "Gold Tycoon",
  description: "Earn 50000 gold",
  rarity: "EPIC",
  effectType: "goldGain",
  effectValue: 0.15,
  target: 50000
},

{
  key: "boss_2",
  name: "Boss Slayer",
  description: "Defeat 50 bosses",
  rarity: "EPIC",
  effectType: "damage",
  effectValue: 0.12,
  target: 50
},

{
  key: "dungeon_2",
  name: "Dungeon Conqueror",
  description: "Clear floor 10",
  rarity: "EPIC",
  effectType: "damage",
  effectValue: 0.12,
  target: 1
},

/* ========================
   LEGENDARY TITLES
======================== */

{
  key: "slayer_4",
  name: "God Slayer",
  description: "Defeat 10000 enemies",
  rarity: "LEGENDARY",
  effectType: "damage",
  effectValue: 0.15,
  target: 10000
},

{
  key: "burn_4",
  name: "Flame Emperor",
  description: "Apply burn 1000 times",
  rarity: "LEGENDARY",
  effectType: "burnDamage",
  effectValue: 0.15,
  target: 1000
},

{
  key: "poison_4",
  name: "Plague Emperor",
  description: "Apply poison 1000 times",
  rarity: "LEGENDARY",
  effectType: "poisonDamage",
  effectValue: 0.15,
  target: 1000
},

{
  key: "crit_4",
  name: "Critical God",
  description: "Trigger crit 1000 times",
  rarity: "LEGENDARY",
  effectType: "critDamage",
  effectValue: 0.15,
  target: 1000
},

{
  key: "combo_4",
  name: "Combo God",
  description: "Trigger 5 skills in one turn",
  rarity: "LEGENDARY",
  effectType: "damage",
  effectValue: 0.15,
  target: 200
},

{
  key: "lifesteal_4",
  name: "Immortal Reaper",
  description: "Lifesteal 1000 times",
  rarity: "LEGENDARY",
  effectType: "lifesteal",
  effectValue: 0.15,
  target: 1000
},

{
  key: "petlegendary_2",
  name: "Beast God",
  description: "Own 5 legendary pets",
  rarity: "LEGENDARY",
  effectType: "petPower",
  effectValue: 0.15,
  target: 5
},

{
  key: "gold_4",
  name: "King of Gold",
  description: "Earn 100000 gold",
  rarity: "LEGENDARY",
  effectType: "goldGain",
  effectValue: 0.15,
  target: 100000
},

{
  key: "boss_3",
  name: "God Hunter",
  description: "Defeat 200 bosses",
  rarity: "LEGENDARY",
  effectType: "damage",
  effectValue: 0.15,
  target: 200
},

{
  key: "ultimate_1",
  name: "Ascended One",
  description: "Reach max level and clear dungeon 10",
  rarity: "LEGENDARY",
  effectType: "damage",
  effectValue: 0.15,
  target: 1
},

/* ========================
   LEGACY TITLES
======================== */

{
  key: "👑 Thợ Săn Huyền Thoại",
  name: "Thợ Săn Huyền Thoại (Legacy)",
  description: "Thành tựu của những thợ săn đầu tiên",
  rarity: "LEGENDARY",
  effectType: "damage",
  effectValue: 0.15,
  target: 0
}

];
