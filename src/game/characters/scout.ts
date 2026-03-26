import type { CharacterDef } from "../types";

export const scout: CharacterDef = {
  id: "scout",
  label: "Scout",
  summary: "Fast responder that survives on movement.",
  passive: "+30% movement speed",
  weakness: "-20% max HP",
  accent: 0x93d9c8,
  panelTint: 0x425654,
  maxHpMultiplier: 0.8,
  moveSpeedMultiplier: 1.3
};
