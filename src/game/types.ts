import { BOSS_IDS, WEAPON_IDS } from "./catalog";

export type WeaponId = (typeof WEAPON_IDS)[number];
export type BossId = (typeof BOSS_IDS)[number];

export type NormalEnemyId = "grunt" | "runner" | "tank" | "shooter" | "elite";
export type EnemyId = NormalEnemyId | "boss";
export type EnemyProjectileType = "slow" | "fast";
export type WeaponPreviewPattern =
  | "single"
  | "stream"
  | "fan"
  | "pierce"
  | "burst"
  | "beam"
  | "explosive"
  | "orbit"
  | "chain"
  | "nova";
export type WeaponFamily =
  | "basic"
  | "spread"
  | "elemental"
  | "precision"
  | "explosive"
  | "orbital"
  | "exotic"
  | "experimental";
export type WeaponTier = 1 | 2 | 3 | 4;
export type WeaponBehaviorKind =
  | "ballisticSingle"
  | "ballisticBurst"
  | "fanSpread"
  | "streamDot"
  | "beam"
  | "pierceShot"
  | "rocketOrGrenade"
  | "mineDeploy"
  | "orbitalHelper"
  | "boomerangReturn"
  | "chainCaster"
  | "novaBurst";
export type WeaponTag =
  | "fire"
  | "poison"
  | "lightning"
  | "ice"
  | "acid"
  | "explosive"
  | "orbital"
  | "precision"
  | "beam"
  | "bounce";
export type WeaponVisualKind =
  | "bullet"
  | "pellet"
  | "flame"
  | "beam"
  | "rocket"
  | "grenade"
  | "mine"
  | "orbital"
  | "boomerang"
  | "lightning"
  | "nova";
export type WeaponImpactKind = "hit" | "elemental" | "explosive" | "chain" | "beam" | "orbital";
export type BossAttackPatternKind =
  | "aimedVolley"
  | "radialBurst"
  | "charge"
  | "teleportBurst"
  | "beamLane"
  | "poisonPool"
  | "lightningArc"
  | "orbitingSatellite"
  | "slowFieldPulse";

export type FlowMode = "characterSelect" | "live" | "levelUp" | "weaponDraft" | "phaseTransition" | "gameOver";

export type CharacterId = "soldier" | "scout" | "tank";

export type UpgradeCategory = "offense" | "utility" | "projectile" | "survivability" | "special";

export type UpgradeId =
  | "caliberBoost"
  | "overpressureRounds"
  | "rapidCycle"
  | "combatStims"
  | "steadyAim"
  | "killScope"
  | "deadlyFocus"
  | "executionProtocol"
  | "dashStride"
  | "fieldMobility"
  | "kineticBracing"
  | "impactHarness"
  | "magnetArray"
  | "salvageBeacon"
  | "splitChamber"
  | "mirrorChamber"
  | "stormBarrel"
  | "vectorArray"
  | "hotshotPropellant"
  | "hyperBallistics"
  | "heavyPayload"
  | "densePayload"
  | "tungstenCore"
  | "railCore"
  | "ricochetMesh"
  | "tightFormation"
  | "reservePlating"
  | "fortifiedFrame"
  | "combatRecovery"
  | "naniteRepair"
  | "ceramicArmor"
  | "bulwarkArmor"
  | "shieldCapacitor"
  | "shieldRelay"
  | "vampiricRounds"
  | "volatileHarvest"
  | "incendiaryPayload"
  | "neurotoxinCoating"
  | "arcNetwork"
  | "guardianDrone";

export type SynergyId =
  | "fireExplosion"
  | "toxicRicochet"
  | "critStorm"
  | "droneOverclock"
  | "piercingRicochet"
  | "vampiricBarrage"
  | "blastFragmentation"
  | "toxicFirestorm";

export interface WeaponBehaviorConfig {
  burstCount?: number;
  burstIntervalMs?: number;
  helperCap?: number;
  helperFireRateMs?: number;
  helperRadius?: number;
  helperCount?: number;
  returnDelayMs?: number;
  explosionRadius?: number;
  explosionDamage?: number;
  shortLifetimeMs?: number;
  beamWidth?: number;
  beamLength?: number;
  beamDurationMs?: number;
  chainTargets?: number;
  chainDamageMultiplier?: number;
  chainRange?: number;
  novaCount?: number;
  mineArmMs?: number;
  mineLifetimeMs?: number;
}

export interface WeaponDef {
  id: WeaponId;
  label: string;
  description: string;
  family: WeaponFamily;
  tier: WeaponTier;
  behaviorKind: WeaponBehaviorKind;
  tags: WeaponTag[];
  visualKind: WeaponVisualKind;
  impactKind: WeaponImpactKind;
  behaviorConfig: WeaponBehaviorConfig;
  fireRateMs: number;
  damage: number;
  baseProjectiles: number;
  projectileSpeed: number;
  tint: number;
  spreadCapDeg: number;
  iconKey: string;
  previewPattern: WeaponPreviewPattern;
  muzzleFlashTint: number;
  trailTint?: number;
  impactTint?: number;
  basePierce?: number;
  burstCount?: number;
  burstIntervalMs?: number;
  projectileScale?: number;
}

