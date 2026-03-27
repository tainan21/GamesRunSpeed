import type { CharacterDef, ItemEffect, PlayerStats } from "../types";

type StatKey = keyof PlayerStats;

export function defineCharacter(definition: CharacterDef): CharacterDef {
  return definition;
}

export function proAdd(stat: StatKey, value: number): ItemEffect {
  return { stat, mode: "add", value, polarity: "pro" };
}

export function conAdd(stat: StatKey, value: number): ItemEffect {
  return { stat, mode: "add", value, polarity: "con" };
}

export function proMul(stat: StatKey, value: number): ItemEffect {
  return { stat, mode: "multiply", value, polarity: "pro" };
}

export function conMul(stat: StatKey, value: number): ItemEffect {
  return { stat, mode: "multiply", value, polarity: "con" };
}
