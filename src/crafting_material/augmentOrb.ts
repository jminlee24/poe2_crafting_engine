import { Item } from "../item/item.ts";
import { ItemTier, Modifier } from "../types.ts";
import CraftingMaterial from "./craftingMaterial.ts";
import { ilvlFilter } from "./helper/filters.ts";

class AugOrb implements CraftingMaterial {
  tiers: ItemTier[] = [ItemTier.Magic];
  minIlvl: number;

  constructor(ilvl: number) {
    this.minIlvl = ilvl;
  }

  filter(mod: Modifier) {
    return ilvlFilter(mod, this.minIlvl);
  }

  effects(item: Item) {
    const newItem = item.copy();
    return [newItem];
  }
}

export const augmentOrb = new AugOrb(0);
export const greaterAugOrb = new AugOrb(46);
export const perfectAugOrb = new AugOrb(72);
