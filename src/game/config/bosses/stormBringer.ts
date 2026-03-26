import { defineBoss } from "./shared";

export const STORM_BRINGER = defineBoss({
  id: "stormBringer",
  label: "Storm Bringer",
  summary: "A sky tyrant that forks lightning through fast attack lanes.",
  introductionPhase: 8,
  baseHp: 310,
  speed: 62,
  contactDamage: 17,
  radius: 42,
  tint: 0x8fcfff,
  deathTint: 0xd9f4ff,
  knockbackResistance: 2.9,
  xpOrbCount: 4,
  xpOrbValue: 3,
  attackPatterns: [
    { kind: "aimedVolley", cooldownMs: 1_450, projectileType: "fast", projectileSpeed: 360, projectileDamage: 8, volleyCount: 3, fanSpreadDeg: 16 },
    { kind: "lightningArc", cooldownMs: 2_400, projectileDamage: 12, areaRadius: 220, volleyCount: 3 }
  ]
});
