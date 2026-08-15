import { Item } from "../item/item.ts";
import { ItemTier, Modifier } from "../types.ts";
import CraftingMaterial from "./craftingMaterial.ts";
import { remove_prefix, remove_suffix } from "./helper/effects.ts";
import { ilvlFilter } from "./helper/filters.ts";

class ChaosOrb implements CraftingMaterial {
  tiers: ItemTier[] = [ItemTier.Rare];
  minIlvl: number;

  constructor(ilvl: number) {
    this.minIlvl = ilvl;
  }

  filter(mod: Modifier) {
    ilvlFilter(mod, this.minIlvl);
    return mod;
  }

  effects(item: Item) {
    let ret: Item[] = [];
    // remove prefixes if possible
    ret = ret.concat(remove_prefix(item));
    // suffixes if possible
    ret = ret.concat(remove_suffix(item));
    return ret;
  }
}

export const chaosOrb = new ChaosOrb(0);
export const greaterChaosOrb = new ChaosOrb(35);
export const perfectChaosOrb = new ChaosOrb(50);
