import { defineCharacter, proAdd, conMul } from "./shared";

export const trickster = defineCharacter({
  id: "trickster",
  label: "Trickster",
  summary: "Especialista em sorte e desvios de build imprevisiveis.",
  difficultyLabel: "Hard",
  startingWeaponId: "ricochetGun",
  pros: ["+20% item luck", "+15% crit chance"],
  cons: ["-10% damage"],
  passiveEffects: [proAdd("itemLuck", 0.2), proAdd("critChance", 0.15), conMul("damageMultiplier", 0.9)],
  accent: 0xc0a1ff,
  panelTint: 0x46395d,
  portraitTint: 0xdfd2ff
});
