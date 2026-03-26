import { defineBoss } from "./shared";

export const IRON_COLOSSUS = defineBoss({
  id: "ironColossus",
  label: "Iron Colossus",
  summary: "A plated juggernaut with cannon bursts and punishing charges.",
  introductionPhase: 20,
  baseHp: 390,
  speed: 54,
  contactDamage: 22,
  radius: 50,
  tint: 0xc2b5a5,
  deathTint: 0xf4e2cd,
  knockbackResistance: 3.8,
  xpOrbCount: 5,
  xpOrbValue: 3,
  attackPatterns: [
    { kind: "aimedVolley", cooldownMs: 1_650, projectileType: "fast", projectileSpeed: 340, projectileDamage: 10, volleyCount: 4, fanSpreadDeg: 20 },
    { kind: "charge", cooldownMs: 4_200, chargeDurationMs: 700, chargeSpeedMultiplier: 2.3 },
    { kind: "radialBurst", cooldownMs: 3_400, projectileType: "slow", projectileSpeed: 210, projectileDamage: 10, volleyCount: 12 }
  ]
});
