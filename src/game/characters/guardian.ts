import { defineCharacter, proAdd, conMul } from "./shared";

export const guardian = defineCharacter({
  id: "guardian",
  label: "Guardian",
  summary: "Defensor estavel que converte tempo em seguranca.",
  difficultyLabel: "Easy",
  startingWeaponId: "shieldBlaster",
  pros: ["+20 armor", "+1.5 HP/s regeneration"],
  cons: ["-10% damage"],
  passiveEffects: [proAdd("armor", 20), proAdd("regenPerSecond", 1.5), conMul("damageMultiplier", 0.9)],
  accent: 0x8fbfe8,
  panelTint: 0x304552,
  portraitTint: 0xc6e0f6
});