export interface EnemyDef {
  id: EnemyId;
  label: string;
  maxHp: number;
  speed: number;
  contactDamage: number;
  radius: number;
  tint: number;
  deathTint: number;
  knockbackResistance: number;
  xpValue: number;
  attackCooldownMs?: number;
  projectileType?: EnemyProjectileType;
  projectileSpeed?: number;
  projectileDamage?: number;
  projectileBurstCount?: number;
}

export interface BossAttackPatternDef {
  kind: BossAttackPatternKind;
  cooldownMs: number;
  projectileType?: EnemyProjectileType;
  projectileSpeed?: number;
  projectileDamage?: number;
  volleyCount?: number;
  fanSpreadDeg?: number;
  chargeDurationMs?: number;
  chargeSpeedMultiplier?: number;
  beamDurationMs?: number;
  beamWidth?: number;
  areaRadius?: number;
  slowMultiplier?: number;
  orbitCount?: number;
}

export interface BossDef {
  id: BossId;
  label: string;
  summary: string;
  introductionPhase: number;
  baseHp: number;
  speed: number;
  contactDamage: number;
  radius: number;
  tint: number;
  deathTint: number;
  knockbackResistance: number;
  xpOrbCount: number;
  xpOrbValue: number;
  attackPatterns: BossAttackPatternDef[];
}

export interface WeightedEnemyMix {
  grunt: number;
  runner: number;
  tank: number;
  shooter: number;
  elite: number;
}

export interface PhaseMixEntry {
  maxPhase: number;
  mix: WeightedEnemyMix;
}

export interface TargetLike {
  x: number;
  y: number;
  active: boolean;
}

export interface CharacterDef {
  id: CharacterId;
  label: string;
  summary: string;
  passive: string;
  weakness: string;
  accent: number;
  panelTint: number;
  maxHpMultiplier?: number;
  moveSpeedMultiplier?: number;
  attackSpeedMultiplier?: number;
}

export interface PlayerStats {
  maxHp: number;
  moveSpeed: number;
  damageMultiplier: number;
  attackSpeedMultiplier: number;
  critChance: number;
  critDamageMultiplier: number;
  projectileSpeedMultiplier: number;
  projectileSizeMultiplier: number;
  knockbackMultiplier: number;
  armor: number;
  regenPerSecond: number;
  projectilePierce: number;
  extraProjectiles: number;
  projectileBounce: number;
  spreadMultiplier: number;
  lifeSteal: number;
  xpMagnetRadius: number;
  maxShieldCharges: number;
  explosionRadius: number;
  explosionDamage: number;
  fireDps: number;
  fireDurationMs: number;
  poisonDps: number;
  poisonDurationMs: number;
  chainLightningChance: number;
  chainLightningTargets: number;
  chainLightningDamageMultiplier: number;
  droneCount: number;
}

export interface UpgradeEffect {
  stat: keyof PlayerStats;
  mode: "add" | "multiply";
  value: number;
}

export interface UpgradeDef {
  id: UpgradeId;
  label: string;
  description: string;
  accent: number;
  category: UpgradeCategory;
  effects: UpgradeEffect[];
  maxStacks?: number;
}

export interface SynergyDef {
  id: SynergyId;
  label: string;
  description: string;
  requires: UpgradeId[][];
  accent: number;
}

export interface PersistentProfile {
  lastCharacterId: CharacterId;
}

export interface EquippedWeapon {
  slotId: number;
  weaponId: WeaponId;
  nextReadyAt: number;
}

export interface PendingSpawn {
  id: number;
  enemyType: EnemyId;
  bossId?: BossId;
  x: number;
  y: number;
  createdAt: number;
  spawnAt: number;
}

export interface LevelProgress {
  level: number;
  xp: number;
  xpToNext: number;
}

export interface QueuedReward {
  type: "levelUp" | "weaponDraft" | "bossSpawn";
  phase: number;
}

export interface Notification {
  id: number;
  label: string;
  accent: number;
  createdAt: number;
  expiresAt: number;
}

export interface XpOrbState {
  id: number;
  x: number;
  y: number;
  value: number;
  active: boolean;
}

export interface WeaponDraftOffer {
  phase: number;
  choices: WeaponId[];
}

export interface RunState {
  flowMode: FlowMode;
  phase: number;
  phaseStartedAt: number;
  kills: number;
  hp: number;
  survivalStartedAt: number;
  selectedCharacter: CharacterId;
  equippedWeapons: EquippedWeapon[];
  pendingSpawns: PendingSpawn[];
  persistentProfile: PersistentProfile;
  bossPhasesTriggered: number[];
  bannerUntil: number;
  bannerText: string;
  stats: PlayerStats;
  gameOver: boolean;
  level: number;
  xp: number;
  xpToNext: number;
  activeUpgrades: Partial<Record<UpgradeId, number>>;
  pendingLevelUps: number;
  queuedRewards: QueuedReward[];
  notifications: Notification[];
  xpOrbs: XpOrbState[];
  activeSynergyIds: SynergyId[];
  shieldCharges: number;
  nextWeaponSlotId: number;
  spawnAccumulator: number;
  nextBurstAt: number;
  bossUnlockIndex: number;
  lastBossId: BossId | null;
  phaseTransitionEndsAt: number;
  weaponDraftOffer: WeaponDraftOffer | null;
}
