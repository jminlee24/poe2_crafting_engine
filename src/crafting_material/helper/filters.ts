import { Modifier } from "../../types.ts";

export function ilvlFilter(mod: Modifier, minIlvl: number) {
  mod.tiers = mod.tiers.filter((e) => e.ilvl >= minIlvl);
  return mod;
}
