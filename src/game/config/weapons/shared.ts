import type { WeaponAvailability, WeaponDef, WeaponId, WeaponRarity } from "../../types";

const DEFAULT_RARITY_BY_TIER: Record<WeaponDef["tier"], WeaponRarity> = {
  1: "common",
  2: "rare",
  3: "epic",
  4: "legendary"
};

export function defineWeapon(
  definition: Omit<WeaponDef, "rarity" | "availability"> & Partial<Pick<WeaponDef, "rarity" | "availability">>
): WeaponDef {
  return {
    rarity: definition.rarity ?? DEFAULT_RARITY_BY_TIER[definition.tier],
    availability: definition.availability ?? ("draft" satisfies WeaponAvailability),
    ...definition
  };
}

export function iconKey(id: WeaponId): string {
  return `weapon-icon-${id}`;
}
