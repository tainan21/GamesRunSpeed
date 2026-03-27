import { defineCharacter, proAdd, conMul } from "./shared";

export const tank = defineCharacter({
  id: "tank",
  label: "Tank",
  summary: "Paredao de curto alcance que troca ritmo por sobrevivencia.",
  difficultyLabel: "Easy",
  startingWeaponId: "shotgun",
  pros: ["+40 max HP", "+15 armor"],
  cons: ["-20% attack speed"],
  passiveEffects: [proAdd("maxHp", 40), proAdd("armor", 15), conMul("attackSpeedMultiplier", 0.8)],
  accent: 0xe19886,
  panelTint: 0x5a4f49,
  portraitTint: 0xf0d0c4
});
