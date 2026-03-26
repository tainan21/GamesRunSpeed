import type { PlayerStats } from "../types";

export const PLAYER_RADIUS = 18;
export const PLAYER_IFRAME_MS = 450;

export const BASE_PLAYER_STATS: PlayerStats = {
  maxHp: 100,
  moveSpeed: 230,
  damageMultiplier: 1,
  attackSpeedMultiplier: 1,
  critChance: 0,
  critDamageMultiplier: 1.5,
  projectileSpeedMultiplier: 1,
  projectileSizeMultiplier: 1,
  knockbackMultiplier: 1,
  armor: 0,
  regenPerSecond: 0,
  projectilePierce: 0,
  extraProjectiles: 0,
  projectileBounce: 0,
  spreadMultiplier: 1,
  lifeSteal: 0,
  xpMagnetRadius: 0,
  maxShieldCharges: 0,
  explosionRadius: 0,
  explosionDamage: 0,
  fireDps: 0,
  fireDurationMs: 0,
  poisonDps: 0,
  poisonDurationMs: 0,
  chainLightningChance: 0,
  chainLightningTargets: 0,
  chainLightningDamageMultiplier: 0,
  droneCount: 0
};
