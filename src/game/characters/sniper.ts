import { defineCharacter, proAdd, conMul } from "./shared";

export const sniper = defineCharacter({
  id: "sniper",
  label: "Sniper",
  summary: "Critico extremo para eliminar alvos antes que encostem.",
  difficultyLabel: "Medium",
  startingWeaponId: "sniperRifle",
  pros: ["+50% crit damage", "+15% crit chance"],
  cons: ["-20% attack speed"],
  passiveEffects: [proAdd("critDamageMultiplier", 0.5), proAdd("critChance", 0.15), conMul("attackSpeedMultiplier", 0.8)],
  accent: 0x9ed6f1,
  panelTint: 0x344955,
  portraitTint: 0xcbeefc
});
