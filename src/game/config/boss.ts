import type { EnemyDef } from "../types";

export const BOSS: EnemyDef = {
  id: "boss",
  label: "Boss",
  maxHp: 280,
  speed: 58,
  contactDamage: 18,
  radius: 44,
  tint: 0xe06f6f,
  deathTint: 0xffc1c1,
  knockbackResistance: 3.2,
  xpValue: 3
};

export const BOSS_XP_ORB_COUNT = 4;
export const BOSS_XP_ORB_VALUE = 3;
export const BOSS_INITIAL_SLOW_SHOT_DELAY_MS = 1_200;
export const BOSS_INITIAL_FAST_SHOT_DELAY_MS = 900;
export const BOSS_INITIAL_MOVE_SWITCH_DELAY_MS = 1_500;
export const BOSS_STRAFE_DURATION_MS = 1_100;
export const BOSS_CHASE_DURATION_MS = 1_900;
export const BOSS_STRAFE_SPEED_MULTIPLIER = 0.8;
export const BOSS_STRAFE_CHASE_BLEND = 0.25;
export const BOSS_SLOW_ATTACK_COOLDOWN_MS = 2_400;
export const BOSS_FAST_ATTACK_COOLDOWN_MS = 1_100;
export const BOSS_SLOW_PROJECTILE_SPEED = 220;
export const BOSS_FAST_PROJECTILE_SPEED = 350;
export const BOSS_SLOW_PROJECTILE_DAMAGE = 10;
export const BOSS_FAST_PROJECTILE_DAMAGE = 8;
export const BOSS_SLOW_VOLLEY_OFFSETS_DEG = [-24, -12, 0, 12, 24] as const;
export const BOSS_FAST_BURST_OFFSETS_DEG = [-8, 0, 8] as const;
