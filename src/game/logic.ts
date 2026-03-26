import { CHARACTERS } from "./characters";
import { BOSS_HP_SCALING_PER_CYCLE, BOSS_PHASE_INTERVAL, ENEMY_HP_SCALING_PER_PHASE, ENEMY_SPEED_SCALING_CAP, ENEMY_SPEED_SCALING_PER_PHASE, MIN_SPAWN_INTERVAL_MS, PHASE_ENEMY_CAPS, PHASE_MIXES, SPAWN_INTERVAL_REDUCTION_PER_PHASE_MS, WEAPON_DRAFT_PHASE_INTERVAL, BASE_SPAWN_INTERVAL_MS } from "./config/phases";
import { BASE_PLAYER_STATS } from "./config/player";
import { LEVEL_XP_BASE, LEVEL_XP_PER_LEVEL } from "./config/progression";
import { UPGRADE_BY_ID } from "./config/upgrades";
import { WEAPONS } from "./config/weapons";
import type {
  CharacterDef,
  CharacterId,
  EquippedWeapon,
  LevelProgress,
  PendingSpawn,
  PlayerStats,
  QueuedReward,
  TargetLike,
  UpgradeDef,
  UpgradeId,
  WeaponId,
  WeightedEnemyMix
} from "./types";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function getPhaseEnemyCap(phase: number): number {
  if (phase <= PHASE_ENEMY_CAPS.length) {
    return PHASE_ENEMY_CAPS[Math.max(0, phase - 1)];
  }

  return PHASE_ENEMY_CAPS[PHASE_ENEMY_CAPS.length - 1] + (phase - PHASE_ENEMY_CAPS.length) * 5;
}

export function getPhaseMix(phase: number): WeightedEnemyMix {
  const entry = PHASE_MIXES.find(({ maxPhase }) => phase <= maxPhase);

  return entry ? entry.mix : PHASE_MIXES[PHASE_MIXES.length - 1].mix;
}

export function chooseEnemyType(phase: number, roll: number) {
  const mix = getPhaseMix(phase);
  const normalizedRoll = clamp(roll, 0, 0.999999) * 100;
  const runnerThreshold = mix.grunt + mix.runner;
  const tankThreshold = runnerThreshold + mix.tank;
  const shooterThreshold = tankThreshold + mix.shooter;

  if (normalizedRoll < mix.grunt) return "grunt" as const;
  if (normalizedRoll < runnerThreshold) return "runner" as const;
  if (normalizedRoll < tankThreshold) return "tank" as const;
  if (normalizedRoll < shooterThreshold) return "shooter" as const;

  return "elite" as const;
}

export function isBossTriggerPhase(phase: number): boolean {
  return phase > 0 && phase % BOSS_PHASE_INTERVAL === 0;
}

export function isWeaponDraftPhase(phase: number): boolean {
  return phase > 0 && phase % WEAPON_DRAFT_PHASE_INTERVAL === 0;
}

export function getPhaseSpawnInterval(phase: number): number {
  return Math.max(MIN_SPAWN_INTERVAL_MS, BASE_SPAWN_INTERVAL_MS - (phase - 1) * SPAWN_INTERVAL_REDUCTION_PER_PHASE_MS);
}

export function getEnemyHealthMultiplier(phase: number): number {
  return 1 + Math.max(0, phase - 1) * ENEMY_HP_SCALING_PER_PHASE;
}

export function getEnemySpeedMultiplier(phase: number): number {
  return Math.min(ENEMY_SPEED_SCALING_CAP, 1 + Math.max(0, phase - 1) * ENEMY_SPEED_SCALING_PER_PHASE);
}

export function getBossHealthMultiplier(phase: number): number {
  const completedBossCycles = Math.max(0, Math.floor(phase / BOSS_PHASE_INTERVAL) - 1);

  return 1 + completedBossCycles * BOSS_HP_SCALING_PER_CYCLE;
}

export function getXpToNextLevel(level: number): number {
  return LEVEL_XP_BASE + Math.max(0, level - 1) * LEVEL_XP_PER_LEVEL;
}

