import { defineCharacter, proAdd, conAdd } from "./shared";

export const assassin = defineCharacter({
  id: "assassin",
  label: "Assassin",
  summary: "Burst fragil focado em critico e execucao.",
  difficultyLabel: "Hard",
  startingWeaponId: "throwingDaggers",
  pros: ["+30% crit chance", "+25% crit damage"],
  cons: ["-20 max HP"],
  passiveEffects: [proAdd("critChance", 0.3), proAdd("critDamageMultiplier", 0.25), conAdd("maxHp", 20)],
  accent: 0xf1c7df,
  panelTint: 0x4f3744,
  portraitTint: 0xfce1ef
});
