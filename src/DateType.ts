import Type from './Type';

export class DateType<DataType = any, ErrorMsgType = string> extends Type<
  string | Date,
  DataType,
  ErrorMsgType
> {
  constructor(errorMessage?: ErrorMsgType) {
    super('date');
    super.pushRule(
      value => !/Invalid|NaN/.test(new Date(value).toString()),
      errorMessage || 'Please enter a valid date'
    );
  }

  range(min: string | Date, max: string | Date, errorMessage?: ErrorMsgType) {
    super.pushRule(
      value => new Date(value) >= new Date(min) && new Date(value) <= new Date(max),
      errorMessage
    );
    return this;
  }

  min(min: string | Date, errorMessage?: ErrorMsgType) {
    super.pushRule(value => new Date(value) >= new Date(min), errorMessage);
    return this;
  }

  max(max: string | Date, errorMessage?: ErrorMsgType) {
    super.pushRule(value => new Date(value) <= new Date(max), errorMessage);
    return this;
  }
}

export default function getDateType<DataType = any, ErrorMsgType = string>(
  errorMessage?: ErrorMsgType
) {
  return new DateType<DataType, ErrorMsgType>(errorMessage);
}
