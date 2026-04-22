import { ArrayType } from './ArrayType';
import { BooleanType } from './BooleanType';
import { DateType } from './DateType';
import { NumberType } from './NumberType';
import { StringType } from './StringType';
import { ObjectType } from './ObjectType';
import type { MixedType } from './MixedType';
import type { Schema } from './Schema';

export type TypeName = 'array' | 'string' | 'boolean' | 'number' | 'object' | 'date';

export interface CheckResult<E = string, DataType = PlainObject> {
  hasError?: boolean;
  errorMessage?: E | string;
  /** All error messages collected when `abortEarly` is `false`. */
  errorMessages?: (E | string)[];
  object?: {
    [P in keyof DataType]: CheckResult<E>;
  };
  array?: CheckResult<E>[];
}
export type ErrorMessageType = string;
export type ValidCallbackType<V, D, E> = (
  value: V,
  data?: D,
  fieldName?: string | string[]
) => CheckResult<E> | boolean;

export type AsyncValidCallbackType<V, D, E> = (
  value: V,
  data?: D,
  fieldName?: string | string[]
) => CheckResult<E> | boolean | Promise<boolean | CheckResult<E>>;

/** A plain key-value record type. */
export type PlainObject<T extends Record<string, unknown> = any> = {
  [P in keyof T]: T[P];
};

export interface RuleType<V, D, E> {
  onValid: AsyncValidCallbackType<V, D, E>;
  errorMessage?: any;
  priority?: boolean;
  params?: any;
  isAsync?: boolean;
}

export type CheckType<X, T, E = ErrorMessageType> = X extends string
  ? StringType<T, E> | DateType<T, E> | NumberType<T, E>
  : X extends number
  ? NumberType<T, E>
  : X extends boolean
  ? BooleanType<T, E>
  : X extends Date
  ? DateType<T, E>
  : X extends Array<any>
  ? ArrayType<T, E>
  : X extends Record<string, unknown>
  ? ObjectType<T, E>
  :
      | StringType<T, E>
      | NumberType<T, E>
      | BooleanType<T, E>
      | ArrayType<T, E>
      | DateType<T, E>
      | ObjectType<T, E>;

/**
 * Declaration of a schema — each key maps to a validator for that field.
 * All fields are optional so you can describe partial data shapes.
 */
export type SchemaDeclaration<T, E = string> = {
  [P in keyof T]?: CheckType<T[P], T, E>;
};

export type SchemaCheckResult<T, E> = {
  [P in keyof T]?: CheckResult<E>;
};

// ---------------------------------------------------------------------------
// Type-inference utilities
// ---------------------------------------------------------------------------

/**
 * Extract the `ValueType` that a `MixedType` (or any subclass) validates.
 *
 * @example
 * type S = TypeOf<StringType>; // string
 * type N = TypeOf<NumberType>; // number | string
 */
export type TypeOf<T extends MixedType<any, any, any>> = T extends MixedType<infer V, any, any>
  ? V
  : never;

/**
 * Infer the `DataType` of a compiled `Schema` instance.
 *
 * @example
 * const model = SchemaModel<{ name: string; age: number }>({ ... });
 * type FormData = InferType<typeof model>; // { name: string; age: number }
 */
export type InferType<T extends Schema<any, any>> = T extends Schema<infer D, any> ? D : never;

