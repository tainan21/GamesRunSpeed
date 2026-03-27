import { CHARACTERS } from "./characters";
import { ITEM_BY_ID } from "./config/items";
import { ITEM_RARITIES } from "./config/rarity";
import { BASE_PLAYER_STATS } from "./config/player";
import { WEAPON_RARITIES } from "./config/weaponRarity";
import { WEAPONS } from "./config/weapons";
import type {
  CharacterDef,
  CharacterId,
  DerivedRunStats,
  DominantTag,
  DominantTagEntry,
  EquippedWeapon,
  ItemDef,
  ItemEffect,
  ItemId,
  ItemInstance,
  PlayerStats,
  SynergyId
} from "./types";

export function applyCharacterToStats(stats: PlayerStats, character: CharacterDef): PlayerStats {
  return character.passiveEffects.reduce(
    (workingStats, effect) => applyItemEffect(workingStats, effect, 1, 1),
    stats
  );
}

function applyItemEffect(stats: PlayerStats, effect: ItemEffect, positiveScale: number, negativeScale: number): PlayerStats {
  const currentValue = stats[effect.stat];
  const numericValue = typeof currentValue === "number" ? currentValue : 0;

  if (effect.mode === "add") {
    const modifier = effect.value * (effect.polarity === "pro" ? positiveScale : -negativeScale);
    return {
      ...stats,
      [effect.stat]: numericValue + modifier
    };
  }

  if (effect.polarity === "pro") {
    return {
      ...stats,
      [effect.stat]: numericValue * (1 + (effect.value - 1) * positiveScale)
    };
  }

  return {
    ...stats,
    [effect.stat]: numericValue * Math.max(0.05, 1 - (1 - effect.value) * negativeScale)
  };
}

export function getItemStacks(items: ItemInstance[]): Partial<Record<ItemId, number>> {
  return items.reduce<Partial<Record<ItemId, number>>>((acc, item) => {
    acc[item.id] = (acc[item.id] ?? 0) + 1;
    return acc;
  }, {});
}

export function getOwnedItemIds(items: ItemInstance[]): ItemId[] {
  return [...new Set(items.map((item) => item.id))];
}

export function getDominantBuildTags(items: ItemInstance[], equippedWeapons: EquippedWeapon[]): DominantTagEntry[] {
  const counts = new Map<DominantTag, number>();

  for (const item of items) {
    for (const tag of ITEM_BY_ID[item.id].tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 2);
    }
  }

  for (const equipped of equippedWeapons) {
    const weapon = WEAPONS[equipped.weaponId];
    counts.set(weapon.family, (counts.get(weapon.family as DominantTag) ?? 0) + 1);
    for (const tag of weapon.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));
}

export function estimateBuildPower(stats: PlayerStats, equippedWeapons: EquippedWeapon[]): number {
  const weaponPressure = equippedWeapons.reduce((sum, equipped) => {
    const weapon = WEAPONS[equipped.weaponId];
    const cadence = Math.max(0.2, 1000 / weapon.fireRateMs);
    return sum + weapon.damage * cadence * (weapon.baseProjectiles + Math.max(0, stats.extraProjectiles) * 0.7);
  }, 0);

  const durability =
    stats.maxHp * 0.18 + stats.armor * 8 + stats.regenPerSecond * 40 + stats.maxShieldCharges * 16 + stats.dodgeChance * 120;
  const utility =
    stats.moveSpeed * 0.04 +
    stats.projectileSpeedMultiplier * 8 +
    stats.projectilePierce * 6 +
    stats.projectileBounce * 9 +
    stats.itemLuck * 14;
  const summonPressure = Math.max(0, stats.droneCount) * stats.summonDamageMultiplier * 18;

  return weaponPressure * stats.damageMultiplier * stats.attackSpeedMultiplier + durability + utility + summonPressure;
}

