import { MixedType } from './MixedType';
import { ErrorMessageType } from './types';
import { NumberTypeLocale } from './locales';

function toNumber(value: string | number) {
  return +value;
}

export class NumberType<DataType = any, E = ErrorMessageType> extends MixedType<
  number | string,
  DataType,
  E,
  NumberTypeLocale
> {
  constructor(errorMessage?: E | string) {
    super('number');
    super.pushRule({
      onValid: value => /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value + ''),
      errorMessage: errorMessage || this.locale.type
    });
  }

  isInteger(errorMessage: E | string = this.locale.isInteger) {
    super.pushRule({
      onValid: value => /^-?\d+$/.test(value + ''),
      errorMessage
    });

    return this;
  }

  pattern(regexp: RegExp, errorMessage: E | string = this.locale.pattern) {
    super.pushRule({
      onValid: value => regexp.test(value + ''),
      errorMessage,
      params: { regexp }
    });
    return this;
  }

  isOneOf(values: number[], errorMessage: E | string = this.locale.isOneOf) {
    super.pushRule({
      onValid: value => values.includes(toNumber(value)),
      errorMessage,
      params: { values }
    });
    return this;
  }

  range(min: number, max: number, errorMessage: E | string = this.locale.range) {
    super.pushRule({
      onValid: value => toNumber(value) >= min && toNumber(value) <= max,
      errorMessage,
      params: { min, max }
    });
    return this;
  }

  min(min: number, errorMessage: E | string = this.locale.min) {
    super.pushRule({
      onValid: value => toNumber(value) >= min,
      errorMessage,
      params: { min }
    });
    return this;
  }

  max(max: number, errorMessage: E | string = this.locale.max) {
    super.pushRule({
      onValid: value => toNumber(value) <= max,
      errorMessage,
      params: { max }
    });
    return this;
  }
}

export default function getNumberType<DataType = any, E = string>(errorMessage?: E) {
  return new NumberType<DataType, E>(errorMessage);
}
