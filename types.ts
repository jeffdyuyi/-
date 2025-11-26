
export enum CardType {
  Weapon = '武器',
  Armor = '护甲',
  Loot = '战利品',
  Consumable = '消耗品',
  Domain = '领域卡',
  Story = '个人剧情',
  Class = '职业',
  Subclass = '子职业',
  Ancestry = '种族',
  Community = '社群'
}

export enum Trait {
  Agility = '敏捷',
  Strength = '力量',
  Finesse = '灵巧',
  Instinct = '本能',
  Presence = '风度',
  Knowledge = '知识'
}

export enum Range {
  Melee = '近战',
  VeryClose = '邻近',
  Close = '近距离',
  Far = '远距离',
  VeryFar = '极远',
}

export enum DamageType {
  Physical = '物理',
  Magic = '魔法'
}

export enum Burden {
  OneHand = '单手',
  TwoHand = '双手'
}

export interface BaseCardData {
  type: CardType;
  name: string;
  description: string;
  creator: string;
  owner: string; // Character name
  tier?: number | string;
}

export interface WeaponData extends BaseCardData {
  trait: Trait;
  range: Range;
  damageDice: string; // e.g. "d8+2"
  damageType: DamageType;
  burden: Burden;
  feature: string;
}

export interface ArmorData extends BaseCardData {
  score: number;
  thresholdMajor: number; // e.g. 5
  thresholdSevere: number; // e.g. 10
  feature: string;
}

export interface LootData extends BaseCardData {
  feature: string;
}

export interface DomainCardData extends BaseCardData {
  domainName: string; // e.g. "Blade", "Bone"
  level: number;
  recallCost: number;
  feature: string;
}

export interface StoryCardData extends BaseCardData {
  trigger: string; // e.g. "When you..."
  benefit: string;
}

export interface ClassCardData extends BaseCardData {
  evasion: number;
  hp: number;
  hopeFeature: string;
  classFeature: string;
}

export interface SubclassCardData extends BaseCardData {
  className: string;
  foundationFeature: string;
  masteryFeature: string;
}

export interface AncestryCardData extends BaseCardData {
  feature1Name: string;
  feature1Desc: string;
  feature2Name: string;
  feature2Desc: string;
}

export interface CommunityCardData extends BaseCardData {
  featureName: string;
  featureDesc: string;
}

export type AnyCardData = 
  | WeaponData 
  | ArmorData 
  | LootData 
  | DomainCardData 
  | StoryCardData 
  | ClassCardData
  | SubclassCardData
  | AncestryCardData
  | CommunityCardData;

export interface SavedCard {
  id: string;
  updatedAt: number;
  data: AnyCardData;
}
