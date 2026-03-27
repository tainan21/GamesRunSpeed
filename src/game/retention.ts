import type { ItemOfferProfile, ItemRarity } from "./types";

export function getXpToNextLevel(level: number): number {
  if (level <= 4) {
    return 5 + (level - 1) * 3;
  }

  if (level <= 10) {
    return 14 + (level - 4) * 4;
  }

  return 38 + (level - 10) * 5;
}

export function getPhaseRecoveryWindowMs(phase: number): number {
  if (phase < 6) {
    return 4_000;
  }

  if (phase < 12) {
    return 3_250;
  }

  return 2_400;
}

export function getBossCountForPhase(phase: number): number {
  if (phase >= 16 && phase % 4 === 0) {
    return 2;
  }

  if (phase >= 12 && phase % 12 === 0) {
    return 2;
  }

  return 1;
}

export function getRarityWeightsForPhase(phase: number, profile: ItemOfferProfile): Record<ItemRarity, number> {
  const early = {
    common: 0.66,
    uncommon: 0.24,
    rare: 0.08,
    epic: 0.02,
    legendary: 0
  };
  const mid = {
    common: 0.4,
    uncommon: 0.3,
    rare: 0.18,
    epic: 0.09,
    legendary: 0.03
  };
  const late = {
    common: 0.2,
    uncommon: 0.28,
    rare: 0.24,
    epic: 0.18,
    legendary: 0.1
  };

  const base = phase < 6 ? early : phase < 12 ? mid : late;
  const next = { ...base };

  if (profile === "safe") {
    next.common += 0.08;
    next.uncommon += 0.05;
    next.epic = Math.max(0, next.epic - 0.07);
    next.legendary = Math.max(0, next.legendary - 0.03);
  } else if (profile === "bold") {
    next.common = Math.max(0.04, next.common - 0.14);
    next.uncommon = Math.max(0.08, next.uncommon - 0.05);
    next.rare += 0.04;
    next.epic += 0.09;
    next.legendary += phase >= 10 ? 0.06 : 0.02;
  } else {
    next.uncommon += 0.03;
    next.rare += 0.03;
  }

  return normalizeRarityWeights(next);
}

export function normalizeRarityWeights(weights: Record<ItemRarity, number>): Record<ItemRarity, number> {
  const total = Object.values(weights).reduce((sum, value) => sum + Math.max(0, value), 0) || 1;

  return {
    common: Math.max(0, weights.common) / total,
    uncommon: Math.max(0, weights.uncommon) / total,
    rare: Math.max(0, weights.rare) / total,
    epic: Math.max(0, weights.epic) / total,
    legendary: Math.max(0, weights.legendary) / total
  };
}
