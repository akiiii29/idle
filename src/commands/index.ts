import { dailyCommand } from "./daily";
import { huntCommand } from "./hunt";
import { profileCommand } from "./profile";
import { registerCommand } from "./register";
import { useCommand } from "./use";
import { questCommand } from "./quest";
import { reviveCommand } from "./revive";
import { tavernCommand } from "./tavern";
import { shopCommand } from "./shop";
import { helpRpgCommand } from "./help-rpg";
import { skillsCommand } from "./skills";

export const commands = [
  registerCommand,
  profileCommand,
  dailyCommand,
  huntCommand,
  useCommand,
  questCommand,
  reviveCommand,
  tavernCommand,
  shopCommand,
  helpRpgCommand,
  skillsCommand
];
