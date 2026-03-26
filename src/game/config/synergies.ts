import type { SynergyDef } from "../types";

function synergy(definition: SynergyDef): SynergyDef {
  return definition;
}

export const SYNERGY_POOL: SynergyDef[] = [
  synergy({
    id: "fireExplosion",
    label: "Fire Explosion",
    description: "Explosions ignite nearby enemies.",
    requires: [["incendiaryPayload"], ["volatileHarvest"]],
    accent: 0xff945e
  }),
  synergy({
    id: "toxicRicochet",
    label: "Toxic Ricochet",
    description: "Ricochets spread poison on impact.",
    requires: [["neurotoxinCoating"], ["ricochetMesh"]],
    accent: 0x9ae071
  }),
  synergy({
    id: "critStorm",
    label: "Crit Storm",
    description: "Critical focus intensifies lightning arcs.",
    requires: [["arcNetwork"], ["steadyAim", "killScope"]],
    accent: 0x92e7ff
  }),
  synergy({
    id: "droneOverclock",
    label: "Drone Overclock",
    description: "Attack-speed upgrades supercharge drones.",
    requires: [["guardianDrone"], ["rapidCycle", "combatStims"]],
    accent: 0xc7efff
  }),
  synergy({
    id: "piercingRicochet",
    label: "Piercing Ricochet",
    description: "Piercing rounds rebound with extra momentum.",
    requires: [["tungstenCore", "railCore"], ["ricochetMesh"]],
    accent: 0xb8ceff
  }),
  synergy({
    id: "vampiricBarrage",
    label: "Vampiric Barrage",
    description: "Rapid fire amplifies life-steal sustain.",
    requires: [["vampiricRounds"], ["rapidCycle", "combatStims"]],
    accent: 0xf59aa3
  }),
  synergy({
    id: "blastFragmentation",
    label: "Blast Fragmentation",
    description: "Explosions scatter extra fragments on kill.",
    requires: [["volatileHarvest"], ["splitChamber", "mirrorChamber", "stormBarrel", "vectorArray"]],
    accent: 0xffc578
  }),
  synergy({
    id: "toxicFirestorm",
    label: "Toxic Firestorm",
    description: "Fire and poison combine into a brutal damage field.",
    requires: [["incendiaryPayload"], ["neurotoxinCoating"]],
    accent: 0xd2b56c
  })
];

export const SYNERGY_BY_ID = Object.fromEntries(
  SYNERGY_POOL.map((entry) => [entry.id, entry])
) as Record<SynergyDef["id"], SynergyDef>;