export function awardXpProgress(progress: LevelProgress, amount: number): { progress: LevelProgress; levelsGained: number } {
  let nextProgress: LevelProgress = {
    level: progress.level,
    xp: progress.xp + amount,
    xpToNext: progress.xpToNext
  };
  let levelsGained = 0;

  while (nextProgress.xp >= nextProgress.xpToNext) {
    nextProgress = {
      level: nextProgress.level + 1,
      xp: nextProgress.xp - nextProgress.xpToNext,
      xpToNext: getXpToNextLevel(nextProgress.level + 1)
    };
    levelsGained += 1;
  }

  return { progress: nextProgress, levelsGained };
}

export function buildPhaseRewardQueue(phase: number, pendingLevelUps: number): QueuedReward[] {
  const rewards: QueuedReward[] = [];

  for (let index = 0; index < pendingLevelUps; index += 1) {
    rewards.push({ type: "levelUp", phase });
  }

  if (isWeaponDraftPhase(phase)) {
    rewards.push({ type: "weaponDraft", phase });
  }

  if (isBossTriggerPhase(phase)) {
    rewards.push({ type: "bossSpawn", phase });
  }

  return rewards;
}

export function getProjectileSpreadAngles(emittedCount: number, spreadCapDeg: number, spreadMultiplier = 1): number[] {
  if (emittedCount <= 1) {
    return [0];
  }

  const clampedSpreadMultiplier = Math.max(0.35, spreadMultiplier);
  const rawFan = 4 + (emittedCount - 1) * (spreadCapDeg > 30 ? 4 : 2.5);
  const spreadCap = spreadCapDeg * clampedSpreadMultiplier;
  const fan = Math.min(spreadCap, rawFan * clampedSpreadMultiplier);
  const step = fan / (emittedCount - 1);
  const start = -fan / 2;

  return Array.from({ length: emittedCount }, (_, index) => start + step * index);
}

export function findNearestTarget<T extends TargetLike>(
  origin: Pick<TargetLike, "x" | "y">,
  targets: readonly T[]
): T | null {
  let bestTarget: T | null = null;
  let bestDistanceSq = Number.POSITIVE_INFINITY;

  for (const target of targets) {
    if (!target.active) continue;
    const dx = target.x - origin.x;
    const dy = target.y - origin.y;
    const distanceSq = dx * dx + dy * dy;

    if (distanceSq < bestDistanceSq) {
      bestDistanceSq = distanceSq;
      bestTarget = target;
    }
  }

  return bestTarget;
}

export function applyCharacterToStats(stats: PlayerStats, character: CharacterDef): PlayerStats {
  return {
    ...stats,
    maxHp: Math.round(stats.maxHp * (character.maxHpMultiplier ?? 1)),
    moveSpeed: stats.moveSpeed * (character.moveSpeedMultiplier ?? 1),
    attackSpeedMultiplier: stats.attackSpeedMultiplier * (character.attackSpeedMultiplier ?? 1)
  };
}

function applyUpgradeEffects(stats: PlayerStats, upgradeId: UpgradeId, count: number): PlayerStats {
  const definition = UPGRADE_BY_ID[upgradeId];
  let nextStats = { ...stats };

  for (let index = 0; index < count; index += 1) {
    nextStats = definition.effects.reduce<PlayerStats>((workingStats, effect) => {
      const currentValue = workingStats[effect.stat];
      const numericValue = typeof currentValue === "number" ? currentValue : 0;
      const updatedValue = effect.mode === "add" ? numericValue + effect.value : numericValue * effect.value;

      return {
        ...workingStats,
        [effect.stat]: updatedValue
      };
    }, nextStats);
  }

  return nextStats;
}

export function buildPlayerStats(
  selected: Partial<Record<UpgradeId, number>>,
  character: CharacterId | CharacterDef
): PlayerStats {
  const characterDef = typeof character === "string" ? CHARACTERS[character] : character;
  let stats = applyCharacterToStats({ ...BASE_PLAYER_STATS }, characterDef);

  for (const [upgradeId, rawCount] of Object.entries(selected) as Array<[UpgradeId, number | undefined]>) {
    const count = rawCount ?? 0;

    if (count <= 0) {
      continue;
    }

    stats = applyUpgradeEffects(stats, upgradeId, count);
  }

  return stats;
}

