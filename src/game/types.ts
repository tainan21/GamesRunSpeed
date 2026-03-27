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
export type WeaponRarity = "common" | "rare" | "epic" | "legendary";
export type WeaponAvailability = "draft" | "starterOnly" | "both";
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

export type FlowMode =
  | "mainMenu"
  | "characterSelect"
  | "live"
  | "itemDraft"
  | "weaponDraft"
  | "phaseTransition"
  | "statsPanel"
  | "gameOver";

export type CharacterId =
  | "soldier"
  | "scout"
  | "tank"
  | "sniper"
  | "pyromancer"
  | "chemist"
  | "engineer"
  | "berserker"
  | "lightningAdept"
  | "guardian"
  | "ranger"
  | "assassin"
  | "necromancer"
  | "gladiator"
  | "alchemist"
  | "trickster";
export type DifficultyLabel = "Easy" | "Medium" | "Hard";

export type ItemCategory = "offense" | "utility" | "projectile" | "survivability" | "special";
export type ItemRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";
export type ItemOfferProfile = "safe" | "synergy" | "bold";
export type DominantTag =
  | "damage"
  | "attackSpeed"
  | "crit"
  | "move"
  | "projectile"
  | "projectileSpeed"
  | "spread"
  | "pierce"
  | "bounce"
  | "armor"
  | "regen"
  | "shield"
  | "hp"
  | "lifesteal"
  | "xp"
  | "fire"
  | "poison"
  | "lightning"
  | "explosive"
  | "drone"
  | "survival"
  | WeaponFamily
  | WeaponTag;

export type ItemId =
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
  | "guardianDrone"
  | "glassAmplifier"
  | "steelToes"
  | "bloodBattery"
  | "recoilEngine"
  | "phaseCatalyst"
  | "fortunaCache"
  | "stasisShell"
  | "overclockedCore";

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
  rarity: WeaponRarity;
  availability: WeaponAvailability;
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
  difficultyLabel: DifficultyLabel;
  startingWeaponId: WeaponId;
  pros: string[];
  cons: string[];
  passiveEffects: ItemEffect[];
  accent: number;
  panelTint: number;
  portraitTint?: number;
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
  dodgeChance: number;
  summonDamageMultiplier: number;
  itemLuck: number;
}

export interface ItemEffect {
  stat: keyof PlayerStats;
  mode: "add" | "multiply";
  value: number;
  polarity: "pro" | "con";
}

export interface ItemDef {
  id: ItemId;
  label: string;
  description: string;
  shortDescription?: string;
  accent: number;
  category: ItemCategory;
  baseRarity: ItemRarity;
  displayIconKey?: string;
  tags: DominantTag[];
  pros: string[];
  cons: string[];
  offerWeight: number;
  possibleSynergies: SynergyId[];
  synergyHint?: string;
  effects: ItemEffect[];
  maxStacks?: number;
}

export interface ItemInstance {
  id: ItemId;
  rarity: ItemRarity;
  acquiredAtLevel: number;
  acquiredAtPhase: number;
}

export interface ItemOfferContext {
  phase: number;
  level: number;
  characterId: CharacterId;
  equippedWeapons: WeaponId[];
  items: ItemInstance[];
  dominantTags: DominantTag[];
  currentPower: number;
  itemLuck: number;
  recentRarities: ItemRarity[];
}

export interface ItemOfferChoice {
  itemId: ItemId;
  rarity: ItemRarity;
  profile: ItemOfferProfile;
}

export interface RarityDef {
  id: ItemRarity;
  label: string;
  accent: number;
  fill: number;
  border: number;
  positiveScale: number;
  negativeScale: number;
  offerWeightMultiplier: number;
  synergyWeightMultiplier: number;
}

export interface WeaponRarityDef {
  id: WeaponRarity;
  label: string;
  accent: number;
  fill: number;
  border: number;
  description: string;
}

export interface DominantTagEntry {
  tag: DominantTag;
  count: number;
}

export type StatPolarity = "positive" | "negative" | "neutral";

export interface BuildStatLine {
  label: string;
  value: string;
  polarity: StatPolarity;
}

export interface BuildInventoryEntry {
  kind: "item" | "passive";
  id: string;
  label: string;
  rarityLabel?: string;
  categoryLabel: string;
  shortDescription: string;
  pros: string[];
  cons: string[];
  tags: string[];
  synergies: string[];
  stackCount: number;
  isUnique: boolean;
  iconKey?: string;
  accent: number;
  fill: number;
  border: number;
  footerHint: string;
}

export interface DerivedRunStats {
  currentHp: number;
  maxHp: number;
  damageMultiplier: number;
  attackSpeedMultiplier: number;
  critChance: number;
  critDamageMultiplier: number;
  moveSpeed: number;
  projectileCountMin: number;
  projectileCountMax: number;
  projectileBonus: number;
  projectileSpeedMultiplier: number;
  projectileSizeMultiplier: number;
  spreadMultiplier: number;
  pierce: number;
  bounce: number;
  knockbackMultiplier: number;
  armor: number;
  lifesteal: number;
  regenPerSecond: number;
  xpMagnetRadius: number;
  dodgeChance: number;
  summonDamageMultiplier: number;
  itemLuck: number;
  shieldCharges: number;
  maxShieldCharges: number;
  equippedWeapons: string[];
  dominantTags: DominantTagEntry[];
  itemCount: number;
  offenseLines: BuildStatLine[];
  defenseLines: BuildStatLine[];
  utilityLines: BuildStatLine[];
  inventoryEntries: BuildInventoryEntry[];
  uniqueItemLabels: string[];
  uniquePassiveLabels: string[];
  synergyLabels: string[];
}

export interface SynergyDef {
  id: SynergyId;
  label: string;
  description: string;
  requires: ItemId[][];
  accent: number;
}

export interface PersistentProfile {
  lastCharacterId: CharacterId;
}

export interface EquippedWeapon {
  slotId: number;
  weaponId: WeaponId;
  rarity: WeaponRarity;
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
  type: "itemDraft" | "weaponDraft" | "bossSpawn";
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
  buildSnapshot: DerivedRunStats;
  gameOver: boolean;
  level: number;
  xp: number;
  xpToNext: number;
  selectedItems: ItemInstance[];
  pendingItemChoices: number;
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
  currentItemOffer: ItemOfferChoice[] | null;
  recentRarities: ItemRarity[];
}

export type UpgradeCategory = ItemCategory;
export type UpgradeId = ItemId;
export type UpgradeEffect = ItemEffect;
export type UpgradeDef = ItemDef;
