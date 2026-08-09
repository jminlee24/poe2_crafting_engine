import assert from "node:assert/strict";
import { test } from "node:test";
import Engine from "../src/engine/engine.ts";
import { Modifier, ItemTier } from "../src/types.ts";
import { Item } from "../src/item/item.ts";
import { augmentOrb } from "../src/crafting_material/augmentOrb.ts";

test("getBaseModPools returns empty prefix modifiers if prefixes are full", () => {
  const engine = new Engine();

  const prefixA: Modifier = {
    name: "prefixA",
    id: 1,
    tiers: [{ weight: 10, ilvl: 1, min: 0, max: 10 }],
    tag: "prefixA",
  };

  const prefixB: Modifier = {
    name: "prefixB",
    id: 2,
    tiers: [{ weight: 20, ilvl: 1, min: 0, max: 10 }],
    tag: "prefixB",
  };

  const suffixA: Modifier = {
    name: "suffixA",
    id: 3,
    tiers: [{ weight: 30, ilvl: 1, min: 0, max: 10 }],
    tag: "suffixA",
  };

  const base = new Item(
    {
      prefix: {
        "base prefix": [prefixA, prefixB],
      },
      suffix: {
        "base suffix": [suffixA],
      },
    },
    {
      prefix: [prefixA],
      suffix: [],
    },
    ItemTier.Magic,
    { maxPrefix: 1, maxSuffix: 1 },
  );

  const [prefixes, suffixes] = engine.getBaseModPools(base);

  assert.deepStrictEqual(prefixes, []);
  assert.deepStrictEqual(suffixes, [suffixA]);
});

test("getBaseModPools returns available modifiers that are not already on the item", () => {
  const engine = new Engine();

  const prefixA: Modifier = {
    name: "prefixA",
    id: 1,
    tiers: [{ weight: 10, ilvl: 1, min: 0, max: 10 }],
    tag: "prefixA",
  };

  const prefixB: Modifier = {
    name: "prefixB",
    id: 2,
    tiers: [{ weight: 20, ilvl: 1, min: 0, max: 10 }],
    tag: "prefixB",
  };

  const suffixA: Modifier = {
    name: "suffixA",
    id: 3,
    tiers: [{ weight: 30, ilvl: 1, min: 0, max: 10 }],
    tag: "suffixA",
  };

  const base = new Item(
    {
      prefix: {
        "base prefix": [prefixA, prefixB],
      },
      suffix: {
        "base suffix": [suffixA],
      },
    },
    {
      prefix: [prefixA],
      suffix: [],
    },
    ItemTier.Rare,
    { maxPrefix: 3, maxSuffix: 3 },
  );

  const [prefixes, suffixes] = engine.getBaseModPools(base);

  assert.deepStrictEqual(prefixes, [prefixB]);
  assert.deepStrictEqual(suffixes, [suffixA]);
});

test("getBaseModPools uses the suffix modifier pool from the suffix available-modifier object", () => {
  const engine = new Engine();

  const prefixA: Modifier = {
    name: "prefixA",
    id: 1,
    tiers: [{ weight: 10, ilvl: 1, min: 0, max: 10 }],
    tag: "prefixA",
  };

  const suffixA: Modifier = {
    name: "suffixA",
    id: 2,
    tiers: [{ weight: 20, ilvl: 1, min: 0, max: 10 }],
    tag: "suffixA",
  };

  const base = new Item(
    {
      prefix: {
        "base prefix": [prefixA],
      },
      suffix: {
        "base suffix": [suffixA],
      },
    },
    {
      prefix: [],
      suffix: [],
    },
  );

  const [, suffixes] = engine.getBaseModPools(base);

  assert.deepStrictEqual(suffixes, [suffixA]);
});

test("calculateProbability uses the target tier weight over the total weight of the filtered mod pool", () => {
  const engine = new Engine();

  const targetModifier: Modifier = {
    name: "target",
    id: 101,
    tiers: [{ weight: 10, ilvl: 1, min: 0, max: 10 }],
    tag: "target",
  };

  const otherModifier: Modifier = {
    name: "other",
    id: 102,
    tiers: [{ weight: 20, ilvl: 1, min: 0, max: 10 }],
    tag: "other",
  };

  const suffixModifier: Modifier = {
    name: "suffix",
    id: 103,
    tiers: [{ weight: 5, ilvl: 1, min: 0, max: 10 }],
    tag: "suffix",
  };

  const base = new Item({
    prefix: {
      "base prefix": [targetModifier, otherModifier],
    },
    suffix: {
      "base suffix": [suffixModifier],
    },
  });

  const result = engine.calculateProbability(
    base,
    [{ id: targetModifier.id, tier: 1 }],
    augmentOrb,
  );

  assert.deepStrictEqual(result, [
    {
      target: { id: targetModifier.id, tier: 1 },
      probability: 10 / 35,
    },
  ]);
});
