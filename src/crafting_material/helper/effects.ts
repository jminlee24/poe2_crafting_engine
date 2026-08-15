import { Item } from "../../item/item.ts";

export function remove_prefix(item: Item) {
  const ret: Item[] = [];
  for (const mod of item.modifiers.prefix) {
    const newItem = item.copy();
    newItem.modifiers.prefix = newItem.modifiers.prefix.filter(
      (m) => m.id != mod.id,
    );
    ret.push(newItem);
  }

  return ret;
}

export function remove_suffix(item: Item) {
  const ret: Item[] = [];
  for (const mod of item.modifiers.suffix) {
    const newItem = item.copy();
    newItem.modifiers.suffix = newItem.modifiers.suffix.filter(
      (m) => m.id != mod.id,
    );
    ret.push(newItem);
  }

  return ret;
}
