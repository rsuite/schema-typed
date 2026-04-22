import { MixedType } from './MixedType';
import { ErrorMessageType } from './types';

/**
 * A type that validates an exact literal value (`string`, `number`, or `boolean`).
 *
 * @example
 * // Exact string
 * LiteralType('admin')
 *
 * // Exact number
 * LiteralType(42)
 *
 * // Used inside a schema
 * SchemaModel({
 *   role: LiteralType('admin').isRequired(),
 *   version: LiteralType(2)
 * });
 */
export class LiteralType<
  V extends string | number | boolean,
  DataType = any,
  E = ErrorMessageType
> extends MixedType<V, DataType, E> {
  constructor(literalValue: V, errorMessage?: E | string) {
    super();
    const defaultMsg =
      errorMessage || (`Value must be ${JSON.stringify(literalValue)}` as E | string);
    super.pushRule({
      onValid: v => v === literalValue,
      errorMessage: defaultMsg,
      params: { value: literalValue }
    });
  }
}

export default function getLiteralType<
  V extends string | number | boolean,
  DataType = any,
  E = string
>(value: V, errorMessage?: E) {
  return new LiteralType<V, DataType, E>(value, errorMessage);
}
