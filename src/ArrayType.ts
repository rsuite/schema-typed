import { MixedType } from './MixedType';
import { CheckType, PlainObject } from './types';

export class ArrayType<DataType = any, ErrorMsgType = string> extends MixedType<
  any[],
  DataType,
  ErrorMsgType
> {
  constructor(errorMessage?: ErrorMsgType) {
    super('array');
    super.pushRule(v => Array.isArray(v), errorMessage || 'Please enter a valid array');
  }

  rangeLength(minLength: number, maxLength: number, errorMessage?: ErrorMsgType) {
    super.pushRule(
      (value: string[]) => value.length >= minLength && value.length <= maxLength,
      errorMessage
    );
    return this;
  }

  minLength(minLength: number, errorMessage?: ErrorMsgType) {
    super.pushRule(value => value.length >= minLength, errorMessage);
    return this;
  }

  maxLength(maxLength: number, errorMessage?: ErrorMsgType) {
    super.pushRule(value => value.length <= maxLength, errorMessage);
    return this;
  }

  unrepeatable(errorMessage?: ErrorMsgType) {
    super.pushRule(items => {
      const hash: PlainObject = {};
      for (const i in items) {
        if (hash[items[i]]) {
          return false;
        }
        hash[items[i]] = true;
      }
      return true;
    }, errorMessage);
    return this;
  }

  /**
   * @example
   * ArrayType().of(StringType().isOneOf(['数码','体育','游戏','旅途','其他'],'Can only be the value of a predefined option')
   */
  of(type: CheckType<any[], DataType, ErrorMsgType>, errorMessage?: ErrorMsgType) {
    super.pushRule(items => {
      return {
        array: items.map(value => type.check(value))
      };
    }, errorMessage);

    return this;
  }
}

export default function getArrayType<DataType = any, ErrorMsgType = string>(
  errorMessage?: ErrorMsgType
) {
  return new ArrayType<DataType, ErrorMsgType>(errorMessage);
}
