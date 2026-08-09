export type ModifierTier = {
  ilvl: number;
  min: number | null;
  max: number | null;
  weight: number;
};

export type Modifier = {
  name: string;
  tag: string;
  mod: ModifierTier[];
};

export type ModifierData = {
  prefix: { [key: string]: Modifier[] };
  suffix: { [key: string]: Modifier[] };
};
