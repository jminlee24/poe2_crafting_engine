import { Item } from "../item/item.ts";

export class Craft<T extends Item> {
  base: T;
  constructor(base: T) {
    this.base = base;
  }
}
