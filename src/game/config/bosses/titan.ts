import { defineBoss } from "./shared";

export const TITAN = defineBoss({
  id: "titan",
  label: "Titan",
  summary: "A siege beast that smashes space with shock rings and boulders.",
  introductionPhase: 4,
  baseHp: 320,
  speed: 58,
  contactDamage: 18,
  radius: 44,
  tint: 0xe0a777,
  deathTint: 0xffd8b1,
  knockbackResistance: 3.1,
  xpOrbCount: 4,
  xpOrbValue: 3,
  attackPatterns: [
    { kind: "aimedVolley", cooldownMs: 2_050, projectileType: "slow", projectileSpeed: 240, projectileDamage: 11, volleyCount: 3, fanSpreadDeg: 18 },
    { kind: "radialBurst", cooldownMs: 3_300, projectileType: "slow", projectileSpeed: 210, projectileDamage: 9, volleyCount: 8 }
  ]
});
