import { defineCharacter, proAdd, conMul } from "./shared";

export const chemist = defineCharacter({
  id: "chemist",
  label: "Chemist",
  summary: "Especialista em corrosao e veneno sustentado.",
  difficultyLabel: "Medium",
  startingWeaponId: "acidSprayer",
  pros: ["+30% poison damage", "+20% poison duration"],
  cons: ["-10% projectile speed"],
  passiveEffects: [proAdd("poisonDps", 0.45), proAdd("poisonDurationMs", 2_880), conMul("projectileSpeedMultiplier", 0.9)],
  accent: 0x9be87a,
  panelTint: 0x34452b,
  portraitTint: 0xcff2af
});
