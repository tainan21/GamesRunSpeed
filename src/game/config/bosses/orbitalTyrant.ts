import { defineBoss } from "./shared";

export const ORBITAL_TYRANT = defineBoss({
  id: "orbitalTyrant",
  label: "Orbital Tyrant",
  summary: "A command core guarded by satellite volleys and laser lanes.",
  introductionPhase: 36,
  baseHp: 450,
  speed: 58,
  contactDamage: 22,
  radius: 50,
  tint: 0xd9c4ff,
  deathTint: 0xf1e7ff,
  knockbackResistance: 3.7,
  xpOrbCount: 5,
  xpOrbValue: 3,
  attackPatterns: [
    { kind: "orbitingSatellite", cooldownMs: 3_300, projectileType: "fast", projectileSpeed: 310, projectileDamage: 8, orbitCount: 3 },
    { kind: "beamLane", cooldownMs: 2_500, projectileDamage: 14, beamDurationMs: 600, beamWidth: 24 },
    { kind: "aimedVolley", cooldownMs: 1_600, projectileType: "fast", projectileSpeed: 340, projectileDamage: 10, volleyCount: 4, fanSpreadDeg: 20 }
  ] as any
});
