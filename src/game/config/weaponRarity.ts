import type { WeaponRarity, WeaponRarityDef } from "../types";

export const WEAPON_RARITY_ORDER: WeaponRarity[] = ["common", "rare", "epic", "legendary"];

export const WEAPON_RARITIES: Record<WeaponRarity, WeaponRarityDef> = {
  common: {
    id: "common",
    label: "Common",
    accent: 0xcad3cd,
    fill: 0x18201d,
    border: 0x83908a,
    description: "Reliable starter-grade weaponry."
  },
  rare: {
    id: "rare",
    label: "Rare",
    accent: 0x89bfff,
    fill: 0x162131,
    border: 0x5d8cd4,
    description: "Stronger weapon identity with sharper tradeoffs."
  },
  epic: {
    id: "epic",
    label: "Epic",
    accent: 0xc091ff,
    fill: 0x251937,
    border: 0xa56ce8,
    description: "Run-defining weapons with aggressive payoffs."
  },
  legendary: {
    id: "legendary",
    label: "Legendary",
    accent: 0xf8c067,
    fill: 0x382712,
    border: 0xe0a246,
    description: "Extreme signature weapons with unique power curves."
  }
};
