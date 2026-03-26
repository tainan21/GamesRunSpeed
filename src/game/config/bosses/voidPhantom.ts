import { defineBoss } from "./shared";

export const VOID_PHANTOM = defineBoss({
  id: "voidPhantom",
  label: "Void Phantom",
  summary: "A blinking predator that repositions into crossfire bursts.",
  introductionPhase: 24,
  baseHp: 355,
  speed: 68,
  contactDamage: 18,
  radius: 40,
  tint: 0xb69cff,
  deathTint: 0xe2d6ff,
  knockbackResistance: 2.8,
  xpOrbCount: 5,
  xpOrbValue: 3,
  attackPatterns: [
    { kind: "teleportBurst", cooldownMs: 3_000, projectileType: "fast", projectileSpeed: 360, projectileDamage: 10, volleyCount: 4 },
    { kind: "aimedVolley", cooldownMs: 1_700, projectileType: "fast", projectileSpeed: 350, projectileDamage: 9, volleyCount: 3, fanSpreadDeg: 24 },
    { kind: "beamLane", cooldownMs: 3_800, projectileDamage: 14, beamDurationMs: 450, beamWidth: 26 }
  ] as any
});
