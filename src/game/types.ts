export type WeaponId = "pistol" | "machineGun" | "shotgun" | "sniper" | "burstRifle";

export type NormalEnemyId = "grunt" | "runner" | "tank" | "shooter" | "elite";
export type EnemyId = NormalEnemyId | "boss";
export type EnemyProjectileType = "slow" | "fast";
export type WeaponPreviewPattern = "single" | "stream" | "fan" | "pierce" | "burst";

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

export interface WeaponDef {
  id: WeaponId;
  label: string;
  description: string;
  fireRateMs: number;
  damage: number;
  baseProjectiles: number;
  projectileSpeed: number;
  tint: number;
  spreadCapDeg: number;
  iconKey: string;
  previewPattern: WeaponPreviewPattern;
  muzzleFlashTint: number;
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
  shieldCharges: number;
  nextWeaponSlotId: number;
  phaseTransitionEndsAt: number;
  weaponDraftOffer: WeaponDraftOffer | null;
}
