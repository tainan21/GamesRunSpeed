import { defineCharacter, proAdd, proMul, conMul } from "./shared";

export const gladiator = defineCharacter({
  id: "gladiator",
  label: "Gladiator",
  summary: "Duelista blindado para controle frontal agressivo.",
  difficultyLabel: "Medium",
  startingWeaponId: "spear",
  pros: ["+20% melee-style damage", "+15 armor"],
  cons: ["-10% movement speed"],
  passiveEffects: [proMul("damageMultiplier", 1.2), proAdd("armor", 15), conMul("moveSpeed", 0.9)],
  accent: 0xf0b48d,
  panelTint: 0x5b4034,
  portraitTint: 0xffd8bd
});
