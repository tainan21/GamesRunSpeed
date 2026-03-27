import { BOSS_ORDER, BOSSES } from "./config/boss";
import { PHASE_MIXES, BOSS_PHASE_INTERVAL, WEAPON_DRAFT_PHASE_INTERVAL } from "./config/phases";
import {
  BURST_WAVE_BASE_COUNT,
  BURST_WAVE_COUNT_CAP,
  BURST_WAVE_INTERVAL_MS,
  BURST_WAVE_PER_FIVE_PHASES,
  DENSITY_CAP_MILESTONES,
  DENSITY_CAP_POST_20_PER_PHASE,
  ELITE_CHANCE_CAP,
  ELITE_CHANCE_PER_PHASE,
  ELITE_CHANCE_POST_20_BONUS,
  ENEMY_HP_SCALING_PER_PHASE,
  ENEMY_SPEED_SCALING_PER_PHASE,
  SPAWN_RATE_BASE_PER_SECOND,
  SPAWN_RATE_DOUBLE_PHASE,
  SPAWN_RATE_PER_PHASE
} from "./config/spawnCurve";
import { WEAPONS } from "./config/weapons";
import { drawItemChoices as drawContextualItemChoices } from "./offers";
import { getBossCountForPhase, getPhaseRecoveryWindowMs, getRarityWeightsForPhase, getXpToNextLevel } from "./retention";
import {
  buildDerivedRunStats,
  buildPlayerStats,
  estimateBuildPower,
  getDominantBuildTags,
  getItemStacks,
  getOwnedItemIds
} from "./stats";
import type {
  BossId,
  CharacterDef,
  CharacterId,
  DerivedRunStats,
  EquippedWeapon,
  ItemId,
  ItemInstance,
  ItemOfferChoice,
  ItemOfferContext,
  LevelProgress,
  PendingSpawn,
  PlayerStats,
  QueuedReward,
  SynergyId,
  TargetLike,
  WeaponId,
  WeightedEnemyMix
} from "./types";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function interpolate(start: number, end: number, ratio: number): number {
  return start + (end - start) * ratio;
}

function chooseFromPool<T>(pool: T[], roll = Math.random()): T {
  const index = Math.min(pool.length - 1, Math.floor(clamp(roll, 0, 0.999999) * pool.length));
  return pool[index];
}

export { buildDerivedRunStats, buildPlayerStats, getDominantBuildTags, getItemStacks, getOwnedItemIds, getRarityWeightsForPhase };
export { getPhaseRecoveryWindowMs, getXpToNextLevel } from "./retention";

export function getPhaseEnemyCap(phase: number): number {
  if (phase <= DENSITY_CAP_MILESTONES[0].phase) {
    return DENSITY_CAP_MILESTONES[0].cap;
  }

  for (let index = 1; index < DENSITY_CAP_MILESTONES.length; index += 1) {
    const previous = DENSITY_CAP_MILESTONES[index - 1];
    const current = DENSITY_CAP_MILESTONES[index];

    if (phase <= current.phase) {
      const ratio = (phase - previous.phase) / (current.phase - previous.phase);
      return Math.round(interpolate(previous.cap, current.cap, ratio));
    }
  }

  const postTwenty = phase - DENSITY_CAP_MILESTONES[DENSITY_CAP_MILESTONES.length - 1].phase;
  return DENSITY_CAP_MILESTONES[DENSITY_CAP_MILESTONES.length - 1].cap + postTwenty * DENSITY_CAP_POST_20_PER_PHASE;
}

export function getPhaseMix(phase: number): WeightedEnemyMix {
  const entry = PHASE_MIXES.find(({ maxPhase }) => phase <= maxPhase);
  return entry ? entry.mix : PHASE_MIXES[PHASE_MIXES.length - 1].mix;
}

export function getEliteChance(phase: number): number {
  return Math.min(ELITE_CHANCE_CAP, phase * ELITE_CHANCE_PER_PHASE + (phase > SPAWN_RATE_DOUBLE_PHASE ? ELITE_CHANCE_POST_20_BONUS : 0));
}

