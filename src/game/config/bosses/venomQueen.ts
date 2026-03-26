import { defineBoss } from "./shared";

export const VENOM_QUEEN = defineBoss({
  id: "venomQueen",
  label: "Venom Queen",
  summary: "A toxic broodmother that lobs venom and spreads pools.",
  introductionPhase: 16,
  baseHp: 360,
  speed: 60,
  contactDamage: 19,
  radius: 46,
  tint: 0x8ed474,
  deathTint: 0xc9ffba,
  knockbackResistance: 3.1,
  xpOrbCount: 4,
  xpOrbValue: 3,
  attackPatterns: [
    { kind: "aimedVolley", cooldownMs: 1_900, projectileType: "slow", projectileSpeed: 200, projectileDamage: 9, volleyCount: 2, fanSpreadDeg: 10 },
    { kind: "poisonPool", cooldownMs: 2_600, projectileType: "slow", projectileSpeed: 170, projectileDamage: 7, areaRadius: 62 }
  ]
});
