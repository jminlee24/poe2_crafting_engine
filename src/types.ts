export type Modifier = {
  name: string;
  tag: string;
  id: number;
  tiers: ModTierInfo[];
};

export type ModTierInfo = {
  ilvl: number;
  range: number;
  weight: number;
};

export type ModifierData = {
  prefix: { [key: string]: Modifier[] };
  suffix: { [key: string]: Modifier[] };
};

export type ItemMetaData = {
  maxPrefix: number;
  maxSuffix: number;
};

export enum ItemTier {
  Normal = 1,
  Magic = 2,
  Rare = 3,
  Unique = 4,
}
