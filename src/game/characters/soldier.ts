import { defineCharacter, proAdd, proMul, conMul } from "./shared";

export const soldier = defineCharacter({
  id: "soldier",
  label: "Soldier",
  summary: "Frontliner disciplinado com cadencia forte e base segura.",
  difficultyLabel: "Easy",
  startingWeaponId: "assaultRifle",
  pros: ["+15% attack speed", "+10 max HP"],
  cons: ["-5% movement speed"],
  passiveEffects: [proMul("attackSpeedMultiplier", 1.15), proAdd("maxHp", 10), conMul("moveSpeed", 0.95)],
  accent: 0xe9d28a,
  panelTint: 0x4d5f5b,
  portraitTint: 0xe7ddb7
});
