import { ITEM_BY_ID, ITEM_POOL } from "./config/items";
import { ITEM_RARITIES } from "./config/rarity";
import { getRarityWeightsForPhase } from "./retention";
import { getItemStacks, getOwnedItemIds } from "./stats";
import type { DominantTag, ItemDef, ItemId, ItemOfferChoice, ItemOfferContext, ItemOfferProfile, ItemRarity } from "./types";

const RARITY_INDEX: Record<ItemRarity, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4
};

function clampRoll(value: number | undefined): number {
  return Math.min(0.999999, Math.max(0, value ?? Math.random()));
}

function weightedPick<T>(entries: Array<{ value: T; weight: number }>, roll?: number): T {
  const total = entries.reduce((sum, entry) => sum + Math.max(0, entry.weight), 0) || entries.length;
  const target = clampRoll(roll) * total;
  let cursor = 0;

  for (const entry of entries) {
    cursor += Math.max(0, entry.weight);
    if (target <= cursor) {
      return entry.value;
    }
  }

  return entries[entries.length - 1].value;
}

function countOverlappingTags(tags: readonly DominantTag[], dominantTags: readonly DominantTag[]): number {
  return tags.reduce((count, tag) => count + (dominantTags.includes(tag) ? 1 : 0), 0);
}

function countActiveSynergyHooks(definition: ItemDef, ownedIds: readonly ItemId[]): number {
  return definition.possibleSynergies.reduce((count, synergyId) => {
    const pairMatches = {
      fireExplosion: ownedIds.includes("incendiaryPayload") || ownedIds.includes("volatileHarvest"),
      toxicRicochet: ownedIds.includes("neurotoxinCoating") || ownedIds.includes("ricochetMesh"),
      critStorm: ownedIds.includes("arcNetwork") || ownedIds.includes("steadyAim") || ownedIds.includes("killScope"),
      droneOverclock: ownedIds.includes("guardianDrone") || ownedIds.includes("rapidCycle") || ownedIds.includes("combatStims"),
      piercingRicochet: ownedIds.includes("tungstenCore") || ownedIds.includes("railCore") || ownedIds.includes("ricochetMesh"),
      vampiricBarrage: ownedIds.includes("vampiricRounds") || ownedIds.includes("rapidCycle") || ownedIds.includes("combatStims"),
      blastFragmentation:
        ownedIds.includes("volatileHarvest") ||
        ownedIds.includes("splitChamber") ||
        ownedIds.includes("mirrorChamber") ||
        ownedIds.includes("stormBarrel") ||
        ownedIds.includes("vectorArray"),
      toxicFirestorm: ownedIds.includes("incendiaryPayload") || ownedIds.includes("neurotoxinCoating")
    }[synergyId];

    return count + (pairMatches ? 1 : 0);
  }, 0);
}

function getProfileScore(definition: ItemDef, context: ItemOfferContext, profile: ItemOfferProfile): number {
  const ownedIds = getOwnedItemIds(context.items);
  const overlappingTags = countOverlappingTags(definition.tags, context.dominantTags);
  const activeHooks = countActiveSynergyHooks(definition, ownedIds);
  const risk = definition.cons.length + Math.max(0, RARITY_INDEX[definition.baseRarity] - 1);
  const rarityBias = RARITY_INDEX[definition.baseRarity] * 0.4;

  if (profile === "safe") {
    const survivabilityBonus = definition.category === "survivability" ? 1.4 : definition.category === "utility" ? 0.7 : 0;
    const recoveryBonus =
      definition.tags.includes("regen") || definition.tags.includes("armor") || definition.tags.includes("hp") || definition.tags.includes("shield")
        ? 0.95
        : 0;
    return definition.offerWeight + survivabilityBonus + recoveryBonus + overlappingTags * 0.25 - risk * 0.25;
  }

  if (profile === "synergy") {
    return definition.offerWeight + overlappingTags * 1.1 + activeHooks * 1.4 + definition.possibleSynergies.length * 0.35;
  }

  const swingBonus = definition.category === "special" || definition.category === "projectile" ? 1 : 0.4;
  const uniqueBonus = definition.maxStacks === 1 ? 0.35 : 0;
  return definition.offerWeight + rarityBias + swingBonus + definition.pros.length * 0.3 + activeHooks * 0.5 + uniqueBonus;
}

function adjustRarityWeights(
  phase: number,
  profile: ItemOfferProfile,
  baseRarity: ItemRarity,
  recentRarities: ItemRarity[],
  itemLuck: number
): Record<ItemRarity, number> {
  const weights = { ...getRarityWeightsForPhase(phase, profile) };

  for (const [rarity, weight] of Object.entries(weights) as Array<[ItemRarity, number]>) {
    const distance = Math.abs(RARITY_INDEX[rarity] - RARITY_INDEX[baseRarity]);
    weights[rarity] = weight * Math.max(0.2, 1 - distance * 0.18);
  }

  const recentEpicOrHigher = recentRarities.filter((rarity) => RARITY_INDEX[rarity] >= RARITY_INDEX.epic).length;
  if (recentEpicOrHigher >= 2) {
    weights.epic *= 0.6;
    weights.legendary *= 0.4;
  }

  if (itemLuck > 0) {
    const luckFactor = Math.min(0.5, itemLuck);
    weights.common *= Math.max(0.35, 1 - luckFactor * 0.55);
    weights.uncommon *= 1 + luckFactor * 0.2;
    weights.rare *= 1 + luckFactor * 0.35;
    weights.epic *= 1 + luckFactor * 0.45;
    weights.legendary *= 1 + luckFactor * 0.6;
  }

  return weights;
}

function pickRarity(
  definition: ItemDef,
  context: ItemOfferContext,
  profile: ItemOfferProfile,
  roll?: number
): ItemRarity {
  const weights = adjustRarityWeights(context.phase, profile, definition.baseRarity, context.recentRarities, context.itemLuck);

  return weightedPick(
    (Object.keys(weights) as ItemRarity[]).map((rarity) => ({
      value: rarity,
      weight: weights[rarity] * ITEM_RARITIES[rarity].offerWeightMultiplier
    })),
    roll
  );
}

export function drawItemChoices(context: ItemOfferContext, rolls: number[] = []): ItemOfferChoice[] {
  const itemStacks = getItemStacks(context.items);
  const profiles: ItemOfferProfile[] = ["safe", "synergy", "bold"];
  const available = ITEM_POOL.filter((definition) => (itemStacks[definition.id] ?? 0) < (definition.maxStacks ?? Number.POSITIVE_INFINITY));
  const picks: ItemOfferChoice[] = [];
  let rollIndex = 0;

  for (const profile of profiles) {
    const candidates = available.filter((definition) => !picks.some((pick) => pick.itemId === definition.id));
    if (candidates.length === 0) {
      break;
    }

    const chosenDef = weightedPick(
      candidates.map((definition) => ({
        value: definition,
        weight: Math.max(0.05, getProfileScore(definition, context, profile))
      })),
      rolls[rollIndex]
    );
    rollIndex += 1;
    const rarity = pickRarity(chosenDef, context, profile, rolls[rollIndex]);
    rollIndex += 1;
    picks.push({
      itemId: chosenDef.id,
      rarity,
      profile
    });
  }

  return picks;
}

export function getItemChoiceDetails(choice: ItemOfferChoice): ItemDef {
  return ITEM_BY_ID[choice.itemId];
}
