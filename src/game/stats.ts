import { CHARACTERS } from "./characters";
import { ITEM_BY_ID } from "./config/items";
import { ITEM_RARITIES } from "./config/rarity";
import { BASE_PLAYER_STATS } from "./config/player";
import { SYNERGY_BY_ID } from "./config/synergies";
import { WEAPON_RARITIES } from "./config/weaponRarity";
import { WEAPONS } from "./config/weapons";
import type {
  BuildInventoryEntry,
  BuildStatLine,
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
  selectedCharacterId: CharacterId;
  activeSynergyIds?: SynergyId[];
}): DerivedRunStats {
  const dominantTags = getDominantBuildTags(args.selectedItems, args.equippedWeapons);
  const projectileCounts = args.equippedWeapons.map((weapon) => Math.max(1, WEAPONS[weapon.weaponId].baseProjectiles + args.stats.extraProjectiles));
  const projectileCountMin = projectileCounts.length > 0 ? Math.min(...projectileCounts) : 0;
  const projectileCountMax = projectileCounts.length > 0 ? Math.max(...projectileCounts) : 0;
  const character = CHARACTERS[args.selectedCharacterId];
  const projectileCountLabel = projectileCountMin === projectileCountMax ? `${projectileCountMin}` : `${projectileCountMin}-${projectileCountMax}`;
  const activeSynergyIds = args.activeSynergyIds ?? [];
  const synergyLabels = activeSynergyIds.map((id) => SYNERGY_BY_ID[id].label);
  const inventoryEntries = buildInventoryEntries(args.selectedItems, args.selectedCharacterId);
  const uniqueItemLabels = inventoryEntries
    .filter((entry) => entry.kind === "item" && entry.isUnique)
    .map((entry) => entry.label);
  const uniquePassiveLabels = [...character.pros, ...character.cons];
  const offenseLines: BuildStatLine[] = [
    createStatLine("Dano", `x${args.stats.damageMultiplier.toFixed(2)}`, args.stats.damageMultiplier, 1),
    createStatLine("Cadência", `x${args.stats.attackSpeedMultiplier.toFixed(2)}`, args.stats.attackSpeedMultiplier, 1),
    createStatLine("Chance crítica", `${(args.stats.critChance * 100).toFixed(0)}%`, args.stats.critChance, BASE_PLAYER_STATS.critChance),
    createStatLine("Dano crítico", `x${args.stats.critDamageMultiplier.toFixed(2)}`, args.stats.critDamageMultiplier, BASE_PLAYER_STATS.critDamageMultiplier),
    createStatLine("Projéteis", projectileCountLabel, args.stats.extraProjectiles, 0),
    createStatLine("Perfuração", `${args.stats.projectilePierce}`, args.stats.projectilePierce, 0),
    createStatLine("Ricochete", `${args.stats.projectileBounce}`, args.stats.projectileBounce, 0),
    createStatLine("Precisão", `x${args.stats.spreadMultiplier.toFixed(2)}`, args.stats.spreadMultiplier, 1, true)
  ];
  const defenseLines: BuildStatLine[] = [
    createStatLine("HP", `${Math.ceil(args.hp)} / ${args.stats.maxHp}`, args.stats.maxHp, BASE_PLAYER_STATS.maxHp),
    createStatLine("Armadura", `${args.stats.armor.toFixed(1)}`, args.stats.armor, BASE_PLAYER_STATS.armor),
    createStatLine("Escudos", `${args.shieldCharges} / ${args.stats.maxShieldCharges}`, args.stats.maxShieldCharges, BASE_PLAYER_STATS.maxShieldCharges),
    createStatLine("Regeneração", `${args.stats.regenPerSecond.toFixed(2)}/s`, args.stats.regenPerSecond, BASE_PLAYER_STATS.regenPerSecond),
    createStatLine("Roubo de vida", `${(args.stats.lifeSteal * 100).toFixed(0)}%`, args.stats.lifeSteal, BASE_PLAYER_STATS.lifeSteal),
    createStatLine("Esquiva", `${(args.stats.dodgeChance * 100).toFixed(0)}%`, args.stats.dodgeChance, BASE_PLAYER_STATS.dodgeChance)
  ];
  const utilityLines: BuildStatLine[] = [
    createStatLine("Velocidade", `${args.stats.moveSpeed.toFixed(0)}`, args.stats.moveSpeed, BASE_PLAYER_STATS.moveSpeed),
    createStatLine("Vel. projétil", `x${args.stats.projectileSpeedMultiplier.toFixed(2)}`, args.stats.projectileSpeedMultiplier, BASE_PLAYER_STATS.projectileSpeedMultiplier),
    createStatLine("Tamanho projétil", `x${args.stats.projectileSizeMultiplier.toFixed(2)}`, args.stats.projectileSizeMultiplier, BASE_PLAYER_STATS.projectileSizeMultiplier),
    createStatLine("Repulsão", `x${args.stats.knockbackMultiplier.toFixed(2)}`, args.stats.knockbackMultiplier, BASE_PLAYER_STATS.knockbackMultiplier),
    createStatLine("Ímã de XP", `${Math.round(args.stats.xpMagnetRadius)}`, args.stats.xpMagnetRadius, BASE_PLAYER_STATS.xpMagnetRadius),
    createStatLine("Dano de invocações", `x${args.stats.summonDamageMultiplier.toFixed(2)}`, args.stats.summonDamageMultiplier, BASE_PLAYER_STATS.summonDamageMultiplier),
    createStatLine("Sorte de item", `${(args.stats.itemLuck * 100).toFixed(0)}%`, args.stats.itemLuck, BASE_PLAYER_STATS.itemLuck)
  ];

  if (args.stats.fireDps > 0) {
    offenseLines.push(createStatLine("Fogo", `${args.stats.fireDps.toFixed(1)} DPS`, args.stats.fireDps, BASE_PLAYER_STATS.fireDps));
  }
  if (args.stats.poisonDps > 0) {
    offenseLines.push(createStatLine("Veneno", `${args.stats.poisonDps.toFixed(1)} DPS`, args.stats.poisonDps, BASE_PLAYER_STATS.poisonDps));
  }
  if (args.stats.explosionRadius > 0 || args.stats.explosionDamage > 0) {
    offenseLines.push(
      createStatLine("Explosão", `${Math.round(args.stats.explosionRadius)} / ${Math.round(args.stats.explosionDamage)}`, args.stats.explosionDamage, BASE_PLAYER_STATS.explosionDamage)
    );
  }
  if (args.stats.chainLightningChance > 0) {
    offenseLines.push(
      createStatLine("Raio em cadeia", `${(args.stats.chainLightningChance * 100).toFixed(0)}%`, args.stats.chainLightningChance, BASE_PLAYER_STATS.chainLightningChance)
    );
  }
  if (args.stats.droneCount > 0) {
    utilityLines.push(createStatLine("Drones", `${args.stats.droneCount}`, args.stats.droneCount, BASE_PLAYER_STATS.droneCount));
  }
  if (dominantTags.length > 0) {
    utilityLines.push({
      label: "Tags dominantes",
      value: dominantTags.map((entry) => `${String(entry.tag)} ${entry.count}`).join(", "),
      polarity: "neutral"
    });
  }

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
    itemCount: args.selectedItems.length,
    offenseLines,
    defenseLines,
    utilityLines,
    inventoryEntries,
    uniqueItemLabels,
    uniquePassiveLabels,
    synergyLabels
  };
}

