import { Item } from "../item/item.ts";
import { ItemTier, Modifier } from "../types.ts";
import CraftingMaterial from "./craftingMaterial.ts";
import { ilvlFilter } from "./helper/filters.ts";

class ExOrb implements CraftingMaterial {
  tiers: ItemTier[] = [ItemTier.Rare];
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

export const exaltedOrb = new ExOrb(0);
export const greaterExaltedOrb = new ExOrb(35);
export const perfectExaltedOrb = new ExOrb(50);
