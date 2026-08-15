import Engine from "../src/engine/engine.ts";
import { Modifier } from "../src/types.ts";
import {
  GenericMagicItem,
  GenericNormalItem,
  GenericRareItem,
  Item,
} from "../src/item/item.ts";
import { augmentOrb } from "../src/crafting_material/augmentOrb.ts";
import {
  assertArrayIncludes,
  assertEquals,
  assertLessOrEqual,
  assertNotEquals,
} from "@std/assert";
import { chaosOrb } from "../src/crafting_material/chaosOrb.ts";

Deno.test(
  "getBaseModPools returns empty prefix modifiers if prefixes are full",
  () => {
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

    const base = new GenericMagicItem(
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
    );

    const [prefixes, suffixes] = engine.getBaseModPools(base);

    assertEquals(prefixes, []);
    assertEquals(suffixes, [suffixA]);
  },
);

Deno.test(
  "getBaseModPools returns available modifiers that are not already on the item",
  () => {
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

    const base = new GenericRareItem(
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
    );

    const [prefixes, suffixes] = engine.getBaseModPools(base);

    assertEquals(prefixes, [prefixB]);
    assertEquals(suffixes, [suffixA]);
  },
);

Deno.test(
  "getBaseModPools uses the suffix modifier pool from the suffix available-modifier object",
  () => {
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

    const base = new GenericRareItem(
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

    assertEquals(suffixes, [suffixA]);
  },
);

Deno.test(
  "calculateProbability uses the target tier weight over the total weight of the filtered mod pool",
  () => {
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

    const base = new GenericRareItem({
      prefix: {
        "base prefix": [targetModifier, otherModifier],
      },
      suffix: {
        "base suffix": [suffixModifier],
      },
    });

    assertEquals(augmentOrb.minIlvl, 0);

    const item = engine.getAllPossibleOutputItems(base, augmentOrb)[0];

    const result = engine.calculateProbability(
      item,
      [{ id: targetModifier.id, tier: 1 }],
      augmentOrb,
    );

    assertEquals(result, [
      {
        target: { id: targetModifier.id, tier: 1 },
        probability: 10 / 35,
      },
    ]);
  },
);

Deno.test(
  "chaos orb effect on an item with 3 modifiers should output 3 unique items",
  () => {
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

    const base = new GenericRareItem(
      {
        prefix: {
          "base prefix": [targetModifier, otherModifier],
        },
        suffix: {
          "base suffix": [otherModifier, suffixModifier],
        },
      },
      {
        prefix: [targetModifier, otherModifier],
        suffix: [otherModifier],
      },
    );

    const out = engine.getAllPossibleOutputItems(base, chaosOrb);

    assertEquals(out.length, 3);
    assertNotEquals(out[0].modifiers, out[1].modifiers);
    assertNotEquals(out[1].modifiers, out[2].modifiers);
    assertNotEquals(out[2].modifiers, out[0].modifiers);

    for (const item of out) {
      assertEquals(
        item.modifiers.prefix.length + item.modifiers.suffix.length,
        2,
      );
    }
  },
);
