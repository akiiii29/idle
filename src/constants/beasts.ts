import { Rarity } from "@prisma/client";

export const BEAST_LIBRARY: Record<Rarity, string[]> = {
  [Rarity.COMMON]: ["Slime", "Rat", "Moss Turtle", "Twig Fox", "Mud Imp"],
  [Rarity.RARE]: ["Storm Lynx", "Crystal Beetle", "Night Bat", "Ember Hound", "Iron Boar"],
  [Rarity.EPIC]: ["Void Serpent", "Thunder Roc", "Frost Chimera", "Ash Wyrm", "Celestial Stag"],
  [Rarity.LEGENDARY]: ["Bahamut", "Exodia", "Leviathan", "Solar Phoenix", "Eclipse Titan"]
};
