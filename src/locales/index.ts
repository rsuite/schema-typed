import defaultLocale from './default';

export type PickKeys<T> = {
  [keys in keyof T]: T[keys];
};

export type Locale = PickKeys<typeof defaultLocale>;
export type MixedTypeLocale = PickKeys<typeof defaultLocale.mixed>;
export type ArrayTypeLocale = PickKeys<typeof defaultLocale.array> & MixedTypeLocale;
export type ObjectTypeLocale = PickKeys<typeof defaultLocale.object> & MixedTypeLocale;
export type BooleanTypeLocale = PickKeys<typeof defaultLocale.boolean> & MixedTypeLocale;
export type StringTypeLocale = PickKeys<typeof defaultLocale.string> & MixedTypeLocale;
export type NumberTypeLocale = PickKeys<typeof defaultLocale.number> & MixedTypeLocale;
export type DateTypeLocale = PickKeys<typeof defaultLocale.date> & MixedTypeLocale;

export default defaultLocale;
