import { Item } from "../item/item.ts";
import { ItemTier, Modifier } from "../types.ts";
import CraftingMaterial from "./craftingMaterial.ts";

class AugOrb implements CraftingMaterial {
  tiers: ItemTier[] = [ItemTier.Magic];
  minIlvl: number;

  constructor(ilvl: number) {
    this.minIlvl = ilvl;
  }

  filter(mod: Modifier) {
    mod.tiers = mod.tiers.filter((e) => e.ilvl >= this.minIlvl);
    return mod;
  }

  effects(item: Item) {
    const newItem = item.copy();
    return newItem;
  }

  getProbability(modPool: Modifier[]) {}
}

export const augmentOrb = new AugOrb(0);
export const greaterAugOrb = new AugOrb(46);
export const perfectAugOrb = new AugOrb(72);
