import type { PhaseMixEntry } from "../types";

export const PHASE_DURATION_MS = 40_000;
export const BOSS_PHASE_INTERVAL = 4;
export const WEAPON_DRAFT_PHASE_INTERVAL = 5;
export const PHASE_ENEMY_CAPS = [6, 10, 15, 20, 25, 30];
export const BASE_SPAWN_INTERVAL_MS = 550;
export const MIN_SPAWN_INTERVAL_MS = 280;
export const SPAWN_INTERVAL_REDUCTION_PER_PHASE_MS = 15;
export const ENEMY_HP_SCALING_PER_PHASE = 0.12;
export const ENEMY_SPEED_SCALING_PER_PHASE = 0.04;
export const ENEMY_SPEED_SCALING_CAP = 1.8;
export const BOSS_HP_SCALING_PER_CYCLE = 0.18;

export const PHASE_MIXES: PhaseMixEntry[] = [
  { maxPhase: 1, mix: { grunt: 80, runner: 20, tank: 0, shooter: 0, elite: 0 } },
  { maxPhase: 2, mix: { grunt: 50, runner: 20, tank: 15, shooter: 15, elite: 0 } },
  { maxPhase: 3, mix: { grunt: 38, runner: 20, tank: 18, shooter: 16, elite: 8 } },
  { maxPhase: Number.POSITIVE_INFINITY, mix: { grunt: 28, runner: 20, tank: 22, shooter: 18, elite: 12 } }
];
