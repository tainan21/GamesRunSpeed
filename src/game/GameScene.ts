import Phaser from "phaser";
import { SynthAudio } from "./audio";
import { CHARACTERS, CHARACTER_ORDER } from "./characters";
import {
  BOSS_ORDER,
  BOSSES,
  BOSS_PHASE_INTERVAL,
  CARD_APPEAR_STAGGER_MS,
  CHAIN_LIGHTNING_RANGE,
  DRONE_FIRE_RATE_MS,
  DRONE_ORBIT_RADIUS,
  ENEMIES,
  ENEMY_BULLET_POOL_SIZE,
  ENEMY_BULLET_LIFETIME_MS,
  ENEMY_FAR_UPDATE_INTERVAL_MS,
  ENEMY_GRID_CELL_SIZE,
  ENEMY_MID_DISTANCE,
  ENEMY_MID_UPDATE_INTERVAL_MS,
  ENEMY_NEAR_DISTANCE,
  ENEMY_POOL_SIZE,
  FX_GHOST_POOL_SIZE,
  FX_MUZZLE_FLASH_POOL_SIZE,
  FX_PARTICLE_POOL_SIZE,
  FX_TRAIL_POOL_SIZE,
  FIRE_TICK_MS,
  HUD_UPDATE_INTERVAL_MS,
  IMPACT_EFFECT_THROTTLE_MS,
  ITEM_BY_ID,
  ITEM_CARD_COUNT,
  ITEM_RARITIES,
  MAX_PENDING_SPAWNS,
  MAX_PARTICLES_PER_BURST,
  MAX_SIMULTANEOUS_GHOSTS,
  MAX_SIMULTANEOUS_MUZZLE_FLASHES,
  MAX_SIMULTANEOUS_PARTICLES,
  MAX_SIMULTANEOUS_TRAILS,
  NOTIFICATION_DURATION_MS,
  PHASE_COMPLETE_DURATION_MS,
  PHASE_DURATION_MS,
  PLAYER_BULLET_POOL_SIZE,
  PLAYER_BULLET_LIFETIME_MS,
  PLAYER_BULLET_OFFSCREEN_MARGIN,
  PLAYER_IFRAME_MS,
  PLAYER_RADIUS,
  POISON_TICK_MS,
  PROJECTILE_TRAIL_INTERVAL_MS,
  PROFILE_STORAGE_KEY,
  PROJECTILE_BOUNCE_RANGE,
  SPAWN_MARKER_SPACING,
  SPAWN_POINT_MARGIN,
  SPAWN_SAFE_RADIUS,
  SPAWN_TELEGRAPH_MS,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  WEAPON_DRAFT_CARD_COUNT,
  WEAPON_PREVIEW_LOOP_MS,
  WEAPON_RARITIES,
  WEAPONS,
  WEAPON_ORDER,
  XP_BASE_MERGE_RADIUS,
  XP_FORCE_MERGE_THRESHOLD,
  XP_HIGH_DENSITY_MERGE_RADIUS,
  XP_HIGH_DENSITY_THRESHOLD,
  XP_ORB_POOL_SIZE,
  XP_TOUCH_RADIUS
} from "./config";
import { SYNERGY_BY_ID } from "./config/synergies";
import { EnemySpatialGrid } from "./enemyGrid";
import {
  appendEquippedWeapon,
  awardXpProgress,
  buildDerivedRunStats,
  buildItemOfferContext,
  buildPhaseRewardQueue,
  buildPlayerStats,
  chooseEnemyType,
  createItemInstance,
  createEquippedWeapon,
  drawItemChoices,
  drawWeaponChoices,
  findNearestTarget,
  getActiveSynergyIds,
  getBossCountForBossPhase,
  getBossHealthMultiplier,
  getBossIdForPhase,
  getBurstWaveCount,
  getBurstWaveInterval,
  getEnemyHealthMultiplier,
  getEnemySpeedMultiplier,
  getPhaseRecoveryWindowMs,
  getPhaseEnemyCap,
  getDominantBuildTags,
  getProjectileSpreadAngles,
  getReadyWeapons,
  getXpToNextLevel,
  isBossTriggerPhase,
  pickSpawnPoint,
  stepSpawnAccumulator
} from "./logic";
import { loadProfile, saveProfile } from "./profile";
import type {
  BuildInventoryEntry,
  BuildStatLine,
  BossDef,
  BossId,
  CharacterId,
  EnemyId,
  ItemCategory,
  ItemOfferChoice,
  ItemRarity,
  Notification,
  PendingSpawn,
  PersistentProfile,
  RunState,
  SynergyId,
  TargetLike,
  WeaponDef,
  WeaponDraftOffer,
  WeaponId
} from "./types";

export { VIEW_HEIGHT, VIEW_WIDTH } from "./config";

type Keys = Record<"w" | "a" | "s" | "d" | "space" | "enter" | "escape" | "tab" | "one" | "two" | "three", Phaser.Input.Keyboard.Key>;

interface EnemySprite extends Phaser.Physics.Arcade.Image, TargetLike {
  uid: number;
  enemyType: EnemyId;
  bossId?: BossId;
  hp: number;
  maxHp: number;
  contactDamage: number;
  moveSpeed: number;
  radiusValue: number;
  baseTint: number;
  deathTint: number;
  knockbackResistance: number;
  flashUntil: number;
  nextAttackAt: number;
  nextSlowShotAt: number;
  nextFastShotAt: number;
  nextMoveSwitchAt: number;
  chargeUntil: number;
  bossStrafing: boolean;
  strafeDirection: number;
  burnUntil: number;
  nextBurnTickAt: number;
  poisonUntil: number;
  nextPoisonTickAt: number;
  nextLogicAt: number;
}

interface BulletSprite extends Phaser.Physics.Arcade.Image {
  owner: "player" | "enemy";
  weaponId?: WeaponId;
  damage: number;
  expiresAt: number;
  knockback: number;
  remainingPierce: number;
  remainingBounce: number;
  crit: boolean;
  explosiveRadius: number;
  explosiveDamage: number;
  appliesFire: boolean;
  appliesPoison: boolean;
  returnsAt: number;
  boomerangOwnerX: number;
  boomerangOwnerY: number;
  mineArmedAt: number;
  fragmentCount: number;
  lastHitEnemyUid: number;
  lastHitTime: number;
  trailTint: number;
  nextTrailAt: number;
}

interface XpOrbSprite extends Phaser.Physics.Arcade.Image {
  orbId: number;
  value: number;
  floatOffset: number;
}

interface DroneSprite extends Phaser.GameObjects.Image {
  orbitAngle: number;
  nextShotAt: number;
}

interface FloatingText extends Phaser.GameObjects.Text {
  velocityY: number;
  expiresAt: number;
}

interface FxSprite extends Phaser.GameObjects.Image {
  effectCreatedAt: number;
  effectExpiresAt: number;
  effectVelocityX: number;
  effectVelocityY: number;
  effectStartAlpha: number;
  effectEndAlpha: number;
  effectStartScale: number;
  effectEndScale: number;
}

interface QueuedBurst {
  weaponId: WeaponId;
  remainingShots: number;
  nextShotAt: number;
  intervalMs: number;
  originX?: number;
  originY?: number;
}

interface NotificationSlot {
  panel: Phaser.GameObjects.Rectangle;
  text: Phaser.GameObjects.Text;
}

interface DamageEnemyOptions {
  crit?: boolean;
  applyStatus?: boolean;
  allowLifeSteal?: boolean;
  allowChain?: boolean;
  allowExplosion?: boolean;
  forceFire?: boolean;
  forcePoison?: boolean;
}

interface ActiveHazard {
  id: number;
  kind: "pool" | "slowField" | "beam";
  x: number;
  y: number;
  radius: number;
  angle?: number;
  width?: number;
  length?: number;
  damagePerTick: number;
  slowMultiplier?: number;
  nextTickAt: number;
  expiresAt: number;
  gfx: Phaser.GameObjects.Graphics;
}

interface OverlayLayoutMetrics {
  left: number;
  top: number;
  width: number;
  height: number;
  density: "comfortable" | "compact";
}

