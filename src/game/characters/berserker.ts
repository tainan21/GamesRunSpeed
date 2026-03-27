import { defineCharacter, proAdd, proMul, conAdd } from "./shared";

export const berserker = defineCharacter({
  id: "berserker",
  label: "Berserker",
  summary: "Agressao pura: entra forte, mas pune qualquer erro.",
  difficultyLabel: "Hard",
  startingWeaponId: "dualBlades",
  pros: ["+25% attack speed", "+20% damage"],
  cons: ["-20 armor"],
  passiveEffects: [proMul("attackSpeedMultiplier", 1.25), proMul("damageMultiplier", 1.2), conAdd("armor", 20)],
  accent: 0xff8c76,
  panelTint: 0x5b342d,
  portraitTint: 0xffb9a6
});
