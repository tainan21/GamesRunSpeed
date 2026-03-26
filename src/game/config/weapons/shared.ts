import type { WeaponDef, WeaponId } from "../../types";

export function defineWeapon(definition: WeaponDef): WeaponDef {
  return definition;
}

export function iconKey(id: WeaponId): string {
  return `weapon-icon-${id}`;
}
