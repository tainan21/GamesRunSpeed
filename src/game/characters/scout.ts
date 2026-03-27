import { defineCharacter, proAdd, proMul, conAdd } from "./shared";

export const scout = defineCharacter({
  id: "scout",
  label: "Scout",
  summary: "Especialista em reposicionamento que sobrevive pela esquiva.",
  difficultyLabel: "Medium",
  startingWeaponId: "pistol",
  pros: ["+25% movement speed", "+10% dodge chance"],
  cons: ["-15 max HP"],
  passiveEffects: [proMul("moveSpeed", 1.25), proAdd("dodgeChance", 0.1), conAdd("maxHp", 15)],
  accent: 0x93d9c8,
  panelTint: 0x425654,
  portraitTint: 0xbef8e6
});
