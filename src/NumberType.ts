import Type from './Type';

function FN(value: string | number) {
  return +value;
}

export class NumberType<DataType = any, ErrorMsgType = string> extends Type<
  number | string,
  DataType,
  ErrorMsgType
> {
  constructor(errorMessage?: ErrorMsgType) {
    super('number');
    super.pushRule(
      value => /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value + ''),
      errorMessage || 'Please enter a valid number'
    );
  }

  isInteger(errorMessage?: ErrorMsgType) {
    super.pushRule(value => /^-?\d+$/.test(value + ''), errorMessage);
    return this;
  }

  pattern(regexp: RegExp, errorMessage?: ErrorMsgType) {
    super.pushRule(value => regexp.test(value + ''), errorMessage);
    return this;
  }

  isOneOf(numLst: number[], errorMessage?: ErrorMsgType) {
    super.pushRule(value => numLst.includes(FN(value)), errorMessage);
    return this;
  }

  range(min: number, max: number, errorMessage?: ErrorMsgType) {
    super.pushRule(value => FN(value) >= min && FN(value) <= max, errorMessage);
    return this;
  }

  min(min: number, errorMessage?: ErrorMsgType) {
    super.pushRule(value => FN(value) >= min, errorMessage);
    return this;
  }

  max(max: number, errorMessage?: ErrorMsgType) {
    super.pushRule(value => FN(value) <= max, errorMessage);
    return this;
  }
}

export default function getNumberType<DataType = any, ErrorMsgType = string>(
  errorMessage?: ErrorMsgType
) {
  return new NumberType<DataType, ErrorMsgType>(errorMessage);
}
