import { BOSS_IDS } from "../../catalog";
import type { BossDef, BossId } from "../../types";
import { CHRONO_BEAST } from "./chronoBeast";
import { FINAL_WARDEN } from "./finalWarden";
import { INFERNO_CORE } from "./infernoCore";
import { IRON_COLOSSUS } from "./ironColossus";
import { ORBITAL_TYRANT } from "./orbitalTyrant";
import { STORM_BRINGER } from "./stormBringer";
import { STORM_HYDRA } from "./stormHydra";
import { TITAN } from "./titan";
import { VENOM_QUEEN } from "./venomQueen";
import { VOID_PHANTOM } from "./voidPhantom";

export const BOSS_ORDER: BossId[] = [...BOSS_IDS];

const ALL_BOSSES: BossDef[] = [
  TITAN,
  STORM_BRINGER,
  INFERNO_CORE,
  VENOM_QUEEN,
  IRON_COLOSSUS,
  VOID_PHANTOM,
  CHRONO_BEAST,
  STORM_HYDRA,
  ORBITAL_TYRANT,
  FINAL_WARDEN
];

export const BOSSES = Object.fromEntries(ALL_BOSSES.map((boss) => [boss.id, boss])) as Record<BossId, BossDef>;
