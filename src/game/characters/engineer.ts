import { defineCharacter, proAdd, conMul } from "./shared";

export const engineer = defineCharacter({
  id: "engineer",
  label: "Engineer",
  summary: "Construtor tatico que escala com drones e suportes.",
  difficultyLabel: "Hard",
  startingWeaponId: "turretLauncher",
  pros: ["+1 drone companion", "+15% summon damage"],
  cons: ["-10% base damage"],
  passiveEffects: [proAdd("droneCount", 1), proAdd("summonDamageMultiplier", 0.15), conMul("damageMultiplier", 0.9)],
  accent: 0x93d9f2,
  panelTint: 0x2b4d58,
  portraitTint: 0xc6ecff
});
