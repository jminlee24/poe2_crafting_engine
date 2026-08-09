import { Modifier, ModifierData, ItemTier, ItemMetaData } from "../types.ts";
import bootModifiers from "../../data/boots_int1.json" with { type: "json" };

export class Item {
  tier: ItemTier;
  metadata: ItemMetaData;
  modifiers: { prefix: Modifier[]; suffix: Modifier[] };
  availableModifiers: ModifierData;

  constructor(
    availbleModifiers: ModifierData,
    modifiers?: { prefix: Modifier[]; suffix: Modifier[] },
    tier?: ItemTier,
    metadata?: ItemMetaData,
  ) {
    this.modifiers = modifiers || {
      prefix: [],
      suffix: [],
    };
    this.availableModifiers = availbleModifiers;
    this.tier = tier || ItemTier.Normal;
    this.metadata = metadata || {
      maxPrefix: 0,
      maxSuffix: 0,
    };
  }

  copy(): Item {
    return new Item(
      structuredClone(this.availableModifiers),
      structuredClone(this.modifiers),
      structuredClone(this.tier),
      structuredClone(this.metadata),
    );
  }
}

export class Boots extends Item {
  readonly baseType = "Boots";

  constructor(
    modifiers?: { prefix: Modifier[]; suffix: Modifier[] },
    tier?: ItemTier,
  ) {
    super(bootModifiers as unknown as ModifierData, modifiers, tier);
  }
}
