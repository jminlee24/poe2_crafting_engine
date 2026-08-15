import { Item } from "../item/item.ts";
import { ItemTier, Modifier } from "../types.ts";
import CraftingMaterial from "./craftingMaterial.ts";
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
    const ret: Item[] = [];
    // remove prefixes if possible
    for (const mod of item.modifiers.prefix) {
      const newItem = item.copy();
      newItem.modifiers.prefix = newItem.modifiers.prefix.filter(
        (m) => m.id != mod.id,
      );
      ret.push(newItem);
    }
    // suffixes if possible
    for (const mod of item.modifiers.suffix) {
      const newItem = item.copy();
      newItem.modifiers.suffix = newItem.modifiers.suffix.filter(
        (m) => m.id != mod.id,
      );
      ret.push(newItem);
    }
    return ret;
  }
}

export const chaosOrb = new ChaosOrb(0);
export const greaterChaosOrb = new ChaosOrb(35);
export const perfectChaosOrb = new ChaosOrb(50);
