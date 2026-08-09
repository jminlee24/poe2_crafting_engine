import assert from "node:assert/strict";
import { test } from "node:test";
import Engine from "../src/engine/engine.ts";

function createModifier(id: number, weight: number) {
  return {
    id,
    tiers: [{ weight }],
  } as any;
}

function createItem(overrides: Record<string, unknown> = {}) {
  return {
    availableModifiers: {
      prefix: {},
      suffix: {},
    },
    modifiers: {
      prefix: [],
      suffix: [],
    },
    metadata: {
      maxPrefix: 3,
      maxSuffix: 3,
    },
    ...overrides,
  } as any;
}

test("getBaseModPools returns available modifiers that are not already on the item", () => {
  const engine = new Engine();

  const prefixA = createModifier(1, 10);
  const prefixB = createModifier(2, 20);
  const suffixA = createModifier(3, 30);

  const base = createItem({
    availableModifiers: {
      prefix: {
        "base prefix": [prefixA, prefixB],
        "base suffix": [suffixA],
      },
      suffix: {
        "base suffix": [suffixA],
      },
    },
    modifiers: {
      prefix: [prefixA],
      suffix: [],
    },
  });

  const [prefixes, suffixes] = engine.getBaseModPools(base);

  assert.deepStrictEqual(prefixes, [prefixB]);
  assert.deepStrictEqual(suffixes, [suffixA]);
});

test("getBaseModPools uses the suffix modifier pool from the suffix available-modifier object", () => {
  const engine = new Engine();

  const prefixA = createModifier(1, 10);
  const suffixA = createModifier(2, 20);

  const base = createItem({
    availableModifiers: {
      prefix: {
        "base prefix": [prefixA],
        "base suffix": [],
      },
      suffix: {
        "base suffix": [suffixA],
      },
    },
    modifiers: {
      prefix: [],
      suffix: [],
    },
  });

  const [, suffixes] = engine.getBaseModPools(base);

  assert.deepStrictEqual(suffixes, [suffixA]);
});

test("calculateProbability uses the target tier weight over the total weight of the filtered mod pool", () => {
  const engine = new Engine();

  const targetModifier = createModifier(101, 10);
  const otherModifier = createModifier(102, 20);
  const suffixModifier = createModifier(103, 5);

  const base = createItem();

  const material = {
    effects: () =>
      createItem({
        availableModifiers: {
          prefix: {
            "base prefix": [targetModifier, otherModifier],
            "base suffix": [],
          },
          suffix: {
            "base suffix": [suffixModifier],
          },
        },
        modifiers: {
          prefix: [],
          suffix: [],
        },
      }),
    filter: () => true,
  } as any;

  const result = engine.calculateProbability(
    base,
    [{ id: targetModifier.id, tier: 1 }],
    material,
  );

  assert.deepStrictEqual(result, [
    {
      target: { id: targetModifier.id, tier: 1 },
      probability: 10 / 35,
    },
  ]);
});