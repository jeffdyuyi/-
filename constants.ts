import { CardType, Trait, Range, DamageType, Burden } from './types';

export const CARD_TYPES = Object.values(CardType);
export const TRAITS = Object.values(Trait);
export const RANGES = Object.values(Range);
export const DAMAGE_TYPES = Object.values(DamageType);
export const BURDENS = Object.values(Burden);

export const DEFAULT_WEAPON = {
  type: CardType.Weapon,
  name: "暗影之刃",
  description: "一把在黑暗中闪烁着微光的匕首，似乎渴望着鲜血。",
  creator: "GM",
  owner: "未分配",
  tier: 1,
  trait: Trait.Finesse,
  range: Range.Melee,
  damageDice: "d8+1",
  damageType: DamageType.Physical,
  burden: Burden.OneHand,
  feature: "当你在阴影中攻击时，伤害+2。"
};

export const WATERMARK = {
  author: "不咕鸟（基德）",
  qq: "442348584",
  wx: "jeffyuyi",
  msg: "暗影纪元西征欢迎您"
};