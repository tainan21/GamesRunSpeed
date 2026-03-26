import type { PersistentProfile, WeaponId } from "../types";

export const PROFILE_STORAGE_KEY = "roguelite-v3-profile";

export const DEFAULT_PERSISTENT_PROFILE: PersistentProfile = {
  lastCharacterId: "soldier"
};

export const STARTING_WEAPON: WeaponId = "pistol";
export const LEVEL_UP_CARD_COUNT = 3;
export const WEAPON_DRAFT_CARD_COUNT = 3;
export const LEVEL_XP_BASE = 6;
export const LEVEL_XP_PER_LEVEL = 4;
export const PHASE_COMPLETE_DURATION_MS = 900;
export const CARD_APPEAR_STAGGER_MS = 120;
export const NOTIFICATION_DURATION_MS = 2200;
export const XP_TOUCH_RADIUS = 22;
export const FIRE_TICK_MS = 250;
export const POISON_TICK_MS = 400;
export const PROJECTILE_BOUNCE_RANGE = 220;
export const CHAIN_LIGHTNING_RANGE = 180;
export const DRONE_FIRE_RATE_MS = 1200;
export const DRONE_ORBIT_RADIUS = 54;
export const WEAPON_PREVIEW_LOOP_MS = 900;
