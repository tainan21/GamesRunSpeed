import { defineCharacter, proAdd, conMul } from "./shared";

export const pyromancer = defineCharacter({
  id: "pyromancer",
  label: "Pyromancer",
  summary: "Catalisador de queimadura com controle de area por fogo.",
  difficultyLabel: "Medium",
  startingWeaponId: "flameThrower",
  pros: ["+30% fire damage", "+15% burn duration"],
  cons: ["-10% attack speed"],
  passiveEffects: [proAdd("fireDps", 0.6), proAdd("fireDurationMs", 2_070), conMul("attackSpeedMultiplier", 0.9)],
  accent: 0xff9d67,
  panelTint: 0x5a3a2d,
  portraitTint: 0xffc1a0
});
