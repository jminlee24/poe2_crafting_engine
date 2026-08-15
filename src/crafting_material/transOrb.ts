import { Item } from "../item/item.ts";
import { ItemTier, Modifier } from "../types.ts";
import CraftingMaterial from "./craftingMaterial.ts";
import { ilvlFilter } from "./helper/filters.ts";

class TransOrb implements CraftingMaterial {
  tiers: ItemTier[] = [ItemTier.Normal];
  minIlvl: number;

  constructor(ilvl: number) {
    this.minIlvl = ilvl;
  }

  filter(mod: Modifier) {
    return ilvlFilter(mod, this.minIlvl);
  }

  effects(item: Item) {
    const newItem = item.copy();
    newItem.tier = ItemTier.Magic;
    newItem.metadata.maxPrefix = 1;
    newItem.metadata.maxSuffix = 1;
    return [newItem];
  }
}

export const transOrb = new TransOrb(0);
export const greaterTransOrb = new TransOrb(44);
export const perfectTransOrb = new TransOrb(70);
