import { defineCharacter, proAdd, conMul } from "./shared";

export const necromancer = defineCharacter({
  id: "necromancer",
  label: "Necromancer",
  summary: "Comandante sombrio que cresce com presenca invocada.",
  difficultyLabel: "Hard",
  startingWeaponId: "boneWand",
  pros: ["+2 summon companions", "+15% summon damage"],
  cons: ["-20% weapon damage"],
  passiveEffects: [proAdd("droneCount", 2), proAdd("summonDamageMultiplier", 0.15), conMul("damageMultiplier", 0.8)],
  accent: 0xd7c3ff,
  panelTint: 0x433855,
  portraitTint: 0xe9dbff
});
