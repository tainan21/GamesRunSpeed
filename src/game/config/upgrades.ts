import type { UpgradeDef } from "../types";

function upgrade(definition: UpgradeDef): UpgradeDef {
  return definition;
}

export const UPGRADE_POOL: UpgradeDef[] = [
  upgrade({ id: "caliberBoost", label: "Caliber Boost", description: "+15% damage.", accent: 0xf3a35a, category: "offense", effects: [{ stat: "damageMultiplier", mode: "add", value: 0.15 }] }),
  upgrade({ id: "overpressureRounds", label: "Overpressure Rounds", description: "+15% damage.", accent: 0xf58a48, category: "offense", effects: [{ stat: "damageMultiplier", mode: "add", value: 0.15 }] }),
  upgrade({ id: "rapidCycle", label: "Rapid Cycle", description: "+12% attack speed.", accent: 0xf2d36b, category: "offense", effects: [{ stat: "attackSpeedMultiplier", mode: "add", value: 0.12 }] }),
  upgrade({ id: "combatStims", label: "Combat Stims", description: "+12% attack speed.", accent: 0xf0c85d, category: "offense", effects: [{ stat: "attackSpeedMultiplier", mode: "add", value: 0.12 }] }),
  upgrade({ id: "steadyAim", label: "Steady Aim", description: "+7% critical chance.", accent: 0xf0e6a4, category: "offense", effects: [{ stat: "critChance", mode: "add", value: 0.07 }] }),
  upgrade({ id: "killScope", label: "Kill Scope", description: "+7% critical chance.", accent: 0xf7efb8, category: "offense", effects: [{ stat: "critChance", mode: "add", value: 0.07 }] }),
  upgrade({ id: "deadlyFocus", label: "Deadly Focus", description: "+25% critical damage.", accent: 0xffd092, category: "offense", effects: [{ stat: "critDamageMultiplier", mode: "add", value: 0.25 }] }),
  upgrade({ id: "executionProtocol", label: "Execution Protocol", description: "+25% critical damage.", accent: 0xffbc82, category: "offense", effects: [{ stat: "critDamageMultiplier", mode: "add", value: 0.25 }] }),
  upgrade({ id: "dashStride", label: "Dash Stride", description: "+8% movement speed.", accent: 0x94e2bf, category: "utility", effects: [{ stat: "moveSpeed", mode: "multiply", value: 1.08 }] }),
  upgrade({ id: "fieldMobility", label: "Field Mobility", description: "+8% movement speed.", accent: 0x8ed6c2, category: "utility", effects: [{ stat: "moveSpeed", mode: "multiply", value: 1.08 }] }),
  upgrade({ id: "kineticBracing", label: "Kinetic Bracing", description: "+20% knockback.", accent: 0x8ecfe6, category: "utility", effects: [{ stat: "knockbackMultiplier", mode: "add", value: 0.2 }] }),
  upgrade({ id: "impactHarness", label: "Impact Harness", description: "+20% knockback.", accent: 0x82c4e4, category: "utility", effects: [{ stat: "knockbackMultiplier", mode: "add", value: 0.2 }] }),
  upgrade({ id: "magnetArray", label: "Magnet Array", description: "XP orbs drift in from farther away.", accent: 0x7ad7d5, category: "utility", effects: [{ stat: "xpMagnetRadius", mode: "add", value: 70 }] }),
  upgrade({ id: "salvageBeacon", label: "Salvage Beacon", description: "XP magnet radius +70.", accent: 0x72cec8, category: "utility", effects: [{ stat: "xpMagnetRadius", mode: "add", value: 70 }] }),
  upgrade({ id: "splitChamber", label: "Split Chamber", description: "+1 projectile.", accent: 0x9cc8ff, category: "projectile", effects: [{ stat: "extraProjectiles", mode: "add", value: 1 }] }),
  upgrade({ id: "mirrorChamber", label: "Mirror Chamber", description: "+1 projectile.", accent: 0x8ebcff, category: "projectile", effects: [{ stat: "extraProjectiles", mode: "add", value: 1 }] }),
  upgrade({ id: "stormBarrel", label: "Storm Barrel", description: "+1 projectile.", accent: 0x82b1ff, category: "projectile", effects: [{ stat: "extraProjectiles", mode: "add", value: 1 }] }),
  upgrade({ id: "vectorArray", label: "Vector Array", description: "+1 projectile.", accent: 0x72a4ff, category: "projectile", effects: [{ stat: "extraProjectiles", mode: "add", value: 1 }] }),
  upgrade({ id: "hotshotPropellant", label: "Hotshot Propellant", description: "+15% projectile speed.", accent: 0xa8deff, category: "projectile", effects: [{ stat: "projectileSpeedMultiplier", mode: "add", value: 0.15 }] }),
  upgrade({ id: "hyperBallistics", label: "Hyper Ballistics", description: "+15% projectile speed.", accent: 0x92d4ff, category: "projectile", effects: [{ stat: "projectileSpeedMultiplier", mode: "add", value: 0.15 }] }),
  upgrade({ id: "heavyPayload", label: "Heavy Payload", description: "+12% projectile size.", accent: 0xb6ea8d, category: "projectile", effects: [{ stat: "projectileSizeMultiplier", mode: "add", value: 0.12 }] }),
  upgrade({ id: "densePayload", label: "Dense Payload", description: "+12% projectile size.", accent: 0xa9de80, category: "projectile", effects: [{ stat: "projectileSizeMultiplier", mode: "add", value: 0.12 }] }),
  upgrade({ id: "tungstenCore", label: "Tungsten Core", description: "+1 projectile pierce.", accent: 0xc6d9ff, category: "projectile", effects: [{ stat: "projectilePierce", mode: "add", value: 1 }] }),
  upgrade({ id: "railCore", label: "Rail Core", description: "+1 projectile pierce.", accent: 0xb4ccff, category: "projectile", effects: [{ stat: "projectilePierce", mode: "add", value: 1 }] }),
  upgrade({ id: "ricochetMesh", label: "Ricochet Mesh", description: "+1 projectile bounce.", accent: 0x9bd5ff, category: "projectile", effects: [{ stat: "projectileBounce", mode: "add", value: 1 }] }),
  upgrade({ id: "tightFormation", label: "Tight Formation", description: "-10% spread.", accent: 0x7fb7ff, category: "projectile", effects: [{ stat: "spreadMultiplier", mode: "multiply", value: 0.9 }] }),
  upgrade({ id: "reservePlating", label: "Reserve Plating", description: "+18 max HP.", accent: 0xe18f8f, category: "survivability", effects: [{ stat: "maxHp", mode: "add", value: 18 }] }),
  upgrade({ id: "fortifiedFrame", label: "Fortified Frame", description: "+18 max HP.", accent: 0xd88383, category: "survivability", effects: [{ stat: "maxHp", mode: "add", value: 18 }] }),
  upgrade({ id: "combatRecovery", label: "Combat Recovery", description: "+0.4 HP regeneration.", accent: 0x96d7a5, category: "survivability", effects: [{ stat: "regenPerSecond", mode: "add", value: 0.4 }] }),
  upgrade({ id: "naniteRepair", label: "Nanite Repair", description: "+0.4 HP regeneration.", accent: 0x88cd9a, category: "survivability", effects: [{ stat: "regenPerSecond", mode: "add", value: 0.4 }] }),
  upgrade({ id: "ceramicArmor", label: "Ceramic Armor", description: "+1 armor.", accent: 0xc4cbd8, category: "survivability", effects: [{ stat: "armor", mode: "add", value: 1 }] }),
  upgrade({ id: "bulwarkArmor", label: "Bulwark Armor", description: "+1 armor.", accent: 0xb7becb, category: "survivability", effects: [{ stat: "armor", mode: "add", value: 1 }] }),
  upgrade({ id: "shieldCapacitor", label: "Shield Capacitor", description: "+1 shield charge.", accent: 0x99c8ff, category: "survivability", effects: [{ stat: "maxShieldCharges", mode: "add", value: 1 }] }),
  upgrade({ id: "shieldRelay", label: "Shield Relay", description: "+1 shield charge.", accent: 0x8ebcff, category: "survivability", effects: [{ stat: "maxShieldCharges", mode: "add", value: 1 }] }),
  upgrade({ id: "vampiricRounds", label: "Vampiric Rounds", description: "Heal for 3% of damage dealt.", accent: 0xf2828e, category: "special", effects: [{ stat: "lifeSteal", mode: "add", value: 0.03 }] }),
  upgrade({ id: "volatileHarvest", label: "Volatile Harvest", description: "Enemies explode on kill.", accent: 0xffb063, category: "special", effects: [{ stat: "explosionRadius", mode: "add", value: 32 }, { stat: "explosionDamage", mode: "add", value: 2 }] }),
  upgrade({ id: "incendiaryPayload", label: "Incendiary Payload", description: "Apply 4 DPS burn for 2s.", accent: 0xff8a52, category: "special", effects: [{ stat: "fireDps", mode: "add", value: 4 }, { stat: "fireDurationMs", mode: "add", value: 2000 }] }),
  upgrade({ id: "neurotoxinCoating", label: "Neurotoxin Coating", description: "Apply 2 DPS poison for 4s.", accent: 0x7fd26b, category: "special", effects: [{ stat: "poisonDps", mode: "add", value: 2 }, { stat: "poisonDurationMs", mode: "add", value: 4000 }] }),
  upgrade({ id: "arcNetwork", label: "Arc Network", description: "20% chance to chain lightning to 2 nearby enemies.", accent: 0x87dfff, category: "special", effects: [{ stat: "chainLightningChance", mode: "add", value: 0.2 }, { stat: "chainLightningTargets", mode: "add", value: 2 }, { stat: "chainLightningDamageMultiplier", mode: "add", value: 0.5 }] }),
  upgrade({ id: "guardianDrone", label: "Guardian Drone", description: "Deploy one orbiting drone.", accent: 0xc1e9ff, category: "special", effects: [{ stat: "droneCount", mode: "add", value: 1 }] })
];

export const UPGRADE_BY_ID = Object.fromEntries(
  UPGRADE_POOL.map((upgradeDef) => [upgradeDef.id, upgradeDef])
) as Record<UpgradeDef["id"], UpgradeDef>;
