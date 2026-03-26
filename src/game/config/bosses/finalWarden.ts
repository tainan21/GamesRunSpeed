import { defineBoss } from "./shared";

export const FINAL_WARDEN = defineBoss({
  id: "finalWarden",
  label: "Final Warden",
  summary: "A late-game overseer that cycles through every pressure pattern.",
  introductionPhase: 40,
  baseHp: 520,
  speed: 60,
  contactDamage: 24,
  radius: 56,
  tint: 0xf0c98c,
  deathTint: 0xffebc6,
  knockbackResistance: 4.1,
  xpOrbCount: 6,
  xpOrbValue: 3,
  attackPatterns: [
    { kind: "aimedVolley", cooldownMs: 1_250, projectileType: "fast", projectileSpeed: 360, projectileDamage: 11, volleyCount: 5, fanSpreadDeg: 28 },
    { kind: "radialBurst", cooldownMs: 2_800, projectileType: "slow", projectileSpeed: 225, projectileDamage: 10, volleyCount: 16 },
    { kind: "beamLane", cooldownMs: 3_400, projectileDamage: 16, beamDurationMs: 700, beamWidth: 28 }
  ] as any
});
