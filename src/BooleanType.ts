import { MixedType } from './MixedType';

export class BooleanType<DataType = any, ErrorMsgType = string> extends MixedType<
  boolean,
  DataType,
  ErrorMsgType
> {
  constructor(errorMessage?: ErrorMsgType) {
    super('boolean');
    super.pushRule(v => typeof v === 'boolean', errorMessage || 'Please enter a valid `boolean`');
  }
}

export default function getBooleanType<DataType = any, ErrorMsgType = string>(
  errorMessage?: ErrorMsgType
) {
  return new BooleanType<DataType, ErrorMsgType>(errorMessage);
}