export function chooseEnemyType(phase: number, roll: number) {
  const eliteChance = getEliteChance(phase);
  const clampedRoll = clamp(roll, 0, 0.999999);

  if (clampedRoll < eliteChance) {
    return "elite" as const;
  }

  const mix = getPhaseMix(phase);
  const normalizedRoll = ((clampedRoll - eliteChance) / Math.max(0.0001, 1 - eliteChance)) * (mix.grunt + mix.runner + mix.tank + mix.shooter);
  const runnerThreshold = mix.grunt + mix.runner;
  const tankThreshold = runnerThreshold + mix.tank;
  const shooterThreshold = tankThreshold + mix.shooter;

  if (normalizedRoll < mix.grunt) return "grunt" as const;
  if (normalizedRoll < runnerThreshold) return "runner" as const;
  if (normalizedRoll < tankThreshold) return "tank" as const;
  if (normalizedRoll < shooterThreshold) return "shooter" as const;

  return "grunt" as const;
}

export function isBossTriggerPhase(phase: number): boolean {
  return phase > 0 && phase % BOSS_PHASE_INTERVAL === 0;
}

export function isWeaponDraftPhase(phase: number): boolean {
  return phase > 0 && phase % WEAPON_DRAFT_PHASE_INTERVAL === 0;
}

export function getSpawnRatePerSecond(phase: number): number {
  const base = SPAWN_RATE_BASE_PER_SECOND + phase * SPAWN_RATE_PER_PHASE;
  return phase > SPAWN_RATE_DOUBLE_PHASE ? base * 2 : base;
}

export function stepSpawnAccumulator(currentAccumulator: number, phase: number, deltaMs: number): { accumulator: number; spawnCount: number } {
  const total = currentAccumulator + getSpawnRatePerSecond(phase) * (deltaMs / 1000);
  const spawnCount = Math.floor(total);

  return {
    accumulator: total - spawnCount,
    spawnCount
  };
}

export function getBurstWaveInterval(): number {
  return BURST_WAVE_INTERVAL_MS;
}

export function getBurstWaveCount(phase: number): number {
  return Math.min(BURST_WAVE_COUNT_CAP, BURST_WAVE_BASE_COUNT + Math.floor(phase / 5) * BURST_WAVE_PER_FIVE_PHASES);
}

export function getEnemyHealthMultiplier(phase: number): number {
  return 1 + phase * ENEMY_HP_SCALING_PER_PHASE;
}

export function getEnemySpeedMultiplier(phase: number): number {
  return 1 + phase * ENEMY_SPEED_SCALING_PER_PHASE;
}

