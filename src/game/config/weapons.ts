import type { WeaponDef, WeaponId } from "../types";

export const WEAPON_ORDER: WeaponId[] = ["pistol", "machineGun", "shotgun", "sniper", "burstRifle"];

export const WEAPONS: Record<WeaponId, WeaponDef> = {
  pistol: {
    id: "pistol",
    label: "Pistol",
    description: "Reliable sidearm with steady moderate rounds.",
    fireRateMs: 700,
    damage: 1,
    baseProjectiles: 1,
    projectileSpeed: 560,
    tint: 0xf5e7b5,
    spreadCapDeg: 24,
    iconKey: "weapon-icon-pistol",
    previewPattern: "single",
    muzzleFlashTint: 0xffe1aa
  },
  machineGun: {
    id: "machineGun",
    label: "Machine Gun",
    description: "Fast fire, low damage, easy to overcommit.",
    fireRateMs: 220,
    damage: 1,
    baseProjectiles: 1,
    projectileSpeed: 600,
    tint: 0xf0c46b,
    spreadCapDeg: 24,
    iconKey: "weapon-icon-machineGun",
    previewPattern: "stream",
    muzzleFlashTint: 0xffd481,
    projectileScale: 0.92
  },
  shotgun: {
    id: "shotgun",
    label: "Shotgun",
    description: "Heavy short-range burst with wide control.",
    fireRateMs: 1200,
    damage: 1,
    baseProjectiles: 5,
    projectileSpeed: 520,
    tint: 0xffa86f,
    spreadCapDeg: 40,
    iconKey: "weapon-icon-shotgun",
    previewPattern: "fan",
    muzzleFlashTint: 0xffbf8e,
    projectileScale: 1.06
  },
  sniper: {
    id: "sniper",
    label: "Sniper",
    description: "Slow powerful shot that pierces two targets.",
    fireRateMs: 1400,
    damage: 5,
    baseProjectiles: 1,
    projectileSpeed: 680,
    tint: 0xb8ebff,
    spreadCapDeg: 12,
    iconKey: "weapon-icon-sniper",
    previewPattern: "pierce",
    muzzleFlashTint: 0xd8f4ff,
    basePierce: 2,
    projectileScale: 1.1
  },
  burstRifle: {
    id: "burstRifle",
    label: "Burst Rifle",
    description: "Three quick shots with a measured cadence.",
    fireRateMs: 850,
    damage: 1,
    baseProjectiles: 1,
    projectileSpeed: 590,
    tint: 0xa6d87f,
    spreadCapDeg: 20,
    iconKey: "weapon-icon-burstRifle",
    previewPattern: "burst",
    muzzleFlashTint: 0xd9f6a6,
    burstCount: 3,
    burstIntervalMs: 100
  }
};
