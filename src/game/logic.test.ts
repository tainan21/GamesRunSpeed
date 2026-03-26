import { describe, expect, it } from "vitest";
import { BOSSES } from "./config/boss";
import { WEAPONS } from "./config/weapons";
import {
  appendEquippedWeapon,
  applyCharacterToStats,
  awardXpProgress,
  buildPhaseRewardQueue,
  buildPlayerStats,
  chooseEnemyType,
  createEquippedWeapon,
  drawUpgradeChoices,
  drawWeaponChoices,
  getActiveSynergyIds,
  getBossHealthMultiplier,
  getBossIdForPhase,
  getBurstWaveCount,
  getEnemyHealthMultiplier,
  getEnemySpeedMultiplier,
  getPhaseEnemyCap,
  getReadyWeapons,
  getSpawnRatePerSecond,
  getUnlockedWeaponPool,
  getXpToNextLevel,
  pickSpawnPoint,
  resolvePendingSpawns,
  stepSpawnAccumulator
} from "./logic";
import { loadProfile, saveProfile } from "./profile";

describe("roguelite v5 logic helpers", () => {
  it("applies character modifiers and synergy-aware run stats", () => {
    const soldierStats = applyCharacterToStats(
      {
        maxHp: 100,
        moveSpeed: 230,
        attackSpeedMultiplier: 1,
        damageMultiplier: 1,
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
      },
      {
        id: "soldier",
        label: "Soldier",
        summary: "",
        passive: "",
        weakness: "",
        accent: 0,
        panelTint: 0,
        moveSpeedMultiplier: 0.9,
        attackSpeedMultiplier: 1.2
      }
    );

    expect(soldierStats.moveSpeed).toBeCloseTo(207);
    expect(soldierStats.attackSpeedMultiplier).toBeCloseTo(1.2);

    const synergyStats = buildPlayerStats(
      {
        arcNetwork: 1,
        steadyAim: 1,
        vampiricRounds: 1,
        rapidCycle: 1
      },
      "soldier"
    );

    expect(synergyStats.chainLightningTargets).toBeGreaterThan(2);
    expect(synergyStats.lifeSteal).toBeGreaterThan(0.03);
    expect(synergyStats.attackSpeedMultiplier).toBeGreaterThan(1.2);
  });

  it("uses the v5 density cap curve and reward cadence", () => {
    expect(getPhaseEnemyCap(1)).toBe(10);
    expect(getPhaseEnemyCap(5)).toBe(25);
    expect(getPhaseEnemyCap(10)).toBe(40);
    expect(getPhaseEnemyCap(20)).toBe(80);
    expect(getPhaseEnemyCap(21)).toBe(86);

    expect(buildPhaseRewardQueue(5, 2)).toEqual([
      { type: "levelUp", phase: 5 },
      { type: "levelUp", phase: 5 },
      { type: "weaponDraft", phase: 5 }
    ]);

    expect(buildPhaseRewardQueue(20, 1)).toEqual([
      { type: "levelUp", phase: 20 },
      { type: "weaponDraft", phase: 20 },
      { type: "bossSpawn", phase: 20 }
    ]);
  });

  it("unlocks the 40-weapon pool by tier and drafts fresh-first", () => {
    const phase5Pool = getUnlockedWeaponPool(5);
    const phase10Pool = getUnlockedWeaponPool(10);
    const phase20Pool = getUnlockedWeaponPool(20);

    expect(phase5Pool.every((weaponId) => WEAPONS[weaponId].tier === 1)).toBe(true);
    expect(phase10Pool.some((weaponId) => WEAPONS[weaponId].tier === 2)).toBe(true);
    expect(phase20Pool).toHaveLength(40);

    const choices = drawWeaponChoices(5, ["pistol", "machineGun"], 3, [0, 0.1, 0.2]);
    expect(choices).toHaveLength(3);
    expect(choices.every((weaponId) => WEAPONS[weaponId].tier === 1)).toBe(true);
    expect(choices.includes("pistol")).toBe(false);
    expect(choices.includes("machineGun")).toBe(false);

    const exhaustedChoices = drawWeaponChoices(5, phase5Pool.slice(0, phase5Pool.length - 1), 3, [0, 0.2, 0.6]);
    expect(exhaustedChoices[0]).toBe(phase5Pool[phase5Pool.length - 1]);
  });

  it("schedules fixed bosses through phase 40 and avoids immediate repeats after that", () => {
    expect(getBossIdForPhase(4, null)).toBe("titan");
    expect(getBossIdForPhase(24, "ironColossus")).toBe("voidPhantom");
    expect(getBossIdForPhase(40, "orbitalTyrant")).toBe("finalWarden");

    const post40 = getBossIdForPhase(44, "finalWarden", 0);
    expect(post40).not.toBe("finalWarden");
    expect(post40 && BOSSES[post40].introductionPhase <= 44).toBe(true);
  });

  it("matches the v5 spawn, burst, and difficulty formulas", () => {
    expect(getSpawnRatePerSecond(1)).toBeCloseTo(1.55);
    expect(getSpawnRatePerSecond(25)).toBeCloseTo((1.2 + 25 * 0.35) * 2);

    const accumulator = stepSpawnAccumulator(0, 1, 1_000);
    expect(accumulator.spawnCount).toBe(1);
    expect(accumulator.accumulator).toBeCloseTo(0.55);

    expect(getBurstWaveCount(5)).toBe(12);
    expect(getBurstWaveCount(30)).toBe(22);

    expect(getEnemyHealthMultiplier(10)).toBeCloseTo(2.5);
    expect(getEnemySpeedMultiplier(10)).toBeCloseTo(1.5);
    expect(getBossHealthMultiplier(20)).toBeCloseTo(5);
  });

  it("scales elite selection probability over time", () => {
    expect(chooseEnemyType(3, 0.01)).toBe("elite");
    expect(chooseEnemyType(3, 0.5)).not.toBe("elite");
    expect(chooseEnemyType(25, 0.5)).toBe("elite");
  });

  it("tracks xp overflow and queued levels correctly", () => {
    expect(getXpToNextLevel(1)).toBe(6);
    expect(getXpToNextLevel(4)).toBe(18);

    const awarded = awardXpProgress({ level: 1, xp: 4, xpToNext: 6 }, 10);
    expect(awarded.levelsGained).toBe(1);
    expect(awarded.progress.level).toBe(2);
    expect(awarded.progress.xp).toBe(8);
    expect(awarded.progress.xpToNext).toBe(10);
  });

  it("activates all curated v5 synergies only when requirements are met", () => {
    const allSynergies = getActiveSynergyIds({
      incendiaryPayload: 1,
      volatileHarvest: 1,
      neurotoxinCoating: 1,
      ricochetMesh: 1,
      arcNetwork: 1,
      steadyAim: 1,
      guardianDrone: 1,
      rapidCycle: 1,
      tungstenCore: 1,
      vampiricRounds: 1,
      splitChamber: 1
    });

    expect(allSynergies).toEqual(
      expect.arrayContaining([
        "fireExplosion",
        "toxicRicochet",
        "critStorm",
        "droneOverclock",
        "piercingRicochet",
        "vampiricBarrage",
        "blastFragmentation",
        "toxicFirestorm"
      ])
    );

    expect(getActiveSynergyIds({ incendiaryPayload: 1 })).toEqual([]);
  });

  it("draws unique upgrade cards and filters capped picks out of the pool", () => {
    const choices = drawUpgradeChoices(
      [
        { id: "caliberBoost", label: "", description: "", accent: 0, category: "offense", effects: [], maxStacks: 1 },
        { id: "rapidCycle", label: "", description: "", accent: 0, category: "offense", effects: [], maxStacks: 1 },
        { id: "steadyAim", label: "", description: "", accent: 0, category: "offense", effects: [], maxStacks: 1 }
      ],
      { caliberBoost: 1 },
      3,
      [0, 0.9]
    );

    expect(choices.map((choice) => choice.id)).toEqual(["rapidCycle", "steadyAim"]);
  });

  it("fires weapon slots independently on their own cooldowns", () => {
    const equipped = [createEquippedWeapon("pistol", 0), createEquippedWeapon("machineGun", 1)];
    const firstPass = getReadyWeapons(equipped, 0, 1);
    expect(firstPass.fired.map((weapon) => weapon.weaponId)).toEqual(["pistol", "machineGun"]);

    const secondPass = getReadyWeapons(firstPass.equippedWeapons, 300, 1);
    expect(secondPass.fired.map((weapon) => weapon.weaponId)).toEqual(["machineGun"]);

    const thirdPass = getReadyWeapons(secondPass.equippedWeapons, 750, 1);
    expect(thirdPass.fired.map((weapon) => weapon.weaponId)).toContain("pistol");
  });

  it("keeps telegraphed spawns inside the arena and resolves them by time", () => {
    const point = pickSpawnPoint(
      1280,
      720,
      56,
      140,
      72,
      { x: 640, y: 360 },
      [{ x: 300, y: 300 }],
      [0.1, 0.1, 0.9, 0.9]
    );

    expect(point?.x).toBeCloseTo(172.8);
    expect(point?.y).toBeCloseTo(116.8);

    const pending = [
      { id: 1, enemyType: "grunt" as const, x: 100, y: 100, createdAt: 0, spawnAt: 400 },
      { id: 2, enemyType: "boss" as const, bossId: "titan" as const, x: 300, y: 300, createdAt: 0, spawnAt: 900 }
    ];

    const resolved = resolvePendingSpawns(pending, 650);
    expect(resolved.ready.map((spawn) => spawn.id)).toEqual([1]);
    expect(resolved.pending.map((spawn) => spawn.id)).toEqual([2]);
  });

  it("loads and saves the last-character profile with corrupt fallback", () => {
    const storage = new Map<string, string>();
    const adapter = {
      getItem(key: string) {
        return storage.get(key) ?? null;
      },
      setItem(key: string, value: string) {
        storage.set(key, value);
      }
    };

    expect(loadProfile(adapter)).toEqual({ lastCharacterId: "soldier" });

    saveProfile(adapter, { lastCharacterId: "tank" });
    expect(loadProfile(adapter)).toEqual({ lastCharacterId: "tank" });

    storage.set("roguelite-v3-profile", "{not-json");
    expect(loadProfile(adapter)).toEqual({ lastCharacterId: "soldier" });
  });
});
