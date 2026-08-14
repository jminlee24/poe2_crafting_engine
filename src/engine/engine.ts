import CraftingMaterial from "../crafting_material/craftingMaterial.ts";
import { findObjByProp } from "../helper.ts";
import { Item } from "../item/item.ts";
import { Modifier } from "../types.ts";
import { Craft } from "./craft.ts";

class Engine {
  getBaseModPools(base: Item) {
    // filter out mods to get all possible modifiers
    let possiblePrefixes: Modifier[] = [];
    let possibleSuffixes: Modifier[] = [];

    // TODO: add support for other modifiers besides the basic ones
    //
    // REFERENCE: looks like the chronomancy rolls are rolled in a separate pool, for prefix its
    // 6.685 % chance that a rolled prefix is a chrono roll prefix pool is estimated 3150 -> implies each tier has a roughly 450 weight adde to the pool
    // 6.685 % chance that a rolled suffix is also a chrono roll suffix pool is estimated 4700 -> Implies each tier has a roughly 470 weight added to the pool
    //
    //
    if (!("base prefix" in base.availableModifiers.prefix)) {
      throw new Error(`No base prefixes found for ${Item.name}`);
    }

    if (!("base suffix" in base.availableModifiers.suffix)) {
      throw new Error(`No base suffixes found for ${Item.name}`);
    }

    // full prefix/suffix means the mod pool would be empty
    if (base.modifiers.prefix.length < base.metadata.maxPrefix) {
      possiblePrefixes = base.availableModifiers.prefix["base prefix"].filter(
        (e) => !base.modifiers.prefix.some((mod) => mod.id === e.id),
      );
    }

    if (base.modifiers.suffix.length < base.metadata.maxSuffix) {
      possibleSuffixes = base.availableModifiers.suffix["base suffix"].filter(
        (e) => !base.modifiers.suffix.some((mod) => mod.id === e.id),
      );
    }

    return [possiblePrefixes, possibleSuffixes];
  }

  // This calculates the number of different base items (ie: if the item changes before a mod is applied)
  // Exists because of chaos orbs and crafted modifiers, where the base item state may change since a modifier
  // is removed before a new one is added
  getAllPossibleOutputItems(base: Item, material: CraftingMaterial): Item[] {
    const ret: Item[] = material.effects(base);

    return ret;
  }

  getAllPossibleMods(
    base: Item,
    material: CraftingMaterial,
    pool: Modifier[],
  ): Modifier[] {
    const modPool: Modifier[] = [];
    return modPool;
  }

  calculateProbability(
    base: Item,
    targets: { id: number; tier: number }[],
    material: CraftingMaterial,
  ): {
    target: { id: number; tier: number };
    probability: number;
  }[] {
    const probabilities = [];

    const targetItem = material.effects(base);

    // TODO: use getAllPossibleMods(base, craftingItem)
    // after getting the total modpool
    //
    const baseModPool = this.getBaseModPools(targetItem).flat();
    const modPool = this.getAllPossibleMods(targetItem, material, baseModPool);

    const totalModWeight = modPool.reduce(
      (acc, curr) =>
        acc + curr.tiers.reduce((acc1, curr1) => acc1 + curr1.weight, 0),
      0,
    );

    for (const { id, tier } of targets) {
      const target = findObjByProp(modPool, "id", id) as Modifier;
      if (!target) {
        continue;
      }
      // since tiers are ordered from smallest to greatest
      // T1 = length (N tiers) - Tier = N tiers - 1 => last element
      const targetTier = target.tiers[target.tiers.length - tier];
      const prob = targetTier.weight / totalModWeight;
      probabilities.push({ target: { id, tier }, probability: prob });
    }

    return probabilities;
  }
}

export default Engine;
