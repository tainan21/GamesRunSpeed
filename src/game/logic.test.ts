import { describe, expect, it } from "vitest";
import { BOSS } from "./config/boss";
import { ENEMIES } from "./config/enemies";
import { PROFILE_STORAGE_KEY } from "./config/progression";
import { UPGRADE_POOL } from "./config/upgrades";
import {
  awardXpProgress,
  buildPhaseRewardQueue,
  buildPlayerStats,
  chooseEnemyType,
  createEquippedWeapon,
  drawUpgradeChoices,
  getBossHealthMultiplier,
  getEnemyHealthMultiplier,
  getEnemySpeedMultiplier,
  getPhaseEnemyCap,
  getPhaseSpawnInterval,
  getReadyWeapons,
  getXpToNextLevel,
  isBossTriggerPhase,
  isWeaponDraftPhase,
  pickSpawnPoint,
  resolvePendingSpawns
} from "./logic";
import { loadProfile, saveProfile } from "./profile";

describe("roguelite v4 logic helpers", () => {
  it("applies character modifiers alongside run upgrades", () => {
    const soldier = buildPlayerStats({ rapidCycle: 1 }, "soldier");
    const scout = buildPlayerStats({ reservePlating: 1 }, "scout");
    const tank = buildPlayerStats({}, "tank");

    expect(soldier.attackSpeedMultiplier).toBeCloseTo(1.32);
    expect(soldier.moveSpeed).toBeCloseTo(207);
    expect(scout.maxHp).toBe(98);
    expect(scout.moveSpeed).toBeCloseTo(299);
    expect(tank.maxHp).toBe(140);
    expect(tank.attackSpeedMultiplier).toBeCloseTo(0.75);
  });

  it("keeps phase caps and reward cadence aligned with v4", () => {
    expect(getPhaseEnemyCap(1)).toBe(6);
    expect(getPhaseEnemyCap(4)).toBe(20);
    expect(getPhaseEnemyCap(8)).toBe(40);
    expect(isBossTriggerPhase(4)).toBe(true);
    expect(isBossTriggerPhase(8)).toBe(true);
    expect(isWeaponDraftPhase(5)).toBe(true);
    expect(isWeaponDraftPhase(10)).toBe(true);
    expect(isWeaponDraftPhase(6)).toBe(false);
  });

  it("selects elite enemies only once their phase mix unlocks them", () => {
    expect(chooseEnemyType(2, 0.99)).not.toBe("elite");
    expect(chooseEnemyType(3, 0.99)).toBe("elite");
    expect(chooseEnemyType(6, 0.99)).toBe("elite");
  });

  it("tracks xp overflow and queued levels correctly", () => {
    const result = awardXpProgress({ level: 1, xp: 5, xpToNext: getXpToNextLevel(1) }, 7);

    expect(result.levelsGained).toBe(1);
    expect(result.progress.level).toBe(2);
    expect(result.progress.xp).toBe(6);
    expect(result.progress.xpToNext).toBe(10);
  });

  it("orders phase rewards as level-ups, then weapon draft, then boss", () => {
    expect(buildPhaseRewardQueue(20, 2)).toEqual([
      { type: "levelUp", phase: 20 },
      { type: "levelUp", phase: 20 },
      { type: "weaponDraft", phase: 20 },
      { type: "bossSpawn", phase: 20 }
    ]);
  });

  it("draws unique upgrade cards and filters one-stack picks out of the pool", () => {
    const choices = drawUpgradeChoices(UPGRADE_POOL, { caliberBoost: 1, rapidCycle: 1 }, 3, [0, 0, 0]);

    expect(new Set(choices.map((choice) => choice.id)).size).toBe(3);
    expect(choices.some((choice) => choice.id === "caliberBoost")).toBe(false);
    expect(choices.some((choice) => choice.id === "rapidCycle")).toBe(false);
  });

  it("fires weapon slots independently on their own cooldowns", () => {
    const equippedWeapons = [
      createEquippedWeapon("pistol", 0),
      { ...createEquippedWeapon("machineGun", 1), nextReadyAt: 500 }
    ];

    const result = getReadyWeapons(equippedWeapons, 400, 1);

    expect(result.fired).toHaveLength(1);
    expect(result.fired[0]?.slotId).toBe(0);
    expect(result.equippedWeapons[0]?.nextReadyAt).toBe(1100);
    expect(result.equippedWeapons[1]?.nextReadyAt).toBe(500);
  });

  it("applies difficulty scaling formulas without mixing boss and normal enemy config", () => {
    expect(getPhaseSpawnInterval(1)).toBe(550);
    expect(getPhaseSpawnInterval(10)).toBe(415);
    expect(getPhaseSpawnInterval(30)).toBe(280);
    expect(getEnemyHealthMultiplier(4)).toBeCloseTo(1.36);
    expect(getEnemySpeedMultiplier(6)).toBeCloseTo(1.2);
    expect(getEnemySpeedMultiplier(30)).toBeCloseTo(1.8);
    expect(getBossHealthMultiplier(4)).toBe(1);
    expect(getBossHealthMultiplier(8)).toBeCloseTo(1.18);
    expect(BOSS.maxHp).toBe(280);
    expect(ENEMIES.grunt.maxHp).toBe(1);
    expect("boss" in ENEMIES).toBe(false);
  });

  it("keeps telegraphed spawns inside the arena and resolves them by time", () => {
    const point = pickSpawnPoint(1280, 720, 56, 140, 72, { x: 640, y: 360 }, [{ x: 240, y: 240 }], [
      0.5,
      0.5,
      0.15,
      0.2,
      0.9,
      0.1
    ]);

    expect(point).not.toBeNull();
    expect(point?.x).toBeGreaterThanOrEqual(56);
    expect(point?.x).toBeLessThanOrEqual(1224);
    expect(point?.y).toBeGreaterThanOrEqual(56);
    expect(point?.y).toBeLessThanOrEqual(664);

    const pending = [
      { id: 1, enemyType: "grunt" as const, x: 100, y: 100, createdAt: 0, spawnAt: 650 },
      { id: 2, enemyType: "boss" as const, x: 200, y: 200, createdAt: 100, spawnAt: 900 }
    ];

    expect(resolvePendingSpawns(pending, 800)).toEqual({
      ready: [{ id: 1, enemyType: "grunt", x: 100, y: 100, createdAt: 0, spawnAt: 650 }],
      pending: [{ id: 2, enemyType: "boss", x: 200, y: 200, createdAt: 100, spawnAt: 900 }]
    });
  });

  it("loads and saves the simplified last-character profile with corrupt fallback", () => {
    const store = new Map<string, string>();
    const storage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      }
    };

    saveProfile(storage, { lastCharacterId: "scout" });
    expect(store.has(PROFILE_STORAGE_KEY)).toBe(true);
    expect(loadProfile(storage)).toEqual({ lastCharacterId: "scout" });

    store.set(PROFILE_STORAGE_KEY, "{bad json");
    expect(loadProfile(storage)).toEqual({ lastCharacterId: "soldier" });
  });
});
