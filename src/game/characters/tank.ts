import type { CharacterDef } from "../types";

export const tank: CharacterDef = {
  id: "tank",
  label: "Tank",
  summary: "Bulky survivor that trades tempo for margin.",
  passive: "+40% max HP",
  weakness: "-25% attack speed",
  accent: 0xe19886,
  panelTint: 0x5a4f49,
  maxHpMultiplier: 1.4,
  attackSpeedMultiplier: 0.75
};