export function drawUpgradeChoices(
  pool: UpgradeDef[],
  selected: Partial<Record<UpgradeId, number>>,
  count: number,
  rolls: number[] = []
): UpgradeDef[] {
  const eligible = pool.filter((upgrade) => {
    const current = selected[upgrade.id] ?? 0;
    const maxStacks = upgrade.maxStacks ?? 1;

    return current < maxStacks;
  });
  const remaining = [...eligible];
  const choices: UpgradeDef[] = [];

  for (let index = 0; index < count && remaining.length > 0; index += 1) {
    const roll = rolls[index] ?? Math.random();
    const choiceIndex = Math.min(remaining.length - 1, Math.floor(clamp(roll, 0, 0.999999) * remaining.length));
    const [choice] = remaining.splice(choiceIndex, 1);

    choices.push(choice);
  }

  return choices;
}

export function drawWeaponChoices(pool: WeaponId[], count: number, rolls: number[] = []): WeaponId[] {
  const remaining = [...pool];
  const choices: WeaponId[] = [];

  for (let index = 0; index < count && remaining.length > 0; index += 1) {
    const roll = rolls[index] ?? Math.random();
    const choiceIndex = Math.min(remaining.length - 1, Math.floor(clamp(roll, 0, 0.999999) * remaining.length));
    const [choice] = remaining.splice(choiceIndex, 1);

    choices.push(choice);
  }

  return choices;
}

export function createEquippedWeapon(weaponId: WeaponId, slotId: number): EquippedWeapon {
  return {
    slotId,
    weaponId,
    nextReadyAt: 0
  };
}

export function appendEquippedWeapon(equippedWeapons: EquippedWeapon[], weaponId: WeaponId, nextSlotId: number): EquippedWeapon[] {
  return [...equippedWeapons, createEquippedWeapon(weaponId, nextSlotId)];
}

export function getReadyWeapons(
  equippedWeapons: EquippedWeapon[],
  time: number,
  attackSpeedMultiplier: number
): { fired: EquippedWeapon[]; equippedWeapons: EquippedWeapon[] } {
  const nextWeapons = equippedWeapons.map((weapon) => ({ ...weapon }));
  const fired: EquippedWeapon[] = [];

  for (const weapon of nextWeapons) {
    if (time < weapon.nextReadyAt) {
      continue;
    }

    fired.push({ ...weapon });
    weapon.nextReadyAt = time + WEAPONS[weapon.weaponId].fireRateMs / attackSpeedMultiplier;
  }

  return { fired, equippedWeapons: nextWeapons };
}

export function pickSpawnPoint(
  width: number,
  height: number,
  margin: number,
  safeRadius: number,
  markerSpacing: number,
  player: Pick<TargetLike, "x" | "y">,
  occupied: Array<Pick<TargetLike, "x" | "y">>,
  rolls: number[] = []
): { x: number; y: number } | null {
  const attempts = Math.max(6, Math.floor(rolls.length / 2));

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const xRoll = rolls[attempt * 2] ?? Math.random();
    const yRoll = rolls[attempt * 2 + 1] ?? Math.random();
    const x = margin + clamp(xRoll, 0, 0.999999) * (width - margin * 2);
    const y = margin + clamp(yRoll, 0, 0.999999) * (height - margin * 2);

    if (Math.hypot(player.x - x, player.y - y) < safeRadius) {
      continue;
    }

    const tooCloseToMarker = occupied.some((point) => Math.hypot(point.x - x, point.y - y) < markerSpacing);

    if (!tooCloseToMarker) {
      return { x, y };
    }
  }

  return null;
}

export function resolvePendingSpawns(
  pending: PendingSpawn[],
  time: number
): { ready: PendingSpawn[]; pending: PendingSpawn[] } {
  const ready: PendingSpawn[] = [];
  const remaining: PendingSpawn[] = [];

  for (const entry of pending) {
    if (time >= entry.spawnAt) {
      ready.push(entry);
    } else {
      remaining.push(entry);
    }
  }

  return {
    ready,
    pending: remaining
  };
}
