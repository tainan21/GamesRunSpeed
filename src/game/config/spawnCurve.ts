export const SPAWN_RATE_BASE_PER_SECOND = 1.2;
export const SPAWN_RATE_PER_PHASE = 0.35;
export const SPAWN_RATE_DOUBLE_PHASE = 20;
export const ENEMY_HP_SCALING_PER_PHASE = 0.15;
export const ENEMY_SPEED_SCALING_PER_PHASE = 0.05;
export const ELITE_CHANCE_PER_PHASE = 0.02;
export const ELITE_CHANCE_POST_20_BONUS = 0.15;
export const ELITE_CHANCE_CAP = 0.6;
export const BURST_WAVE_INTERVAL_MS = 60_000;
export const BURST_WAVE_BASE_COUNT = 10;
export const BURST_WAVE_PER_FIVE_PHASES = 2;
export const BURST_WAVE_COUNT_CAP = 24;
export const MAX_PENDING_SPAWNS = 22;

export const DENSITY_CAP_MILESTONES = [
  { phase: 1, cap: 10 },
  { phase: 5, cap: 25 },
  { phase: 10, cap: 40 },
  { phase: 20, cap: 80 }
] as const;

export const DENSITY_CAP_POST_20_PER_PHASE = 6;
