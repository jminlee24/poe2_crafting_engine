import { Modifier, ModifierData, ItemTier, ItemMetaData } from "../types.ts";

export class Item {
  tier: ItemTier;
  metadata: ItemMetaData;
  modifiers: { prefix: Modifier[]; suffix: Modifier[] };
  availableModifiers: ModifierData;

  constructor(
    availableModifiers: ModifierData,
    modifiers?: { prefix: Modifier[]; suffix: Modifier[] },
    tier?: ItemTier,
    metadata?: ItemMetaData,
  ) {
    this.modifiers = modifiers || {
      prefix: [],
      suffix: [],
    };
    this.availableModifiers = availableModifiers;
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

export class GenericNormalItem extends Item {
  constructor(
    availableModifiers: ModifierData,
    modifiers?: { prefix: Modifier[]; suffix: Modifier[] },
  ) {
    super(availableModifiers, modifiers, ItemTier.Normal, {
      maxPrefix: 0,
      maxSuffix: 0,
    });
  }
}

export class GenericMagicItem extends Item {
  constructor(
    availableModifiers: ModifierData,
    modifiers?: { prefix: Modifier[]; suffix: Modifier[] },
  ) {
    super(availableModifiers, modifiers, ItemTier.Magic, {
      maxPrefix: 1,
      maxSuffix: 1,
    });
  }
}

export class GenericRareItem extends Item {
  constructor(
    availableModifiers: ModifierData,
    modifiers?: { prefix: Modifier[]; suffix: Modifier[] },
  ) {
    super(availableModifiers, modifiers, ItemTier.Rare, {
      maxPrefix: 3,
      maxSuffix: 3,
    });
  }
}
