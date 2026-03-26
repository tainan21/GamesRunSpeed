import type { CharacterDef, CharacterId } from "../types";
import { scout } from "./scout";
import { soldier } from "./soldier";
import { tank } from "./tank";

export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  soldier,
  scout,
  tank
};

export const CHARACTER_ORDER: CharacterId[] = ["soldier", "scout", "tank"];