export function buildPlayerStats(
  selectedItems: ItemInstance[],
  character: CharacterId | CharacterDef,
  activeSynergyIds: SynergyId[] = []
): PlayerStats {
  const characterDef = typeof character === "string" ? CHARACTERS[character] : character;
  let stats = applyCharacterToStats({ ...BASE_PLAYER_STATS }, characterDef);

  for (const item of selectedItems) {
    const definition = ITEM_BY_ID[item.id];
    const rarity = ITEM_RARITIES[item.rarity];

    stats = definition.effects.reduce(
      (workingStats, effect) => applyItemEffect(workingStats, effect, rarity.positiveScale, rarity.negativeScale),
      stats
    );
  }

  if (activeSynergyIds.includes("critStorm")) {
    stats.chainLightningChance += 0.12;
    stats.chainLightningTargets += 1;
  }

  if (activeSynergyIds.includes("vampiricBarrage")) {
    stats.lifeSteal += 0.02;
    stats.attackSpeedMultiplier += 0.08;
  }

  if (activeSynergyIds.includes("toxicFirestorm")) {
    stats.fireDps += 1;
    stats.poisonDps += 1;
  }

  return {
    ...stats,
    critChance: Math.max(0, stats.critChance),
    dodgeChance: Math.max(0, Math.min(0.75, stats.dodgeChance)),
    moveSpeed: Math.max(70, stats.moveSpeed),
    projectileSpeedMultiplier: Math.max(0.45, stats.projectileSpeedMultiplier),
    spreadMultiplier: Math.max(0.45, stats.spreadMultiplier),
    maxShieldCharges: Math.max(0, Math.round(stats.maxShieldCharges)),
    projectilePierce: Math.round(stats.projectilePierce),
    projectileBounce: Math.round(stats.projectileBounce),
    extraProjectiles: Math.round(stats.extraProjectiles),
    droneCount: Math.max(0, Math.round(stats.droneCount))
  };
}

export function buildDerivedRunStats(args: {
  hp: number;
  stats: PlayerStats;
  selectedItems: ItemInstance[];
  equippedWeapons: EquippedWeapon[];
  shieldCharges: number;
}): DerivedRunStats {
  const dominantTags = getDominantBuildTags(args.selectedItems, args.equippedWeapons);
  const projectileCounts = args.equippedWeapons.map((weapon) => Math.max(1, WEAPONS[weapon.weaponId].baseProjectiles + args.stats.extraProjectiles));
  const projectileCountMin = projectileCounts.length > 0 ? Math.min(...projectileCounts) : 0;
  const projectileCountMax = projectileCounts.length > 0 ? Math.max(...projectileCounts) : 0;

  return {
    currentHp: args.hp,
    maxHp: args.stats.maxHp,
    damageMultiplier: args.stats.damageMultiplier,
    attackSpeedMultiplier: args.stats.attackSpeedMultiplier,
    critChance: args.stats.critChance,
    critDamageMultiplier: args.stats.critDamageMultiplier,
    moveSpeed: args.stats.moveSpeed,
    projectileCountMin,
    projectileCountMax,
    projectileBonus: args.stats.extraProjectiles,
    projectileSpeedMultiplier: args.stats.projectileSpeedMultiplier,
    projectileSizeMultiplier: args.stats.projectileSizeMultiplier,
    spreadMultiplier: args.stats.spreadMultiplier,
    pierce: args.stats.projectilePierce,
    bounce: args.stats.projectileBounce,
    knockbackMultiplier: args.stats.knockbackMultiplier,
    armor: args.stats.armor,
    lifesteal: args.stats.lifeSteal,
    regenPerSecond: args.stats.regenPerSecond,
    xpMagnetRadius: args.stats.xpMagnetRadius,
    dodgeChance: args.stats.dodgeChance,
    summonDamageMultiplier: args.stats.summonDamageMultiplier,
    itemLuck: args.stats.itemLuck,
    shieldCharges: args.shieldCharges,
    maxShieldCharges: args.stats.maxShieldCharges,
    equippedWeapons: args.equippedWeapons.map(
      (weapon) => `${WEAPONS[weapon.weaponId].label} (${WEAPON_RARITIES[weapon.rarity].label})`
    ),
    dominantTags,
    itemCount: args.selectedItems.length
  };
}

export function getItemOfferText(definition: ItemDef): string {
  return definition.description;
}
