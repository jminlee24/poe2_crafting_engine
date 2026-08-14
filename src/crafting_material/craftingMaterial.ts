import { Item } from "../item/item.ts";
import { ItemTier, Modifier } from "../types.ts";

export default interface CraftingMaterial {
  tiers: ItemTier[];
  minIlvl: number;

  // will be applied on the available modifier pool
  filter(mod: Modifier): Modifier;

  // any side effects of the material being applied to the item
  // returns a list of different possible item states
  // ie. rarity upgrade, removed modifiers, etc:
  // CANNOT AFFECT THE MOD,
  effects(item: Item): Item[];
}
