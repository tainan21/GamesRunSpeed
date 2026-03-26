import { defineBoss } from "./shared";

export const INFERNO_CORE = defineBoss({
  id: "infernoCore",
  label: "Inferno Core",
  summary: "A molten core that floods the arena with fire bursts.",
  introductionPhase: 12,
  baseHp: 340,
  speed: 56,
  contactDamage: 19,
  radius: 46,
  tint: 0xff8d6d,
  deathTint: 0xffc1aa,
  knockbackResistance: 3.2,
  xpOrbCount: 4,
  xpOrbValue: 3,
  attackPatterns: [
    { kind: "radialBurst", cooldownMs: 2_700, projectileType: "slow", projectileSpeed: 220, projectileDamage: 10, volleyCount: 10 },
    { kind: "poisonPool", cooldownMs: 2_100, projectileType: "slow", projectileSpeed: 180, projectileDamage: 6, areaRadius: 56 }
  ]
});
