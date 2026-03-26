import { defineBoss } from "./shared";

export const STORM_HYDRA = defineBoss({
  id: "stormHydra",
  label: "Storm Hydra",
  summary: "A triple-headed storm engine with converging volleys.",
  introductionPhase: 32,
  baseHp: 430,
  speed: 61,
  contactDamage: 21,
  radius: 52,
  tint: 0x7fd7e4,
  deathTint: 0xc1f7ff,
  knockbackResistance: 3.4,
  xpOrbCount: 5,
  xpOrbValue: 3,
  attackPatterns: [
    { kind: "aimedVolley", cooldownMs: 1_350, projectileType: "fast", projectileSpeed: 355, projectileDamage: 9, volleyCount: 5, fanSpreadDeg: 28 },
    { kind: "lightningArc", cooldownMs: 2_200, projectileDamage: 14, areaRadius: 240, volleyCount: 4 },
    { kind: "radialBurst", cooldownMs: 3_200, projectileType: "fast", projectileSpeed: 320, projectileDamage: 9, volleyCount: 14 }
  ]
});