export function getBossHealthMultiplier(phase: number): number {
  return 1 + phase * 0.2;
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

export function buildPhaseRewardQueue(phase: number, pendingItemChoices: number): QueuedReward[] {
  const rewards: QueuedReward[] = [];

  for (let index = 0; index < pendingItemChoices; index += 1) {
    rewards.push({ type: "itemDraft", phase });
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

  const clampedSpreadMultiplier = Math.max(0.3, spreadMultiplier);
  const rawFan = 4 + (emittedCount - 1) * (spreadCapDeg > 30 ? 4 : 2.4);
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

export function getActiveSynergyIds(selectedItems: ItemInstance[]): SynergyId[] {
  const ownedIds = new Set(selectedItems.map((item) => item.id));
  const hasAny = (...ids: ItemId[]) => ids.some((id) => ownedIds.has(id));

  const active: SynergyId[] = [];

  if (hasAny("incendiaryPayload") && hasAny("volatileHarvest")) active.push("fireExplosion");
  if (hasAny("neurotoxinCoating") && hasAny("ricochetMesh")) active.push("toxicRicochet");
  if (hasAny("arcNetwork") && hasAny("steadyAim", "killScope")) active.push("critStorm");
  if (hasAny("guardianDrone") && hasAny("rapidCycle", "combatStims")) active.push("droneOverclock");
  if (hasAny("tungstenCore", "railCore") && hasAny("ricochetMesh")) active.push("piercingRicochet");
  if (hasAny("vampiricRounds") && hasAny("rapidCycle", "combatStims")) active.push("vampiricBarrage");
  if (hasAny("volatileHarvest") && hasAny("splitChamber", "mirrorChamber", "stormBarrel", "vectorArray")) active.push("blastFragmentation");
  if (hasAny("incendiaryPayload") && hasAny("neurotoxinCoating")) active.push("toxicFirestorm");

  return active;
}

export function buildItemOfferContext(args: {
  phase: number;
  level: number;
  characterId: CharacterId;
  items: ItemInstance[];
  equippedWeapons: EquippedWeapon[];
  stats: PlayerStats;
}): ItemOfferContext {
  const dominantTags = getDominantBuildTags(args.items, args.equippedWeapons).map((entry) => entry.tag);
  const currentPower = estimateBuildPower(args.stats, args.equippedWeapons);

  return {
    phase: args.phase,
    level: args.level,
    characterId: args.characterId,
    equippedWeapons: args.equippedWeapons.map((weapon) => weapon.weaponId),
    items: args.items,
    dominantTags,
    currentPower,
    itemLuck: args.stats.itemLuck,
    recentRarities: args.items.slice(-4).map((item) => item.rarity)
  };
}

export function drawItemChoices(context: ItemOfferContext, rolls: number[] = []): ItemOfferChoice[] {
  return drawContextualItemChoices(context, rolls);
}

export function createItemInstance(itemId: ItemId, rarity: ItemOfferChoice["rarity"], level: number, phase: number): ItemInstance {
  return {
    id: itemId,
    rarity,
    acquiredAtLevel: level,
    acquiredAtPhase: phase
  };
}

export function getUnlockedWeaponTier(phase: number): 1 | 2 | 3 | 4 {
  if (phase >= 20) return 4;
  if (phase >= 15) return 3;
  if (phase >= 10) return 2;
  return 1;
}

export function getUnlockedWeaponPool(phase: number): WeaponId[] {
  const maxTier = getUnlockedWeaponTier(phase);
  return Object.values(WEAPONS)
    .filter((weapon) => weapon.tier <= maxTier && weapon.availability !== "starterOnly")
    .sort((a, b) => a.tier - b.tier || a.label.localeCompare(b.label))
    .map((weapon) => weapon.id);
}

export function drawWeaponChoices(phase: number, ownedWeapons: WeaponId[], count: number, rolls: number[] = []): WeaponId[] {
  const unlocked = getUnlockedWeaponPool(phase);
  const remainingFresh = unlocked.filter((weaponId) => !ownedWeapons.includes(weaponId));
  const freshPool = [...remainingFresh];
  const fallbackPool = [...unlocked];
  const choices: WeaponId[] = [];
  let rollIndex = 0;

  while (choices.length < count && freshPool.length > 0) {
    const choice = chooseFromPool(freshPool, rolls[rollIndex] ?? Math.random());
    rollIndex += 1;
    choices.push(choice);
    freshPool.splice(freshPool.indexOf(choice), 1);
  }

  const uniqueFallback = fallbackPool.filter((weaponId) => !choices.includes(weaponId));
  while (choices.length < count && uniqueFallback.length > 0) {
    const choice = chooseFromPool(uniqueFallback, rolls[rollIndex] ?? Math.random());
    rollIndex += 1;
    choices.push(choice);
    uniqueFallback.splice(uniqueFallback.indexOf(choice), 1);
  }

  while (choices.length < count && fallbackPool.length > 0) {
    const choice = chooseFromPool(fallbackPool, rolls[rollIndex] ?? Math.random());
    rollIndex += 1;
    choices.push(choice);
  }

  return choices;
}

export function createEquippedWeapon(
  weaponId: WeaponId,
  slotId: number,
  rarity = WEAPONS[weaponId].rarity
): EquippedWeapon {
  return {
    slotId,
    weaponId,
    rarity,
    nextReadyAt: 0
  };
}

export function appendEquippedWeapon(
  equippedWeapons: EquippedWeapon[],
  weaponId: WeaponId,
  nextSlotId: number,
  rarity = WEAPONS[weaponId].rarity
): EquippedWeapon[] {
  return [...equippedWeapons, createEquippedWeapon(weaponId, nextSlotId, rarity)];
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

export function getBossIdForPhase(phase: number, lastBossId: BossId | null, roll = Math.random()): BossId | null {
  if (!isBossTriggerPhase(phase)) {
    return null;
  }

  const fixedBoss = BOSS_ORDER.find((bossId) => BOSSES[bossId].introductionPhase === phase);
  if (fixedBoss) {
    return fixedBoss;
  }

  const unlocked = BOSS_ORDER.filter((bossId) => BOSSES[bossId].introductionPhase <= phase);
  if (unlocked.length === 0) {
    return BOSS_ORDER[0];
  }

  const pool = lastBossId && unlocked.length > 1 ? unlocked.filter((bossId) => bossId !== lastBossId) : unlocked;
  return chooseFromPool(pool, roll);
}

export function getBossCountForBossPhase(phase: number): number {
  return getBossCountForPhase(phase);
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
  const attempts = Math.max(8, Math.floor(rolls.length / 2) || 8);

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

export function resolvePendingSpawns(pending: PendingSpawn[], time: number): { ready: PendingSpawn[]; pending: PendingSpawn[] } {
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
