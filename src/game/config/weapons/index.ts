import { WEAPON_IDS } from "../../catalog";
import type { WeaponDef, WeaponId } from "../../types";
import { BASIC_WEAPONS } from "./basic";
import { ELEMENTAL_WEAPONS } from "./elemental";
import { EXPERIMENTAL_WEAPONS } from "./experimental";
import { EXOTIC_WEAPONS } from "./exotic";
import { EXPLOSIVE_WEAPONS } from "./explosive";
import { ORBITAL_WEAPONS } from "./orbital";
import { PRECISION_WEAPONS } from "./precision";
import { SPREAD_WEAPONS } from "./spread";
import { STARTER_WEAPONS } from "./starters";

const ALL_WEAPON_DEFS: WeaponDef[] = [
  ...BASIC_WEAPONS,
  ...SPREAD_WEAPONS,
  ...ELEMENTAL_WEAPONS,
  ...PRECISION_WEAPONS,
  ...EXPLOSIVE_WEAPONS,
  ...ORBITAL_WEAPONS,
  ...EXOTIC_WEAPONS,
  ...EXPERIMENTAL_WEAPONS,
  ...STARTER_WEAPONS
];

export const WEAPON_ORDER: WeaponId[] = [...WEAPON_IDS];

export const WEAPONS = Object.fromEntries(
  ALL_WEAPON_DEFS.map((weapon) => [weapon.id, weapon])
) as Record<WeaponId, WeaponDef>;
