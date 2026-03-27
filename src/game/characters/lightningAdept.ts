import { defineCharacter, proAdd, conAdd } from "./shared";

export const lightningAdept = defineCharacter({
  id: "lightningAdept",
  label: "Lightning Adept",
  summary: "Condutor veloz que transforma criticos em tempestade.",
  difficultyLabel: "Medium",
  startingWeaponId: "lightningStaff",
  pros: ["+30% lightning damage", "+15% chain chance"],
  cons: ["-10 max HP"],
  passiveEffects: [proAdd("chainLightningDamageMultiplier", 0.3), proAdd("chainLightningChance", 0.15), conAdd("maxHp", 10)],
  accent: 0xa4c8ff,
  panelTint: 0x31435f,
  portraitTint: 0xd3e4ff
});