interface FocusableOverlayEntry extends Phaser.GameObjects.Container {
  setFocused: (focused: boolean) => void;
  select: () => void;
}

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Image;
  private enemies!: Phaser.Physics.Arcade.Group;
  private playerBullets!: Phaser.Physics.Arcade.Group;
  private enemyBullets!: Phaser.Physics.Arcade.Group;
  private xpOrbs!: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Keys;
  private hpBarFill!: Phaser.GameObjects.Graphics;
  private xpBarFill!: Phaser.GameObjects.Graphics;
  private hpLabelText!: Phaser.GameObjects.Text;
  private xpLabelText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private phaseText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private enemyCountText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;
  private bannerText!: Phaser.GameObjects.Text;
  private buildSummaryText!: Phaser.GameObjects.Text;
  private weaponStripContainer!: Phaser.GameObjects.Container;
  private statsButtonPanel!: Phaser.GameObjects.Rectangle;
  private statsButtonText!: Phaser.GameObjects.Text;
  private hudFrameElements: Phaser.GameObjects.GameObject[] = [];
  private overlayElements: Phaser.GameObjects.GameObject[] = [];
  private activeChoiceActions: Array<() => void> = [];
  private floatingTexts: FloatingText[] = [];
  private notificationSlots: NotificationSlot[] = [];
  private audioController = new SynthAudio();
  private run!: RunState;
  private nextSpawnAttemptAt = 0;
  private playerInvulnerableUntil = 0;
  private playerFlashUntil = 0;
  private playerSlowUntil = 0;
  private playerSlowMultiplier = 1;
  private enemyUidCounter = 0;
  private pendingSpawnIdCounter = 0;
  private orbIdCounter = 0;
  private notificationIdCounter = 0;
  private hazardIdCounter = 0;
  private burstQueue: QueuedBurst[] = [];
  private spawnMarkers = new Map<number, Phaser.GameObjects.Image>();
  private selectedCharacterId: CharacterId = "soldier";
  private menuScreen: "main" | "about" | "settings" = "main";
  private drones: DroneSprite[] = [];
  private hazards: ActiveHazard[] = [];
  private trailEffects: FxSprite[] = [];
  private particleEffects: FxSprite[] = [];
  private muzzleFlashEffects: FxSprite[] = [];
  private ghostEffects: FxSprite[] = [];
  private readonly enemyGrid = new EnemySpatialGrid<EnemySprite>(ENEMY_GRID_CELL_SIZE);
  private readonly activeEnemiesScratch: EnemySprite[] = [];
  private readonly nearbyEnemiesScratch: EnemySprite[] = [];
  private readonly pendingSpawnPointsScratch: Array<{ x: number; y: number }> = [];
  private cachedNearestEnemy: EnemySprite | null = null;
  private cachedPlayerX = VIEW_WIDTH / 2;
  private cachedPlayerY = VIEW_HEIGHT / 2;
  private activeEnemyCountCache = 0;
  private activeNormalEnemyCountCache = 0;
  private activeParticleCount = 0;
  private activeTrailCount = 0;
  private activeMuzzleFlashCount = 0;
  private activeGhostCount = 0;
  private nextHudRefreshAt = 0;
  private hudForceRefresh = true;
  private lastHpRatio = -1;
  private lastXpRatio = -1;
  private lastHudMode: string | null = null;
  private lastHudHint = "";
  private lastHpLabel = "";
  private lastXpLabel = "";
  private lastLevelLabel = "";
  private lastPhaseLabel = "";
  private lastTimerLabel = "";
  private lastEnemyCountLabel = "";
  private lastBuildSummaryLabel = "";
  private lastImpactBurstAt = 0;
  private livePauseStartedAt: number | null = null;
  private phaseStartPending = false;
  private lastWeaponStripSignature = "";
  private overlayInputMode: "mouse" | "keyboard" = "mouse";
  private characterEntries: FocusableOverlayEntry[] = [];
  private characterGridColumns = 1;
  private characterFocusIndex = 0;
  private draftEntries: FocusableOverlayEntry[] = [];
  private draftFocusIndex = 0;
  private statsEntries: FocusableOverlayEntry[] = [];
  private statsGridColumns = 1;
  private statsFocusIndex = 0;
  private statsDetailTitle?: Phaser.GameObjects.Text;
  private statsDetailMeta?: Phaser.GameObjects.Text;
  private statsDetailDescription?: Phaser.GameObjects.Text;
  private statsDetailPros?: Phaser.GameObjects.Text;
  private statsDetailCons?: Phaser.GameObjects.Text;
  private statsDetailFooter?: Phaser.GameObjects.Text;

  constructor() {
    super("GameScene");
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#495853");
    this.physics.world.setBounds(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    this.createTextures();
    this.createArena();
    this.createGroups();
    this.createPlayer();
    this.createUi();
    this.createInput();
    this.createColliders();
    this.initializeState();
    this.input.on("pointerdown", () => this.audioController.unlock());
    this.input.keyboard?.on("keydown", () => this.audioController.unlock());
  }

  update(time: number, delta: number): void {
    this.updateImageEffects(time, delta);
    this.updateFloatingTexts(delta, time);
    this.updateBanner(time);
    this.updateNotificationsUi(time);
    this.handleChoiceInput();

    if (this.run.flowMode === "mainMenu") {
      this.updateHud(time);
      return;
    }

    if (this.run.flowMode === "characterSelect") {
      if (Phaser.Input.Keyboard.JustDown(this.keys.escape)) {
        this.openMainMenu();
        return;
      }
      this.handleCharacterSelectionInput();
      if (Phaser.Input.Keyboard.JustDown(this.keys.space) || Phaser.Input.Keyboard.JustDown(this.keys.enter)) {
        this.startRun(this.selectedCharacterId);
      }
      this.updateHud(time);
      return;
    }

    if (this.run.flowMode === "gameOver") {
      if (Phaser.Input.Keyboard.JustDown(this.keys.space) || Phaser.Input.Keyboard.JustDown(this.keys.enter)) {
        this.startRun(this.selectedCharacterId);
      }
      this.updateHud(time);
      return;
    }

    if (this.run.flowMode === "phaseTransition") {
      if (time >= this.run.phaseTransitionEndsAt) {
        this.resolveQueuedRewards(time);
      }
      this.updateHud(time);
      return;
    }

    if (this.run.flowMode === "itemDraft" || this.run.flowMode === "weaponDraft") {
      this.handleDraftFocusInput();
      this.updateHud(time);
      return;
    }

    if (this.run.flowMode === "statsPanel") {
      if (Phaser.Input.Keyboard.JustDown(this.keys.tab) || Phaser.Input.Keyboard.JustDown(this.keys.escape)) {
        this.closeStatsPanel();
      } else {
        this.handleStatsPanelFocusInput();
      }
      this.updateHud(time);
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.tab)) {
      this.openStatsPanelResponsive();
      this.updateHud(time);
      return;
    }

    this.updatePlayerMovement();
    this.updatePlayerPose();
    this.cachedPlayerX = this.player.x;
    this.cachedPlayerY = this.player.y;
    this.updatePlayerRegeneration(delta);
    this.updatePlayerFlash(time);
    this.updateXpOrbs(time, delta);
    this.updatePendingSpawns(time);
    this.refreshEnemySpatialState();
    this.tryScheduleNormalSpawn(time, delta);
    this.updateEnemies(time);
    this.tryFireWeapons(time);
    this.processBurstQueue(time);
    this.updateDrones(time);
    this.updateProjectiles(time);
    this.updateHazards(time);
    this.updatePhaseState(time);
    this.updateHud(time);
  }

  private createTextures(): void {
    if (this.textures.exists("player")) {
      return;
    }

    this.generateCircleTexture("player-bullet", 14, 0xf8f1c8, 0x1c2220, 2);
    this.generateCircleTexture("enemy-bullet-slow", 18, 0xec8e6a, 0x542714, 2);
    this.generateDartTexture("enemy-bullet-fast", 22, 0xf1d671, 0x5b4216);
    this.generateCircleTexture("particle-dot", 8, 0xf8f5ea, 0xffffff, 1);
    this.generatePlayerTexture();
    this.generateEnemyTexture("grunt", 44, 0xc6c0ff, 0x272234);
    this.generateEnemyTexture("runner", 38, 0xcafdf0, 0x193630);
    this.generateEnemyTexture("tank", 56, 0xf5e0ba, 0x443726);
    this.generateEnemyTexture("shooter", 48, 0xffd1b7, 0x563224);
    this.generateEnemyTexture("elite", 58, 0xff8ab0, 0x521f33);
    Object.values(BOSSES).forEach((boss, index) => this.generateBossTexture(`enemy-boss-${boss.id}`, boss.tint, boss.deathTint, index));
    this.generateSpawnMarkerTexture();
    this.generateXpOrbTexture();
    this.generateMuzzleFlashTexture();
    this.generateDroneTexture();
    WEAPON_ORDER.forEach((weaponId) => {
      const weapon = WEAPONS[weaponId];
      this.generateWeaponIconTexture(weapon.iconKey, weapon.tint, weapon.previewPattern);
    });
    this.generateUpgradeCategoryTexture("offense", 0xf2c071);
    this.generateUpgradeCategoryTexture("utility", 0x88d6c9);
    this.generateUpgradeCategoryTexture("projectile", 0x88b5ff);
    this.generateUpgradeCategoryTexture("survivability", 0xd99797);
    this.generateUpgradeCategoryTexture("special", 0xffb16b);
  }

  private generateCircleTexture(key: string, size: number, fill: number, stroke: number, strokeWidth: number): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.lineStyle(strokeWidth, stroke, 1);
    g.fillStyle(fill, 1);
    g.fillCircle(size / 2, size / 2, size / 2 - strokeWidth);
    g.strokeCircle(size / 2, size / 2, size / 2 - strokeWidth);
    g.generateTexture(key, size, size);
    g.destroy();
  }

  private generateDartTexture(key: string, size: number, fill: number, stroke: number): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.lineStyle(2, stroke, 1);
    g.fillStyle(fill, 1);
    g.beginPath();
    g.moveTo(2, size / 2);
    g.lineTo(size - 6, 2);
    g.lineTo(size - 2, size / 2);
    g.lineTo(size - 6, size - 2);
    g.closePath();
    g.fillPath();
    g.strokePath();
    g.generateTexture(key, size, size);
    g.destroy();
  }

  private generatePlayerTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.lineStyle(4, 0x121515, 1);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(24, 24, 17);
    g.strokeCircle(24, 24, 17);
    g.fillStyle(0xec6a5c, 1);
    g.fillCircle(31, 18, 4);
    g.fillStyle(0x1a1c1c, 1);
    g.fillCircle(18, 25, 3);
    g.generateTexture("player", 48, 48);
    g.destroy();
  }

  private generateEnemyTexture(key: string, size: number, fill: number, stroke: number): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    const center = size / 2;
    const radius = size / 2 - 6;
    g.lineStyle(4, stroke, 1);
    g.fillStyle(fill, 1);
    g.fillCircle(center, center + 2, radius);
    g.strokeCircle(center, center + 2, radius);
    g.fillStyle(stroke, 1);
    g.fillCircle(center - 6, center - 2, 3);
    g.fillCircle(center + 4, center - 1, 2);
    g.generateTexture(`enemy-${key}`, size, size);
    g.destroy();
  }

  private generateBossTexture(key: string, fill: number, accent: number, index: number): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    const stroke = Phaser.Display.Color.IntegerToColor(accent).darken(55).color;
    g.lineStyle(5, stroke, 1);
    g.fillStyle(fill, 1);
    g.fillCircle(44, 44, 34);
    g.strokeCircle(44, 44, 34);
    g.fillStyle(stroke, 1);
    g.fillCircle(31, 39, 5);
    g.fillCircle(56, 39, 5);
    g.lineStyle(4, stroke, 1);
    g.beginPath();
    g.moveTo(22, 22);
    g.lineTo(30, 6);
    g.lineTo(37, 22);
    g.moveTo(66, 22);
    g.lineTo(58, 6);
    g.lineTo(50, 22);
    if (index % 2 === 0) {
      g.moveTo(44, 18);
      g.lineTo(44, 4);
    } else {
      g.moveTo(40, 16);
      g.lineTo(34, 4);
      g.moveTo(48, 16);
      g.lineTo(54, 4);
    }
    if (index >= 5) {
      g.moveTo(16, 44);
      g.lineTo(8, 34);
      g.moveTo(72, 44);
      g.lineTo(80, 34);
    }
    g.strokePath();
    g.generateTexture(key, 88, 88);
    g.destroy();
  }

  private generateSpawnMarkerTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.lineStyle(4, 0xb81d25, 0.95);
    g.strokeCircle(30, 30, 22);
    g.lineBetween(14, 14, 46, 46);
    g.lineBetween(46, 14, 14, 46);
    g.generateTexture("spawn-marker", 60, 60);
    g.destroy();
  }

  private generateXpOrbTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x77f0c5, 1);
    g.fillCircle(12, 12, 8);
    g.lineStyle(2, 0x123d34, 1);
    g.strokeCircle(12, 12, 8);
    g.fillStyle(0xbaffec, 0.9);
    g.fillCircle(9, 9, 3);
    g.generateTexture("xp-orb", 24, 24);
    g.destroy();
  }

  private generateMuzzleFlashTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xffedbb, 1);
    g.beginPath();
    g.moveTo(2, 16);
    g.lineTo(12, 6);
    g.lineTo(30, 12);
    g.lineTo(18, 16);
    g.lineTo(30, 20);
    g.lineTo(12, 26);
    g.closePath();
    g.fillPath();
    g.generateTexture("muzzle-flash", 32, 32);
    g.destroy();
  }

  private generateDroneTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.lineStyle(2, 0x173036, 1);
    g.fillStyle(0xc3efff, 1);
    g.fillCircle(14, 14, 9);
    g.strokeCircle(14, 14, 9);
    g.fillStyle(0x173036, 1);
    g.fillRect(11, 5, 6, 4);
    g.fillRect(5, 12, 4, 4);
    g.fillRect(19, 12, 4, 4);
    g.generateTexture("drone", 28, 28);
    g.destroy();
  }

  private generateWeaponIconTexture(key: string, tint: number, pattern: WeaponDef["previewPattern"]): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x15211f, 1);
    g.fillRoundedRect(2, 2, 36, 36, 10);
    g.lineStyle(2, tint, 0.9);
    g.strokeRoundedRect(2, 2, 36, 36, 10);
    g.fillStyle(tint, 1);
    g.fillRect(10, 17, 16, 4);
    g.fillRect(8, 20, 6, 9);
    if (pattern === "stream") {
      g.fillRect(23, 14, 9, 3);
      g.fillRect(23, 19, 9, 3);
    } else if (pattern === "fan") {
      g.fillTriangle(26, 12, 32, 19, 26, 26);
    } else if (pattern === "pierce") {
      g.fillRect(23, 18, 11, 2);
      g.fillRect(30, 15, 4, 8);
    } else if (pattern === "burst") {
      g.fillRect(23, 16, 7, 2);
      g.fillRect(23, 20, 7, 2);
      g.fillRect(29, 18, 4, 2);
    } else if (pattern === "beam") {
      g.fillRect(22, 17, 11, 4);
      g.fillRect(30, 14, 4, 10);
    } else if (pattern === "explosive") {
      g.fillCircle(27, 18, 5);
      g.lineBetween(27, 10, 27, 6);
    } else if (pattern === "orbit") {
      g.strokeCircle(27, 18, 6);
      g.fillCircle(33, 18, 2);
    } else if (pattern === "chain") {
      g.lineStyle(2, tint, 1);
      g.lineBetween(22, 18, 27, 12);
      g.lineBetween(27, 12, 32, 18);
      g.lineBetween(32, 18, 27, 24);
    } else if (pattern === "nova") {
      g.fillCircle(27, 18, 4);
      g.lineBetween(27, 8, 27, 28);
      g.lineBetween(17, 18, 37, 18);
    } else {
      g.fillRect(23, 18, 9, 2);
    }
    g.generateTexture(key, 40, 40);
    g.destroy();
  }

  private generateUpgradeCategoryTexture(category: ItemCategory, tint: number): void {
    const key = `upgrade-${category}`;
    const g = this.make.graphics({ x: 0, y: 0 });
    g.lineStyle(2, 0x12201d, 1);
    g.fillStyle(tint, 1);
    if (category === "offense") {
      g.fillTriangle(16, 2, 28, 28, 4, 28);
      g.strokeTriangle(16, 2, 28, 28, 4, 28);
    } else if (category === "utility") {
      g.fillRoundedRect(6, 6, 20, 20, 8);
      g.strokeRoundedRect(6, 6, 20, 20, 8);
    } else if (category === "projectile") {
      g.fillRect(5, 13, 22, 6);
      g.fillTriangle(27, 10, 31, 16, 27, 22);
      g.strokeRect(5, 13, 22, 6);
      g.strokeTriangle(27, 10, 31, 16, 27, 22);
    } else if (category === "survivability") {
      g.beginPath();
      g.moveTo(16, 4);
      g.lineTo(28, 10);
      g.lineTo(24, 26);
      g.lineTo(16, 30);
      g.lineTo(8, 26);
      g.lineTo(4, 10);
      g.closePath();
      g.fillPath();
      g.strokePath();
    } else {
      g.fillCircle(16, 16, 12);
      g.strokeCircle(16, 16, 12);
      g.lineBetween(16, 4, 16, 28);
      g.lineBetween(4, 16, 28, 16);
    }
    g.generateTexture(key, 32, 32);
    g.destroy();
  }

  private createArena(): void {
    const g = this.add.graphics();
    g.fillStyle(0x4e5d58, 1);
    g.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    g.fillStyle(0x5d6e68, 0.18);
    g.fillRoundedRect(18, 18, VIEW_WIDTH - 36, VIEW_HEIGHT - 36, 28);
    g.lineStyle(2, 0x8ea09a, 0.3);
    g.strokeRoundedRect(18, 18, VIEW_WIDTH - 36, VIEW_HEIGHT - 36, 28);
    for (let index = 0; index < 240; index += 1) {
      const x = Phaser.Math.Between(24, VIEW_WIDTH - 24);
      const y = Phaser.Math.Between(24, VIEW_HEIGHT - 24);
      const tint = Phaser.Math.RND.pick([0x44524d, 0x55655f, 0x72827c]);
      g.fillStyle(tint, Phaser.Math.FloatBetween(0.14, 0.28));
      g.fillCircle(x, y, Phaser.Math.Between(1, 3));
    }
    g.setDepth(-10);
  }

  private createGroups(): void {
    this.enemies = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image, maxSize: ENEMY_POOL_SIZE, runChildUpdate: false });
    this.playerBullets = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image, maxSize: PLAYER_BULLET_POOL_SIZE, runChildUpdate: false });
    this.enemyBullets = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image, maxSize: ENEMY_BULLET_POOL_SIZE, runChildUpdate: false });
    this.xpOrbs = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image, maxSize: XP_ORB_POOL_SIZE, runChildUpdate: false });
  }

  private createPlayer(): void {
    this.player = this.physics.add.image(VIEW_WIDTH / 2, VIEW_HEIGHT / 2, "player");
    this.player.setDepth(20);
    this.player.setCircle(PLAYER_RADIUS, 6, 6);
    this.player.setCollideWorldBounds(true);
    this.player.setVisible(false);
  }

  private createUi(): void {
    const titleStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: "Trebuchet MS",
      fontSize: "24px",
      color: "#f5f3e8",
      stroke: "#1a211f",
      strokeThickness: 4
    };
    const labelStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: "Trebuchet MS",
      fontSize: "16px",
      color: "#eef2ec",
      stroke: "#1a211f",
      strokeThickness: 3
    };
    const smallStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: "Trebuchet MS",
      fontSize: "14px",
      color: "#d9e1da",
      stroke: "#1a211f",
      strokeThickness: 2
    };

    const chrome = this.add.graphics();
    chrome.fillStyle(0x101715, 0.26);
    chrome.fillRoundedRect(20, 16, 304, 88, 20);
    chrome.fillRoundedRect(VIEW_WIDTH - 264, 16, 244, 88, 20);
    chrome.fillRoundedRect(VIEW_WIDTH / 2 - 220, VIEW_HEIGHT - 78, 440, 52, 24);
    chrome.lineStyle(2, 0x81918c, 0.22);
    chrome.strokeRoundedRect(20, 16, 304, 88, 20);
    chrome.strokeRoundedRect(VIEW_WIDTH - 264, 16, 244, 88, 20);
    chrome.strokeRoundedRect(VIEW_WIDTH / 2 - 220, VIEW_HEIGHT - 78, 440, 52, 24);
    chrome.setDepth(40);

    const hpBg = this.add.graphics().setDepth(41);
    hpBg.fillStyle(0x171d1b, 0.95);
    hpBg.fillRoundedRect(34, 26, 220, 12, 6);
    hpBg.fillRoundedRect(34, 58, 220, 12, 6);
    hpBg.lineStyle(2, 0x65746f, 0.45);
    hpBg.strokeRoundedRect(34, 26, 220, 12, 6);
    hpBg.strokeRoundedRect(34, 58, 220, 12, 6);
    this.hudFrameElements.push(chrome, hpBg);

    this.hpBarFill = this.add.graphics().setDepth(42);
    this.xpBarFill = this.add.graphics().setDepth(42);
    this.hpLabelText = this.add.text(34, 8, "HP", labelStyle).setDepth(42);
    this.xpLabelText = this.add.text(34, 40, "XP", labelStyle).setDepth(42);
    this.levelText = this.add.text(262, 40, "LV 1", labelStyle).setDepth(42).setOrigin(1, 0);
    this.phaseText = this.add.text(VIEW_WIDTH - 34, 12, "FASE 1", titleStyle).setOrigin(1, 0).setDepth(42);
    this.timerText = this.add.text(VIEW_WIDTH - 34, 44, "00:40", labelStyle).setOrigin(1, 0).setDepth(42);
    this.enemyCountText = this.add.text(VIEW_WIDTH - 34, 68, "INIMIGOS 0", smallStyle).setOrigin(1, 0).setDepth(42);
    this.buildSummaryText = this.add
      .text(VIEW_WIDTH / 2, VIEW_HEIGHT - 92, "BUILD  CARGA INICIAL", {
        fontFamily: "Trebuchet MS",
        fontSize: "13px",
        color: "#cdd8d1",
        stroke: "#101513",
        strokeThickness: 3,
        align: "center"
      })
      .setOrigin(0.5)
      .setDepth(42)
      .setAlpha(0.82);
    this.weaponStripContainer = this.add.container(VIEW_WIDTH / 2, VIEW_HEIGHT - 52).setDepth(42);
    this.hintText = this.add.text(28, VIEW_HEIGHT - 22, "MOVA  WASD / SETAS", smallStyle).setDepth(42).setOrigin(0, 1).setAlpha(0.82);
    this.statsButtonPanel = this.add
      .rectangle(116, VIEW_HEIGHT - 58, 156, 34, 0x141a18, 0.94)
      .setStrokeStyle(2, 0x7aa0a3, 0.46)
      .setDepth(42)
      .setInteractive({ cursor: "pointer" });
    this.statsButtonText = this.add
      .text(116, VIEW_HEIGHT - 58, "TAB  BUILD", {
        fontFamily: "Trebuchet MS",
        fontSize: "14px",
        color: "#dce7e2",
        stroke: "#141917",
        strokeThickness: 3
      })
      .setOrigin(0.5)
      .setDepth(43);
    this.statsButtonPanel.on("pointerover", () => this.statsButtonPanel.setFillStyle(0x22302c, 1));
    this.statsButtonPanel.on("pointerout", () => this.statsButtonPanel.setFillStyle(0x141a18, 0.94));
    this.statsButtonPanel.on("pointerup", () => this.toggleStatsPanel());
    this.bannerText = this.add
      .text(VIEW_WIDTH / 2, VIEW_HEIGHT / 2 - 84, "", {
        fontFamily: "Trebuchet MS",
        fontSize: "48px",
        color: "#fff4d1",
        stroke: "#1a211f",
        strokeThickness: 6
      })
      .setOrigin(0.5)
      .setDepth(70)
      .setAlpha(0);

    for (let index = 0; index < 4; index += 1) {
      const y = VIEW_HEIGHT - 154 - index * 54;
      const panel = this.add.rectangle(VIEW_WIDTH - 170, y, 236, 42, 0x111716, 0.92).setStrokeStyle(2, 0x6d7a76, 0.36).setDepth(43);
      const text = this.add
        .text(VIEW_WIDTH - 270, y - 10, "", {
          fontFamily: "Trebuchet MS",
          fontSize: "14px",
          color: "#eff4ee",
          stroke: "#111716",
          strokeThickness: 2,
          wordWrap: { width: 194 }
        })
        .setDepth(44);
      panel.setVisible(false);
      text.setVisible(false);
      this.notificationSlots.push({ panel, text });
    }
  }

  private createInput(): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) {
      throw new Error("Keyboard input is unavailable.");
    }
    this.cursors = keyboard.createCursorKeys();
    this.keys = keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
      escape: Phaser.Input.Keyboard.KeyCodes.ESC,
      tab: Phaser.Input.Keyboard.KeyCodes.TAB,
      one: Phaser.Input.Keyboard.KeyCodes.ONE,
      two: Phaser.Input.Keyboard.KeyCodes.TWO,
      three: Phaser.Input.Keyboard.KeyCodes.THREE
    }) as Keys;
  }

  private createColliders(): void {
    this.physics.add.overlap(this.playerBullets, this.enemies, (a, b) => this.handlePlayerBulletHit(a as BulletSprite, b as EnemySprite));
    this.physics.add.overlap(this.player, this.enemies, (_player, enemy) => this.handlePlayerEnemyContact(enemy as EnemySprite));
    this.physics.add.overlap(this.player, this.enemyBullets, (_player, bullet) => this.handleEnemyBulletHit(bullet as BulletSprite));
  }

  private initializeState(): void {
    const profile = loadProfile(typeof window !== "undefined" ? window.localStorage : undefined);
    this.selectedCharacterId = profile.lastCharacterId;
    this.run = this.createRunState(profile, this.selectedCharacterId, this.time.now, "mainMenu");
    this.physics.pause();
    this.updateWeaponStrip();
    this.openMainMenu();
  }

  private createRunState(profile: PersistentProfile, characterId: CharacterId, time: number, flowMode: RunState["flowMode"]): RunState {
    const character = CHARACTERS[characterId];
    const activeSynergyIds: SynergyId[] = [];
    const selectedItems: RunState["selectedItems"] = [];
    const equippedWeapons = [createEquippedWeapon(character.startingWeaponId, 0)];
    const stats = buildPlayerStats(selectedItems, characterId, activeSynergyIds);
    const shieldCharges = stats.maxShieldCharges;
    return {
      flowMode,
      phase: 1,
      phaseStartedAt: time,
      kills: 0,
      hp: stats.maxHp,
      survivalStartedAt: time,
      selectedCharacter: characterId,
      equippedWeapons,
      pendingSpawns: [],
      persistentProfile: profile,
      bossPhasesTriggered: [],
      bannerUntil: 0,
      bannerText: "",
      stats,
      buildSnapshot: buildDerivedRunStats({
        hp: stats.maxHp,
        stats,
        selectedItems,
        equippedWeapons,
        shieldCharges,
        selectedCharacterId: characterId,
        activeSynergyIds
      }),
      gameOver: false,
      level: 1,
      xp: 0,
      xpToNext: getXpToNextLevel(1),
      selectedItems,
      pendingItemChoices: 0,
      queuedRewards: [],
      notifications: [],
      xpOrbs: [],
      activeSynergyIds,
      shieldCharges,
      nextWeaponSlotId: equippedWeapons.length,
      spawnAccumulator: 0,
      nextBurstAt: time + getBurstWaveInterval(),
      bossUnlockIndex: 0,
      lastBossId: null,
      phaseTransitionEndsAt: 0,
      weaponDraftOffer: null,
      currentItemOffer: null,
      recentRarities: []
    };
  }

  private startRun(characterId: CharacterId): void {
    const profile: PersistentProfile = { lastCharacterId: characterId };
    saveProfile(typeof window !== "undefined" ? window.localStorage : undefined, profile);
    this.selectedCharacterId = characterId;
    this.run = this.createRunState(profile, characterId, this.time.now, "live");
    this.resetArena();
    this.player.setVisible(true);
    this.player.setPosition(VIEW_WIDTH / 2, VIEW_HEIGHT / 2);
    this.player.setVelocity(0, 0);
    this.player.setScale(1);
    this.player.setRotation(0);
    this.clearOverlay();
    this.physics.resume();
    this.nextSpawnAttemptAt = this.time.now + 350;
    this.playerInvulnerableUntil = 0;
    this.playerFlashUntil = 0;
    this.playerSlowUntil = 0;
    this.playerSlowMultiplier = 1;
    this.livePauseStartedAt = null;
    this.phaseStartPending = false;
    this.cachedNearestEnemy = null;
    this.activeEnemyCountCache = 0;
    this.activeNormalEnemyCountCache = 0;
    this.hudForceRefresh = true;
    this.nextHudRefreshAt = 0;
    const character = CHARACTERS[characterId];
    const startingWeapon = WEAPONS[character.startingWeaponId];
    this.pushNotification(
      `${character.label} deployed • ${startingWeapon.label} (${WEAPON_RARITIES[startingWeapon.rarity].label})`,
      character.accent,
      this.time.now
    );
    this.showBanner("PHASE 1", 1_000, this.time.now);
    this.syncDroneCount(this.time.now);
    this.refreshBuildSnapshot();
    this.updateWeaponStrip();
  }

  private resetArena(): void {
    this.clearGroup(this.enemies);
    this.clearGroup(this.playerBullets);
    this.clearGroup(this.enemyBullets);
    this.clearGroup(this.xpOrbs);
    this.clearSpawnMarkers();
    this.clearOverlay();
    this.burstQueue = [];
    this.run.pendingSpawns = [];
    this.run.notifications = [];
    this.run.xpOrbs = [];
    this.run.spawnAccumulator = 0;
    this.run.nextBurstAt = this.time.now + getBurstWaveInterval();
    this.run.currentItemOffer = null;
    this.destroyDrones();
    this.clearHazards();
    this.player.setVelocity(0, 0);
    this.lastWeaponStripSignature = "";
    this.cachedNearestEnemy = null;
    this.activeEnemyCountCache = 0;
    this.activeNormalEnemyCountCache = 0;
    this.pendingSpawnPointsScratch.length = 0;
    this.hudForceRefresh = true;
  }

  private refreshBuildSnapshot(): void {
    this.run.buildSnapshot = buildDerivedRunStats({
      hp: this.run.hp,
      stats: this.run.stats,
      selectedItems: this.run.selectedItems,
      equippedWeapons: this.run.equippedWeapons,
      shieldCharges: this.run.shieldCharges,
      selectedCharacterId: this.selectedCharacterId,
      activeSynergyIds: this.run.activeSynergyIds
    });
    this.hudForceRefresh = true;
  }

  private rebuildCombatStats(): void {
    this.run.activeSynergyIds = getActiveSynergyIds(this.run.selectedItems);
    this.run.stats = buildPlayerStats(this.run.selectedItems, this.selectedCharacterId, this.run.activeSynergyIds);
    this.run.shieldCharges = Math.min(this.run.shieldCharges, this.run.stats.maxShieldCharges);
    this.refreshBuildSnapshot();
  }

  private openMainMenu(): void {
    this.menuScreen = "main";
    this.run.flowMode = "mainMenu";
    this.physics.pause();
    this.player.setVisible(false);
    this.player.setVelocity(0, 0);
    this.clearOverlay();
    this.hudForceRefresh = true;
    this.createModalFrame("ROGUELITE WEB", "A sobrevivência começa aqui. Escolha um personagem, entre com uma arma inicial forte e empilhe caos legível run após run.");

    const createMenuAction = (
      label: string,
      y: number,
      accent: number,
      onSelect: () => void,
      disabled = false
    ) => {
      this.createActionButton(VIEW_WIDTH / 2, y, 336, 54, label, accent, onSelect, disabled);
    };

    createMenuAction("JOGAR", 258, 0xcfe09a, () => this.openCharacterSelect());
    createMenuAction("MULTIPLAYER LOCAL", 330, 0x6d7a76, () => undefined, true);
    createMenuAction("MULTIPLAYER ONLINE", 402, 0x6d7a76, () => undefined, true);
    createMenuAction(
      "SOBRE",
      492,
      0x88b8d8,
      () => this.openStaticMenuPanel("SOBRE", "Roguelite survival top-down focado em caos legível, identidade forte de personagem e progressão modular.")
    );
    createMenuAction(
      "AJUSTES",
      564,
      0xdab181,
      () =>
        this.openStaticMenuPanel(
          "AJUSTES",
          "O áudio desbloqueia no primeiro input. Use TAB durante a run para abrir a build. Os modos multiplayer seguem visíveis, mas ainda estão desativados neste marco."
        )
    );

    const footer = this.add
      .text(VIEW_WIDTH / 2, 642, "A run solo é o modo ativo neste build. Escolha um personagem para começar.", {
        fontFamily: "Trebuchet MS",
        fontSize: "18px",
        color: "#dce6de",
        stroke: "#161b19",
        strokeThickness: 3,
        align: "center"
      })
      .setOrigin(0.5)
      .setDepth(73);
    this.overlayElements.push(footer);
  }

  private openStaticMenuPanel(title: string, body: string): void {
    this.run.flowMode = "mainMenu";
    this.clearOverlay();
    this.createModalFrame(title, body);
    this.createActionButton(VIEW_WIDTH / 2, 600, 280, 54, "BACK", 0x9db8af, () => this.openMainMenu());
  }

  private openCharacterSelect(): void {
    this.run.flowMode = "characterSelect";
    this.physics.pause();
    this.player.setVisible(false);
    this.player.setVelocity(0, 0);
    this.clearOverlay();
    this.createModalFrame(
      "Escolha do Personagem",
      "Monte sua run a partir de um perfil claro. Destaques em verde fortalecem a build; trade-offs em vermelho definem o risco."
    );
    this.activeChoiceActions = [];
    this.characterEntries = [];

    const selectedCharacter = CHARACTERS[this.selectedCharacterId];
    const startingWeapon = WEAPONS[selectedCharacter.startingWeaponId];
    const rarity = WEAPON_RARITIES[startingWeapon.rarity];
    const layout = this.getOverlayLayoutMetrics();
    const panelCenterY = 294;
    const panel = this.createOverlayPanel(VIEW_WIDTH / 2, panelCenterY, layout.width, 264, 0x111816, selectedCharacter.accent);
    panel.setAlpha(0.97);

    const portraitPlate = this.add.rectangle(layout.left + 110, panelCenterY, 160, 170, 0x141d1a, 0.98).setStrokeStyle(2, selectedCharacter.accent, 0.94).setDepth(74);
    const portraitSlot = this.add.rectangle(layout.left + 110, panelCenterY + 84, 126, 24, 0x0f1513, 0.92).setStrokeStyle(1, 0x5f726d, 0.45).setDepth(75);
    const portraitSlotLabel = this.add
      .text(layout.left + 110, panelCenterY + 84, "slot retrato", {
        fontFamily: "Trebuchet MS",
        fontSize: "12px",
        color: "#96a59f"
      })
      .setOrigin(0.5)
      .setDepth(76);
    const portrait = this.add.image(layout.left + 110, panelCenterY - 10, "player").setTint(selectedCharacter.portraitTint ?? selectedCharacter.accent).setScale(2.35).setDepth(75);
    const title = this.add
      .text(layout.left + 218, 182, selectedCharacter.label.toUpperCase(), {
        fontFamily: "Trebuchet MS",
        fontSize: "34px",
        color: "#f7f3e9",
        stroke: "#161b19",
        strokeThickness: 4
      })
      .setDepth(75);
    const difficulty = this.add
      .text(layout.left + 218, 224, `Dificuldade  ${selectedCharacter.difficultyLabel}`, {
        fontFamily: "Trebuchet MS",
        fontSize: "18px",
        color: "#d6e2dc",
        stroke: "#161b19",
        strokeThickness: 3
      })
      .setDepth(75);
    const weaponBadge = this.add.rectangle(layout.left + 218, 270, 278, 34, rarity.fill, 0.96).setOrigin(0, 0.5).setStrokeStyle(2, rarity.border, 0.96).setDepth(75);
    const weaponText = this.add
      .text(layout.left + 236, 270, `${startingWeapon.label} • ${rarity.label}`, {
        fontFamily: "Trebuchet MS",
        fontSize: "16px",
        color: "#f8f6eb",
        stroke: "#161b19",
        strokeThickness: 3
      })
      .setOrigin(0, 0.5)
      .setDepth(76);
    const summary = this.add
      .text(layout.left + 218, 298, selectedCharacter.summary, {
        fontFamily: "Trebuchet MS",
        fontSize: "18px",
        color: "#d9e3dc",
        stroke: "#161b19",
        strokeThickness: 3,
        wordWrap: { width: 380 }
      })
      .setDepth(75);
    this.fitTextBlock(summary, 380, 42, 15);

    const prosTitle = this.add
      .text(layout.left + 218, 344, "Pontos Fortes", {
        fontFamily: "Trebuchet MS",
        fontSize: "16px",
        color: "#8fe3a2",
        stroke: "#161b19",
        strokeThickness: 3
      })
      .setDepth(75);
    const consTitle = this.add
      .text(layout.left + 514, 344, "Pontos Fracos", {
        fontFamily: "Trebuchet MS",
        fontSize: "16px",
        color: "#ff958b",
        stroke: "#161b19",
        strokeThickness: 3
      })
      .setDepth(75);
    const pros = this.add
      .text(layout.left + 218, 368, selectedCharacter.pros.map((entry) => `+ ${entry}`).join("\n"), {
        fontFamily: "Trebuchet MS",
        fontSize: "16px",
        color: "#9ae7ac",
        stroke: "#161b19",
        strokeThickness: 3,
        wordWrap: { width: 244 }
      })
      .setDepth(75);
    const cons = this.add
      .text(layout.left + 514, 368, selectedCharacter.cons.map((entry) => `- ${entry}`).join("\n"), {
        fontFamily: "Trebuchet MS",
        fontSize: "16px",
        color: "#ffab9f",
        stroke: "#161b19",
        strokeThickness: 3,
        wordWrap: { width: 212 }
      })
      .setDepth(75);
    this.fitTextBlock(pros, 244, 42, 13);
    this.fitTextBlock(cons, 212, 42, 13);
    this.overlayElements.push(panel, portraitPlate, portraitSlot, portraitSlotLabel, portrait, title, difficulty, weaponBadge, weaponText, summary, prosTitle, consTitle, pros, cons);

    const rosterLabel = this.add
      .text(VIEW_WIDTH / 2, 474, "Elenco da Run", {
        fontFamily: "Trebuchet MS",
        fontSize: "18px",
        color: "#dce8e1",
        stroke: "#161b19",
        strokeThickness: 3
      })
      .setOrigin(0.5)
      .setDepth(75);
    this.overlayElements.push(rosterLabel);

    const rowCount = this.getResponsiveRowCount(CHARACTER_ORDER.length);
    const columns = Math.ceil(CHARACTER_ORDER.length / rowCount);
    this.characterGridColumns = columns;
    this.characterFocusIndex = Math.max(0, CHARACTER_ORDER.indexOf(this.selectedCharacterId));
    const cellWidth = 84;
    const cellHeight = 86;
    const startX = VIEW_WIDTH / 2 - ((columns - 1) * cellWidth) / 2;
    const startY = 532 - ((rowCount - 1) * cellHeight) / 2;

    CHARACTER_ORDER.forEach((characterId, index) => {
      const x = startX + (index % columns) * cellWidth;
      const y = startY + Math.floor(index / columns) * cellHeight;
      const entry = this.createCharacterIconButton(x, y, CHARACTERS[characterId], index === this.characterFocusIndex, () => {
        this.overlayInputMode = "mouse";
        this.selectedCharacterId = characterId;
        this.characterFocusIndex = index;
        this.openCharacterSelect();
      });
      this.characterEntries.push(entry);
    });
    this.applyOverlayFocus(this.characterEntries, this.characterFocusIndex);

    const footer = this.add
      .text(VIEW_WIDTH / 2, 640, "Use WASD / setas para navegar. A selecao atual fica salva localmente.", {
        fontFamily: "Trebuchet MS",
        fontSize: "14px",
        color: "#c7d4cd",
        align: "center",
        stroke: "#161b19",
        strokeThickness: 2
      })
      .setOrigin(0.5)
      .setDepth(75);
    this.overlayElements.push(footer);
    this.createActionButton(VIEW_WIDTH / 2 - 128, 682, 184, 44, "Voltar", 0x90a39c, () => this.openMainMenu());
    this.createActionButton(VIEW_WIDTH / 2 + 128, 682, 220, 48, "Iniciar Run", 0xc0d78f, () => this.startRun(this.selectedCharacterId));
  }

  private updatePlayerMovement(): void {
    const moveX = (this.cursors.left.isDown || this.keys.a.isDown ? -1 : 0) + (this.cursors.right.isDown || this.keys.d.isDown ? 1 : 0);
    const moveY = (this.cursors.up.isDown || this.keys.w.isDown ? -1 : 0) + (this.cursors.down.isDown || this.keys.s.isDown ? 1 : 0);
    const direction = new Phaser.Math.Vector2(moveX, moveY);
    const speedMultiplier = this.time.now < this.playerSlowUntil ? this.playerSlowMultiplier : 1;

    if (direction.lengthSq() > 0) {
      direction.normalize().scale(this.run.stats.moveSpeed * speedMultiplier);
      this.player.setVelocity(direction.x, direction.y);
      return;
    }

    this.player.setVelocity(0, 0);
  }

  private updatePlayerPose(): void {
    const body = this.getBody(this.player);
    const speed = body.velocity.length();
    const normalized = Phaser.Math.Clamp(speed / Math.max(1, this.run.stats.moveSpeed), 0, 1);
    this.player.setScale(1 + normalized * 0.07, 1 - normalized * 0.04);
    this.player.setRotation(Phaser.Math.Clamp(body.velocity.x / 1000, -0.12, 0.12));
  }

  private updatePlayerRegeneration(delta: number): void {
    if (this.run.stats.regenPerSecond <= 0 || this.run.hp >= this.run.stats.maxHp) {
      return;
    }

    this.run.hp = Math.min(this.run.stats.maxHp, this.run.hp + this.run.stats.regenPerSecond * (delta / 1000));
  }

  private updateXpOrbs(time: number, delta: number): void {
    for (const orb of this.xpOrbs.getChildren() as XpOrbSprite[]) {
      if (!orb.active) {
        continue;
      }

      orb.floatOffset += delta * 0.004;
      orb.setScale(1 + Math.sin(orb.floatOffset) * 0.08);
      const dx = this.cachedPlayerX - orb.x;
      const dy = this.cachedPlayerY - orb.y;
      const distanceSq = dx * dx + dy * dy;
      const activeOrbCount = this.run.xpOrbs.length;
      const lateGameMagnetBonus = activeOrbCount > XP_HIGH_DENSITY_THRESHOLD ? Math.min(140, this.run.phase * 3 + activeOrbCount * 0.35) : 0;
      const magnetRadius = XP_TOUCH_RADIUS + this.run.stats.xpMagnetRadius + lateGameMagnetBonus;
      const magnetRadiusSq = magnetRadius * magnetRadius;

      if (distanceSq <= XP_TOUCH_RADIUS * XP_TOUCH_RADIUS) {
        this.collectXpOrb(orb);
        continue;
      }

      const body = this.getBody(orb);
      if (distanceSq <= magnetRadiusSq && distanceSq > 0.001) {
        const distance = Math.sqrt(distanceSq);
        const speed = 120 + this.run.stats.xpMagnetRadius * 0.6 + lateGameMagnetBonus * 0.75;
        const invDistance = 1 / distance;
        body.setVelocity(dx * invDistance * speed, dy * invDistance * speed);
      } else if (body.velocity.x !== 0 || body.velocity.y !== 0) {
        body.setVelocity(0, 0);
      }
    }
  }

  private collectXpOrb(orb: XpOrbSprite): void {
    if (!orb.active || this.run.flowMode !== "live") {
      return;
    }

    const now = this.time.now;
    const value = orb.value;
    orb.disableBody(true, true);
    this.removeXpOrbState(orb.orbId);
    this.spawnParticleBurst(orb.x, orb.y, 4, 0x9ff7d2);
    this.audioController.pickup();
    this.awardXp(value, now);
  }

  private awardXp(amount: number, time: number): void {
    const { progress, levelsGained } = awardXpProgress(
      { level: this.run.level, xp: this.run.xp, xpToNext: this.run.xpToNext },
      amount
    );
    this.run.level = progress.level;
    this.run.xp = progress.xp;
    this.run.xpToNext = progress.xpToNext;

    if (levelsGained <= 0) {
      return;
    }

    this.run.pendingItemChoices += levelsGained;
    this.pushNotification("Level up", 0xf3d277, time);
    this.showBanner("LEVEL UP", 650, time);

    if (this.run.flowMode === "live") {
      this.openItemDraftResponsive(time, true);
    }
  }

  private tryScheduleNormalSpawn(time: number, delta: number): void {
    if (time < this.nextSpawnAttemptAt) {
      return;
    }

    const pendingNormals = this.getPendingNormalSpawnCount();
    const activeNormals = this.getActiveNormalEnemyCount();
    const cap = getPhaseEnemyCap(this.run.phase);
    const stepped = stepSpawnAccumulator(this.run.spawnAccumulator, this.run.phase, delta);
    this.run.spawnAccumulator = stepped.accumulator;

    let spawnBudget = Math.min(
      stepped.spawnCount,
      Math.max(0, cap - activeNormals - pendingNormals),
      Math.max(0, MAX_PENDING_SPAWNS - this.run.pendingSpawns.length)
    );

    while (spawnBudget > 0) {
      const point = this.getSafeSpawnPoint();
      if (!point) {
        break;
      }

      this.schedulePendingSpawn(chooseEnemyType(this.run.phase, Phaser.Math.FloatBetween(0, 1)), point.x, point.y, time);
      spawnBudget -= 1;
    }

    if (time >= this.run.nextBurstAt) {
      this.run.nextBurstAt += getBurstWaveInterval();
      this.pushNotification("Burst wave", 0xffb28e, time);
      this.showBanner("BURST WAVE", 900, time);
      let burstBudget = Math.min(
        getBurstWaveCount(this.run.phase),
        Math.max(0, cap - this.getActiveNormalEnemyCount() - this.getPendingNormalSpawnCount()),
        Math.max(0, MAX_PENDING_SPAWNS - this.run.pendingSpawns.length)
      );

      while (burstBudget > 0) {
        const point = this.getSafeSpawnPoint();
        if (!point) {
          break;
        }

        this.schedulePendingSpawn(chooseEnemyType(this.run.phase, Phaser.Math.FloatBetween(0, 1)), point.x, point.y, time);
        burstBudget -= 1;
      }
    }
  }

  private getSafeSpawnPoint(): { x: number; y: number } | null {
    this.pendingSpawnPointsScratch.length = this.run.pendingSpawns.length;
    for (let index = 0; index < this.run.pendingSpawns.length; index += 1) {
      const spawn = this.run.pendingSpawns[index];
      this.pendingSpawnPointsScratch[index] = { x: spawn.x, y: spawn.y };
    }

    return (
      pickSpawnPoint(
        VIEW_WIDTH,
        VIEW_HEIGHT,
        SPAWN_POINT_MARGIN,
        SPAWN_SAFE_RADIUS,
        SPAWN_MARKER_SPACING,
        { x: this.cachedPlayerX, y: this.cachedPlayerY },
        this.pendingSpawnPointsScratch
      ) ?? this.getFallbackSpawnPoint()
    );
  }

  private getFallbackSpawnPoint(): { x: number; y: number } {
    const candidates = [
      { x: SPAWN_POINT_MARGIN, y: SPAWN_POINT_MARGIN },
      { x: VIEW_WIDTH - SPAWN_POINT_MARGIN, y: SPAWN_POINT_MARGIN },
      { x: SPAWN_POINT_MARGIN, y: VIEW_HEIGHT - SPAWN_POINT_MARGIN },
      { x: VIEW_WIDTH - SPAWN_POINT_MARGIN, y: VIEW_HEIGHT - SPAWN_POINT_MARGIN }
    ];

    let best = candidates[0];
    let bestDistanceSq = -1;

    for (const candidate of candidates) {
      const dx = candidate.x - this.cachedPlayerX;
      const dy = candidate.y - this.cachedPlayerY;
      const distanceSq = dx * dx + dy * dy;
      if (distanceSq > bestDistanceSq) {
        best = candidate;
        bestDistanceSq = distanceSq;
      }
    }

    return best;
  }

  private scheduleBossSpawn(time: number): void {
    const bossId = getBossIdForPhase(this.run.phase, this.run.lastBossId);
    if (!bossId) {
      return;
    }

    const boss = BOSSES[bossId];
    this.run.bossUnlockIndex = Math.max(
      this.run.bossUnlockIndex,
      BOSS_ORDER.findIndex((id) => id === bossId) + 1
    );
    const bossCount = getBossCountForBossPhase(this.run.phase);
    for (let index = 0; index < bossCount; index += 1) {
      const point = this.getSafeSpawnPoint() ?? this.getFallbackSpawnPoint();
      const scheduledBossId =
        index === 0 ? bossId : getBossIdForPhase(this.run.phase + index * 4, this.run.lastBossId ?? bossId, Phaser.Math.FloatBetween(0, 1)) ?? bossId;
      this.run.lastBossId = scheduledBossId;
      this.schedulePendingSpawn("boss", point.x, point.y, time, scheduledBossId);
    }
    this.pushNotification(`Boss incoming: ${boss.label}`, boss.tint, time);
    if (bossCount > 1) {
      this.pushNotification("Double boss phase", 0xffb78a, time);
    }
    this.showBanner("BOSS INCOMING", 1_100, time);
    this.audioController.boss();
  }

  private schedulePendingSpawn(enemyType: EnemyId, x: number, y: number, time: number, bossId?: BossId): void {
    const id = this.pendingSpawnIdCounter++;
    const marker = this.add.image(x, y, "spawn-marker").setDepth(8);
    const scale = enemyType === "boss" ? 1.4 : enemyType === "elite" ? 1.15 : 1;
    marker.setScale(scale);
    marker.setTint(enemyType === "boss" ? BOSSES[bossId ?? "titan"].tint : enemyType === "elite" ? 0xff90b2 : 0xca3038);
    this.spawnMarkers.set(id, marker);
    this.run.pendingSpawns.push({ id, enemyType, bossId, x, y, createdAt: time, spawnAt: time + SPAWN_TELEGRAPH_MS });
  }

  private updatePendingSpawns(time: number): void {
    let writeIndex = 0;

    for (let index = 0; index < this.run.pendingSpawns.length; index += 1) {
      const pending = this.run.pendingSpawns[index];
      const marker = this.spawnMarkers.get(pending.id);
      if (!marker) {
        if (time < pending.spawnAt) {
          this.run.pendingSpawns[writeIndex] = pending;
          writeIndex += 1;
        }
        continue;
      }

      const elapsed = time - pending.createdAt;
      const baseScale = pending.enemyType === "boss" ? 1.4 : pending.enemyType === "elite" ? 1.15 : 1;
      marker.setAlpha(0.42 + Math.sin(elapsed * 0.015) * 0.22);
      marker.setScale(baseScale + Math.sin(elapsed * 0.018) * 0.08);

      if (time >= pending.spawnAt) {
        marker.destroy();
        this.spawnMarkers.delete(pending.id);
        this.spawnEnemy(pending.enemyType, pending.x, pending.y, time, pending.bossId);
        continue;
      }

      this.run.pendingSpawns[writeIndex] = pending;
      writeIndex += 1;
    }

    this.run.pendingSpawns.length = writeIndex;
  }

  private spawnEnemy(enemyType: EnemyId, x: number, y: number, time: number, bossId?: BossId): void {
    const bossDef = enemyType === "boss" ? BOSSES[bossId ?? this.run.lastBossId ?? "titan"] : null;
    const normalDef = enemyType === "boss" ? null : ENEMIES[enemyType as keyof typeof ENEMIES];
    const baseDef = enemyType === "boss" && bossDef ? bossDef : normalDef!;
    const healthMultiplier = enemyType === "boss" ? getBossHealthMultiplier(this.run.phase) : getEnemyHealthMultiplier(this.run.phase);
    const speedMultiplier = getEnemySpeedMultiplier(this.run.phase);
    const texture = enemyType === "boss" && bossDef ? `enemy-boss-${bossDef.id}` : `enemy-${enemyType}`;
    const enemy = this.enemies.get(x, y, texture) as EnemySprite | null;
    if (!enemy) {
      return;
    }

    const baseHp = bossDef ? bossDef.baseHp : normalDef?.maxHp ?? 1;
    const attackCooldownMs = normalDef?.attackCooldownMs ?? 0;
    const hp = Math.max(1, Math.round(baseHp * healthMultiplier));

    enemy.enableBody(true, x, y, true, true);
    enemy.uid = this.enemyUidCounter++;
    enemy.enemyType = enemyType;
    enemy.bossId = bossDef?.id;
    enemy.hp = hp;
    enemy.maxHp = hp;
    enemy.contactDamage = baseDef.contactDamage;
    enemy.moveSpeed = baseDef.speed * speedMultiplier;
    enemy.radiusValue = baseDef.radius;
    enemy.baseTint = baseDef.tint;
    enemy.deathTint = baseDef.deathTint;
    enemy.knockbackResistance = baseDef.knockbackResistance;
    enemy.flashUntil = 0;
    enemy.nextAttackAt = time + attackCooldownMs + Phaser.Math.Between(40, 220);
    enemy.nextSlowShotAt = time + (bossDef?.attackPatterns[1]?.cooldownMs ?? 1_800);
    enemy.nextFastShotAt = time + (bossDef?.attackPatterns[2]?.cooldownMs ?? 2_600);
    enemy.nextMoveSwitchAt = time + 1_500;
    enemy.chargeUntil = 0;
    enemy.bossStrafing = false;
    enemy.strafeDirection = Phaser.Math.RND.pick([-1, 1]);
    enemy.burnUntil = 0;
    enemy.nextBurnTickAt = 0;
    enemy.poisonUntil = 0;
    enemy.nextPoisonTickAt = 0;
    enemy.nextLogicAt = 0;
    enemy.setDepth(enemyType === "boss" ? 16 : 12).setTint(baseDef.tint).setScale(0.3).setAlpha(0.05);
    enemy.setTexture(texture);
    enemy.setCircle(baseDef.radius, enemy.width / 2 - baseDef.radius, enemy.height / 2 - baseDef.radius);
    const body = this.getBody(enemy);
    body.setAllowGravity(false);
    body.setVelocity(0, 0);
    this.tweens.add({
      targets: enemy,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 170,
      ease: "Back.Out"
    });
    this.spawnParticleBurst(x, y, enemyType === "boss" ? 10 : 5, enemyType === "boss" ? bossDef?.deathTint ?? 0xffd9d9 : baseDef.deathTint);
    this.cachedNearestEnemy = null;
  }

  private updateEnemies(time: number): void {
    for (const enemy of this.enemies.getChildren() as EnemySprite[]) {
      if (!enemy.active) {
        continue;
      }

      enemy.setTint(time < enemy.flashUntil ? 0xffffff : enemy.baseTint);
      this.updateEnemyStatusEffects(enemy, time);

      if (!enemy.active) {
        continue;
      }

      if (enemy.enemyType === "boss") {
        this.updateBossMovement(enemy, time);
        this.updateBossAttacks(enemy, time);
        continue;
      }

      const dx = this.cachedPlayerX - enemy.x;
      const dy = this.cachedPlayerY - enemy.y;
      const distanceSq = dx * dx + dy * dy;

      if (distanceSq > ENEMY_MID_DISTANCE * ENEMY_MID_DISTANCE) {
        if (time < enemy.nextLogicAt) {
          continue;
        }
        enemy.nextLogicAt = time + ENEMY_FAR_UPDATE_INTERVAL_MS;
      } else if (distanceSq > ENEMY_NEAR_DISTANCE * ENEMY_NEAR_DISTANCE) {
        if (time < enemy.nextLogicAt) {
          continue;
        }
        enemy.nextLogicAt = time + ENEMY_MID_UPDATE_INTERVAL_MS;
      } else {
        enemy.nextLogicAt = 0;
      }

      if (distanceSq > 0.0001) {
        const invDistance = enemy.moveSpeed / Math.sqrt(distanceSq);
        this.getBody(enemy).setVelocity(dx * invDistance, dy * invDistance);
      }

      if (enemy.enemyType === "shooter") {
        this.updateShooterAttack(enemy, time);
      } else if (enemy.enemyType === "elite") {
        this.updateEliteAttack(enemy, time);
      }
    }
  }

  private updateEnemyStatusEffects(enemy: EnemySprite, time: number): void {
    const fireDps = this.run.stats.fireDps > 0 ? this.run.stats.fireDps : 2;
    if (enemy.burnUntil > time && time >= enemy.nextBurnTickAt) {
      enemy.nextBurnTickAt = time + FIRE_TICK_MS;
      this.damageEnemy(enemy, fireDps * (FIRE_TICK_MS / 1000), 0, 0, 0, {
        applyStatus: false,
        allowLifeSteal: false,
        allowChain: false
      });
    }

    const poisonDps = this.run.stats.poisonDps > 0 ? this.run.stats.poisonDps : 1.5;
    if (enemy.poisonUntil > time && time >= enemy.nextPoisonTickAt) {
      enemy.nextPoisonTickAt = time + POISON_TICK_MS;
      this.damageEnemy(enemy, poisonDps * (POISON_TICK_MS / 1000), 0, 0, 0, {
        applyStatus: false,
        allowLifeSteal: false,
        allowChain: false
      });
    }
  }

  private updateBossMovement(boss: EnemySprite, time: number): void {
    const bossDef = boss.bossId ? BOSSES[boss.bossId] : BOSSES.titan;
    if (time < boss.chargeUntil) {
      const chargeDx = this.cachedPlayerX - boss.x;
      const chargeDy = this.cachedPlayerY - boss.y;
      const chargeDistanceSq = chargeDx * chargeDx + chargeDy * chargeDy;
      if (chargeDistanceSq > 0.001) {
        const chargeSpeed = boss.moveSpeed * (bossDef.id === "ironColossus" ? 2.7 : 2.25) / Math.sqrt(chargeDistanceSq);
        this.getBody(boss).setVelocity(chargeDx * chargeSpeed, chargeDy * chargeSpeed);
      }
      return;
    }

    if (time >= boss.nextMoveSwitchAt) {
      boss.bossStrafing = !boss.bossStrafing;
      boss.strafeDirection = Phaser.Math.RND.pick([-1, 1]);
      boss.nextMoveSwitchAt = time + (boss.bossStrafing ? 1_150 : 1_850);
    }

    const dx = this.cachedPlayerX - boss.x;
    const dy = this.cachedPlayerY - boss.y;
    const distanceSq = dx * dx + dy * dy;
    if (distanceSq <= 0.0001) {
      return;
    }

    const invDistance = 1 / Math.sqrt(distanceSq);
    const nx = dx * invDistance;
    const ny = dy * invDistance;
    if (!boss.bossStrafing) {
      this.getBody(boss).setVelocity(nx * boss.moveSpeed, ny * boss.moveSpeed);
      return;
    }

    const strafeScale = boss.moveSpeed * 0.82;
    const chaseScale = boss.moveSpeed * 0.28;
    const strafeX = -ny * boss.strafeDirection * strafeScale;
    const strafeY = nx * boss.strafeDirection * strafeScale;
    const chaseX = nx * chaseScale;
    const chaseY = ny * chaseScale;
    this.getBody(boss).setVelocity(strafeX + chaseX, strafeY + chaseY);
  }

  private updateShooterAttack(enemy: EnemySprite, time: number): void {
    if (time < enemy.nextAttackAt) {
      return;
    }

    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
    this.spawnEnemyBullet(enemy.x, enemy.y, angle, ENEMIES.shooter.projectileSpeed ?? 210, ENEMIES.shooter.projectileDamage ?? 6, "slow");
    enemy.nextAttackAt = time + (ENEMIES.shooter.attackCooldownMs ?? 1_900);
  }

  private updateEliteAttack(enemy: EnemySprite, time: number): void {
    if (time < enemy.nextAttackAt) {
      return;
    }

    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
    for (const offset of [-8, 8]) {
      this.spawnEnemyBullet(
        enemy.x,
        enemy.y,
        angle + Phaser.Math.DegToRad(offset),
        ENEMIES.elite.projectileSpeed ?? 350,
        ENEMIES.elite.projectileDamage ?? 8,
        "fast"
      );
    }
    enemy.nextAttackAt = time + (ENEMIES.elite.attackCooldownMs ?? 1_500);
  }

  private updateBossAttacks(boss: EnemySprite, time: number): void {
    const bossDef = boss.bossId ? BOSSES[boss.bossId] : BOSSES.titan;
    const chaosEnabled = this.run.phase >= 20;
    const patterns = bossDef.attackPatterns;

    if (patterns[0] && time >= boss.nextAttackAt) {
      this.executeBossPattern(boss, patterns[0], time, chaosEnabled);
      boss.nextAttackAt = time + patterns[0].cooldownMs * (chaosEnabled && patterns.length > 2 ? 0.92 : 1);
      this.audioController.boss();
    }

    if (patterns[1] && time >= boss.nextSlowShotAt) {
      this.executeBossPattern(boss, patterns[1], time, chaosEnabled);
      boss.nextSlowShotAt = time + patterns[1].cooldownMs * (chaosEnabled && patterns.length > 2 ? 0.94 : 1);
    }

    if (patterns[2] && time >= boss.nextFastShotAt) {
      this.executeBossPattern(boss, patterns[2], time, chaosEnabled);
      boss.nextFastShotAt = time + patterns[2].cooldownMs * (chaosEnabled ? 0.88 : 1);
    }
  }

  private spawnEnemyBullet(x: number, y: number, angle: number, speed: number, damage: number, kind: "slow" | "fast"): void {
    const texture = kind === "slow" ? "enemy-bullet-slow" : "enemy-bullet-fast";
    const bullet = this.enemyBullets.get(x, y, texture) as BulletSprite | null;
    if (!bullet) {
      return;
    }

    bullet.enableBody(true, x, y, true, true);
    bullet
      .setActive(true)
      .setVisible(true)
      .setTexture(texture)
      .setTint(kind === "slow" ? 0xffcf88 : 0xffef9e)
      .setScale(kind === "slow" ? 1.06 : 0.94)
      .setDepth(14)
      .setRotation(angle);
    bullet.setCircle(kind === "slow" ? 7 : 5, 2, 2);
    const body = this.getBody(bullet);
    body.setAllowGravity(false);
    body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    bullet.owner = "enemy";
    bullet.damage = damage;
    bullet.knockback = 0;
    bullet.expiresAt = this.time.now + ENEMY_BULLET_LIFETIME_MS;
    bullet.remainingPierce = 0;
    bullet.remainingBounce = 0;
    bullet.crit = false;
    bullet.lastHitEnemyUid = -1;
    bullet.lastHitTime = 0;
    bullet.trailTint = kind === "slow" ? 0xf7b27f : 0xf5e58d;
    bullet.nextTrailAt = this.time.now + PROJECTILE_TRAIL_INTERVAL_MS;
    bullet.weaponId = undefined;
    bullet.explosiveRadius = 0;
    bullet.explosiveDamage = 0;
    bullet.appliesFire = false;
    bullet.appliesPoison = false;
    bullet.returnsAt = 0;
    bullet.boomerangOwnerX = 0;
    bullet.boomerangOwnerY = 0;
    bullet.mineArmedAt = 0;
    bullet.fragmentCount = 0;
  }

  private executeBossPattern(
    boss: EnemySprite,
    pattern: BossDef["attackPatterns"][number],
    time: number,
    chaosEnabled: boolean
  ): void {
    const aimAngle = Phaser.Math.Angle.Between(boss.x, boss.y, this.player.x, this.player.y);
    const projectileType = pattern.projectileType ?? "fast";
    const projectileSpeed = pattern.projectileSpeed ?? (projectileType === "slow" ? 220 : 350);
    const projectileDamage = pattern.projectileDamage ?? 10;
    const volleyCount = Math.max(1, pattern.volleyCount ?? 1) + (chaosEnabled ? 1 : 0);
    const fanSpread = pattern.fanSpreadDeg ?? 28;

    switch (pattern.kind) {
      case "aimedVolley": {
        const offsets = getProjectileSpreadAngles(volleyCount, fanSpread);
        for (const offset of offsets) {
          this.spawnEnemyBullet(
            boss.x,
            boss.y,
            aimAngle + Phaser.Math.DegToRad(offset),
            projectileSpeed,
            projectileDamage,
            projectileType
          );
        }
        break;
      }
      case "radialBurst": {
        for (let index = 0; index < volleyCount; index += 1) {
          const angle = (Math.PI * 2 * index) / volleyCount;
          this.spawnEnemyBullet(boss.x, boss.y, angle, projectileSpeed, projectileDamage, projectileType);
        }
        break;
      }
      case "charge": {
        boss.chargeUntil = time + (pattern.chargeDurationMs ?? 650);
        this.cameras.main.shake(140, 0.0018);
        break;
      }
      case "teleportBurst": {
        const point = this.getSafeSpawnPoint() ?? this.getFallbackSpawnPoint();
        boss.setPosition(point.x, point.y);
        const offsets = [45, 135, 225, 315];
        for (const offset of offsets) {
          this.spawnEnemyBullet(
            boss.x,
            boss.y,
            Phaser.Math.DegToRad(offset),
            projectileSpeed,
            projectileDamage,
            projectileType
          );
        }
        break;
      }
      case "beamLane": {
        this.spawnBeamHazard(boss.x, boss.y, aimAngle, pattern.beamWidth ?? 24, 420, pattern.beamDurationMs ?? 500, projectileDamage);
        break;
      }
      case "poisonPool": {
        this.spawnCircularHazard(this.player.x, this.player.y, pattern.areaRadius ?? 54, pattern.beamDurationMs ?? 2_200, projectileDamage * 0.5, 0x7ecd6d, "pool");
        break;
      }
      case "lightningArc": {
        const offsets = getProjectileSpreadAngles(volleyCount, 22);
        for (const offset of offsets) {
          this.spawnEnemyBullet(
            boss.x,
            boss.y,
            aimAngle + Phaser.Math.DegToRad(offset),
            projectileSpeed,
            projectileDamage,
            "fast"
          );
        }
        this.spawnLightningTrace(boss.x, boss.y, this.player.x, this.player.y, 0xa8ecff);
        break;
      }
      case "orbitingSatellite": {
        const orbitCount = Math.max(2, pattern.orbitCount ?? 3) + (chaosEnabled ? 1 : 0);
        for (let index = 0; index < orbitCount; index += 1) {
          const orbitAngle = (Math.PI * 2 * index) / orbitCount + time * 0.0012;
          const sx = boss.x + Math.cos(orbitAngle) * 42;
          const sy = boss.y + Math.sin(orbitAngle) * 34;
          const fireAngle = Phaser.Math.Angle.Between(sx, sy, this.player.x, this.player.y);
          this.spawnEnemyBullet(sx, sy, fireAngle, projectileSpeed, projectileDamage, projectileType);
        }
        break;
      }
      case "slowFieldPulse": {
        this.spawnCircularHazard(boss.x, boss.y, pattern.areaRadius ?? 120, 1_500, 2, 0x8eb9ff, "slowField", pattern.slowMultiplier ?? 0.55);
        break;
      }
    }
  }

  private tryFireWeapons(time: number): void {
    if (!this.getNearestEnemyTarget()) {
      return;
    }

    const schedule = getReadyWeapons(this.run.equippedWeapons, time, this.run.stats.attackSpeedMultiplier);
    this.run.equippedWeapons = schedule.equippedWeapons;
    for (const weapon of schedule.fired) {
      this.fireWeapon(weapon.weaponId, this.player.x, this.player.y, true);
    }
  }

  private processBurstQueue(time: number): void {
    this.burstQueue = this.burstQueue.filter((burst) => {
      if (time < burst.nextShotAt) {
        return true;
      }

      const didFire = this.fireWeapon(burst.weaponId, burst.originX ?? this.player.x, burst.originY ?? this.player.y, false);
      burst.remainingShots -= 1;
      burst.nextShotAt = time + burst.intervalMs;
      return burst.remainingShots > 0 && didFire;
    });
  }

  private fireWeapon(weaponId: WeaponId, originX: number, originY: number, allowBurst: boolean): boolean {
    const target = this.getNearestEnemyTarget();
    if (!target) {
      return false;
    }

    const weapon = WEAPONS[weaponId];
    const aimAngle = Phaser.Math.Angle.Between(originX, originY, target.x, target.y);
    const critChance = Phaser.Math.Clamp(this.run.stats.critChance, 0, 0.85);
    const projectileCount = Math.min(18, weapon.baseProjectiles + this.run.stats.extraProjectiles);
    const spreadAngles = getProjectileSpreadAngles(projectileCount, weapon.spreadCapDeg, this.run.stats.spreadMultiplier);
    const defaultDamage = (crit: boolean) =>
      weapon.damage * this.run.stats.damageMultiplier * (crit ? this.run.stats.critDamageMultiplier : 1);
    const spawnBallisticVolley = (
      emittedAngles: number[],
      overrides: Partial<{
        speed: number;
        damage: number;
        pierce: number;
        bounce: number;
        scale: number;
        explosiveRadius: number;
        explosiveDamage: number;
        lifetimeMs: number;
        returnsAt: number;
        mineArmedAt: number;
        fragmentCount: number;
        appliesFire: boolean;
        appliesPoison: boolean;
      }> = {}
    ) => {
      for (const spreadAngle of emittedAngles) {
        const angle = aimAngle + Phaser.Math.DegToRad(spreadAngle);
        const crit = Math.random() < critChance;
        this.spawnFriendlyBullet({
          weaponId,
          x: originX + Math.cos(angle) * 28,
          y: originY + Math.sin(angle) * 28,
          angle,
          speed: overrides.speed ?? weapon.projectileSpeed * this.run.stats.projectileSpeedMultiplier,
          damage: overrides.damage ?? defaultDamage(crit),
          tint: weapon.tint,
          remainingPierce: overrides.pierce ?? (weapon.basePierce ?? 0) + this.run.stats.projectilePierce,
          remainingBounce: overrides.bounce ?? this.run.stats.projectileBounce,
          projectileScale: overrides.scale ?? (weapon.projectileScale ?? 1) * this.run.stats.projectileSizeMultiplier,
          crit,
          explosiveRadius: overrides.explosiveRadius ?? 0,
          explosiveDamage: overrides.explosiveDamage ?? 0,
          lifetimeMs: overrides.lifetimeMs ?? PLAYER_BULLET_LIFETIME_MS,
          returnsAt: overrides.returnsAt ?? 0,
          boomerangOwnerX: originX,
          boomerangOwnerY: originY,
          mineArmedAt: overrides.mineArmedAt ?? 0,
          fragmentCount: overrides.fragmentCount ?? 0,
          appliesFire: overrides.appliesFire ?? weapon.tags.includes("fire"),
          appliesPoison: overrides.appliesPoison ?? weapon.tags.includes("poison")
        });
      }
    };

    switch (weapon.behaviorKind) {
      case "ballisticSingle":
      case "pierceShot":
      case "fanSpread":
        spawnBallisticVolley(spreadAngles);
        break;
      case "ballisticBurst":
        spawnBallisticVolley(spreadAngles);
        break;
      case "streamDot":
        spawnBallisticVolley(
          getProjectileSpreadAngles(Math.min(8, Math.max(2, projectileCount)), Math.max(weapon.spreadCapDeg, 20), this.run.stats.spreadMultiplier),
          {
            speed: weapon.projectileSpeed * this.run.stats.projectileSpeedMultiplier,
            scale: (weapon.projectileScale ?? 1) * this.run.stats.projectileSizeMultiplier * 0.9,
            lifetimeMs: weapon.behaviorConfig.shortLifetimeMs ?? 520,
            appliesFire: weapon.tags.includes("fire"),
            appliesPoison: weapon.tags.includes("poison")
          }
        );
        break;
      case "beam":
        this.fireBeamWeapon(originX, originY, aimAngle, weapon);
        break;
      case "rocketOrGrenade":
        spawnBallisticVolley(spreadAngles.slice(0, Math.min(3, spreadAngles.length)), {
          speed: weapon.projectileSpeed * this.run.stats.projectileSpeedMultiplier,
          explosiveRadius: weapon.behaviorConfig.explosionRadius ?? 38,
          explosiveDamage: (weapon.behaviorConfig.explosionDamage ?? weapon.damage) * this.run.stats.damageMultiplier,
          fragmentCount: weapon.id === "clusterLauncher" ? 3 : 0,
          appliesPoison: weapon.tags.includes("acid") || weapon.tags.includes("poison"),
          appliesFire: weapon.tags.includes("fire")
        });
        break;
      case "mineDeploy":
        this.spawnMine(originX, originY, aimAngle, weapon);
        break;
      case "orbitalHelper":
        this.fireOrbitalWeapon(weapon, projectileCount);
        break;
      case "boomerangReturn":
        spawnBallisticVolley(spreadAngles.slice(0, Math.min(4, spreadAngles.length)), {
          returnsAt: this.time.now + (weapon.behaviorConfig.returnDelayMs ?? 320),
          bounce: this.run.stats.projectileBounce + 1
        });
        break;
      case "chainCaster":
        this.fireChainCaster(originX, originY, target.x, target.y, weapon);
        break;
      case "novaBurst": {
        const forwardCount = Math.max(6, weapon.behaviorConfig.novaCount ?? projectileCount);
        const forwardAngles = getProjectileSpreadAngles(forwardCount, 46, this.run.stats.spreadMultiplier);
        spawnBallisticVolley(forwardAngles, {
          explosiveRadius: weapon.behaviorConfig.explosionRadius ?? 20,
          explosiveDamage: (weapon.behaviorConfig.explosionDamage ?? weapon.damage * 0.75) * this.run.stats.damageMultiplier
        });
        break;
      }
    }

    this.spawnMuzzleFlash(originX, originY, aimAngle, weapon.muzzleFlashTint);
    if (allowBurst && (weapon.behaviorConfig.burstCount ?? weapon.burstCount ?? 1) > 1 && (weapon.behaviorConfig.burstIntervalMs ?? weapon.burstIntervalMs)) {
      this.burstQueue.push({
        weaponId,
        remainingShots: (weapon.behaviorConfig.burstCount ?? weapon.burstCount ?? 1) - 1,
        nextShotAt: this.time.now + (weapon.behaviorConfig.burstIntervalMs ?? weapon.burstIntervalMs ?? 100),
        intervalMs: weapon.behaviorConfig.burstIntervalMs ?? weapon.burstIntervalMs ?? 100,
        originX,
        originY
      });
    }
    this.audioController.fire(weapon.fireRateMs / this.run.stats.attackSpeedMultiplier);
    return true;
  }

  private spawnFriendlyBullet(options: {
    weaponId: WeaponId;
    x: number;
    y: number;
    angle: number;
    speed: number;
    damage: number;
    tint: number;
    remainingPierce: number;
    remainingBounce: number;
    projectileScale: number;
    crit: boolean;
    explosiveRadius: number;
    explosiveDamage: number;
    lifetimeMs: number;
    returnsAt: number;
    boomerangOwnerX: number;
    boomerangOwnerY: number;
    mineArmedAt: number;
    fragmentCount: number;
    appliesFire: boolean;
    appliesPoison: boolean;
  }): void {
    const bullet = this.playerBullets.get(options.x, options.y, "player-bullet") as BulletSprite | null;
    if (!bullet) {
      return;
    }

    bullet.enableBody(true, options.x, options.y, true, true);
    bullet
      .setActive(true)
      .setVisible(true)
      .setTexture("player-bullet")
      .setTint(options.tint)
      .setScale(options.projectileScale)
      .setDepth(14)
      .setRotation(options.angle);
    bullet.setCircle(Math.max(4, 5 * options.projectileScale), 2, 2);
    const body = this.getBody(bullet);
    body.setAllowGravity(false);
    body.setVelocity(Math.cos(options.angle) * options.speed, Math.sin(options.angle) * options.speed);
    bullet.owner = "player";
    bullet.weaponId = options.weaponId;
    bullet.damage = options.damage;
    bullet.knockback = 48 * this.run.stats.knockbackMultiplier;
    bullet.expiresAt = this.time.now + options.lifetimeMs;
    bullet.remainingPierce = options.remainingPierce;
    bullet.remainingBounce = options.remainingBounce;
    bullet.crit = options.crit;
    bullet.explosiveRadius = options.explosiveRadius;
    bullet.explosiveDamage = options.explosiveDamage;
    bullet.appliesFire = options.appliesFire;
    bullet.appliesPoison = options.appliesPoison;
    bullet.returnsAt = options.returnsAt;
    bullet.boomerangOwnerX = options.boomerangOwnerX;
    bullet.boomerangOwnerY = options.boomerangOwnerY;
    bullet.mineArmedAt = options.mineArmedAt;
    bullet.fragmentCount = options.fragmentCount;
    bullet.lastHitEnemyUid = -1;
    bullet.lastHitTime = 0;
    bullet.trailTint = options.tint;
    bullet.nextTrailAt = options.speed <= 0.1 ? Number.POSITIVE_INFINITY : this.time.now + PROJECTILE_TRAIL_INTERVAL_MS;
  }

  private fireBeamWeapon(originX: number, originY: number, angle: number, weapon: WeaponDef): void {
    const beamLength = weapon.behaviorConfig.beamLength ?? 300;
    const beamWidth = weapon.behaviorConfig.beamWidth ?? 18;
    const endX = originX + Math.cos(angle) * beamLength;
    const endY = originY + Math.sin(angle) * beamLength;
    const lineDx = endX - originX;
    const lineDy = endY - originY;
    const lineLengthSq = lineDx * lineDx + lineDy * lineDy || 1;
    const beam = this.add.graphics().setDepth(17);
    beam.lineStyle(beamWidth * 0.28, weapon.tint, 0.86);
    beam.beginPath();
    beam.moveTo(originX, originY);
    beam.lineTo(endX, endY);
    beam.strokePath();
    this.tweens.add({
      targets: beam,
      alpha: 0,
      duration: weapon.behaviorConfig.beamDurationMs ?? 100,
      onComplete: () => beam.destroy()
    });

    for (const enemy of this.enemies.getChildren() as EnemySprite[]) {
      if (!enemy.active) {
        continue;
      }

      const t = Phaser.Math.Clamp(((enemy.x - originX) * lineDx + (enemy.y - originY) * lineDy) / lineLengthSq, 0, 1);
      const nearestX = originX + lineDx * t;
      const nearestY = originY + lineDy * t;
      const nearestDx = enemy.x - nearestX;
      const nearestDy = enemy.y - nearestY;
      const distanceToLine = Math.sqrt(nearestDx * nearestDx + nearestDy * nearestDy);

      if (distanceToLine > beamWidth + enemy.radiusValue) {
        continue;
      }

      this.damageEnemy(enemy, weapon.damage * this.run.stats.damageMultiplier, Math.cos(angle), Math.sin(angle), 18, {
        crit: false,
        forceFire: weapon.tags.includes("fire"),
        forcePoison: weapon.tags.includes("poison")
      });
    }
  }

  private spawnMine(originX: number, originY: number, angle: number, weapon: WeaponDef): void {
    this.spawnFriendlyBullet({
      weaponId: weapon.id,
      x: originX + Math.cos(angle) * 18,
      y: originY + Math.sin(angle) * 18,
      angle,
      speed: 0,
      damage: weapon.damage * this.run.stats.damageMultiplier,
      tint: weapon.tint,
      remainingPierce: 0,
      remainingBounce: 0,
      projectileScale: 1.1,
      crit: false,
      explosiveRadius: weapon.behaviorConfig.explosionRadius ?? 52,
      explosiveDamage: (weapon.behaviorConfig.explosionDamage ?? weapon.damage * 1.5) * this.run.stats.damageMultiplier,
      lifetimeMs: weapon.behaviorConfig.mineLifetimeMs ?? 4_800,
      returnsAt: 0,
      boomerangOwnerX: originX,
      boomerangOwnerY: originY,
      mineArmedAt: this.time.now + (weapon.behaviorConfig.mineArmMs ?? 550),
      fragmentCount: 0,
      appliesFire: false,
      appliesPoison: false
    });
  }

  private fireOrbitalWeapon(weapon: WeaponDef, projectileCount: number): void {
    const helperCount = Math.min(weapon.behaviorConfig.helperCap ?? 2, weapon.behaviorConfig.helperCount ?? 1);
    for (let index = 0; index < helperCount; index += 1) {
      const orbitAngle = this.time.now * 0.002 + (Math.PI * 2 * index) / Math.max(1, helperCount);
      const radius = (weapon.behaviorConfig.helperRadius ?? 68) + index * 8;
      const originX = this.player.x + Math.cos(orbitAngle) * radius;
      const originY = this.player.y + Math.sin(orbitAngle) * radius * 0.8;
      const target = this.getNearestEnemyTarget();
      if (!target) {
        continue;
      }
      const aimAngle = Phaser.Math.Angle.Between(originX, originY, target.x, target.y);
      const spreadAngles = getProjectileSpreadAngles(Math.min(6, Math.max(1, projectileCount)), weapon.spreadCapDeg, this.run.stats.spreadMultiplier);
      for (const spreadAngle of spreadAngles.slice(0, Math.min(4, spreadAngles.length))) {
        const angle = aimAngle + Phaser.Math.DegToRad(spreadAngle);
        this.spawnFriendlyBullet({
          weaponId: weapon.id,
          x: originX,
          y: originY,
          angle,
          speed: Math.max(520, weapon.projectileSpeed * this.run.stats.projectileSpeedMultiplier),
          damage: weapon.damage * this.run.stats.damageMultiplier,
          tint: weapon.tint,
          remainingPierce: weapon.basePierce ?? 0,
          remainingBounce: 0,
          projectileScale: (weapon.projectileScale ?? 1) * this.run.stats.projectileSizeMultiplier,
          crit: false,
          explosiveRadius: 0,
          explosiveDamage: 0,
          lifetimeMs: PLAYER_BULLET_LIFETIME_MS,
          returnsAt: 0,
          boomerangOwnerX: originX,
          boomerangOwnerY: originY,
          mineArmedAt: 0,
          fragmentCount: 0,
          appliesFire: false,
          appliesPoison: false
        });
      }
      this.spawnMuzzleFlash(originX, originY, aimAngle, weapon.muzzleFlashTint, 0.62);
    }
  }

  private fireChainCaster(originX: number, originY: number, targetX: number, targetY: number, weapon: WeaponDef): void {
    const nearest = this.getNearestEnemyTarget();
    if (!nearest) {
      return;
    }

    this.spawnLightningTrace(originX, originY, targetX, targetY, weapon.tint);
    this.damageEnemy(nearest, weapon.damage * this.run.stats.damageMultiplier, targetX - originX, targetY - originY, 0, {
      forceFire: false,
      forcePoison: false
    });

    const extraTargets = Math.max(2, weapon.behaviorConfig.chainTargets ?? 3);
    const damageMultiplier = weapon.behaviorConfig.chainDamageMultiplier ?? 0.65;
    const chainRange = weapon.behaviorConfig.chainRange ?? CHAIN_LIGHTNING_RANGE;
    this.enemyGrid.queryRadius(nearest.x, nearest.y, chainRange, this.nearbyEnemiesScratch, nearest.uid);
    this.sortEnemiesByDistance(this.nearbyEnemiesScratch, nearest.x, nearest.y);

    for (let index = 0; index < Math.min(extraTargets, this.nearbyEnemiesScratch.length); index += 1) {
      const enemy = this.nearbyEnemiesScratch[index];
      this.spawnLightningTrace(nearest.x, nearest.y, enemy.x, enemy.y, weapon.tint);
      this.damageEnemy(enemy, weapon.damage * this.run.stats.damageMultiplier * damageMultiplier, 0, 0, 0, {
        allowChain: false
      });
    }
  }

  private updateProjectiles(time: number): void {
    for (const group of [this.playerBullets, this.enemyBullets]) {
      for (const bullet of group.getChildren() as BulletSprite[]) {
        if (!bullet.active) {
          continue;
        }

        const outside =
          bullet.x < -PLAYER_BULLET_OFFSCREEN_MARGIN ||
          bullet.x > VIEW_WIDTH + PLAYER_BULLET_OFFSCREEN_MARGIN ||
          bullet.y < -PLAYER_BULLET_OFFSCREEN_MARGIN ||
          bullet.y > VIEW_HEIGHT + PLAYER_BULLET_OFFSCREEN_MARGIN;

        if (time >= bullet.nextTrailAt) {
          bullet.nextTrailAt = time + PROJECTILE_TRAIL_INTERVAL_MS;
          const shouldSkipTrail =
            this.activeTrailCount >= MAX_SIMULTANEOUS_TRAILS ||
            bullet.expiresAt - time < 100 ||
            outside ||
            bullet.mineArmedAt > time;

          if (!shouldSkipTrail) {
            this.spawnImageEffect(this.trailEffects, FX_TRAIL_POOL_SIZE, "particle-dot", {
              x: bullet.x,
              y: bullet.y,
              depth: 10,
              tint: bullet.trailTint,
              scale: bullet.owner === "player" ? 0.65 : 0.5,
              alpha: 0.35,
              durationMs: 150,
              endScale: (bullet.owner === "player" ? 0.65 : 0.5) * 0.3
            });
          }
        }

        if (bullet.owner === "player" && bullet.returnsAt > 0 && time >= bullet.returnsAt) {
          const body = this.getBody(bullet);
          const angle = Phaser.Math.Angle.Between(bullet.x, bullet.y, this.player.x, this.player.y);
          const speed = Math.max(320, body.velocity.length());
          body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
          bullet.setRotation(angle);
          bullet.returnsAt = 0;
        }

        if (outside || time >= bullet.expiresAt) {
          if (bullet.owner === "player" && bullet.explosiveRadius > 0) {
            this.explodePlayerProjectile(bullet, bullet.x, bullet.y);
          } else {
            this.disableProjectile(bullet);
          }
        }
      }
    }
  }

  private updateDrones(time: number): void {
    if (this.drones.length === 0) {
      return;
    }

    this.drones.forEach((drone, index) => {
      drone.orbitAngle += 0.016 + index * 0.0003;
      const orbit = DRONE_ORBIT_RADIUS + index * 10;
      drone.setPosition(
        this.player.x + Math.cos(drone.orbitAngle) * orbit,
        this.player.y + Math.sin(drone.orbitAngle) * orbit * 0.78
      );
      drone.setRotation(drone.orbitAngle + Math.PI / 2);

      if (time < drone.nextShotAt) {
        return;
      }

      const target = this.getNearestEnemyTarget();
      if (!target) {
        return;
      }

      const fireRate = this.run.activeSynergyIds.includes("droneOverclock") ? DRONE_FIRE_RATE_MS * 0.72 : DRONE_FIRE_RATE_MS;
      drone.nextShotAt = time + fireRate;
      const angle = Phaser.Math.Angle.Between(drone.x, drone.y, target.x, target.y);
      this.spawnFriendlyBullet({
        weaponId: "droneGun",
        x: drone.x + Math.cos(angle) * 16,
        y: drone.y + Math.sin(angle) * 16,
        angle,
        speed: 620,
        damage:
          (this.run.activeSynergyIds.includes("droneOverclock") ? 1.7 : 1.25) *
          this.run.stats.damageMultiplier *
          this.run.stats.summonDamageMultiplier,
        tint: 0xc5f0ff,
        remainingPierce: 0,
        remainingBounce: 0,
        projectileScale: 0.9,
        crit: false,
        explosiveRadius: 0,
        explosiveDamage: 0,
        lifetimeMs: PLAYER_BULLET_LIFETIME_MS,
        returnsAt: 0,
        boomerangOwnerX: drone.x,
        boomerangOwnerY: drone.y,
        mineArmedAt: 0,
        fragmentCount: 0,
        appliesFire: false,
        appliesPoison: false
      });
      this.spawnMuzzleFlash(drone.x, drone.y, angle, 0xd7f5ff, 0.75);
    });
  }

  private syncDroneCount(time: number): void {
    const targetCount = Math.max(0, Math.floor(this.run.stats.droneCount));
    while (this.drones.length > targetCount) {
      this.drones.pop()?.destroy();
    }
    while (this.drones.length < targetCount) {
      const drone = this.add.image(this.player.x, this.player.y, "drone").setDepth(18) as DroneSprite;
      drone.orbitAngle = (Math.PI * 2 * this.drones.length) / Math.max(1, targetCount);
      drone.nextShotAt = time + 350 + this.drones.length * 120;
      this.drones.push(drone);
    }
  }

  private destroyDrones(): void {
    for (const drone of this.drones) {
      drone.destroy();
    }
    this.drones = [];
  }

  private updatePhaseState(time: number): void {
    if (time - this.run.phaseStartedAt < PHASE_DURATION_MS) {
      return;
    }

    this.run.phase += 1;
    this.run.flowMode = "phaseTransition";
    this.run.phaseTransitionEndsAt = time + PHASE_COMPLETE_DURATION_MS;
    this.run.queuedRewards = buildPhaseRewardQueue(this.run.phase, this.run.pendingItemChoices);
    this.run.pendingItemChoices = 0;
    this.phaseStartPending = true;
    this.physics.pause();
    this.player.setVelocity(0, 0);
    this.showBanner("PHASE COMPLETE", PHASE_COMPLETE_DURATION_MS, time);
    this.pushNotification("Phase complete", 0xf1d48d, time);
  }

  private resolveQueuedRewards(time: number): void {
    if (this.run.queuedRewards.length === 0) {
      this.clearOverlay();
      this.run.flowMode = "live";
      this.run.phaseStartedAt = time;
      this.phaseStartPending = false;
      this.nextSpawnAttemptAt = Math.max(this.nextSpawnAttemptAt, time + getPhaseRecoveryWindowMs(this.run.phase));
      this.physics.resume();
      this.showBanner(`PHASE ${this.run.phase}`, 850, time);
      this.pushNotification("Brief recovery window", 0x8fbfd0, time);
      return;
    }

    const nextReward = this.run.queuedRewards.shift();
    if (!nextReward) {
      return;
    }

      if (nextReward.type === "itemDraft") {
        this.run.pendingItemChoices += 1;
        this.openItemDraftResponsive(time, false);
        return;
      }

    if (nextReward.type === "weaponDraft") {
      this.openWeaponDraftResponsive(nextReward.phase);
      return;
    }

    this.scheduleBossSpawn(time);
    this.resolveQueuedRewards(time);
  }

  private beginLivePause(time: number): void {
    if (this.livePauseStartedAt === null) {
      this.livePauseStartedAt = time;
      this.physics.pause();
      this.player.setVelocity(0, 0);
    }
  }

  private resumeFromLivePause(time: number): void {
    if (this.livePauseStartedAt === null) {
      return;
    }

    const pausedDuration = time - this.livePauseStartedAt;
    this.shiftTimersByPause(pausedDuration);
    this.livePauseStartedAt = null;
    this.run.flowMode = "live";
    this.clearOverlay();
    this.physics.resume();
  }

  private shiftTimersByPause(pausedDuration: number): void {
    this.run.phaseStartedAt += pausedDuration;
    this.nextSpawnAttemptAt += pausedDuration;
    this.playerInvulnerableUntil += pausedDuration;
    this.playerFlashUntil += pausedDuration;
    this.run.bannerUntil += pausedDuration;
    this.run.nextBurstAt += pausedDuration;
    this.run.notifications = this.run.notifications.map((notification) => ({
      ...notification,
      createdAt: notification.createdAt + pausedDuration,
      expiresAt: notification.expiresAt + pausedDuration
    }));
    this.run.pendingSpawns = this.run.pendingSpawns.map((spawn) => ({
      ...spawn,
      createdAt: spawn.createdAt + pausedDuration,
      spawnAt: spawn.spawnAt + pausedDuration
    }));
    this.run.equippedWeapons = this.run.equippedWeapons.map((weapon) => ({
      ...weapon,
      nextReadyAt: weapon.nextReadyAt + pausedDuration
    }));
    this.burstQueue = this.burstQueue.map((burst) => ({
      ...burst,
      nextShotAt: burst.nextShotAt + pausedDuration
    }));
    for (const enemy of this.enemies.getChildren() as EnemySprite[]) {
      if (!enemy.active) {
        continue;
      }
      enemy.flashUntil += pausedDuration;
      enemy.nextAttackAt += pausedDuration;
      enemy.nextSlowShotAt += pausedDuration;
      enemy.nextFastShotAt += pausedDuration;
      enemy.nextMoveSwitchAt += pausedDuration;
      enemy.burnUntil += pausedDuration;
      enemy.nextBurnTickAt += pausedDuration;
      enemy.poisonUntil += pausedDuration;
      enemy.nextPoisonTickAt += pausedDuration;
    }
    for (const bullet of [...(this.playerBullets.getChildren() as BulletSprite[]), ...(this.enemyBullets.getChildren() as BulletSprite[])]) {
      if (!bullet.active) {
        continue;
      }
      bullet.expiresAt += pausedDuration;
      bullet.nextTrailAt += pausedDuration;
      bullet.lastHitTime += pausedDuration;
    }
    for (const drone of this.drones) {
      drone.nextShotAt += pausedDuration;
    }
    for (const text of this.floatingTexts) {
      text.expiresAt += pausedDuration;
    }
    this.playerSlowUntil += pausedDuration;
    for (const hazard of this.hazards) {
      hazard.nextTickAt += pausedDuration;
      hazard.expiresAt += pausedDuration;
    }
  }

  private openItemDraft(time: number, fromLive: boolean): void {
    if (fromLive) {
      this.beginLivePause(time);
    }

    const choices = drawItemChoices(
      buildItemOfferContext({
        phase: this.run.phase,
        level: this.run.level,
        characterId: this.selectedCharacterId,
        items: this.run.selectedItems,
        equippedWeapons: this.run.equippedWeapons,
        stats: this.run.stats
      })
    ).slice(0, ITEM_CARD_COUNT);
    if (choices.length === 0) {
      if (this.livePauseStartedAt !== null) {
        this.resumeFromLivePause(time);
      } else {
        this.resolveQueuedRewards(time);
      }
      return;
    }

    this.run.currentItemOffer = choices;
    this.run.flowMode = "itemDraft";
    this.clearOverlay();
    this.createModalFrame("ITEM CHOICE", "Escolha 1 item. Os prós e contras já entram na build imediatamente.");
    this.activeChoiceActions = choices.map((choice) => () => this.selectItemChoice(choice));
    choices.forEach((choice, index) => {
      const definition = ITEM_BY_ID[choice.itemId];
      const rarity = ITEM_RARITIES[choice.rarity];
      const synergyLabels = definition.possibleSynergies.map((synergyId) => SYNERGY_BY_ID[synergyId].label).slice(0, 2);
      const card = this.createDraftCard({
        x: VIEW_WIDTH / 2 + (index - 1) * 250,
        y: VIEW_HEIGHT / 2 + 20,
        width: 238,
        height: 328,
        title: `${definition.label.toUpperCase()} • ${rarity.label.toUpperCase()}`,
        body: [
          definition.description,
          `Profile ${choice.profile.toUpperCase()}  •  ${definition.category.toUpperCase()}`,
          `Tags ${definition.tags.slice(0, 4).join(", ")}`,
          `+ ${definition.pros.join("\n+ ")}`,
          `- ${definition.cons.join("\n- ")}`,
          `Synergy hooks ${synergyLabels.length > 0 ? synergyLabels.join(", ") : "none"}`
        ].join("\n\n"),
        accent: rarity.accent,
        hotkeyIndex: index,
        onSelect: () => this.selectItemChoice(choice),
        iconKey: `upgrade-${definition.category}`,
        fillColor: rarity.fill,
        bodyColor: "#edf2ef"
      });
      this.animateCardIn(card, index);
    });
  }

  private selectItemChoice(choice: ItemOfferChoice): void {
    const oldStats = this.run.stats;
    const oldSynergies = new Set(this.run.activeSynergyIds);
    const definition = ITEM_BY_ID[choice.itemId];
    this.run.selectedItems = [...this.run.selectedItems, createItemInstance(choice.itemId, choice.rarity, this.run.level, this.run.phase)];
    this.run.pendingItemChoices = Math.max(0, this.run.pendingItemChoices - 1);
    this.run.recentRarities = [...this.run.recentRarities, choice.rarity].slice(-6);
    this.run.activeSynergyIds = getActiveSynergyIds(this.run.selectedItems);
    this.run.stats = buildPlayerStats(this.run.selectedItems, this.selectedCharacterId, this.run.activeSynergyIds);
    const maxHpIncrease = this.run.stats.maxHp - oldStats.maxHp;
    if (maxHpIncrease > 0) {
      this.run.hp = Math.min(this.run.stats.maxHp, this.run.hp + maxHpIncrease);
    } else {
      this.run.hp = Math.min(this.run.hp, this.run.stats.maxHp);
    }
    if (this.run.stats.maxShieldCharges > oldStats.maxShieldCharges) {
      this.run.shieldCharges = this.run.stats.maxShieldCharges;
    } else {
      this.run.shieldCharges = Math.min(this.run.shieldCharges, this.run.stats.maxShieldCharges);
    }
    this.syncDroneCount(this.time.now);
    this.refreshBuildSnapshot();
    this.pushNotification(`${definition.label} • ${ITEM_RARITIES[choice.rarity].label}`, ITEM_RARITIES[choice.rarity].accent, this.time.now);
    this.run.activeSynergyIds
      .filter((synergyId) => !oldSynergies.has(synergyId))
      .forEach((synergyId) => {
        const synergy = SYNERGY_BY_ID[synergyId];
        this.pushNotification(`Synergy: ${synergy.label}`, synergy.accent, this.time.now);
      });
    this.run.currentItemOffer = null;
    this.clearOverlay();

    if (this.run.pendingItemChoices > 0) {
      this.openItemDraftResponsive(this.time.now, false);
      return;
    }

    if (this.livePauseStartedAt !== null) {
      this.resumeFromLivePause(this.time.now);
      return;
    }

    this.resolveQueuedRewards(this.time.now);
  }

  private openWeaponDraft(phase: number): void {
    const choices = drawWeaponChoices(
      phase,
      this.run.equippedWeapons.map((weapon) => weapon.weaponId),
      WEAPON_DRAFT_CARD_COUNT
    );
    this.run.weaponDraftOffer = { phase, choices };
    this.run.flowMode = "weaponDraft";
    this.clearOverlay();
    this.createModalFrame("NEW WEAPON", `Phase ${phase} armory draft. Pick one weapon to add as a new independently firing slot.`);
    this.activeChoiceActions = choices.map((weaponId) => () => this.selectWeapon(weaponId));
    choices.forEach((weaponId, index) => {
      const weapon = WEAPONS[weaponId];
      const rarity = WEAPON_RARITIES[weapon.rarity];
      const card = this.createDraftCard({
        x: VIEW_WIDTH / 2 + (index - 1) * 250,
        y: VIEW_HEIGHT / 2 + 20,
        width: 220,
        height: 296,
        title: `${weapon.label.toUpperCase()} • ${rarity.label.toUpperCase()}`,
        body: [weapon.description, `Family ${weapon.family.toUpperCase()}  -  Tier ${weapon.tier}`, `Behavior ${weapon.behaviorKind}`].join(
          "\n\n"
        ),
        accent: rarity.accent,
        hotkeyIndex: index,
        onSelect: () => this.selectWeapon(weaponId),
        iconKey: weapon.iconKey,
        fillColor: rarity.fill
      });
      this.createWeaponPreview(card, weapon);
      this.animateCardIn(card, index);
    });
  }

  private selectWeapon(weaponId: WeaponId): void {
    this.run.equippedWeapons = appendEquippedWeapon(this.run.equippedWeapons, weaponId, this.run.nextWeaponSlotId);
    this.run.nextWeaponSlotId += 1;
    this.run.weaponDraftOffer = null;
    this.refreshBuildSnapshot();
    this.pushNotification(`New weapon: ${WEAPONS[weaponId].label}`, WEAPONS[weaponId].tint, this.time.now);
    this.clearOverlay();
    this.updateWeaponStrip();

    if (this.livePauseStartedAt !== null) {
      this.resumeFromLivePause(this.time.now);
      return;
    }

    this.resolveQueuedRewards(this.time.now);
  }

  private openStatsPanel(): void {
    if (this.run.flowMode !== "live") {
      return;
    }

    this.beginLivePause(this.time.now);
    this.run.flowMode = "statsPanel";
    this.refreshBuildSnapshot();
    this.clearOverlay();
    this.createModalFrame("BUILD STATS", "Leitura em tempo real da run atual. Feche com TAB, ESC ou pelo botão abaixo.");

    const snapshot = this.run.buildSnapshot;
    const projectileCountLabel =
      snapshot.projectileCountMin === snapshot.projectileCountMax
        ? `${snapshot.projectileCountMin}`
        : `${snapshot.projectileCountMin} - ${snapshot.projectileCountMax}`;
    const offense = [
      `Damage x${snapshot.damageMultiplier.toFixed(2)}`,
      `Attack speed x${snapshot.attackSpeedMultiplier.toFixed(2)}`,
      `Crit chance ${(snapshot.critChance * 100).toFixed(0)}%`,
      `Crit multiplier x${snapshot.critDamageMultiplier.toFixed(2)}`,
      `Projectile count ${projectileCountLabel}`,
      `Bonus projectiles +${snapshot.projectileBonus}`,
      `Projectile speed x${snapshot.projectileSpeedMultiplier.toFixed(2)}`,
      `Projectile size x${snapshot.projectileSizeMultiplier.toFixed(2)}`,
      `Spread x${snapshot.spreadMultiplier.toFixed(2)}`,
      `Pierce ${snapshot.pierce}`,
      `Bounce ${snapshot.bounce}`
    ].join("\n");
    const defense = [
      `HP ${Math.ceil(snapshot.currentHp)} / ${snapshot.maxHp}`,
      `Move speed ${snapshot.moveSpeed.toFixed(0)}`,
      `Armor ${snapshot.armor.toFixed(1)}`,
      `Dodge ${(snapshot.dodgeChance * 100).toFixed(0)}%`,
      `Lifesteal ${(snapshot.lifesteal * 100).toFixed(0)}%`,
      `Regen ${snapshot.regenPerSecond.toFixed(2)}/s`,
      `Shield ${snapshot.shieldCharges} / ${snapshot.maxShieldCharges}`,
      `Items ${snapshot.itemCount}`
    ].join("\n");
    const utility = [
      `Knockback x${snapshot.knockbackMultiplier.toFixed(2)}`,
      `XP magnet ${Math.round(snapshot.xpMagnetRadius)}`,
      `Summon damage x${snapshot.summonDamageMultiplier.toFixed(2)}`,
      `Item luck ${(snapshot.itemLuck * 100).toFixed(0)}%`,
      `Dominant tags: ${snapshot.dominantTags.map((entry) => `${entry.tag}(${entry.count})`).join(", ") || "None"}`
    ].join("\n");
    const build = [
      `Weapons: ${snapshot.equippedWeapons.join(", ") || "None"}`,
      `Synergies: ${this.run.activeSynergyIds.map((id) => SYNERGY_BY_ID[id].label).join(", ") || "None"}`
    ].join("\n\n");

    const offenseLabel = this.add
      .text(VIEW_WIDTH / 2 - 320, 214, "OFFENSE", {
        fontFamily: "Trebuchet MS",
        fontSize: "18px",
        color: "#f3d38b",
        stroke: "#161b19",
        strokeThickness: 3
      })
      .setDepth(75);
    const defenseLabel = this.add
      .text(VIEW_WIDTH / 2 - 20, 214, "DEFENSE", {
        fontFamily: "Trebuchet MS",
        fontSize: "18px",
        color: "#98d6ad",
        stroke: "#161b19",
        strokeThickness: 3
      })
      .setDepth(75);
    const utilityLabel = this.add
      .text(VIEW_WIDTH / 2 + 210, 214, "UTILITY + BUILD", {
        fontFamily: "Trebuchet MS",
        fontSize: "18px",
        color: "#9dc4ff",
        stroke: "#161b19",
        strokeThickness: 3
      })
      .setDepth(75);

    const left = this.add
      .text(VIEW_WIDTH / 2 - 320, 250, offense, {
        fontFamily: "Trebuchet MS",
        fontSize: "18px",
        color: "#f4f6ee",
        stroke: "#161b19",
        strokeThickness: 3,
        wordWrap: { width: 250 }
      })
      .setDepth(75);
    const middle = this.add
      .text(VIEW_WIDTH / 2 - 20, 250, defense, {
        fontFamily: "Trebuchet MS",
        fontSize: "18px",
        color: "#dce7dd",
        stroke: "#161b19",
        strokeThickness: 3,
        wordWrap: { width: 220 }
      })
      .setDepth(75);
    const right = this.add
      .text(VIEW_WIDTH / 2 + 210, 250, `${utility}\n\n${build}`, {
        fontFamily: "Trebuchet MS",
        fontSize: "17px",
        color: "#dae4ff",
        stroke: "#161b19",
        strokeThickness: 3,
        wordWrap: { width: 260 }
      })
      .setDepth(75);
    this.overlayElements.push(offenseLabel, defenseLabel, utilityLabel, left, middle, right);
    this.createActionButton(VIEW_WIDTH / 2, 640, 240, 52, "CLOSE", 0x8fb2b8, () => this.closeStatsPanel());
  }

  private closeStatsPanel(): void {
    if (this.run.flowMode !== "statsPanel") {
      return;
    }

    this.resumeFromLivePause(this.time.now);
  }

  private toggleStatsPanel(): void {
    if (this.run.flowMode === "live") {
      this.openStatsPanelResponsive();
      return;
    }

    if (this.run.flowMode === "statsPanel") {
      this.closeStatsPanel();
    }
  }

  private openItemDraftResponsive(time: number, fromLive: boolean): void {
    if (fromLive) {
      this.beginLivePause(time);
    }

    const choices = drawItemChoices(
      buildItemOfferContext({
        phase: this.run.phase,
        level: this.run.level,
        characterId: this.selectedCharacterId,
        items: this.run.selectedItems,
        equippedWeapons: this.run.equippedWeapons,
        stats: this.run.stats
      })
    ).slice(0, ITEM_CARD_COUNT);

    if (choices.length === 0) {
      if (this.livePauseStartedAt !== null) {
        this.resumeFromLivePause(time);
      } else {
        this.resolveQueuedRewards(time);
      }
      return;
    }

    this.run.currentItemOffer = choices;
    this.run.flowMode = "itemDraft";
    this.clearOverlay();
    this.createModalFrame("Escolha de Item", "Escolha 1 item. Bônus aparecem em verde, trade-offs em vermelho e entram na build imediatamente.");
    this.draftEntries = [];
    this.activeChoiceActions = choices.map((choice) => () => this.selectItemChoice(choice));
    this.draftFocusIndex = 0;

    choices.forEach((choice, index) => {
      const definition = ITEM_BY_ID[choice.itemId];
      const rarity = ITEM_RARITIES[choice.rarity];
      const synergies = definition.synergyHint
        ? [definition.synergyHint]
        : definition.possibleSynergies.map((synergyId) => SYNERGY_BY_ID[synergyId].label).slice(0, 2);
      const card = this.createDraftCard({
        x: VIEW_WIDTH / 2 + (index - 1) * 320,
        y: VIEW_HEIGHT / 2 + 34,
        width: 290,
        height: 378,
        title: definition.label,
        summary: definition.shortDescription ?? definition.description,
        accent: rarity.accent,
        hotkeyIndex: index,
        onSelect: () => this.selectItemChoice(choice),
        onHover: () => {
          this.overlayInputMode = "mouse";
          this.draftFocusIndex = index;
          this.applyOverlayFocus(this.draftEntries, index);
        },
        iconKey: definition.displayIconKey ?? `upgrade-${definition.category}`,
        fillColor: rarity.fill,
        rarityLabel: rarity.label.toUpperCase(),
        categoryLabel: `${this.formatDraftProfile(choice.profile)} • ${this.formatItemCategory(definition.category)}`,
        tags: definition.tags.slice(0, 4).map((tag) => String(tag)),
        synergies,
        pros: definition.pros,
        cons: definition.cons,
        footerLabel: `Pressione ${index + 1}, Enter ou clique`
      });
      this.draftEntries.push(card);
      this.animateCardIn(card, index);
    });

    this.applyOverlayFocus(this.draftEntries, this.draftFocusIndex);
  }

  private openWeaponDraftResponsive(phase: number): void {
    const choices = drawWeaponChoices(
      phase,
      this.run.equippedWeapons.map((weapon) => weapon.weaponId),
      WEAPON_DRAFT_CARD_COUNT
    );
    this.run.weaponDraftOffer = { phase, choices };
    this.run.flowMode = "weaponDraft";
    this.clearOverlay();
    this.createModalFrame("Nova Arma", `Fase ${phase}. Escolha uma nova arma para somar mais um slot de disparo independente.`);
    this.draftEntries = [];
    this.activeChoiceActions = choices.map((weaponId) => () => this.selectWeapon(weaponId));
    this.draftFocusIndex = 0;

    choices.forEach((weaponId, index) => {
      const weapon = WEAPONS[weaponId];
      const rarity = WEAPON_RARITIES[weapon.rarity];
      const card = this.createDraftCard({
        x: VIEW_WIDTH / 2 + (index - 1) * 308,
        y: VIEW_HEIGHT / 2 + 28,
        width: 274,
        height: 344,
        title: weapon.label,
        summary: weapon.description,
        accent: rarity.accent,
        hotkeyIndex: index,
        onSelect: () => this.selectWeapon(weaponId),
        onHover: () => {
          this.overlayInputMode = "mouse";
          this.draftFocusIndex = index;
          this.applyOverlayFocus(this.draftEntries, index);
        },
        iconKey: weapon.iconKey,
        fillColor: rarity.fill,
        rarityLabel: rarity.label.toUpperCase(),
        categoryLabel: `${weapon.family.toUpperCase()} • Tier ${weapon.tier}`,
        tags: weapon.tags.map((tag) => tag.toUpperCase()),
        synergies: [`Comportamento: ${weapon.behaviorKind}`],
        footerLabel: `Pressione ${index + 1}, Enter ou clique`
      });
      this.createWeaponPreview(card, weapon);
      this.draftEntries.push(card);
      this.animateCardIn(card, index);
    });

    this.applyOverlayFocus(this.draftEntries, this.draftFocusIndex);
  }

  private openStatsPanelResponsive(): void {
    if (this.run.flowMode !== "live") {
      return;
    }

    this.beginLivePause(this.time.now);
    this.run.flowMode = "statsPanel";
    this.refreshBuildSnapshot();
    this.clearOverlay();
    this.createModalFrame("Build da Run", "Leia os totais no topo e navegue pelas miniaturas para ver detalhes de itens e passivas.");

    const snapshot = this.run.buildSnapshot;
    this.renderStatGroupPanel(230, 286, 288, 212, "Ofensiva", 0xf3d38b, snapshot.offenseLines);
    this.renderStatGroupPanel(552, 286, 288, 212, "Defesa", 0x98d6ad, snapshot.defenseLines);
    this.renderStatGroupPanel(874, 286, 328, 212, "Utilidade + Build", 0x9dc4ff, snapshot.utilityLines);

    const uniqueItemsText = this.add
      .text(716, 402, `Itens unicos  ${snapshot.uniqueItemLabels.join(", ") || "nenhum"}`, {
        fontFamily: "Trebuchet MS",
        fontSize: "12px",
        color: "#d8e3ff",
        wordWrap: { width: 298 }
      })
      .setDepth(75);
    const uniquePassivesText = this.add
      .text(716, 422, `Passivas unicas  ${snapshot.uniquePassiveLabels.join(", ") || "nenhuma"}`, {
        fontFamily: "Trebuchet MS",
        fontSize: "12px",
        color: "#dce7dd",
        wordWrap: { width: 298 }
      })
      .setDepth(75);
    const synergyText = this.add
      .text(716, 442, `Sinergias ativas  ${snapshot.synergyLabels.join(", ") || "nenhuma"}`, {
        fontFamily: "Trebuchet MS",
        fontSize: "12px",
        color: "#d9e7e2",
        wordWrap: { width: 298 }
      })
      .setDepth(75);
    this.fitTextBlock(uniqueItemsText, 298, 18, 10);
    this.fitTextBlock(uniquePassivesText, 298, 18, 10);
    this.fitTextBlock(synergyText, 298, 18, 10);
    this.overlayElements.push(uniqueItemsText, uniquePassivesText, synergyText);

    const inventoryPanel = this.createOverlayPanel(340, 558, 476, 248, 0x111816, 0x6d9ab0);
    const detailPanel = this.createOverlayPanel(930, 558, 300, 248, 0x111816, 0x9bbca7);
    inventoryPanel.setAlpha(0.98);
    detailPanel.setAlpha(0.98);
    const inventoryLabel = this.add
      .text(114, 468, "Miniaturas da Build", {
        fontFamily: "Trebuchet MS",
        fontSize: "16px",
        color: "#f8f6eb",
        stroke: "#161b19",
        strokeThickness: 3
      })
      .setDepth(75);
    const detailLabel = this.add
      .text(790, 468, "Detalhes do Foco", {
        fontFamily: "Trebuchet MS",
        fontSize: "16px",
        color: "#f8f6eb",
        stroke: "#161b19",
        strokeThickness: 3
      })
      .setDepth(75);
    this.overlayElements.push(inventoryLabel, detailLabel);

    this.statsDetailTitle = this.add.text(790, 486, "", {
      fontFamily: "Trebuchet MS",
      fontSize: "22px",
      color: "#f8f6eb",
      stroke: "#161b19",
      strokeThickness: 3,
      wordWrap: { width: 254 }
    }).setDepth(75);
    this.statsDetailMeta = this.add.text(790, 524, "", {
      fontFamily: "Trebuchet MS",
      fontSize: "13px",
      color: "#d7e3dc",
      wordWrap: { width: 254 }
    }).setDepth(75);
    this.statsDetailDescription = this.add.text(790, 560, "", {
      fontFamily: "Trebuchet MS",
      fontSize: "13px",
      color: "#c5d4cc",
      wordWrap: { width: 254 }
    }).setDepth(75);
    this.statsDetailPros = this.add.text(790, 604, "", {
      fontFamily: "Trebuchet MS",
      fontSize: "12px",
      color: "#9ae7ac",
      wordWrap: { width: 254 }
    }).setDepth(75);
    this.statsDetailCons = this.add.text(790, 642, "", {
      fontFamily: "Trebuchet MS",
      fontSize: "12px",
      color: "#ffab9f",
      wordWrap: { width: 254 }
    }).setDepth(75);
    this.statsDetailFooter = this.add.text(790, 676, "", {
      fontFamily: "Trebuchet MS",
      fontSize: "11px",
      color: "#d3ddd8",
      wordWrap: { width: 254 }
    }).setDepth(75);
    this.overlayElements.push(
      this.statsDetailTitle,
      this.statsDetailMeta,
      this.statsDetailDescription,
      this.statsDetailPros,
      this.statsDetailCons,
      this.statsDetailFooter
    );

    this.statsEntries = [];
    this.statsFocusIndex = 0;
    this.statsGridColumns = Math.min(5, Math.max(3, Math.ceil(snapshot.inventoryEntries.length / 2)));
    const chipSpacingX = 82;
    const chipSpacingY = 84;
    const chipStartX = 156;
    const chipStartY = 506;
    snapshot.inventoryEntries.forEach((entry, index) => {
      const chip = this.createStatsInventoryChip(
        entry,
        chipStartX + (index % this.statsGridColumns) * chipSpacingX,
        chipStartY + Math.floor(index / this.statsGridColumns) * chipSpacingY,
        () => {
          this.overlayInputMode = "mouse";
          this.statsFocusIndex = index;
          this.applyOverlayFocus(this.statsEntries, index);
          this.updateStatsDetailPanel(entry);
        }
      );
      this.statsEntries.push(chip);
    });

    this.applyOverlayFocus(this.statsEntries, this.statsFocusIndex);
    this.updateStatsDetailPanel(snapshot.inventoryEntries[this.statsFocusIndex]);
    this.createActionButton(VIEW_WIDTH / 2, 690, 210, 42, "Fechar", 0x8fb2b8, () => this.closeStatsPanel());
  }

  private handlePlayerBulletHit(bullet: BulletSprite, enemy: EnemySprite): void {
    if (this.run.flowMode !== "live" || !bullet.active || !enemy.active) {
      return;
    }
    if (bullet.lastHitEnemyUid === enemy.uid && this.time.now - bullet.lastHitTime < 80) {
      return;
    }
    if (bullet.mineArmedAt > this.time.now) {
      return;
    }

    const body = this.getBody(bullet);
    this.damageEnemy(enemy, bullet.damage, body.velocity.x, body.velocity.y, bullet.knockback, {
      crit: bullet.crit,
      forceFire: bullet.appliesFire,
      forcePoison: bullet.appliesPoison
    });
    bullet.lastHitEnemyUid = enemy.uid;
    bullet.lastHitTime = this.time.now;

    if (!bullet.active) {
      return;
    }

    if (bullet.explosiveRadius > 0) {
      this.explodePlayerProjectile(bullet, enemy.x, enemy.y);
      return;
    }

    if (bullet.remainingPierce > 0) {
      bullet.remainingPierce -= 1;
      return;
    }

    if (bullet.remainingBounce > 0 && this.tryBounceProjectile(bullet, enemy)) {
      bullet.remainingBounce -= 1;
      if (this.run.activeSynergyIds.includes("toxicRicochet")) {
        bullet.appliesPoison = true;
      }
      bullet.remainingPierce = 0;
      return;
    }

    this.disableProjectile(bullet);
  }

  private handlePlayerEnemyContact(enemy: EnemySprite): void {
    if (this.run.flowMode !== "live" || !enemy.active) {
      return;
    }

    this.damagePlayer(enemy.contactDamage);
  }

  private handleEnemyBulletHit(bullet: BulletSprite): void {
    if (this.run.flowMode !== "live" || !bullet.active) {
      return;
    }

    this.disableProjectile(bullet);
    this.damagePlayer(bullet.damage);
  }

  private damageEnemy(
    enemy: EnemySprite,
    damage: number,
    vx: number,
    vy: number,
    knockback: number,
    options: DamageEnemyOptions = {}
  ): void {
    if (!enemy.active) {
      return;
    }

    const config = {
      crit: false,
      applyStatus: true,
      allowLifeSteal: true,
      allowChain: true,
      allowExplosion: true,
      ...options
    };

    enemy.hp -= damage;
    enemy.flashUntil = this.time.now + 70;
    this.audioController.hit();
    this.cameras.main.shake(36, enemy.enemyType === "boss" ? 0.0016 : 0.00075);
    if (this.time.now - this.lastImpactBurstAt >= IMPACT_EFFECT_THROTTLE_MS) {
      this.lastImpactBurstAt = this.time.now;
      this.spawnParticleBurst(enemy.x, enemy.y, enemy.enemyType === "boss" ? 8 : 4, config.crit ? 0xffe28c : enemy.deathTint);
    }

    if (knockback > 0) {
      const direction = new Phaser.Math.Vector2(vx, vy);
      if (direction.lengthSq() > 0.0001) {
        direction.normalize().scale(knockback / enemy.knockbackResistance);
        const body = this.getBody(enemy);
        body.velocity.x += direction.x;
        body.velocity.y += direction.y;
      }
    }

    const lifeStealMultiplier = this.run.activeSynergyIds.includes("vampiricBarrage") ? 1.5 : 1;
    if (config.allowLifeSteal && this.run.stats.lifeSteal > 0) {
      this.healPlayer(damage * this.run.stats.lifeSteal * lifeStealMultiplier);
    }

    const shouldApplyFire = config.forceFire || (config.applyStatus && this.run.stats.fireDurationMs > 0 && this.run.stats.fireDps > 0);
    const shouldApplyPoison = config.forcePoison || (config.applyStatus && this.run.stats.poisonDurationMs > 0 && this.run.stats.poisonDps > 0);

    if (shouldApplyFire && (this.run.stats.fireDps > 0 || config.forceFire)) {
      const fireDuration = config.forceFire ? Math.max(this.run.stats.fireDurationMs, 1_800) : this.run.stats.fireDurationMs;
      enemy.burnUntil = Math.max(enemy.burnUntil, this.time.now + fireDuration);
      enemy.nextBurnTickAt = this.time.now + FIRE_TICK_MS;
    }

    if (shouldApplyPoison && (this.run.stats.poisonDps > 0 || config.forcePoison)) {
      const poisonDuration = config.forcePoison ? Math.max(this.run.stats.poisonDurationMs, 2_400) : this.run.stats.poisonDurationMs;
      enemy.poisonUntil = Math.max(enemy.poisonUntil, this.time.now + poisonDuration);
      enemy.nextPoisonTickAt = this.time.now + POISON_TICK_MS;
    }

    if (config.allowChain && this.run.stats.chainLightningChance > 0 && Math.random() < this.run.stats.chainLightningChance) {
      this.triggerChainLightning(enemy, damage, this.time.now);
    }

    if (enemy.hp > 0) {
      if (config.crit) {
        this.spawnFloatingText(enemy.x, enemy.y - 22, "CRIT", "#ffe29a");
      }
      return;
    }

    this.killEnemy(enemy, config.allowExplosion);
  }

  private killEnemy(enemy: EnemySprite, allowExplosion: boolean): void {
    if (!enemy.active) {
      return;
    }

    const deathX = enemy.x;
    const deathY = enemy.y;
    this.spawnImageEffect(this.ghostEffects, FX_GHOST_POOL_SIZE, enemy.enemyType === "boss" ? `enemy-boss-${enemy.bossId ?? "titan"}` : `enemy-${enemy.enemyType}`, {
      x: deathX,
      y: deathY,
      depth: 17,
      tintFill: 0xffffff,
      scale: enemy.scaleX,
      alpha: 0.95,
      durationMs: 140,
      endScale: enemy.scaleX * 1.2
    });
    this.spawnParticleBurst(deathX, deathY, enemy.enemyType === "boss" ? 16 : 8, enemy.deathTint);
    enemy.disableBody(true, true);
    this.getBody(enemy).setVelocity(0, 0);
    this.run.kills += 1;
    this.spawnXpDrops(enemy);
    this.cachedNearestEnemy = null;

    if (allowExplosion && this.run.stats.explosionRadius > 0 && this.run.stats.explosionDamage > 0) {
      this.triggerExplosionOnKill(deathX, deathY, enemy.uid);
    }

    if (enemy.enemyType === "boss") {
      this.cameras.main.shake(220, 0.003);
      this.showBanner("BOSS DOWN", 1_100, this.time.now);
      this.audioController.boss();
    }
  }

  private spawnXpDrops(enemy: EnemySprite): void {
    if (enemy.enemyType === "boss") {
      const boss = enemy.bossId ? BOSSES[enemy.bossId] : BOSSES.titan;
      for (let index = 0; index < boss.xpOrbCount; index += 1) {
        const angle = (Math.PI * 2 * index) / boss.xpOrbCount;
        this.spawnXpOrb(
          enemy.x + Math.cos(angle) * 18,
          enemy.y + Math.sin(angle) * 18,
          boss.xpOrbValue
        );
      }
      return;
    }

    this.spawnXpOrb(enemy.x, enemy.y, ENEMIES[enemy.enemyType].xpValue);
  }

  private spawnXpOrb(x: number, y: number, value: number): void {
    const mergeRadius = this.run.xpOrbs.length >= XP_HIGH_DENSITY_THRESHOLD ? XP_HIGH_DENSITY_MERGE_RADIUS : XP_BASE_MERGE_RADIUS;
    const forceMerge = this.run.xpOrbs.length >= XP_FORCE_MERGE_THRESHOLD;
    const mergeTarget = this.findMergeableXpOrb(x, y, forceMerge ? XP_HIGH_DENSITY_MERGE_RADIUS : mergeRadius);

    if (mergeTarget) {
      mergeTarget.value += value;
      mergeTarget.setScale(Math.min(1.3, mergeTarget.scaleX + 0.05));
      mergeTarget.floatOffset += 0.5;
      return;
    }

    const orb = this.xpOrbs.get(x, y, "xp-orb") as XpOrbSprite | null;
    if (!orb) {
      const fallbackTarget = this.findNearestXpOrb(x, y);
      if (fallbackTarget) {
        fallbackTarget.value += value;
      }
      return;
    }
    const orbId = this.orbIdCounter++;
    orb.enableBody(true, x, y, true, true);
    orb.setActive(true).setVisible(true).setScale(0.7).setAlpha(0).setDepth(11);
    orb.setCircle(8, 4, 4);
    this.getBody(orb).setAllowGravity(false).setVelocity(0, 0);
    orb.orbId = orbId;
    orb.value = value;
    orb.floatOffset = Phaser.Math.FloatBetween(0, Math.PI * 2);
    this.run.xpOrbs.push({ id: orbId, x, y, value, active: true });
    this.tweens.add({
      targets: orb,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 160,
      ease: "Back.Out"
    });
  }

  private healPlayer(amount: number): void {
    if (amount <= 0) {
      return;
    }

    const previous = this.run.hp;
    this.run.hp = Math.min(this.run.stats.maxHp, this.run.hp + amount);
    this.refreshBuildSnapshot();
    if (this.run.hp > previous + 0.1) {
      this.spawnFloatingText(this.player.x, this.player.y - 34, `+${this.run.hp - previous > 1 ? Math.round(this.run.hp - previous) : 1}`, "#9ff0bd");
    }
  }

  private damagePlayer(amount: number): void {
    const now = this.time.now;
    if (now < this.playerInvulnerableUntil) {
      return;
    }

    if (this.run.stats.dodgeChance > 0 && Math.random() < this.run.stats.dodgeChance) {
      this.playerInvulnerableUntil = now + Math.round(PLAYER_IFRAME_MS * 0.5);
      this.spawnFloatingText(this.player.x, this.player.y - 28, "DODGE", "#9ff6df");
      this.spawnParticleBurst(this.player.x, this.player.y, 5, 0x99f2da);
      this.pushNotification("Dodge", 0x99f2da, now);
      return;
    }

    if (this.run.shieldCharges > 0) {
      this.run.shieldCharges -= 1;
      this.refreshBuildSnapshot();
      this.playerInvulnerableUntil = now + PLAYER_IFRAME_MS;
      this.playerFlashUntil = now + 180;
      this.spawnParticleBurst(this.player.x, this.player.y, 8, 0xa6d9ff);
      this.pushNotification("Shield blocked hit", 0xa6d9ff, now);
      return;
    }

    const adjusted = Math.max(1, amount - this.run.stats.armor);
    this.run.hp = Math.max(0, this.run.hp - adjusted);
    this.refreshBuildSnapshot();
    this.playerInvulnerableUntil = now + PLAYER_IFRAME_MS;
    this.playerFlashUntil = now + 220;
    this.audioController.hurt();
    this.cameras.main.shake(90, 0.0026);
    this.spawnParticleBurst(this.player.x, this.player.y, 7, 0xff9a9a);
    if (this.run.hp <= 0) {
      this.triggerGameOver();
    }
  }

  private explodePlayerProjectile(projectile: BulletSprite, x: number, y: number): void {
    const radius = projectile.explosiveRadius;
    const damage = projectile.explosiveDamage > 0 ? projectile.explosiveDamage : projectile.damage;
    this.disableProjectile(projectile);
    this.spawnParticleBurst(x, y, 10, projectile.trailTint || 0xffb263);
    this.cameras.main.shake(70, 0.0014);
    this.damageEnemiesInRadius(x, y, radius, damage, projectile);

    if (projectile.fragmentCount > 0 || this.run.activeSynergyIds.includes("blastFragmentation")) {
      const fragments = Math.min(8, projectile.fragmentCount + (this.run.activeSynergyIds.includes("blastFragmentation") ? 3 : 0));
      for (let index = 0; index < fragments; index += 1) {
        const angle = (Math.PI * 2 * index) / Math.max(1, fragments);
        this.spawnFriendlyBullet({
          weaponId: projectile.weaponId ?? "pistol",
          x,
          y,
          angle,
          speed: 420,
          damage: Math.max(0.8, damage * 0.35),
          tint: projectile.trailTint,
          remainingPierce: 0,
          remainingBounce: 0,
          projectileScale: 0.7,
          crit: false,
          explosiveRadius: 0,
          explosiveDamage: 0,
          lifetimeMs: 480,
          returnsAt: 0,
          boomerangOwnerX: x,
          boomerangOwnerY: y,
          mineArmedAt: 0,
          fragmentCount: 0,
          appliesFire: projectile.appliesFire,
          appliesPoison: projectile.appliesPoison
        });
      }
    }
  }

  private damageEnemiesInRadius(x: number, y: number, radius: number, damage: number, source?: BulletSprite): void {
    this.enemyGrid.queryRadius(x, y, radius, this.nearbyEnemiesScratch);
    for (const enemy of this.nearbyEnemiesScratch) {
      this.damageEnemy(enemy, damage, enemy.x - x, enemy.y - y, 24, {
        applyStatus: true,
        allowLifeSteal: false,
        allowChain: false,
        allowExplosion: false,
        forceFire: source?.appliesFire ?? false,
        forcePoison: source?.appliesPoison ?? false
      });
    }
  }

  private tryBounceProjectile(projectile: BulletSprite, fromEnemy: EnemySprite): boolean {
    if (projectile.remainingBounce <= 0) {
      return false;
    }

    this.enemyGrid.queryRadius(fromEnemy.x, fromEnemy.y, PROJECTILE_BOUNCE_RANGE, this.nearbyEnemiesScratch, fromEnemy.uid);
    this.sortEnemiesByDistance(this.nearbyEnemiesScratch, fromEnemy.x, fromEnemy.y);
    const target = this.nearbyEnemiesScratch[0];
    if (!target) {
      return false;
    }

    const body = this.getBody(projectile);
    const speed = body.velocity.length();
    const angle = Phaser.Math.Angle.Between(projectile.x, projectile.y, target.x, target.y);
    const nextSpeed = this.run.activeSynergyIds.includes("piercingRicochet") ? speed * 1.08 : speed;
    body.setVelocity(Math.cos(angle) * nextSpeed, Math.sin(angle) * nextSpeed);
    projectile.setRotation(angle);
    projectile.lastHitEnemyUid = -1;
    projectile.lastHitTime = 0;
    if (this.run.activeSynergyIds.includes("piercingRicochet")) {
      projectile.remainingPierce = Math.max(projectile.remainingPierce, 1);
    }
    return true;
  }

  private triggerExplosionOnKill(x: number, y: number, sourceUid: number): void {
    this.spawnParticleBurst(x, y, 12, 0xffb263);
    this.cameras.main.shake(70, 0.0014);
    this.enemyGrid.queryRadius(x, y, this.run.stats.explosionRadius, this.nearbyEnemiesScratch, sourceUid);
    for (const enemy of this.nearbyEnemiesScratch) {
      this.damageEnemy(enemy, this.run.stats.explosionDamage, enemy.x - x, enemy.y - y, 24, {
        applyStatus: false,
        allowLifeSteal: false,
        allowChain: false,
        allowExplosion: false,
        forceFire: this.run.activeSynergyIds.includes("fireExplosion") || this.run.activeSynergyIds.includes("toxicFirestorm"),
        forcePoison: this.run.activeSynergyIds.includes("toxicFirestorm")
      });
    }
  }

  private triggerChainLightning(sourceEnemy: EnemySprite, baseDamage: number, time: number): void {
    const bonusTargets = this.run.activeSynergyIds.includes("critStorm") ? 1 : 0;
    const bonusDamage = this.run.activeSynergyIds.includes("critStorm") ? 0.2 : 0;
    this.enemyGrid.queryRadius(sourceEnemy.x, sourceEnemy.y, CHAIN_LIGHTNING_RANGE, this.nearbyEnemiesScratch, sourceEnemy.uid);
    this.sortEnemiesByDistance(this.nearbyEnemiesScratch, sourceEnemy.x, sourceEnemy.y);
    const targetCount = Math.max(0, Math.floor(this.run.stats.chainLightningTargets + bonusTargets));

    for (let index = 0; index < Math.min(targetCount, this.nearbyEnemiesScratch.length); index += 1) {
      const target = this.nearbyEnemiesScratch[index];
      this.spawnLightningTrace(sourceEnemy.x, sourceEnemy.y, target.x, target.y, 0x94ecff);
      this.damageEnemy(target, baseDamage * (this.run.stats.chainLightningDamageMultiplier + bonusDamage), 0, 0, 0, {
        applyStatus: false,
        allowLifeSteal: false,
        allowChain: false,
        allowExplosion: false
      });
    }
  }

  private triggerGameOver(): void {
    this.run.flowMode = "gameOver";
    this.run.gameOver = true;
    this.physics.pause();
    this.player.setVelocity(0, 0);
    this.clearOverlay();
    const survivedMs = this.time.now - this.run.survivalStartedAt;
    this.createModalFrame(
      "GAME OVER",
      `Survived ${this.formatSurvivalTime(survivedMs)}  •  Phase ${this.run.phase}  •  Kills ${this.run.kills}`
    );
    const body = this.add
      .text(
        VIEW_WIDTH / 2,
        VIEW_HEIGHT / 2 + 18,
        [
          "The run ends here. Restart to re-enter the arena with your last selected character and rebuild your power from scratch.",
          `Items collected ${this.run.selectedItems.length}  -  Active synergies ${this.run.activeSynergyIds.length}`,
          `Build focus ${this.run.buildSnapshot.dominantTags.map((entry) => entry.tag).slice(0, 3).join(", ") || "starter loadout"}`
        ].join("\n\n"),
        {
          fontFamily: "Trebuchet MS",
          fontSize: "18px",
          color: "#dbe5dc",
          align: "center",
          stroke: "#161b19",
          strokeThickness: 3,
          wordWrap: { width: 720 }
        }
      )
      .setOrigin(0.5)
      .setDepth(73);
    this.overlayElements.push(body);
    this.createActionButton(VIEW_WIDTH / 2, VIEW_HEIGHT / 2 + 102, 280, 58, "RESTART RUN", 0xc3df95, () =>
      this.startRun(this.selectedCharacterId)
    );
  }

  private spawnLightningTrace(x1: number, y1: number, x2: number, y2: number, tint: number): void {
    const bolt = this.add.graphics().setDepth(19);
    bolt.lineStyle(2, tint, 0.92);
    bolt.beginPath();
    bolt.moveTo(x1, y1);
    bolt.lineTo((x1 + x2) / 2 + Phaser.Math.Between(-8, 8), (y1 + y2) / 2 + Phaser.Math.Between(-8, 8));
    bolt.lineTo(x2, y2);
    bolt.strokePath();
    this.tweens.add({
      targets: bolt,
      alpha: 0,
      duration: 110,
      onComplete: () => bolt.destroy()
    });
  }

  private spawnCircularHazard(
    x: number,
    y: number,
    radius: number,
    durationMs: number,
    damagePerTick: number,
    tint: number,
    kind: ActiveHazard["kind"],
    slowMultiplier?: number
  ): void {
    const gfx = this.add.graphics().setDepth(9);
    gfx.lineStyle(2, tint, 0.8);
    gfx.fillStyle(tint, 0.12);
    gfx.fillCircle(x, y, radius);
    gfx.strokeCircle(x, y, radius);
    this.hazards.push({
      id: this.hazardIdCounter++,
      kind,
      x,
      y,
      radius,
      damagePerTick,
      slowMultiplier,
      nextTickAt: this.time.now + 250,
      expiresAt: this.time.now + durationMs,
      gfx
    });
    this.tweens.add({
      targets: gfx,
      alpha: 0.3,
      duration: durationMs,
      onComplete: () => gfx.destroy()
    });
  }

  private spawnBeamHazard(
    x: number,
    y: number,
    angle: number,
    width: number,
    length: number,
    durationMs: number,
    damagePerTick: number
  ): void {
    const gfx = this.add.graphics().setDepth(10);
    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length;
    gfx.lineStyle(width * 0.35, 0xf0c18f, 0.55);
    gfx.beginPath();
    gfx.moveTo(x, y);
    gfx.lineTo(endX, endY);
    gfx.strokePath();
    this.hazards.push({
      id: this.hazardIdCounter++,
      kind: "beam",
      x,
      y,
      radius: width,
      angle,
      width,
      length,
      damagePerTick,
      nextTickAt: this.time.now + 180,
      expiresAt: this.time.now + durationMs,
      gfx
    });
    this.tweens.add({
      targets: gfx,
      alpha: 0.15,
      duration: durationMs,
      onComplete: () => gfx.destroy()
    });
  }

  private updateHazards(time: number): void {
    let writeIndex = 0;

    for (let index = 0; index < this.hazards.length; index += 1) {
      const hazard = this.hazards[index];
      if (time >= hazard.expiresAt) {
        hazard.gfx.destroy();
        continue;
      }

      if (hazard.kind === "pool" || hazard.kind === "slowField") {
        hazard.gfx.setAlpha(0.16 + Math.sin(time * 0.01 + hazard.id) * 0.08);
        const dx = this.cachedPlayerX - hazard.x;
        const dy = this.cachedPlayerY - hazard.y;
        const distanceSq = dx * dx + dy * dy;
        const radiusSq = hazard.radius * hazard.radius;
        if (hazard.kind === "slowField" && distanceSq <= radiusSq) {
          this.playerSlowUntil = Math.max(this.playerSlowUntil, time + 120);
          this.playerSlowMultiplier = Math.min(this.playerSlowMultiplier, hazard.slowMultiplier ?? 0.55);
        }
        if (time >= hazard.nextTickAt) {
          hazard.nextTickAt = time + 250;
          if (distanceSq <= radiusSq) {
            this.damagePlayer(hazard.damagePerTick);
          }
        }
        this.hazards[writeIndex] = hazard;
        writeIndex += 1;
        continue;
      }

      const endX = hazard.x + Math.cos(hazard.angle ?? 0) * (hazard.length ?? 0);
      const endY = hazard.y + Math.sin(hazard.angle ?? 0) * (hazard.length ?? 0);
      const lineDx = endX - hazard.x;
      const lineDy = endY - hazard.y;
      const lineLengthSq = lineDx * lineDx + lineDy * lineDy || 1;
      const t = Phaser.Math.Clamp(((this.cachedPlayerX - hazard.x) * lineDx + (this.cachedPlayerY - hazard.y) * lineDy) / lineLengthSq, 0, 1);
      const nearestX = hazard.x + lineDx * t;
      const nearestY = hazard.y + lineDy * t;
      const nearestDx = this.cachedPlayerX - nearestX;
      const nearestDy = this.cachedPlayerY - nearestY;
      const width = hazard.width ?? hazard.radius;
      const distanceSq = nearestDx * nearestDx + nearestDy * nearestDy;
      if (time >= hazard.nextTickAt) {
        hazard.nextTickAt = time + 180;
        if (distanceSq <= width * width) {
          this.damagePlayer(hazard.damagePerTick);
        }
      }
      this.hazards[writeIndex] = hazard;
      writeIndex += 1;
    }

    this.hazards.length = writeIndex;

    if (time >= this.playerSlowUntil) {
      this.playerSlowMultiplier = 1;
    }
  }

  private clearHazards(): void {
    for (const hazard of this.hazards) {
      hazard.gfx.destroy();
    }
    this.hazards = [];
    this.playerSlowUntil = 0;
    this.playerSlowMultiplier = 1;
  }

  private updatePlayerFlash(time: number): void {
    if (time < this.playerFlashUntil) {
      const dim = Math.floor(time / 45) % 2 === 0;
      this.player.setTint(dim ? 0xffd2d2 : 0xffffff);
      this.player.setAlpha(dim ? 0.72 : 1);
      return;
    }

    this.player.setTint(0xffffff);
    this.player.setAlpha(1);
  }

  private updateFloatingTexts(delta: number, time: number): void {
    let writeIndex = 0;

    for (let index = 0; index < this.floatingTexts.length; index += 1) {
      const text = this.floatingTexts[index];
      if (time >= text.expiresAt) {
        text.destroy();
        continue;
      }

      text.y += text.velocityY * (delta / 1000);
      text.alpha = Phaser.Math.Clamp((text.expiresAt - time) / 700, 0, 1);
      this.floatingTexts[writeIndex] = text;
      writeIndex += 1;
    }

    this.floatingTexts.length = writeIndex;
  }

  private updateBanner(time: number): void {
    this.bannerText.setText(this.run.bannerText);
    this.bannerText.setAlpha(time < this.run.bannerUntil ? 1 : 0);
  }

  private updateHud(time: number): void {
    if (!this.hudForceRefresh && this.lastHudMode === this.run.flowMode && time < this.nextHudRefreshAt) {
      return;
    }

    this.hudForceRefresh = false;
    this.lastHudMode = this.run.flowMode;
    this.nextHudRefreshAt = time + HUD_UPDATE_INTERVAL_MS;

    const hpRatio = Phaser.Math.Clamp(this.run.hp / Math.max(1, this.run.stats.maxHp), 0, 1);
    const xpRatio = Phaser.Math.Clamp(this.run.xp / Math.max(1, this.run.xpToNext), 0, 1);
    let timerValue = 40;

    if (this.run.flowMode === "live") {
      timerValue = Math.max(0, Math.ceil((PHASE_DURATION_MS - (time - this.run.phaseStartedAt)) / 1000));
    } else if (this.livePauseStartedAt !== null) {
      timerValue = Math.max(0, Math.ceil((PHASE_DURATION_MS - (this.livePauseStartedAt - this.run.phaseStartedAt)) / 1000));
    }

    if (Math.abs(hpRatio - this.lastHpRatio) > 0.001) {
      this.lastHpRatio = hpRatio;
      this.hpBarFill.clear();
      this.hpBarFill.fillStyle(0xdf564f, 1);
      this.hpBarFill.fillRoundedRect(36, 28, 216 * hpRatio, 8, 4);
    }
    if (Math.abs(xpRatio - this.lastXpRatio) > 0.001) {
      this.lastXpRatio = xpRatio;
      this.xpBarFill.clear();
      this.xpBarFill.fillStyle(0x7ce6cf, 1);
      this.xpBarFill.fillRoundedRect(36, 60, 216 * xpRatio, 8, 4);
    }

    this.hpLabelText.setText(`${CHARACTERS[this.selectedCharacterId].label.toUpperCase()} HP ${Math.ceil(this.run.hp)} / ${this.run.stats.maxHp}`);
    this.xpLabelText.setText(`XP ${this.run.xp} / ${this.run.xpToNext}`);
    this.levelText.setText(`LV ${this.run.level}`);
    this.phaseText.setText(`FASE ${this.run.phase}`);
    this.timerText.setText(this.formatSeconds(timerValue));
    this.enemyCountText.setText(`INIMIGOS ${this.getActiveEnemyCount()}`);
    this.buildSummaryText.setText(
      this.run.buildSnapshot.dominantTags.length > 0
        ? `BUILD  ${this.run.selectedItems.length} ITEMS  •  ${this.run.buildSnapshot.dominantTags
            .slice(0, 3)
            .map((entry) => `${String(entry.tag).toUpperCase()} ${entry.count}`)
            .join("  •  ")}`
        : `BUILD  STARTER LOADOUT  •  ${this.run.equippedWeapons.length} WEAPON SLOTS`
    );
    const showRuntimeHud = this.run.flowMode !== "mainMenu" && this.run.flowMode !== "characterSelect" && this.run.flowMode !== "gameOver";
    this.hudFrameElements.forEach((element) => {
      if ("setVisible" in element && typeof element.setVisible === "function") {
        element.setVisible(showRuntimeHud);
      }
    });
    this.hpBarFill.setVisible(showRuntimeHud);
    this.xpBarFill.setVisible(showRuntimeHud);
    this.hpLabelText.setVisible(showRuntimeHud);
    this.xpLabelText.setVisible(showRuntimeHud);
    this.levelText.setVisible(showRuntimeHud);
    this.phaseText.setVisible(showRuntimeHud);
    this.timerText.setVisible(showRuntimeHud);
    this.enemyCountText.setVisible(showRuntimeHud);
    this.weaponStripContainer.setVisible(showRuntimeHud);

    if (this.run.flowMode === "mainMenu") {
      this.hintText.setText("CLIQUE EM JOGAR PARA COMEÇAR");
    } else if (this.run.flowMode === "characterSelect") {
      this.hintText.setText("ESPAÇO / ENTER PARA INICIAR");
    } else if (this.run.flowMode === "gameOver") {
      this.hintText.setText("ESPAÇO / ENTER PARA RECOMEÇAR");
    } else if (this.run.flowMode === "itemDraft" || this.run.flowMode === "weaponDraft") {
      this.hintText.setText("1 / 2 / 3, ENTER OU CLIQUE EM UM CARD");
    } else if (this.run.flowMode === "statsPanel") {
      this.hintText.setText("TAB / ESC PARA FECHAR A BUILD");
    } else {
      this.hintText.setText(`MOVE - WASD / ARROWS  •  SHIELDS ${this.run.shieldCharges}`);
    }

    const statsButtonVisible = this.run.flowMode === "live" || this.run.flowMode === "statsPanel";
    this.statsButtonPanel.setVisible(statsButtonVisible);
    this.statsButtonText.setVisible(statsButtonVisible);
    this.buildSummaryText.setVisible(
      this.run.flowMode === "live" || this.run.flowMode === "statsPanel" || this.run.flowMode === "phaseTransition"
    );
    this.updateWeaponStrip();
  }

  private updateWeaponStrip(): void {
    const signature = this.run.equippedWeapons.map((weapon) => `${weapon.weaponId}:${weapon.rarity}`).join("|");
    if (signature === this.lastWeaponStripSignature) {
      return;
    }

    this.lastWeaponStripSignature = signature;
    this.weaponStripContainer.removeAll(true);
    const visibleWeapons = this.run.equippedWeapons.slice(0, 6);
    const size = this.run.equippedWeapons.length > 6 ? 28 : 36;
    const spacing = size + 10;
    const startX = -((visibleWeapons.length - 1) * spacing) / 2;

    visibleWeapons.forEach((equippedWeapon, index) => {
      const weapon = WEAPONS[equippedWeapon.weaponId];
      const rarity = WEAPON_RARITIES[equippedWeapon.rarity];
      const background = this.add
        .rectangle(startX + index * spacing, 0, size + 10, size + 10, rarity.fill, 0.95)
        .setStrokeStyle(2, rarity.border, 0.85);
      const icon = this.add.image(startX + index * spacing, 0, weapon.iconKey).setScale(size / 40);
      this.weaponStripContainer.add([background, icon]);
    });

    if (this.run.equippedWeapons.length > 6) {
      const overflow = this.add
        .text(startX + visibleWeapons.length * spacing + 8, -9, `+${this.run.equippedWeapons.length - 6}`, {
          fontFamily: "Trebuchet MS",
          fontSize: "18px",
          color: "#f2f3ea",
          stroke: "#141917",
          strokeThickness: 3
        })
        .setOrigin(0, 0.5);
      this.weaponStripContainer.add(overflow);
    }
  }

  private pushNotification(label: string, accent: number, time: number): void {
    const notification: Notification = {
      id: this.notificationIdCounter++,
      label,
      accent,
      createdAt: time,
      expiresAt: time + NOTIFICATION_DURATION_MS
    };
    if (this.run.notifications.length >= 6) {
      this.run.notifications.shift();
    }
    this.run.notifications.push(notification);
  }

  private updateNotificationsUi(time: number): void {
    let writeIndex = 0;
    for (let index = 0; index < this.run.notifications.length; index += 1) {
      const notification = this.run.notifications[index];
      if (notification.expiresAt <= time) {
        continue;
      }
      this.run.notifications[writeIndex] = notification;
      writeIndex += 1;
    }
    this.run.notifications.length = writeIndex;
    const visible = [...this.run.notifications].slice(-this.notificationSlots.length).reverse();
    this.notificationSlots.forEach((slot, index) => {
      const notification = visible[index];
      if (!notification) {
        slot.panel.setVisible(false);
        slot.text.setVisible(false);
        return;
      }

      const alpha = Phaser.Math.Clamp((notification.expiresAt - time) / NOTIFICATION_DURATION_MS, 0, 1);
      slot.panel.setVisible(true).setAlpha(alpha).setStrokeStyle(2, notification.accent, 0.58);
      slot.text.setVisible(true).setAlpha(alpha).setText(notification.label.toUpperCase());
    });
  }

  private handleChoiceInput(): void {
    if (this.activeChoiceActions.length === 0) {
      return;
    }

    let index: number | null = null;
    if (Phaser.Input.Keyboard.JustDown(this.keys.one)) {
      index = 0;
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.two)) {
      index = 1;
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.three)) {
      index = 2;
    }

    if (index !== null && this.activeChoiceActions[index]) {
      this.activeChoiceActions[index]();
    }
  }

  private createModalFrame(title: string, subtitle: string): void {
    const backdrop = this.add.rectangle(VIEW_WIDTH / 2, VIEW_HEIGHT / 2, VIEW_WIDTH, VIEW_HEIGHT, 0x0b100f, 0.76).setDepth(72);
    const titleText = this.add
      .text(VIEW_WIDTH / 2, 94, title, {
        fontFamily: "Trebuchet MS",
        fontSize: "46px",
        color: "#f8f6eb",
        stroke: "#161b19",
        strokeThickness: 6
      })
      .setOrigin(0.5)
      .setDepth(73);
    const subtitleText = this.add
      .text(VIEW_WIDTH / 2, 140, subtitle, {
        fontFamily: "Trebuchet MS",
        fontSize: "18px",
        color: "#dbe5dc",
        stroke: "#161b19",
        strokeThickness: 3,
        align: "center",
        wordWrap: { width: 860 }
      })
      .setOrigin(0.5)
      .setDepth(73);
    this.overlayElements.push(backdrop, titleText, subtitleText);
  }

  private getOverlayLayoutMetrics(): OverlayLayoutMetrics {
    const paddingX = 78;
    return {
      left: paddingX,
      top: 154,
      width: VIEW_WIDTH - paddingX * 2,
      height: VIEW_HEIGHT - 196,
      density: VIEW_WIDTH < 1180 ? "compact" : "comfortable"
    };
  }

  private getResponsiveRowCount(totalEntries: number): number {
    if (totalEntries <= 10) {
      return 1;
    }
    if (totalEntries <= 18) {
      return 2;
    }
    if (totalEntries <= 26) {
      return 3;
    }
    return 4;
  }

  private fitTextBlock(text: Phaser.GameObjects.Text, maxWidth: number, maxHeight: number, minFontSize = 12): void {
    let fontSize = Number.parseInt(`${text.style.fontSize ?? 16}`, 10);
    while ((text.height > maxHeight || text.width > maxWidth) && fontSize > minFontSize) {
      fontSize -= 1;
      text.setFontSize(fontSize);
    }

    if (text.height <= maxHeight && text.width <= maxWidth) {
      return;
    }

    let workingText = text.text;
    while (workingText.length > 6 && (text.height > maxHeight || text.width > maxWidth)) {
      workingText = `${workingText.slice(0, Math.max(0, workingText.length - 4)).trimEnd()}...`;
      text.setText(workingText);
    }
  }

  private applyOverlayFocus(entries: FocusableOverlayEntry[], activeIndex: number): void {
    entries.forEach((entry, index) => entry.setFocused(index === activeIndex));
  }

  private moveGridFocus(currentIndex: number, total: number, columns: number, dx: number, dy: number): number {
    if (total === 0) {
      return 0;
    }

    const rows = Math.ceil(total / Math.max(1, columns));
    const currentRow = Math.floor(currentIndex / columns);
    const currentColumn = currentIndex % columns;
    const nextRow = Phaser.Math.Clamp(currentRow + dy, 0, rows - 1);
    const nextColumn = Phaser.Math.Clamp(currentColumn + dx, 0, columns - 1);
    return Phaser.Math.Clamp(nextRow * columns + nextColumn, 0, total - 1);
  }

  private updateCharacterFocus(nextIndex: number): void {
    this.characterFocusIndex = Phaser.Math.Clamp(nextIndex, 0, this.characterEntries.length - 1);
    this.selectedCharacterId = CHARACTER_ORDER[this.characterFocusIndex] ?? this.selectedCharacterId;
    this.openCharacterSelect();
  }

  private handleCharacterSelectionInput(): void {
    let nextIndex = this.characterFocusIndex;

    if (Phaser.Input.Keyboard.JustDown(this.keys.a) || Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      nextIndex = this.moveGridFocus(nextIndex, this.characterEntries.length, this.characterGridColumns, -1, 0);
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.d) || Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      nextIndex = this.moveGridFocus(nextIndex, this.characterEntries.length, this.characterGridColumns, 1, 0);
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.w) || Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      nextIndex = this.moveGridFocus(nextIndex, this.characterEntries.length, this.characterGridColumns, 0, -1);
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.s) || Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      nextIndex = this.moveGridFocus(nextIndex, this.characterEntries.length, this.characterGridColumns, 0, 1);
    }

    if (nextIndex !== this.characterFocusIndex) {
      this.overlayInputMode = "keyboard";
      this.updateCharacterFocus(nextIndex);
    }
  }

  private handleDraftFocusInput(): void {
    if (this.draftEntries.length === 0) {
      return;
    }

    let nextIndex = this.draftFocusIndex;
    if (Phaser.Input.Keyboard.JustDown(this.keys.a) || Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      nextIndex = Phaser.Math.Clamp(nextIndex - 1, 0, this.draftEntries.length - 1);
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.d) || Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      nextIndex = Phaser.Math.Clamp(nextIndex + 1, 0, this.draftEntries.length - 1);
    }

    if (nextIndex !== this.draftFocusIndex) {
      this.overlayInputMode = "keyboard";
      this.draftFocusIndex = nextIndex;
      this.applyOverlayFocus(this.draftEntries, this.draftFocusIndex);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.enter) || Phaser.Input.Keyboard.JustDown(this.keys.space)) {
      this.draftEntries[this.draftFocusIndex]?.select();
    }
  }

  private handleStatsPanelFocusInput(): void {
    if (this.statsEntries.length === 0) {
      return;
    }

    let nextIndex = this.statsFocusIndex;
    if (Phaser.Input.Keyboard.JustDown(this.keys.a) || Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      nextIndex = this.moveGridFocus(nextIndex, this.statsEntries.length, this.statsGridColumns, -1, 0);
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.d) || Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      nextIndex = this.moveGridFocus(nextIndex, this.statsEntries.length, this.statsGridColumns, 1, 0);
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.w) || Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      nextIndex = this.moveGridFocus(nextIndex, this.statsEntries.length, this.statsGridColumns, 0, -1);
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.s) || Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      nextIndex = this.moveGridFocus(nextIndex, this.statsEntries.length, this.statsGridColumns, 0, 1);
    }

    if (nextIndex !== this.statsFocusIndex) {
      this.overlayInputMode = "keyboard";
      this.statsFocusIndex = nextIndex;
      this.applyOverlayFocus(this.statsEntries, this.statsFocusIndex);
      this.updateStatsDetailPanel(this.run.buildSnapshot.inventoryEntries[this.statsFocusIndex]);
    }
  }

  private formatDraftProfile(profile: ItemOfferChoice["profile"]): string {
    switch (profile) {
      case "safe":
        return "Perfil seguro";
      case "synergy":
        return "Perfil synergy";
      case "bold":
        return "Perfil agressivo";
      default:
        return "Perfil";
    }
  }

  private formatItemCategory(category: ItemCategory): string {
    switch (category) {
      case "offense":
        return "Ofensiva";
      case "utility":
        return "Utilidade";
      case "projectile":
        return "Projétil";
      case "survivability":
        return "Sobrevivência";
      case "special":
        return "Especial";
      default:
        return "Build";
    }
  }

  private getPolarityColor(polarity: BuildStatLine["polarity"]): string {
    switch (polarity) {
      case "positive":
        return "#9be7ad";
      case "negative":
        return "#ffaca0";
      default:
        return "#e7eee9";
    }
  }

  private renderStatGroupPanel(
    x: number,
    y: number,
    width: number,
    height: number,
    title: string,
    accent: number,
    lines: BuildStatLine[]
  ): void {
    const panel = this.createOverlayPanel(x, y, width, height, 0x111816, accent);
    panel.setAlpha(0.98);
    const titleText = this.add
      .text(x - width / 2 + 18, y - height / 2 + 16, title, {
        fontFamily: "Trebuchet MS",
        fontSize: "16px",
        color: "#f8f6eb",
        stroke: "#161b19",
        strokeThickness: 3
      })
      .setDepth(75);
    this.overlayElements.push(titleText);

    lines.slice(0, 6).forEach((line, index) => {
      const labelText = this.add
        .text(x - width / 2 + 18, y - height / 2 + 48 + index * 28, line.label, {
          fontFamily: "Trebuchet MS",
          fontSize: "13px",
          color: "#bac8c1"
        })
        .setDepth(75);
      const valueText = this.add
        .text(x + width / 2 - 18, y - height / 2 + 48 + index * 28, line.value, {
          fontFamily: "Trebuchet MS",
          fontSize: "13px",
          color: this.getPolarityColor(line.polarity)
        })
        .setOrigin(1, 0)
        .setDepth(75);
      this.fitTextBlock(labelText, width - 130, 20, 11);
      this.fitTextBlock(valueText, 108, 20, 11);
      this.overlayElements.push(labelText, valueText);
    });
  }

  private createStatsInventoryChip(entry: BuildInventoryEntry, x: number, y: number, onHover: () => void): FocusableOverlayEntry {
    const panel = this.add.container(x, y).setDepth(75);
    const background = this.add.rectangle(0, 0, 70, 70, entry.fill, 0.96).setStrokeStyle(2, entry.border, 0.88);
    const icon = this.add.image(0, -6, entry.iconKey ?? "upgrade-special").setScale(entry.iconKey === "player" ? 1 : 0.9);
    const stack = this.add
      .text(24, 22, entry.stackCount > 1 ? `${entry.stackCount}` : "", {
        fontFamily: "Trebuchet MS",
        fontSize: "11px",
        color: "#f8f6eb",
        stroke: "#161b19",
        strokeThickness: 2
      })
      .setOrigin(1, 1);
    panel.add([background, icon, stack]);
    panel.setSize(70, 70);
    panel.setInteractive(new Phaser.Geom.Rectangle(-35, -35, 70, 70), Phaser.Geom.Rectangle.Contains);
    panel.on("pointerover", () => onHover());
    panel.on("pointerup", () => onHover());
    this.overlayElements.push(panel);

    const chip = panel as FocusableOverlayEntry;
    chip.setFocused = (focused: boolean) => {
      background.setStrokeStyle(focused ? 3 : 2, focused ? entry.accent : entry.border, focused ? 1 : 0.88);
      background.setFillStyle(focused ? Phaser.Display.Color.IntegerToColor(entry.fill).lighten(8).color : entry.fill, 0.96);
      panel.setScale(focused ? 1.06 : 1);
    };
    chip.select = onHover;
    return chip;
  }

  private updateStatsDetailPanel(entry: BuildInventoryEntry | undefined): void {
    if (!entry || !this.statsDetailTitle || !this.statsDetailMeta || !this.statsDetailDescription || !this.statsDetailPros || !this.statsDetailCons || !this.statsDetailFooter) {
      return;
    }

    this.statsDetailTitle.setText(entry.label.toUpperCase());
    this.fitTextBlock(this.statsDetailTitle, 254, 44, 16);
    this.statsDetailMeta.setText(
      [
        entry.rarityLabel ? `Raridade  ${entry.rarityLabel}` : entry.categoryLabel,
        entry.categoryLabel,
        entry.isUnique ? "Único" : `Stacks  ${entry.stackCount}`
      ].join("\n")
    );
    this.fitTextBlock(this.statsDetailMeta, 254, 62, 12);
    this.statsDetailDescription.setText(entry.shortDescription);
    this.fitTextBlock(this.statsDetailDescription, 254, 58, 12);
    this.statsDetailPros.setText([entry.pros.length > 0 ? "Positivos" : "Positivos\nSem bônus", ...entry.pros.map((line) => `+ ${line}`)].join("\n"));
    this.fitTextBlock(this.statsDetailPros, 254, 72, 12);
    this.statsDetailCons.setText([entry.cons.length > 0 ? "Negativos" : "Negativos\nSem trade-offs", ...entry.cons.map((line) => `- ${line}`)].join("\n"));
    this.fitTextBlock(this.statsDetailCons, 254, 62, 12);
    this.statsDetailFooter.setText(
      [`Tags  ${entry.tags.join(", ") || "sem tags"}`, `Sinergias  ${entry.synergies.join(", ") || "nenhuma"}`].join("\n")
    );
    this.fitTextBlock(this.statsDetailFooter, 254, 44, 11);
  }

  private createDraftCard(options: {
    x: number;
    y: number;
    width: number;
    height: number;
    title: string;
    summary?: string;
    body?: string;
    accent: number;
    hotkeyIndex: number;
    onSelect: () => void;
    onHover?: () => void;
    iconKey?: string;
    selected?: boolean;
    fillColor?: number;
    rarityLabel?: string;
    categoryLabel?: string;
    tags?: string[];
    synergies?: string[];
    pros?: string[];
    cons?: string[];
    footerLabel?: string;
    bodyColor?: string;
  }): FocusableOverlayEntry {
    const panel = this.add.container(options.x, options.y).setDepth(75);
    const baseFill = options.fillColor ?? (options.selected ? 0x22302c : 0x16201d);
    const glow = this.add.graphics();
    const frame = this.add.graphics();
    const drawCardState = (focused: boolean) => {
      glow.clear();
      frame.clear();
      if (focused) {
        glow.fillStyle(options.accent, 0.16);
        glow.fillRoundedRect(-options.width / 2 - 4, -options.height / 2 - 4, options.width + 8, options.height + 8, 24);
      }
      frame.fillStyle(focused ? 0x22302c : baseFill, 0.98);
      frame.lineStyle(focused ? 3 : 2, options.accent, focused ? 1 : 0.92);
      frame.fillRoundedRect(-options.width / 2, -options.height / 2, options.width, options.height, 22);
      frame.strokeRoundedRect(-options.width / 2, -options.height / 2, options.width, options.height, 22);
      frame.fillStyle(options.accent, focused ? 0.85 : 0.72);
      frame.fillRoundedRect(-options.width / 2 + 14, -options.height / 2 + 14, options.width - 28, 8, 6);
    };
    drawCardState(Boolean(options.selected));

    const iconSlot = this.add.rectangle(-options.width / 2 + 48, -options.height / 2 + 62, 72, 72, 0x111816, 0.98).setStrokeStyle(2, options.accent, 0.7);
    const icon = this.add
      .image(-options.width / 2 + 48, -options.height / 2 + 62, options.iconKey ?? "upgrade-special")
      .setScale(options.iconKey === "player" ? 1 : 0.95);
    const titleText = this.add
      .text(-options.width / 2 + 96, -options.height / 2 + 24, options.title, {
        fontFamily: "Trebuchet MS",
        fontSize: "23px",
        color: "#f8f6eb",
        align: "left",
        wordWrap: { width: options.width - 150 }
      })
      .setOrigin(0, 0);
    this.fitTextBlock(titleText, options.width - 150, 54, 17);

    const rarityPill = this.add.rectangle(options.width / 2 - 66, -options.height / 2 + 86, 104, 26, 0x101715, 0.92).setStrokeStyle(1, options.accent, 0.72);
    const rarityText = this.add
      .text(options.width / 2 - 66, -options.height / 2 + 86, options.rarityLabel ?? "Build", {
        fontFamily: "Trebuchet MS",
        fontSize: "12px",
        color: "#dce7e2"
      })
      .setOrigin(0.5);

    const summaryText = this.add
      .text(-options.width / 2 + 24, -options.height / 2 + 132, options.summary ?? options.body ?? "", {
        fontFamily: "Trebuchet MS",
        fontSize: "15px",
        color: options.bodyColor ?? "#dbe5dc",
        align: "left",
        wordWrap: { width: options.width - 48 }
      })
      .setOrigin(0, 0);
    this.fitTextBlock(summaryText, options.width - 48, 44, 13);

    const categoryText = this.add
      .text(-options.width / 2 + 24, -options.height / 2 + 180, options.categoryLabel ?? "Build", {
        fontFamily: "Trebuchet MS",
        fontSize: "13px",
        color: "#9ecac1",
        stroke: "#111816",
        strokeThickness: 2
      })
      .setOrigin(0, 0);
    const tagText = this.add
      .text(-options.width / 2 + 24, -options.height / 2 + 202, `Tags  ${(options.tags ?? []).join(", ") || "sem tags"}`, {
        fontFamily: "Trebuchet MS",
        fontSize: "12px",
        color: "#bdd0c9",
        wordWrap: { width: options.width - 48 }
      })
      .setOrigin(0, 0);
    this.fitTextBlock(tagText, options.width - 48, 32, 11);

    const prosText = this.add
      .text(-options.width / 2 + 24, -options.height / 2 + 236, (options.pros ?? []).map((entry) => `+ ${entry}`).join("\n") || "+ sem bônus", {
        fontFamily: "Trebuchet MS",
        fontSize: "14px",
        color: "#9ae7ac",
        wordWrap: { width: options.width - 48 }
      })
      .setOrigin(0, 0);
    this.fitTextBlock(prosText, options.width - 48, 54, 12);

    const consText = this.add
      .text(-options.width / 2 + 24, -options.height / 2 + 294, (options.cons ?? []).map((entry) => `- ${entry}`).join("\n") || "- sem trade-offs", {
        fontFamily: "Trebuchet MS",
        fontSize: "14px",
        color: "#ffab9f",
        wordWrap: { width: options.width - 48 }
      })
      .setOrigin(0, 0);
    this.fitTextBlock(consText, options.width - 48, 42, 12);

    const synergyText = this.add
      .text(-options.width / 2 + 24, options.height / 2 - 58, `Sinergias  ${(options.synergies ?? []).join(", ") || "nenhuma"}`, {
        fontFamily: "Trebuchet MS",
        fontSize: "12px",
        color: "#c9d6cf",
        wordWrap: { width: options.width - 48 }
      })
      .setOrigin(0, 0.5);
    this.fitTextBlock(synergyText, options.width - 48, 28, 11);

    const footerText = this.add
      .text(0, options.height / 2 - 20, options.footerLabel ?? `Pressione ${options.hotkeyIndex + 1}, Enter ou clique`, {
        fontFamily: "Trebuchet MS",
        fontSize: "12px",
        color: "#c9d3cb"
      })
      .setOrigin(0.5);
    panel.add([glow, frame, iconSlot, icon, titleText, rarityPill, rarityText, summaryText, categoryText, tagText, prosText, consText, synergyText, footerText]);
    panel.setSize(options.width, options.height);
    panel.setInteractive(
      new Phaser.Geom.Rectangle(-options.width / 2, -options.height / 2, options.width, options.height),
      Phaser.Geom.Rectangle.Contains
    );
    panel.on("pointerover", () => {
      options.onHover?.();
    });
    panel.on("pointerup", () => options.onSelect());
    this.overlayElements.push(panel);
    const entry = panel as FocusableOverlayEntry;
    entry.setFocused = (focused: boolean) => {
      drawCardState(focused);
      panel.y = focused ? options.y - 8 : options.y;
      panel.setScale(focused ? 1.02 : 1);
    };
    entry.select = options.onSelect;
    return entry;
  }

  private createWeaponPreview(panel: Phaser.GameObjects.Container, weapon: WeaponDef): void {
    const previewBg = this.add.rectangle(0, 82, 154, 42, 0x101513, 0.9).setStrokeStyle(1, weapon.tint, 0.6);
    const muzzle = this.add.image(-44, 82, "muzzle-flash").setTint(weapon.muzzleFlashTint).setScale(0.45).setAlpha(0.1);
    const trail =
      weapon.previewPattern === "beam"
        ? this.add.rectangle(6, 82, 74, 6, weapon.tint, 0.6).setOrigin(0, 0.5)
        : weapon.previewPattern === "orbit"
          ? this.add.circle(0, 82, 4, weapon.tint, 1)
          : this.add.rectangle(-34, 82, 8, 3, weapon.tint, 0.8).setOrigin(0.5);
    panel.add([previewBg, trail, muzzle]);

    if (weapon.previewPattern === "orbit") {
      this.tweens.add({
        targets: trail,
        duration: WEAPON_PREVIEW_LOOP_MS,
        repeat: -1,
        onUpdate: () => {
          const progress = ((this.time.now % WEAPON_PREVIEW_LOOP_MS) / WEAPON_PREVIEW_LOOP_MS) * Math.PI * 2;
          trail.x = Math.cos(progress) * 28;
          trail.y = 82 + Math.sin(progress) * 12;
        }
      });
    } else {
      this.tweens.add({
        targets: trail,
        x: weapon.previewPattern === "beam" ? 34 : 40,
        alpha: 0,
        duration: WEAPON_PREVIEW_LOOP_MS * 0.55,
        repeat: -1,
        onRepeat: () => {
          trail.x = weapon.previewPattern === "beam" ? 6 : -34;
          trail.alpha = 0.9;
        }
      });
    }
    this.tweens.add({
      targets: muzzle,
      alpha: { from: 0.95, to: 0.1 },
      scaleX: { from: 0.6, to: 0.38 },
      scaleY: { from: 0.6, to: 0.38 },
      duration: WEAPON_PREVIEW_LOOP_MS * 0.22,
      yoyo: false,
      repeat: -1
    });
  }

  private animateCardIn(card: Phaser.GameObjects.Container, index: number): void {
    card.setAlpha(0);
    card.setScale(0.92);
    this.tweens.add({
      targets: card,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 180,
      delay: index * CARD_APPEAR_STAGGER_MS,
      ease: "Back.Out"
    });
  }

  private createOverlayPanel(x: number, y: number, width: number, height: number, fill: number, stroke: number): Phaser.GameObjects.Rectangle {
    const panel = this.add
      .rectangle(x, y, width, height, fill, 0.96)
      .setStrokeStyle(2, stroke, 0.92)
      .setDepth(73);
    this.overlayElements.push(panel);
    return panel;
  }

  private createCharacterIconButton(
    x: number,
    y: number,
    character: (typeof CHARACTERS)[CharacterId],
    selected: boolean,
    onSelect: () => void
  ): FocusableOverlayEntry {
    const panel = this.add.container(x, y).setDepth(75);
    const background = this.add
      .rectangle(0, 0, 66, 66, selected ? character.panelTint : 0x121816, 0.98)
      .setStrokeStyle(2, selected ? character.accent : 0x677570, 0.94);
    const icon = this.add.image(0, -6, "player").setTint(character.portraitTint ?? character.accent).setScale(1.1);
    const label = this.add
      .text(0, 26, character.label.slice(0, 3).toUpperCase(), {
        fontFamily: "Trebuchet MS",
        fontSize: "11px",
        color: selected ? "#f8f6eb" : "#dbe5dc",
        stroke: "#161b19",
        strokeThickness: 2
      })
      .setOrigin(0.5);
    panel.add([background, icon, label]);
    panel.setSize(66, 66);
    panel.setInteractive(new Phaser.Geom.Rectangle(-33, -33, 66, 66), Phaser.Geom.Rectangle.Contains);
    panel.on("pointerover", () => {
      onSelect();
    });
    panel.on("pointerup", () => onSelect());
    this.overlayElements.push(panel);
    const entry = panel as FocusableOverlayEntry;
    entry.setFocused = (focused: boolean) => {
      background.setFillStyle(focused ? character.panelTint : 0x121816, 0.98);
      background.setStrokeStyle(focused ? 3 : 2, focused ? character.accent : 0x677570, focused ? 1 : 0.94);
      label.setColor(focused ? "#f8f6eb" : "#dbe5dc");
      panel.setScale(focused ? 1.08 : 1);
    };
    entry.select = onSelect;
    return entry;
  }

  private createActionButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    accent: number,
    onSelect: () => void,
    disabled = false
  ): void {
    const panel = this.add.container(x, y).setDepth(75);
    const button = this.add
      .rectangle(0, 0, width, height, disabled ? 0x101614 : 0x16201d, disabled ? 0.9 : 0.98)
      .setStrokeStyle(2, accent, disabled ? 0.42 : 0.95);
    const text = this.add
      .text(0, 0, label, {
        fontFamily: "Trebuchet MS",
        fontSize: "22px",
        color: disabled ? "#87948f" : "#f8f6eb"
      })
      .setOrigin(0.5);
    panel.add([button, text]);
    panel.setSize(width, height);
    if (!disabled) {
      panel.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height), Phaser.Geom.Rectangle.Contains);
      panel.on("pointerover", () => {
        button.setFillStyle(0x22302c, 1);
        panel.setScale(1.02);
      });
      panel.on("pointerout", () => {
        button.setFillStyle(0x16201d, 0.98);
        panel.setScale(1);
      });
      panel.on("pointerup", () => onSelect());
    }
    this.overlayElements.push(panel);
  }

  private clearOverlay(): void {
    for (const element of this.overlayElements) {
      element.destroy();
    }
    this.overlayElements = [];
    this.activeChoiceActions = [];
    this.characterEntries = [];
    this.draftEntries = [];
    this.statsEntries = [];
    this.statsDetailTitle = undefined;
    this.statsDetailMeta = undefined;
    this.statsDetailDescription = undefined;
    this.statsDetailPros = undefined;
    this.statsDetailCons = undefined;
    this.statsDetailFooter = undefined;
  }

  private getNearestEnemyTarget(): EnemySprite | null {
    if (this.cachedNearestEnemy?.active) {
      return this.cachedNearestEnemy;
    }

    this.cachedNearestEnemy = findNearestTarget({ x: this.cachedPlayerX, y: this.cachedPlayerY }, this.activeEnemiesScratch);
    return this.cachedNearestEnemy;
  }

  private getActiveEnemyCount(): number {
    return this.activeEnemyCountCache + this.run.pendingSpawns.length;
  }

  private getActiveNormalEnemyCount(): number {
    return this.activeNormalEnemyCountCache;
  }

  private refreshEnemySpatialState(): void {
    this.activeEnemiesScratch.length = 0;
    let normalCount = 0;

    for (const enemy of this.enemies.getChildren() as EnemySprite[]) {
      if (!enemy.active) {
        continue;
      }

      this.activeEnemiesScratch.push(enemy);
      if (enemy.enemyType !== "boss") {
        normalCount += 1;
      }
    }

    this.activeEnemyCountCache = this.activeEnemiesScratch.length;
    this.activeNormalEnemyCountCache = normalCount;
    this.enemyGrid.rebuild(this.activeEnemiesScratch);
    this.cachedNearestEnemy = null;
  }

  private getPendingNormalSpawnCount(): number {
    let count = 0;

    for (let index = 0; index < this.run.pendingSpawns.length; index += 1) {
      if (this.run.pendingSpawns[index].enemyType !== "boss") {
        count += 1;
      }
    }

    return count;
  }

  private sortEnemiesByDistance(enemies: EnemySprite[], x: number, y: number): void {
    enemies.sort((a, b) => {
      const adx = a.x - x;
      const ady = a.y - y;
      const bdx = b.x - x;
      const bdy = b.y - y;
      return adx * adx + ady * ady - (bdx * bdx + bdy * bdy);
    });
  }

  private findMergeableXpOrb(x: number, y: number, radius: number): XpOrbSprite | null {
    const radiusSq = radius * radius;
    let bestOrb: XpOrbSprite | null = null;
    let bestDistanceSq = Number.POSITIVE_INFINITY;

    for (const orb of this.xpOrbs.getChildren() as XpOrbSprite[]) {
      if (!orb.active) {
        continue;
      }

      const dx = orb.x - x;
      const dy = orb.y - y;
      const distanceSq = dx * dx + dy * dy;
      if (distanceSq > radiusSq || distanceSq >= bestDistanceSq) {
        continue;
      }

      bestOrb = orb;
      bestDistanceSq = distanceSq;
    }

    return bestOrb;
  }

  private findNearestXpOrb(x: number, y: number): XpOrbSprite | null {
    let bestOrb: XpOrbSprite | null = null;
    let bestDistanceSq = Number.POSITIVE_INFINITY;

    for (const orb of this.xpOrbs.getChildren() as XpOrbSprite[]) {
      if (!orb.active) {
        continue;
      }

      const dx = orb.x - x;
      const dy = orb.y - y;
      const distanceSq = dx * dx + dy * dy;
      if (distanceSq >= bestDistanceSq) {
        continue;
      }

      bestOrb = orb;
      bestDistanceSq = distanceSq;
    }

    return bestOrb;
  }

  private removeXpOrbState(orbId: number): void {
    for (let index = 0; index < this.run.xpOrbs.length; index += 1) {
      if (this.run.xpOrbs[index].id !== orbId) {
        continue;
      }

      const lastIndex = this.run.xpOrbs.length - 1;
      this.run.xpOrbs[index] = this.run.xpOrbs[lastIndex];
      this.run.xpOrbs.length = lastIndex;
      return;
    }
  }

  private spawnImageEffect(
    pool: FxSprite[],
    maxSize: number,
    texture: string,
    options: {
      x: number;
      y: number;
      depth: number;
      tint?: number;
      tintFill?: number;
      scale: number;
      alpha: number;
      durationMs: number;
      endScale?: number;
      velocityX?: number;
      velocityY?: number;
      rotation?: number;
    }
  ): void {
    const effect = this.acquireImageEffect(pool, maxSize, texture);
    if (!effect) {
      return;
    }

    effect
      .setActive(true)
      .setVisible(true)
      .setTexture(texture)
      .setPosition(options.x, options.y)
      .setDepth(options.depth)
      .setScale(options.scale)
      .setAlpha(options.alpha)
      .setRotation(options.rotation ?? 0);

    if (typeof options.tintFill === "number") {
      effect.setTintFill(options.tintFill);
    } else if (typeof options.tint === "number") {
      effect.clearTint();
      effect.setTint(options.tint);
    } else {
      effect.clearTint();
    }

    effect.effectCreatedAt = this.time.now;
    effect.effectExpiresAt = this.time.now + options.durationMs;
    effect.effectVelocityX = options.velocityX ?? 0;
    effect.effectVelocityY = options.velocityY ?? 0;
    effect.effectStartAlpha = options.alpha;
    effect.effectEndAlpha = 0;
    effect.effectStartScale = options.scale;
    effect.effectEndScale = options.endScale ?? options.scale * 0.45;
  }

  private acquireImageEffect(pool: FxSprite[], maxSize: number, texture: string): FxSprite | null {
    for (const effect of pool) {
      if (!effect.active) {
        return effect;
      }
    }

    if (pool.length >= maxSize) {
      return null;
    }

    const effect = this.add.image(0, 0, texture).setVisible(false).setActive(false) as FxSprite;
    effect.effectCreatedAt = 0;
    effect.effectExpiresAt = 0;
    effect.effectVelocityX = 0;
    effect.effectVelocityY = 0;
    effect.effectStartAlpha = 0;
    effect.effectEndAlpha = 0;
    effect.effectStartScale = 1;
    effect.effectEndScale = 1;
    pool.push(effect);
    return effect;
  }

  private updateImageEffects(time: number, delta: number): void {
    this.activeParticleCount = this.updateImageEffectPool(this.particleEffects, time, delta);
    this.activeTrailCount = this.updateImageEffectPool(this.trailEffects, time, delta);
    this.activeMuzzleFlashCount = this.updateImageEffectPool(this.muzzleFlashEffects, time, delta);
    this.activeGhostCount = this.updateImageEffectPool(this.ghostEffects, time, delta);
  }

  private updateImageEffectPool(pool: FxSprite[], time: number, delta: number): number {
    let activeCount = 0;

    for (const effect of pool) {
      if (!effect.active) {
        continue;
      }

      if (time >= effect.effectExpiresAt) {
        effect.setActive(false).setVisible(false);
        continue;
      }

      activeCount += 1;
      const duration = Math.max(1, effect.effectExpiresAt - effect.effectCreatedAt);
      const progress = Phaser.Math.Clamp((time - effect.effectCreatedAt) / duration, 0, 1);
      effect.x += effect.effectVelocityX * (delta / 1000);
      effect.y += effect.effectVelocityY * (delta / 1000);
      effect.setAlpha(Phaser.Math.Linear(effect.effectStartAlpha, effect.effectEndAlpha, progress));
      effect.setScale(Phaser.Math.Linear(effect.effectStartScale, effect.effectEndScale, progress));
    }

    return activeCount;
  }

  private clearGroup(group: Phaser.Physics.Arcade.Group): void {
    for (const child of group.getChildren() as Phaser.Physics.Arcade.Image[]) {
      if (child.active) {
        child.disableBody(true, true);
      }
    }
  }

  private clearSpawnMarkers(): void {
    for (const marker of this.spawnMarkers.values()) {
      marker.destroy();
    }
    this.spawnMarkers.clear();
  }

  private disableProjectile(projectile: BulletSprite): void {
    this.getBody(projectile).setVelocity(0, 0);
    projectile.disableBody(true, true);
  }

  private spawnMuzzleFlash(x: number, y: number, angle: number, tint: number, scale = 1): void {
    if (this.activeMuzzleFlashCount >= MAX_SIMULTANEOUS_MUZZLE_FLASHES) {
      return;
    }

    this.spawnImageEffect(this.muzzleFlashEffects, FX_MUZZLE_FLASH_POOL_SIZE, "muzzle-flash", {
      x,
      y,
      depth: 18,
      tint,
      scale,
      alpha: 0.95,
      durationMs: 70,
      endScale: scale * 0.45,
      rotation: angle
    });
  }

  private spawnFloatingText(x: number, y: number, label: string, color: string): void {
    const text = this.add.text(x, y, label, {
      fontFamily: "Trebuchet MS",
      fontSize: "18px",
      color,
      stroke: "#25302d",
      strokeThickness: 3
    }) as FloatingText;
    text.setOrigin(0.5).setDepth(78);
    text.velocityY = -18;
    text.expiresAt = this.time.now + 700;
    this.floatingTexts.push(text);
  }

  private spawnParticleBurst(x: number, y: number, count: number, tint: number): void {
    if (this.activeParticleCount >= MAX_SIMULTANEOUS_PARTICLES) {
      return;
    }

    const availableBudget = Math.max(0, MAX_SIMULTANEOUS_PARTICLES - this.activeParticleCount);
    const burstCount = Math.min(count, MAX_PARTICLES_PER_BURST, availableBudget);

    for (let index = 0; index < burstCount; index += 1) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = Phaser.Math.Between(42, 120);
      const startScale = Phaser.Math.FloatBetween(0.5, 1);
      this.spawnImageEffect(this.particleEffects, FX_PARTICLE_POOL_SIZE, "particle-dot", {
        x,
        y,
        depth: 18,
        tint,
        scale: startScale,
        alpha: 0.92,
        durationMs: Phaser.Math.Between(180, 320),
        endScale: startScale * 0.4,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed
      });
    }
  }

  private showBanner(label: string, durationMs: number, time: number): void {
    this.run.bannerText = label;
    this.run.bannerUntil = time + durationMs;
  }

  private formatSeconds(seconds: number): string {
    const mins = Math.floor(Math.max(0, seconds) / 60);
    const secs = Math.max(0, seconds) % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  private formatSurvivalTime(milliseconds: number): string {
    return this.formatSeconds(Math.floor(milliseconds / 1000));
  }

  private getBody(sprite: Phaser.Physics.Arcade.Image): Phaser.Physics.Arcade.Body {
    const body = sprite.body;
    if (!(body instanceof Phaser.Physics.Arcade.Body)) {
      throw new Error("Expected arcade body.");
    }
    return body;
  }
}
