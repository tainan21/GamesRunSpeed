import { defineCharacter, proAdd, conMul } from "./shared";

export const alchemist = defineCharacter({
  id: "alchemist",
  label: "Alchemist",
  summary: "Demolidor experimental focado em explosoes controladas.",
  difficultyLabel: "Medium",
  startingWeaponId: "bombLauncher",
  pros: ["+20% explosion radius", "+25% explosion damage"],
  cons: ["-15% fire rate"],
  passiveEffects: [proAdd("explosionRadius", 10), proAdd("explosionDamage", 0.6), conMul("attackSpeedMultiplier", 0.85)],
  accent: 0xffb071,
  panelTint: 0x5b3b2d,
  portraitTint: 0xffd1ac
});
