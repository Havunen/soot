export const enum IVFlags {
  HasInvalidChildren = 1,
  HasKeyedChildren = 1 << 1,
  HasNonKeydChildren = 1 << 2,
  HasTextChildren = 1 << 3,
  HasBasicChildren = 1 << 4,
  HasMultiple = HasKeyedChildren | HasNonKeydChildren
}
