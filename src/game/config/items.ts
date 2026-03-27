import type { ItemDef } from "../types";

function item(definition: ItemDef): ItemDef {
  return definition;
}

export const ITEM_POOL: ItemDef[] = [
  item({
    id: "caliberBoost",
    label: "Caliber Boost",
    description: "Heavy rounds hit harder, but the kick dulls mobility.",
    accent: 0xf3a35a,
    category: "offense",
    baseRarity: "common",
    tags: ["damage"],
    pros: ["+15% damage"],
    cons: ["-4% move speed"],
    offerWeight: 1.05,
    possibleSynergies: [],
    effects: [
      { stat: "damageMultiplier", mode: "add", value: 0.15, polarity: "pro" },
      { stat: "moveSpeed", mode: "multiply", value: 0.96, polarity: "con" }
    ],
    maxStacks: 2
  }),
  item({
    id: "overpressureRounds",
    label: "Overpressure Rounds",
    description: "Amped cartridges crack armor, but the reload cycle drags.",
    accent: 0xf58a48,
    category: "offense",
    baseRarity: "uncommon",
    tags: ["damage"],
    pros: ["+18% damage"],
    cons: ["-8% attack speed"],
    offerWeight: 0.95,
    possibleSynergies: [],
    effects: [
      { stat: "damageMultiplier", mode: "add", value: 0.18, polarity: "pro" },
      { stat: "attackSpeedMultiplier", mode: "multiply", value: 0.92, polarity: "con" }
    ],
    maxStacks: 2
  }),
  item({
    id: "rapidCycle",
    label: "Rapid Cycle",
    description: "Faster cycling turns every gun snappier, at the cost of punch.",
    accent: 0xf2d36b,
    category: "offense",
    baseRarity: "common",
    tags: ["attackSpeed"],
    pros: ["+14% attack speed"],
    cons: ["-8% damage"],
    offerWeight: 1.05,
    possibleSynergies: ["droneOverclock", "vampiricBarrage"],
    effects: [
      { stat: "attackSpeedMultiplier", mode: "add", value: 0.14, polarity: "pro" },
      { stat: "damageMultiplier", mode: "multiply", value: 0.92, polarity: "con" }
    ],
    maxStacks: 3
  }),
  item({
    id: "combatStims",
    label: "Combat Stims",
    description: "Chemical tempo keeps the guns singing, but leaves aim shaky.",
    accent: 0xf0c85d,
    category: "offense",
    baseRarity: "uncommon",
    tags: ["attackSpeed", "crit"],
    pros: ["+12% attack speed"],
    cons: ["-6% crit chance"],
    offerWeight: 0.92,
    possibleSynergies: ["droneOverclock", "vampiricBarrage"],
    effects: [
      { stat: "attackSpeedMultiplier", mode: "add", value: 0.12, polarity: "pro" },
      { stat: "critChance", mode: "add", value: 0.06, polarity: "con" }
    ],
    maxStacks: 3
  }),
  item({
    id: "steadyAim",
    label: "Steady Aim",
    description: "Breathing control raises crit consistency, but lowers top speed.",
    accent: 0xf0e6a4,
    category: "offense",
    baseRarity: "common",
    tags: ["crit", "precision"],
    pros: ["+7% crit chance"],
    cons: ["-6% move speed"],
    offerWeight: 0.98,
    possibleSynergies: ["critStorm"],
    effects: [
      { stat: "critChance", mode: "add", value: 0.07, polarity: "pro" },
      { stat: "moveSpeed", mode: "multiply", value: 0.94, polarity: "con" }
    ],
    maxStacks: 2
  }),
  item({
    id: "killScope",
    label: "Kill Scope",
    description: "Glass-clear sightlines turn hits lethal, but spread widens when rushed.",
    accent: 0xf7efb8,
    category: "offense",
    baseRarity: "rare",
    tags: ["crit", "spread"],
    pros: ["+9% crit chance"],
    cons: ["+12% spread"],
    offerWeight: 0.82,
    possibleSynergies: ["critStorm"],
    effects: [
      { stat: "critChance", mode: "add", value: 0.09, polarity: "pro" },
      { stat: "spreadMultiplier", mode: "multiply", value: 1.12, polarity: "con" }
    ],
    maxStacks: 2
  }),
  item({
    id: "deadlyFocus",
    label: "Deadly Focus",
    description: "High-pressure focus multiplies crit damage, but normal rounds lose edge.",
    accent: 0xffd092,
    category: "offense",
    baseRarity: "uncommon",
    tags: ["crit", "damage"],
    pros: ["+25% crit damage"],
    cons: ["-6% damage"],
    offerWeight: 0.88,
    possibleSynergies: ["critStorm"],
    effects: [
      { stat: "critDamageMultiplier", mode: "add", value: 0.25, polarity: "pro" },
      { stat: "damageMultiplier", mode: "multiply", value: 0.94, polarity: "con" }
    ],
    maxStacks: 2
  }),
  item({
    id: "executionProtocol",
    label: "Execution Protocol",
    description: "Finisher heuristics sharpen crit damage, but shred your regen pace.",
    accent: 0xffbc82,
    category: "offense",
    baseRarity: "rare",
    tags: ["crit", "regen"],
    pros: ["+28% crit damage"],
    cons: ["-0.3 regen/s"],
    offerWeight: 0.72,
    possibleSynergies: ["critStorm"],
    effects: [
      { stat: "critDamageMultiplier", mode: "add", value: 0.28, polarity: "pro" },
      { stat: "regenPerSecond", mode: "add", value: 0.3, polarity: "con" }
    ],
    maxStacks: 2
  }),
  item({
    id: "dashStride",
    label: "Dash Stride",
    description: "Footwork drills boost speed, but reduce armor discipline.",
    accent: 0x94e2bf,
    category: "utility",
    baseRarity: "common",
    tags: ["move"],
    pros: ["+9% move speed"],
    cons: ["-1 armor"],
    offerWeight: 1.02,
    possibleSynergies: [],
    effects: [
      { stat: "moveSpeed", mode: "multiply", value: 1.09, polarity: "pro" },
      { stat: "armor", mode: "add", value: 1, polarity: "con" }
    ],
    maxStacks: 2
  }),
  item({
    id: "fieldMobility",
    label: "Field Mobility",
    description: "Lighter kit keeps you moving, but your max HP slips.",
    accent: 0x8ed6c2,
    category: "utility",
    baseRarity: "common",
    tags: ["move", "hp"],
    pros: ["+10% move speed"],
    cons: ["-8 max HP"],
    offerWeight: 1.02,
    possibleSynergies: [],
    effects: [
      { stat: "moveSpeed", mode: "multiply", value: 1.1, polarity: "pro" },
      { stat: "maxHp", mode: "add", value: 8, polarity: "con" }
    ],
    maxStacks: 2
  }),
  item({
    id: "kineticBracing",
    label: "Kinetic Bracing",
    description: "Recoil bracing slams enemies back, but your burst narrows.",
    accent: 0x8ecfe6,
    category: "utility",
    baseRarity: "common",
    tags: ["projectile", "move"],
    pros: ["+20% knockback"],
    cons: ["-5% move speed"],
    offerWeight: 0.96,
    possibleSynergies: [],
    effects: [
      { stat: "knockbackMultiplier", mode: "add", value: 0.2, polarity: "pro" },
      { stat: "moveSpeed", mode: "multiply", value: 0.95, polarity: "con" }
    ],
    maxStacks: 2
  }),
  item({
    id: "impactHarness",
    label: "Impact Harness",
    description: "Hard-mounted recoil plates increase knockback while slowing shots.",
    accent: 0x82c4e4,
    category: "utility",
    baseRarity: "uncommon",
    tags: ["projectile", "attackSpeed"],
    pros: ["+24% knockback"],
    cons: ["-7% attack speed"],
    offerWeight: 0.84,
    possibleSynergies: [],
    effects: [
      { stat: "knockbackMultiplier", mode: "add", value: 0.24, polarity: "pro" },
      { stat: "attackSpeedMultiplier", mode: "multiply", value: 0.93, polarity: "con" }
    ],
    maxStacks: 2
  }),
  item({
    id: "magnetArray",
    label: "Magnet Array",
    description: "Vacuum coils pull XP from farther out, but increase spread.",
    accent: 0x7ad7d5,
    category: "utility",
    baseRarity: "common",
    tags: ["xp", "spread"],
    pros: ["+70 XP magnet radius"],
    cons: ["+8% spread"],
    offerWeight: 0.98,
    possibleSynergies: [],
    effects: [
      { stat: "xpMagnetRadius", mode: "add", value: 70, polarity: "pro" },
      { stat: "spreadMultiplier", mode: "multiply", value: 1.08, polarity: "con" }
    ],
    maxStacks: 2
  }),
  item({
    id: "salvageBeacon",
    label: "Salvage Beacon",
    description: "Recovery pings attract XP, but slow your movement loop.",
    accent: 0x72cec8,
    category: "utility",
    baseRarity: "uncommon",
    tags: ["xp", "move"],
    pros: ["+85 XP magnet radius"],
    cons: ["-5% move speed"],
    offerWeight: 0.86,
    possibleSynergies: [],
    effects: [
      { stat: "xpMagnetRadius", mode: "add", value: 85, polarity: "pro" },
      { stat: "moveSpeed", mode: "multiply", value: 0.95, polarity: "con" }
    ],
    maxStacks: 2
  }),
  item({
    id: "splitChamber",
    label: "Split Chamber",
    description: "A widened chamber adds a projectile but blooms the pattern.",
    accent: 0x9cc8ff,
    category: "projectile",
    baseRarity: "common",
    tags: ["projectile", "spread"],
    pros: ["+1 projectile"],
    cons: ["+14% spread"],
    offerWeight: 0.98,
    possibleSynergies: ["blastFragmentation"],
    effects: [
      { stat: "extraProjectiles", mode: "add", value: 1, polarity: "pro" },
      { stat: "spreadMultiplier", mode: "multiply", value: 1.14, polarity: "con" }
    ],
    maxStacks: 3
  }),
  item({
    id: "mirrorChamber",
    label: "Mirror Chamber",
    description: "Mirrored emitters add an extra shot and shave projectile speed.",
    accent: 0x8ebcff,
    category: "projectile",
    baseRarity: "uncommon",
    tags: ["projectile", "projectileSpeed"],
    pros: ["+1 projectile"],
    cons: ["-8% projectile speed"],
    offerWeight: 0.88,
    possibleSynergies: ["blastFragmentation"],
    effects: [
      { stat: "extraProjectiles", mode: "add", value: 1, polarity: "pro" },
      { stat: "projectileSpeedMultiplier", mode: "multiply", value: 0.92, polarity: "con" }
    ],
    maxStacks: 3
  }),
  item({
    id: "stormBarrel",
    label: "Storm Barrel",
    description: "Oversized barrel blasts an extra shot and erodes crit precision.",
    accent: 0x82b1ff,
    category: "projectile",
    baseRarity: "rare",
    tags: ["projectile", "crit"],
    pros: ["+1 projectile"],
    cons: ["-5% crit chance"],
    offerWeight: 0.74,
    possibleSynergies: ["blastFragmentation"],
    effects: [
      { stat: "extraProjectiles", mode: "add", value: 1, polarity: "pro" },
      { stat: "critChance", mode: "add", value: 0.05, polarity: "con" }
    ],
    maxStacks: 3
  }),
  item({
    id: "vectorArray",
    label: "Vector Array",
    description: "Computational targeting adds a projectile but slows fire rate.",
    accent: 0x72a4ff,
    category: "projectile",
    baseRarity: "rare",
    tags: ["projectile", "attackSpeed"],
    pros: ["+1 projectile"],
    cons: ["-6% attack speed"],
    offerWeight: 0.72,
    possibleSynergies: ["blastFragmentation"],
    effects: [
      { stat: "extraProjectiles", mode: "add", value: 1, polarity: "pro" },
      { stat: "attackSpeedMultiplier", mode: "multiply", value: 0.94, polarity: "con" }
    ],
    maxStacks: 3
  }),
  item({
    id: "hotshotPropellant",
    label: "Hotshot Propellant",
    description: "Aggressive powder speeds projectiles but increases spread.",
    accent: 0xa8deff,
    category: "projectile",
    baseRarity: "common",
    tags: ["projectileSpeed", "spread"],
    pros: ["+15% projectile speed"],
    cons: ["+10% spread"],
    offerWeight: 0.94,
    possibleSynergies: [],
    effects: [
      { stat: "projectileSpeedMultiplier", mode: "add", value: 0.15, polarity: "pro" },
      { stat: "spreadMultiplier", mode: "multiply", value: 1.1, polarity: "con" }
    ],
    maxStacks: 2
  }),
  item({
    id: "hyperBallistics",
    label: "Hyper Ballistics",
    description: "Long-range tuning accelerates shots, but cuts knockback heft.",
    accent: 0x92d4ff,
    category: "projectile",
    baseRarity: "uncommon",
    tags: ["projectileSpeed"],
    pros: ["+18% projectile speed"],
    cons: ["-10% knockback"],
    offerWeight: 0.84,
    possibleSynergies: [],
    effects: [
      { stat: "projectileSpeedMultiplier", mode: "add", value: 0.18, polarity: "pro" },
      { stat: "knockbackMultiplier", mode: "multiply", value: 0.9, polarity: "con" }
    ],
    maxStacks: 2
  }),
  item({
    id: "heavyPayload",
    label: "Heavy Payload",
    description: "Oversized rounds grow in size, but drag movement.",
    accent: 0xb6ea8d,
    category: "projectile",
    baseRarity: "common",
    tags: ["projectile", "damage"],
    pros: ["+12% projectile size"],
    cons: ["-4% move speed"],
    offerWeight: 0.96,
    possibleSynergies: [],
    effects: [
      { stat: "projectileSizeMultiplier", mode: "add", value: 0.12, polarity: "pro" },
      { stat: "moveSpeed", mode: "multiply", value: 0.96, polarity: "con" }
    ],
    maxStacks: 2
  }),
  item({
    id: "densePayload",
    label: "Dense Payload",
    description: "Dense munitions grow round size, but reduce projectile speed.",
    accent: 0xa9de80,
    category: "projectile",
    baseRarity: "uncommon",
    tags: ["projectile"],
    pros: ["+14% projectile size"],
    cons: ["-7% projectile speed"],
    offerWeight: 0.82,
    possibleSynergies: [],
    effects: [
      { stat: "projectileSizeMultiplier", mode: "add", value: 0.14, polarity: "pro" },
      { stat: "projectileSpeedMultiplier", mode: "multiply", value: 0.93, polarity: "con" }
    ],
    maxStacks: 2
  }),
  item({
    id: "tungstenCore",
    label: "Tungsten Core",
    description: "Piercing rounds punch through targets, but bounce is lost.",
    accent: 0xc6d9ff,
    category: "projectile",
    baseRarity: "rare",
    tags: ["pierce"],
    pros: ["+1 pierce"],
    cons: ["-1 bounce"],
    offerWeight: 0.68,
    possibleSynergies: ["piercingRicochet"],
    effects: [
      { stat: "projectilePierce", mode: "add", value: 1, polarity: "pro" },
      { stat: "projectileBounce", mode: "add", value: 1, polarity: "con" }
    ],
    maxStacks: 2
  }),
  item({
    id: "railCore",
    label: "Rail Core",
    description: "Rail-lined rounds pierce deeper, but max HP suffers.",
    accent: 0xb4ccff,
    category: "projectile",
    baseRarity: "rare",
    tags: ["pierce", "precision"],
    pros: ["+1 pierce"],
    cons: ["-10 max HP"],
    offerWeight: 0.66,
    possibleSynergies: ["piercingRicochet"],
    effects: [
      { stat: "projectilePierce", mode: "add", value: 1, polarity: "pro" },
      { stat: "maxHp", mode: "add", value: 10, polarity: "con" }
    ],
    maxStacks: 2
  }),
  item({
    id: "ricochetMesh",
    label: "Ricochet Mesh",
    description: "Deflection mesh adds bounce, but rounds lose stability.",
    accent: 0x9bd5ff,
    category: "projectile",
    baseRarity: "rare",
    tags: ["bounce"],
    pros: ["+1 bounce"],
    cons: ["-8% damage"],
    offerWeight: 0.7,
    possibleSynergies: ["toxicRicochet", "piercingRicochet"],
    effects: [
      { stat: "projectileBounce", mode: "add", value: 1, polarity: "pro" },
      { stat: "damageMultiplier", mode: "multiply", value: 0.92, polarity: "con" }
    ],
    maxStacks: 1
  }),
  item({
    id: "tightFormation",
    label: "Tight Formation",
    description: "Disciplined spacing narrows spread but slows your stride.",
    accent: 0x7fb7ff,
    category: "projectile",
    baseRarity: "common",
    tags: ["spread"],
    pros: ["-10% spread"],
    cons: ["-5% move speed"],
    offerWeight: 0.94,
    possibleSynergies: [],
    effects: [
      { stat: "spreadMultiplier", mode: "multiply", value: 0.9, polarity: "pro" },
      { stat: "moveSpeed", mode: "multiply", value: 0.95, polarity: "con" }
    ],
    maxStacks: 2
  }),
  item({
    id: "reservePlating",
    label: "Reserve Plating",
    description: "Extra plating gives you HP, but saps mobility.",
    accent: 0xe18f8f,
    category: "survivability",
    baseRarity: "common",
    tags: ["hp", "survival"],
    pros: ["+18 max HP"],
    cons: ["-5% move speed"],
    offerWeight: 1,
    possibleSynergies: [],
    effects: [
      { stat: "maxHp", mode: "add", value: 18, polarity: "pro" },
      { stat: "moveSpeed", mode: "multiply", value: 0.95, polarity: "con" }
    ],
    maxStacks: 2
  }),
  item({
    id: "fortifiedFrame",
    label: "Fortified Frame",
    description: "A reinforced chassis bulks your HP while widening your spread.",
    accent: 0xd88383,
    category: "survivability",
    baseRarity: "uncommon",
    tags: ["hp", "spread"],
    pros: ["+20 max HP"],
    cons: ["+10% spread"],
    offerWeight: 0.86,
    possibleSynergies: [],
    effects: [
      { stat: "maxHp", mode: "add", value: 20, polarity: "pro" },
      { stat: "spreadMultiplier", mode: "multiply", value: 1.1, polarity: "con" }
    ],
    maxStacks: 2
  }),
  item({
    id: "combatRecovery",
    label: "Combat Recovery",
    description: "Field repair kits boost regen, but shave max HP.",
    accent: 0x96d7a5,
    category: "survivability",
    baseRarity: "common",
    tags: ["regen", "survival"],
    pros: ["+0.4 regen/s"],
    cons: ["-8 max HP"],
    offerWeight: 0.96,
    possibleSynergies: [],
    effects: [
      { stat: "regenPerSecond", mode: "add", value: 0.4, polarity: "pro" },
      { stat: "maxHp", mode: "add", value: 8, polarity: "con" }
    ],
    maxStacks: 2
  }),
  item({
    id: "naniteRepair",
    label: "Nanite Repair",
    description: "Nanites patch damage over time, but lower armor density.",
    accent: 0x88cd9a,
    category: "survivability",
    baseRarity: "uncommon",
    tags: ["regen", "armor"],
    pros: ["+0.45 regen/s"],
    cons: ["-1 armor"],
    offerWeight: 0.82,
    possibleSynergies: [],
    effects: [
      { stat: "regenPerSecond", mode: "add", value: 0.45, polarity: "pro" },
      { stat: "armor", mode: "add", value: 1, polarity: "con" }
    ],
    maxStacks: 2
  }),
  item({
    id: "ceramicArmor",
    label: "Ceramic Armor",
    description: "Ceramic plating adds armor, but drags movement speed.",
    accent: 0xc4cbd8,
    category: "survivability",
    baseRarity: "common",
    tags: ["armor", "survival"],
    pros: ["+1 armor"],
    cons: ["-6% move speed"],
    offerWeight: 0.94,
    possibleSynergies: [],
    effects: [
      { stat: "armor", mode: "add", value: 1, polarity: "pro" },
      { stat: "moveSpeed", mode: "multiply", value: 0.94, polarity: "con" }
    ],
    maxStacks: 3
  }),
  item({
    id: "bulwarkArmor",
    label: "Bulwark Armor",
    description: "Bulky armor adds protection, but reduces attack speed.",
    accent: 0xb7becb,
    category: "survivability",
    baseRarity: "uncommon",
    tags: ["armor"],
    pros: ["+1 armor"],
    cons: ["-6% attack speed"],
    offerWeight: 0.84,
    possibleSynergies: [],
    effects: [
      { stat: "armor", mode: "add", value: 1, polarity: "pro" },
      { stat: "attackSpeedMultiplier", mode: "multiply", value: 0.94, polarity: "con" }
    ],
    maxStacks: 3
  }),
  item({
    id: "shieldCapacitor",
    label: "Shield Capacitor",
    description: "Stored charge grants a shield, but your damage output dips.",
    accent: 0x99c8ff,
    category: "survivability",
    baseRarity: "rare",
    tags: ["shield", "survival"],
    pros: ["+1 shield charge"],
    cons: ["-5% damage"],
    offerWeight: 0.7,
    possibleSynergies: [],
    effects: [
      { stat: "maxShieldCharges", mode: "add", value: 1, polarity: "pro" },
      { stat: "damageMultiplier", mode: "multiply", value: 0.95, polarity: "con" }
    ],
    maxStacks: 2
  }),
  item({
    id: "shieldRelay",
    label: "Shield Relay",
    description: "Reactive relays add shielding, but your HP ceiling falls.",
    accent: 0x8ebcff,
    category: "survivability",
    baseRarity: "rare",
    tags: ["shield", "hp"],
    pros: ["+1 shield charge"],
    cons: ["-10 max HP"],
    offerWeight: 0.66,
    possibleSynergies: [],
    effects: [
      { stat: "maxShieldCharges", mode: "add", value: 1, polarity: "pro" },
      { stat: "maxHp", mode: "add", value: 10, polarity: "con" }
    ],
    maxStacks: 2
  }),
  item({
    id: "vampiricRounds",
    label: "Vampiric Rounds",
    description: "Blood-fed rounds heal you, but max HP shrinks slightly.",
    accent: 0xf2828e,
    category: "special",
    baseRarity: "rare",
    tags: ["lifesteal", "survival"],
    pros: ["+3% lifesteal"],
    cons: ["-10 max HP"],
    offerWeight: 0.68,
    possibleSynergies: ["vampiricBarrage"],
    effects: [
      { stat: "lifeSteal", mode: "add", value: 0.03, polarity: "pro" },
      { stat: "maxHp", mode: "add", value: 10, polarity: "con" }
    ],
    maxStacks: 1
  }),
  item({
    id: "volatileHarvest",
    label: "Volatile Harvest",
    description: "Kills erupt in blasts, but your armor plating runs thin.",
    accent: 0xffb063,
    category: "special",
    baseRarity: "rare",
    tags: ["explosive"],
    pros: ["Kills explode for 2 damage in 32 px"],
    cons: ["-1 armor"],
    offerWeight: 0.7,
    possibleSynergies: ["fireExplosion", "blastFragmentation"],
    effects: [
      { stat: "explosionRadius", mode: "add", value: 32, polarity: "pro" },
      { stat: "explosionDamage", mode: "add", value: 2, polarity: "pro" },
      { stat: "armor", mode: "add", value: 1, polarity: "con" }
    ],
    maxStacks: 1
  }),
  item({
    id: "incendiaryPayload",
    label: "Incendiary Payload",
    description: "Rounds ignite targets, but projectile speed drops.",
    accent: 0xff8a52,
    category: "special",
    baseRarity: "rare",
    tags: ["fire"],
    pros: ["Burn for 4 DPS over 2s"],
    cons: ["-8% projectile speed"],
    offerWeight: 0.68,
    possibleSynergies: ["fireExplosion", "toxicFirestorm"],
    effects: [
      { stat: "fireDps", mode: "add", value: 4, polarity: "pro" },
      { stat: "fireDurationMs", mode: "add", value: 2000, polarity: "pro" },
      { stat: "projectileSpeedMultiplier", mode: "multiply", value: 0.92, polarity: "con" }
    ],
    maxStacks: 1
  }),
  item({
    id: "neurotoxinCoating",
    label: "Neurotoxin Coating",
    description: "Poison edges whittle enemies down, but immediate damage slips.",
    accent: 0x7fd26b,
    category: "special",
    baseRarity: "rare",
    tags: ["poison"],
    pros: ["Poison for 2 DPS over 4s"],
    cons: ["-8% damage"],
    offerWeight: 0.68,
    possibleSynergies: ["toxicRicochet", "toxicFirestorm"],
    effects: [
      { stat: "poisonDps", mode: "add", value: 2, polarity: "pro" },
      { stat: "poisonDurationMs", mode: "add", value: 4000, polarity: "pro" },
      { stat: "damageMultiplier", mode: "multiply", value: 0.92, polarity: "con" }
    ],
    maxStacks: 1
  }),
  item({
    id: "arcNetwork",
    label: "Arc Network",
    description: "Arc relays trigger chain lightning, but stability drops.",
    accent: 0x87dfff,
    category: "special",
    baseRarity: "epic",
    tags: ["lightning"],
    pros: ["20% chance to chain for 50% damage"],
    cons: ["+10% spread"],
    offerWeight: 0.5,
    possibleSynergies: ["critStorm"],
    effects: [
      { stat: "chainLightningChance", mode: "add", value: 0.2, polarity: "pro" },
      { stat: "chainLightningTargets", mode: "add", value: 2, polarity: "pro" },
      { stat: "chainLightningDamageMultiplier", mode: "add", value: 0.5, polarity: "pro" },
      { stat: "spreadMultiplier", mode: "multiply", value: 1.1, polarity: "con" }
    ],
    maxStacks: 1
  }),
  item({
    id: "guardianDrone",
    label: "Guardian Drone",
    description: "One orbiting drone joins the run, but your fire rate drops slightly.",
    accent: 0xc1e9ff,
    category: "special",
    baseRarity: "epic",
    tags: ["drone", "orbital"],
    pros: ["Deploy 1 drone"],
    cons: ["-6% attack speed"],
    offerWeight: 0.48,
    possibleSynergies: ["droneOverclock"],
    effects: [
      { stat: "droneCount", mode: "add", value: 1, polarity: "pro" },
      { stat: "attackSpeedMultiplier", mode: "multiply", value: 0.94, polarity: "con" }
    ],
    maxStacks: 1
  }),
  item({
    id: "glassAmplifier",
    label: "Glass Amplifier",
    description: "The glass core massively boosts damage at a survivability cost.",
    accent: 0xffd39c,
    category: "offense",
    baseRarity: "epic",
    tags: ["damage", "crit"],
    pros: ["+24% damage", "+18% crit damage"],
    cons: ["-18 max HP"],
    offerWeight: 0.42,
    possibleSynergies: ["critStorm"],
    effects: [
      { stat: "damageMultiplier", mode: "add", value: 0.24, polarity: "pro" },
      { stat: "critDamageMultiplier", mode: "add", value: 0.18, polarity: "pro" },
      { stat: "maxHp", mode: "add", value: 18, polarity: "con" }
    ],
    maxStacks: 1
  }),
  item({
    id: "steelToes",
    label: "Steel Toes",
    description: "Weighted boots add speed and knockback, but cost attack tempo.",
    accent: 0x8fd1c4,
    category: "utility",
    baseRarity: "uncommon",
    tags: ["move"],
    pros: ["+12% move speed", "+12% knockback"],
    cons: ["-6% attack speed"],
    offerWeight: 0.78,
    possibleSynergies: [],
    effects: [
      { stat: "moveSpeed", mode: "multiply", value: 1.12, polarity: "pro" },
      { stat: "knockbackMultiplier", mode: "add", value: 0.12, polarity: "pro" },
      { stat: "attackSpeedMultiplier", mode: "multiply", value: 0.94, polarity: "con" }
    ],
    maxStacks: 2
  }),
  item({
    id: "bloodBattery",
    label: "Blood Battery",
    description: "Leech power boosts sustain and fire, but armor falls away.",
    accent: 0xf08d96,
    category: "special",
    baseRarity: "epic",
    tags: ["lifesteal", "attackSpeed"],
    pros: ["+3% lifesteal", "+8% attack speed"],
    cons: ["-2 armor"],
    offerWeight: 0.4,
    possibleSynergies: ["vampiricBarrage"],
    effects: [
      { stat: "lifeSteal", mode: "add", value: 0.03, polarity: "pro" },
      { stat: "attackSpeedMultiplier", mode: "add", value: 0.08, polarity: "pro" },
      { stat: "armor", mode: "add", value: 2, polarity: "con" }
    ],
    maxStacks: 1
  }),
  item({
    id: "recoilEngine",
    label: "Recoil Engine",
    description: "Powered recoil gives speed and shot velocity, but worsens spread.",
    accent: 0x97d8ff,
    category: "projectile",
    baseRarity: "uncommon",
    tags: ["projectileSpeed", "move"],
    pros: ["+12% projectile speed", "+6% move speed"],
    cons: ["+12% spread"],
    offerWeight: 0.76,
    possibleSynergies: [],
    effects: [
      { stat: "projectileSpeedMultiplier", mode: "add", value: 0.12, polarity: "pro" },
      { stat: "moveSpeed", mode: "multiply", value: 1.06, polarity: "pro" },
      { stat: "spreadMultiplier", mode: "multiply", value: 1.12, polarity: "con" }
    ],
    maxStacks: 2
  }),
  item({
    id: "phaseCatalyst",
    label: "Phase Catalyst",
    description: "Unstable catalyst accelerates XP flow while reducing raw damage.",
    accent: 0x7ddcca,
    category: "utility",
    baseRarity: "rare",
    tags: ["xp", "damage"],
    pros: ["+90 XP magnet radius", "+0.25 regen/s"],
    cons: ["-10% damage"],
    offerWeight: 0.54,
    possibleSynergies: [],
    effects: [
      { stat: "xpMagnetRadius", mode: "add", value: 90, polarity: "pro" },
      { stat: "regenPerSecond", mode: "add", value: 0.25, polarity: "pro" },
      { stat: "damageMultiplier", mode: "multiply", value: 0.9, polarity: "con" }
    ],
    maxStacks: 1
  }),
  item({
    id: "fortunaCache",
    label: "Fortuna Cache",
    description: "Risk-laced lucky hardware spikes crits, but lowers projectile count.",
    accent: 0xffd888,
    category: "offense",
    baseRarity: "rare",
    tags: ["crit", "projectile"],
    pros: ["+10% crit chance", "+20% crit damage"],
    cons: ["-1 projectile"],
    offerWeight: 0.46,
    possibleSynergies: ["critStorm"],
    effects: [
      { stat: "critChance", mode: "add", value: 0.1, polarity: "pro" },
      { stat: "critDamageMultiplier", mode: "add", value: 0.2, polarity: "pro" },
      { stat: "extraProjectiles", mode: "add", value: 1, polarity: "con" }
    ],
    maxStacks: 1
  }),
  item({
    id: "stasisShell",
    label: "Stasis Shell",
    description: "A cold shell grants armor and shielding, but mobility collapses.",
    accent: 0xb8d8ff,
    category: "survivability",
    baseRarity: "epic",
    tags: ["armor", "shield"],
    pros: ["+2 armor", "+1 shield charge"],
    cons: ["-10% move speed"],
    offerWeight: 0.4,
    possibleSynergies: [],
    effects: [
      { stat: "armor", mode: "add", value: 2, polarity: "pro" },
      { stat: "maxShieldCharges", mode: "add", value: 1, polarity: "pro" },
      { stat: "moveSpeed", mode: "multiply", value: 0.9, polarity: "con" }
    ],
    maxStacks: 1
  }),
  item({
    id: "overclockedCore",
    label: "Overclocked Core",
    description: "A dangerous core supercharges multiple systems at clear risk.",
    accent: 0xffb772,
    category: "special",
    baseRarity: "legendary",
    tags: ["damage", "attackSpeed", "projectile"],
    pros: ["+18% damage", "+12% attack speed", "+1 projectile"],
    cons: ["-18 max HP", "+16% spread"],
    offerWeight: 0.18,
    possibleSynergies: ["blastFragmentation", "critStorm"],
    effects: [
      { stat: "damageMultiplier", mode: "add", value: 0.18, polarity: "pro" },
      { stat: "attackSpeedMultiplier", mode: "add", value: 0.12, polarity: "pro" },
      { stat: "extraProjectiles", mode: "add", value: 1, polarity: "pro" },
      { stat: "maxHp", mode: "add", value: 18, polarity: "con" },
      { stat: "spreadMultiplier", mode: "multiply", value: 1.16, polarity: "con" }
    ],
    maxStacks: 1
  })
];

export const ITEM_BY_ID = Object.fromEntries(ITEM_POOL.map((entry) => [entry.id, entry])) as Record<ItemDef["id"], ItemDef>;
