import type { ItemRarity, RarityDef } from "../types";

export const ITEM_RARITY_ORDER: ItemRarity[] = ["common", "uncommon", "rare", "epic", "legendary"];

export const ITEM_RARITIES: Record<ItemRarity, RarityDef> = {
  common: {
    id: "common",
    label: "Common",
    accent: 0xc9d2cd,
    fill: 0x1a2320,
    border: 0x85918c,
    positiveScale: 1,
    negativeScale: 1,
    offerWeightMultiplier: 1,
    synergyWeightMultiplier: 1
  },
  uncommon: {
    id: "uncommon",
    label: "Uncommon",
    accent: 0x8fe0be,
    fill: 0x152521,
    border: 0x63b896,
    positiveScale: 1.18,
    negativeScale: 1.08,
    offerWeightMultiplier: 0.82,
    synergyWeightMultiplier: 1.08
  },
  rare: {
    id: "rare",
    label: "Rare",
    accent: 0x8eb9ff,
    fill: 0x162033,
    border: 0x6c93df,
    positiveScale: 1.38,
    negativeScale: 1.16,
    offerWeightMultiplier: 0.58,
    synergyWeightMultiplier: 1.2
  },
  epic: {
    id: "epic",
    label: "Epic",
    accent: 0xc79cff,
    fill: 0x23173a,
    border: 0xa777e2,
    positiveScale: 1.68,
    negativeScale: 1.28,
    offerWeightMultiplier: 0.32,
    synergyWeightMultiplier: 1.36
  },
  legendary: {
    id: "legendary",
    label: "Legendary",
    accent: 0xffc46f,
    fill: 0x332412,
    border: 0xe4a84e,
    positiveScale: 2.08,
    negativeScale: 1.44,
    offerWeightMultiplier: 0.12,
    synergyWeightMultiplier: 1.6
  }
};
