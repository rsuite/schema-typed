import { MixedType } from './MixedType';
import { PlainObject, SchemaDeclaration } from './types';

export class ObjectType<DataType = any, ErrorMsgType = string> extends MixedType<
  PlainObject,
  DataType,
  ErrorMsgType
> {
  constructor(errorMessage?: ErrorMsgType) {
    super('object');
    super.pushRule(v => typeof v === 'object', errorMessage || 'Please enter a valid `object`');
  }

  /**
   * @example
   * ObjectType().shape({
   *  name: StringType(),
   *  age: NumberType()
   * })
   */
  shape(types: SchemaDeclaration<DataType, ErrorMsgType>) {
    super.setSchemaShape(types);

    return this;
  }
}

export default function getObjectType<DataType = any, ErrorMsgType = string>(
  errorMessage?: ErrorMsgType
) {
  return new ObjectType<DataType, ErrorMsgType>(errorMessage);
}
