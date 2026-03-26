import type { EnemyDef, NormalEnemyId } from "../types";

export const ENEMIES: Record<NormalEnemyId, EnemyDef> = {
  grunt: {
    id: "grunt",
    label: "Grunt",
    maxHp: 1,
    speed: 75,
    contactDamage: 5,
    radius: 18,
    tint: 0x7a72d8,
    deathTint: 0xa9a2ff,
    knockbackResistance: 1,
    xpValue: 1
  },
  runner: {
    id: "runner",
    label: "Runner",
    maxHp: 1,
    speed: 135,
    contactDamage: 8,
    radius: 15,
    tint: 0x86ddd3,
    deathTint: 0xc1fff8,
    knockbackResistance: 0.82,
    xpValue: 1
  },
  tank: {
    id: "tank",
    label: "Tank",
    maxHp: 3,
    speed: 55,
    contactDamage: 10,
    radius: 24,
    tint: 0xd2bb8c,
    deathTint: 0xf2dbb1,
    knockbackResistance: 1.45,
    xpValue: 3
  },
  shooter: {
    id: "shooter",
    label: "Shooter",
    maxHp: 2,
    speed: 70,
    contactDamage: 6,
    radius: 20,
    tint: 0xf1a07b,
    deathTint: 0xffcfb8,
    knockbackResistance: 1.1,
    xpValue: 2,
    attackCooldownMs: 1900,
    projectileType: "slow",
    projectileSpeed: 210,
    projectileDamage: 6,
    projectileBurstCount: 1
  },
  elite: {
    id: "elite",
    label: "Elite",
    maxHp: 6,
    speed: 95,
    contactDamage: 12,
    radius: 26,
    tint: 0xd66f90,
    deathTint: 0xffb2cb,
    knockbackResistance: 1.7,
    xpValue: 4,
    attackCooldownMs: 1500,
    projectileType: "fast",
    projectileSpeed: 350,
    projectileDamage: 8,
    projectileBurstCount: 2
  }
};
