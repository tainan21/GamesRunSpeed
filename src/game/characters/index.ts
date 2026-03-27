import type { CharacterDef, CharacterId } from "../types";
import { alchemist } from "./alchemist";
import { assassin } from "./assassin";
import { berserker } from "./berserker";
import { chemist } from "./chemist";
import { engineer } from "./engineer";
import { gladiator } from "./gladiator";
import { guardian } from "./guardian";
import { lightningAdept } from "./lightningAdept";
import { necromancer } from "./necromancer";
import { pyromancer } from "./pyromancer";
import { ranger } from "./ranger";
import { scout } from "./scout";
import { sniper } from "./sniper";
import { soldier } from "./soldier";
import { tank } from "./tank";
import { trickster } from "./trickster";

export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  alchemist,
  assassin,
  berserker,
  chemist,
  engineer,
  gladiator,
  guardian,
  lightningAdept,
  necromancer,
  pyromancer,
  ranger,
  soldier,
  scout,
  sniper,
  tank
  ,
  trickster
};

export const CHARACTER_ORDER: CharacterId[] = [
  "soldier",
  "scout",
  "tank",
  "sniper",
  "pyromancer",
  "chemist",
  "engineer",
  "berserker",
  "lightningAdept",
  "guardian",
  "ranger",
  "assassin",
  "necromancer",
  "gladiator",
  "alchemist",
  "trickster"
];
