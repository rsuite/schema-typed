import { MixedType } from './MixedType';
import { PlainObject, CheckResult, ErrorMessageType } from './types';
import { ArrayTypeLocale } from './locales';

export class ArrayType<DataType = any, E = ErrorMessageType> extends MixedType<
  any[],
  DataType,
  E,
  ArrayTypeLocale
> {
  constructor(errorMessage?: E | string) {
    super('array');
    super.pushRule({
      onValid: v => Array.isArray(v),
      errorMessage: errorMessage || this.locale.type
    });
  }

  rangeLength(
    minLength: number,
    maxLength: number,
    errorMessage: E | string = this.locale.rangeLength
  ) {
    super.pushRule({
      onValid: (value: string[]) => value.length >= minLength && value.length <= maxLength,
      errorMessage,
      params: { minLength, maxLength }
    });
    return this;
  }

  minLength(minLength: number, errorMessage: E | string = this.locale.minLength) {
    super.pushRule({
      onValid: value => value.length >= minLength,
      errorMessage,
      params: { minLength }
    });

    return this;
  }

  maxLength(maxLength: number, errorMessage: E | string = this.locale.maxLength) {
    super.pushRule({
      onValid: value => value.length <= maxLength,
      errorMessage,
      params: { maxLength }
    });
    return this;
  }

  unrepeatable(errorMessage: E | string = this.locale.unrepeatable) {
    super.pushRule({
      onValid: items => {
        const hash: PlainObject = {};
        for (const i in items) {
          if (hash[items[i]]) {
            return false;
          }
          hash[items[i]] = true;
        }
        return true;
      },
      errorMessage
    });

    return this;
  }

  of(type: MixedType<any, DataType, E>) {
    super.pushRule({
      onValid: (items, data, fieldName) => {
        const checkResults = items.map((value, index) => {
          const name = Array.isArray(fieldName)
            ? [...fieldName, `[${index}]`]
            : [fieldName, `[${index}]`];

          return type.check(value, data, name as string[]);
        });
        const hasError = !!checkResults.find(item => item?.hasError);

        return {
          hasError,
          array: checkResults
        } as CheckResult<string | E>;
      }
    });

    return this;
  }
}

export default function getArrayType<DataType = any, E = string>(errorMessage?: E) {
  return new ArrayType<DataType, E>(errorMessage);
}
