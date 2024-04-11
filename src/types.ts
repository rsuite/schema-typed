import { ArrayType } from './ArrayType';
import { BooleanType } from './BooleanType';
import { DateType } from './DateType';
import { NumberType } from './NumberType';
import { StringType } from './StringType';
import { ObjectType } from './ObjectType';

export type TypeName = 'array' | 'string' | 'boolean' | 'number' | 'object' | 'date';

export interface CheckResult<E = string, DataType = PlainObject> {
  hasError?: boolean;
  errorMessage?: E | string;
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

export type PlainObject<T extends Record<string, unknown> = any> = {
  [P in keyof T]: T;
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

export type SchemaDeclaration<T, E = string> = {
  [P in keyof T]: CheckType<T[P], T, E>;
};

export type SchemaCheckResult<T, E> = {
  [P in keyof T]?: CheckResult<E>;
};
