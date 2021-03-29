import { MixedType } from './MixedType';
import { ErrorMessageType } from './types';
import { BooleanTypeLocale } from './locales';

export class BooleanType<DataType = any, E = ErrorMessageType> extends MixedType<
  boolean,
  DataType,
  E,
  BooleanTypeLocale
> {
  constructor(errorMessage?: E | string) {
    super('boolean');
    super.pushRule({
      onValid: v => typeof v === 'boolean',
      errorMessage: errorMessage || this.locale.type
    });
  }
}

export default function getBooleanType<DataType = any, E = string>(errorMessage?: E) {
  return new BooleanType<DataType, E>(errorMessage);
}
