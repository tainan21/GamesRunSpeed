import { describe, expect, it } from "vitest";
import { BOSSES } from "./config/boss";
import { ITEM_BY_ID } from "./config/items";
import { WEAPONS } from "./config/weapons";
import {
  appendEquippedWeapon,
  awardXpProgress,
  buildItemOfferContext,
  buildPhaseRewardQueue,
  buildPlayerStats,
  chooseEnemyType,
  createEquippedWeapon,
  createItemInstance,
  drawItemChoices,
  drawWeaponChoices,
  getActiveSynergyIds,
  getBossCountForBossPhase,
  getBossHealthMultiplier,
  getBossIdForPhase,
  getBurstWaveCount,
  getEnemyHealthMultiplier,
  getEnemySpeedMultiplier,
  getPhaseRecoveryWindowMs,
  getPhaseEnemyCap,
  getRarityWeightsForPhase,
  getReadyWeapons,
  getSpawnRatePerSecond,
  getUnlockedWeaponPool,
  getXpToNextLevel,
  pickSpawnPoint,
  resolvePendingSpawns,
  stepSpawnAccumulator
} from "./logic";
import { loadProfile, saveProfile } from "./profile";
import { applyCharacterToStats, buildDerivedRunStats } from "./stats";

describe("roguelite roadmap logic", () => {
  it("applies character modifiers and item-based synergies", () => {
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
        difficultyLabel: "Easy",
        starterWeapons: ["pistol", "burstRifle"],
        pros: [],
        cons: [],
        accent: 0,
        panelTint: 0,
        moveSpeedMultiplier: 0.9,
        attackSpeedMultiplier: 1.2
      }
    );

    expect(soldierStats.moveSpeed).toBeCloseTo(207);
    expect(soldierStats.attackSpeedMultiplier).toBeCloseTo(1.2);

    const selectedItems = [
      createItemInstance("arcNetwork", "epic", 3, 2),
      createItemInstance("steadyAim", "common", 3, 2),
      createItemInstance("vampiricRounds", "rare", 3, 2),
      createItemInstance("rapidCycle", "common", 3, 2)
    ];
    const synergyStats = buildPlayerStats(selectedItems, "soldier", getActiveSynergyIds(selectedItems));

    expect(synergyStats.chainLightningTargets).toBeGreaterThan(2);
    expect(synergyStats.lifeSteal).toBeGreaterThan(0.03);
    expect(synergyStats.attackSpeedMultiplier).toBeGreaterThan(1.2);
  });

  it("uses the density cap curve and item reward cadence", () => {
    expect(getPhaseEnemyCap(1)).toBe(10);
    expect(getPhaseEnemyCap(5)).toBe(25);
    expect(getPhaseEnemyCap(10)).toBe(40);
    expect(getPhaseEnemyCap(20)).toBe(80);
    expect(getPhaseEnemyCap(21)).toBe(86);

    expect(buildPhaseRewardQueue(5, 2)).toEqual([
      { type: "itemDraft", phase: 5 },
      { type: "itemDraft", phase: 5 },
      { type: "weaponDraft", phase: 5 }
    ]);

    expect(buildPhaseRewardQueue(20, 1)).toEqual([
      { type: "itemDraft", phase: 20 },
      { type: "weaponDraft", phase: 20 },
      { type: "bossSpawn", phase: 20 }
    ]);
  });

  it("unlocks the weapon pool by tier and drafts fresh-first", () => {
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
  });

  it("schedules fixed bosses, avoids immediate repeats, and enables double-boss milestones", () => {
    expect(getBossIdForPhase(4, null)).toBe("titan");
    expect(getBossIdForPhase(24, "ironColossus")).toBe("voidPhantom");
    expect(getBossIdForPhase(40, "orbitalTyrant")).toBe("finalWarden");

    const post40 = getBossIdForPhase(44, "finalWarden", 0);
    expect(post40).not.toBe("finalWarden");
    expect(post40 && BOSSES[post40].introductionPhase <= 44).toBe(true);
    expect(getBossCountForBossPhase(8)).toBe(1);
    expect(getBossCountForBossPhase(12)).toBe(2);
    expect(getBossCountForBossPhase(16)).toBe(2);
    expect(getBossCountForBossPhase(20)).toBe(2);
  });

  it("matches spawn, burst, and difficulty formulas", () => {
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

  it("tracks xp overflow with the new retention curve", () => {
    expect(getXpToNextLevel(1)).toBe(5);
    expect(getXpToNextLevel(4)).toBe(14);
    expect(getXpToNextLevel(11)).toBe(43);

    const awarded = awardXpProgress({ level: 1, xp: 4, xpToNext: 5 }, 10);
    expect(awarded.levelsGained).toBe(2);
    expect(awarded.progress.level).toBe(3);
    expect(awarded.progress.xp).toBe(1);
    expect(awarded.progress.xpToNext).toBe(11);
  });

  it("activates curated item synergies only when requirements are met", () => {
    const allSynergies = getActiveSynergyIds([
      createItemInstance("incendiaryPayload", "rare", 1, 1),
      createItemInstance("volatileHarvest", "rare", 1, 1),
      createItemInstance("neurotoxinCoating", "rare", 1, 1),
      createItemInstance("ricochetMesh", "rare", 1, 1),
      createItemInstance("arcNetwork", "epic", 1, 1),
      createItemInstance("steadyAim", "common", 1, 1),
      createItemInstance("guardianDrone", "epic", 1, 1),
      createItemInstance("rapidCycle", "common", 1, 1),
      createItemInstance("tungstenCore", "rare", 1, 1),
      createItemInstance("vampiricRounds", "rare", 1, 1),
      createItemInstance("splitChamber", "common", 1, 1)
    ]);

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

    expect(getActiveSynergyIds([createItemInstance("incendiaryPayload", "rare", 1, 1)])).toEqual([]);
  });

  it("draws unique contextual item offers and filters capped stacks", () => {
    const owned = [
      createItemInstance("arcNetwork", "epic", 5, 3),
      createItemInstance("guardianDrone", "epic", 5, 3),
      createItemInstance("overclockedCore", "legendary", 5, 3)
    ];

    const context = buildItemOfferContext({
      phase: 10,
      level: 5,
      characterId: "soldier",
      items: owned,
      equippedWeapons: [createEquippedWeapon("pistol", 0), createEquippedWeapon("burstRifle", 1)],
      stats: buildPlayerStats(owned, "soldier", getActiveSynergyIds(owned))
    });

    const choices = drawItemChoices(context, [0.1, 0.2, 0.3, 0.4, 0.5, 0.6]);
    const ids = choices.map((choice) => choice.itemId);

    expect(choices).toHaveLength(3);
    expect(new Set(ids).size).toBe(3);
    expect(ids.includes("arcNetwork")).toBe(false);
    expect(ids.includes("guardianDrone")).toBe(false);
    expect(ids.includes("overclockedCore")).toBe(false);
  });

  it("builds readable runtime stats from the real run state", () => {
    const items = [createItemInstance("rapidCycle", "common", 2, 1), createItemInstance("ceramicArmor", "common", 2, 1)];
    const stats = buildPlayerStats(items, "tank", getActiveSynergyIds(items));
    const snapshot = buildDerivedRunStats({
      hp: 88,
      stats,
      selectedItems: items,
      equippedWeapons: [createEquippedWeapon("shotgun", 0), createEquippedWeapon("pistol", 1)],
      shieldCharges: stats.maxShieldCharges
    });

    expect(snapshot.currentHp).toBe(88);
    expect(snapshot.equippedWeapons).toContain("Shotgun");
    expect(snapshot.projectileCountMin).toBeGreaterThan(0);
    expect(snapshot.projectileCountMax).toBeGreaterThanOrEqual(snapshot.projectileCountMin);
    expect(snapshot.dominantTags.length).toBeGreaterThan(0);
  });

  it("opens larger recovery windows early and shorter ones later", () => {
    expect(getPhaseRecoveryWindowMs(2)).toBe(4_000);
    expect(getPhaseRecoveryWindowMs(8)).toBe(3_250);
    expect(getPhaseRecoveryWindowMs(18)).toBe(2_400);
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

  it("persists only the last selected character in profile storage", () => {
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

  it("ramps rarity weights by phase and offer profile", () => {
    const earlySafe = getRarityWeightsForPhase(2, "safe");
    const lateBold = getRarityWeightsForPhase(18, "bold");

    expect(earlySafe.common).toBeGreaterThan(earlySafe.rare);
    expect(lateBold.epic).toBeGreaterThan(earlySafe.epic);
    expect(lateBold.legendary).toBeGreaterThan(0);
    expect(Object.values(lateBold).reduce((sum, value) => sum + value, 0)).toBeCloseTo(1);
  });
});
