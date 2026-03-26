import type { CharacterDef } from "../types";

export const soldier: CharacterDef = {
  id: "soldier",
  label: "Soldier",
  summary: "Balanced gunner with disciplined output.",
  passive: "+20% attack speed",
  weakness: "-10% movement speed",
  accent: 0xe9d28a,
  panelTint: 0x4d5f5b,
  attackSpeedMultiplier: 1.2,
  moveSpeedMultiplier: 0.9
};
