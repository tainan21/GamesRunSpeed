import { defineBoss } from "./shared";

export const CHRONO_BEAST = defineBoss({
  id: "chronoBeast",
  label: "Chrono Beast",
  summary: "A warped hunter that slows time before delayed bursts land.",
  introductionPhase: 28,
  baseHp: 400,
  speed: 60,
  contactDamage: 20,
  radius: 48,
  tint: 0xbdd9ff,
  deathTint: 0xe6f2ff,
  knockbackResistance: 3.2,
  xpOrbCount: 5,
  xpOrbValue: 3,
  attackPatterns: [
    { kind: "slowFieldPulse", cooldownMs: 3_500, projectileDamage: 0, areaRadius: 120, slowMultiplier: 0.55 },
    { kind: "aimedVolley", cooldownMs: 1_950, projectileType: "fast", projectileSpeed: 330, projectileDamage: 11, volleyCount: 3, fanSpreadDeg: 14 },
    { kind: "radialBurst", cooldownMs: 4_100, projectileType: "slow", projectileSpeed: 220, projectileDamage: 9, volleyCount: 10 }
  ]
});
