import { Item } from "../item/item.ts";
import { Craft } from "./craft.ts";
import Engine from "./engine.ts";

export default class CraftingManager<T extends Item> {
  engine: Engine;
  craftRoot: Craft<T>;

  constructor(craft: Craft<T>) {
    this.engine = new Engine();
    this.craftRoot = craft;
  }
}
