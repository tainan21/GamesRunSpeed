import { defineCharacter, proMul, conMul } from "./shared";

export const ranger = defineCharacter({
  id: "ranger",
  label: "Ranger",
  summary: "Especialista em linha reta e controle de distancia.",
  difficultyLabel: "Medium",
  startingWeaponId: "longbow",
  pros: ["+20% projectile speed", "+15% effective range"],
  cons: ["-10% fire rate"],
  passiveEffects: [proMul("projectileSpeedMultiplier", 1.2), proMul("spreadMultiplier", 0.85), conMul("attackSpeedMultiplier", 0.9)],
  accent: 0xd9c182,
  panelTint: 0x544831,
  portraitTint: 0xefdfad
});