export function getItemOfferText(definition: ItemDef): string {
  return definition.shortDescription ?? definition.description;
}

function createStatLine(label: string, value: string, current: number, baseline: number, invert = false): BuildStatLine {
  return {
    label,
    value,
    polarity: getPolarity(current, baseline, invert)
  };
}

function getPolarity(current: number, baseline: number, invert = false): BuildStatLine["polarity"] {
  if (Math.abs(current - baseline) <= 0.001) {
    return "neutral";
  }

  const isPositive = invert ? current < baseline : current > baseline;
  return isPositive ? "positive" : "negative";
}

function buildInventoryEntries(selectedItems: ItemInstance[], selectedCharacterId: CharacterId): BuildInventoryEntry[] {
  const grouped = new Map<ItemId, ItemInstance[]>();
  for (const item of selectedItems) {
    const bucket = grouped.get(item.id) ?? [];
    bucket.push(item);
    grouped.set(item.id, bucket);
  }

  const itemEntries = [...grouped.entries()].map<BuildInventoryEntry>(([itemId, stack]) => {
    const definition = ITEM_BY_ID[itemId];
    const latest = stack[stack.length - 1];
    const rarity = ITEM_RARITIES[latest.rarity];
    const synergies = definition.synergyHint
      ? [definition.synergyHint]
      : definition.possibleSynergies.map((synergyId) => SYNERGY_BY_ID[synergyId].label);

    return {
      kind: "item",
      id: itemId,
      label: definition.label,
      rarityLabel: rarity.label,
      categoryLabel: getCategoryLabel(definition.category),
      shortDescription: definition.shortDescription ?? definition.description,
      pros: definition.pros,
      cons: definition.cons,
      tags: definition.tags.map((tag) => String(tag)),
      synergies,
      stackCount: stack.length,
      isUnique: definition.maxStacks === 1,
      iconKey: definition.displayIconKey ?? `upgrade-${definition.category}`,
      accent: rarity.accent,
      fill: rarity.fill,
      border: rarity.border,
      footerHint: "Pressione Enter ou clique"
    };
  });

  const character = CHARACTERS[selectedCharacterId];
  const passiveEntry: BuildInventoryEntry = {
    kind: "passive",
    id: `${selectedCharacterId}-passive`,
    label: `${character.label} • Passiva`,
    rarityLabel: "Personagem",
    categoryLabel: "Passiva única",
    shortDescription: character.summary,
    pros: character.pros,
    cons: character.cons,
    tags: [character.difficultyLabel, WEAPONS[character.startingWeaponId].label],
    synergies: [],
    stackCount: 1,
    isUnique: true,
    iconKey: "player",
    accent: character.accent,
    fill: character.panelTint,
    border: character.accent,
    footerHint: "Passiva inicial"
  };

  return [passiveEntry, ...itemEntries];
}

function getCategoryLabel(category: ItemDef["category"]): string {
  switch (category) {
    case "offense":
      return "Ofensiva";
    case "utility":
      return "Utilidade";
    case "projectile":
      return "Projétil";
    case "survivability":
      return "Sobrevivência";
    case "special":
      return "Especial";
    default:
      return "Build";
  }
}
