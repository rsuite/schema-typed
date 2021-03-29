import { MixedType } from './MixedType';
import { ErrorMessageType } from './types';
import { DateTypeLocale } from './locales';

export class DateType<DataType = any, E = ErrorMessageType> extends MixedType<
  string | Date,
  DataType,
  E,
  DateTypeLocale
> {
  constructor(errorMessage?: E | string) {
    super('date');
    super.pushRule({
      onValid: value => !/Invalid|NaN/.test(new Date(value).toString()),
      errorMessage: errorMessage || this.locale.type
    });
  }

  range(min: string | Date, max: string | Date, errorMessage: E | string = this.locale.range) {
    super.pushRule({
      onValid: value => new Date(value) >= new Date(min) && new Date(value) <= new Date(max),
      errorMessage,
      params: { min, max }
    });
    return this;
  }

  min(min: string | Date, errorMessage: E | string = this.locale.min) {
    super.pushRule({
      onValid: value => new Date(value) >= new Date(min),
      errorMessage,
      params: { min }
    });
    return this;
  }

  max(max: string | Date, errorMessage: E | string = this.locale.max) {
    super.pushRule({
      onValid: value => new Date(value) <= new Date(max),
      errorMessage,
      params: { max }
    });
    return this;
  }
}

export default function getDateType<DataType = any, E = string>(errorMessage?: E) {
  return new DateType<DataType, E>(errorMessage);
}
