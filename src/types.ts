import { ArrayType } from './ArrayType';
import { BooleanType } from './BooleanType';
import { DateType } from './DateType';
import { NumberType } from './NumberType';
import { StringType } from './StringType';
import { ObjectType } from './ObjectType';

export interface CheckResult<E = string> {
  hasError?: boolean;
  errorMessage?: E | string;
  shape?: CheckResult<E>;
  each?: CheckResult<E>[];
}

export type ValidCallbackType<V, D, E> = (value: V, data?: D) => CheckResult<E> | boolean;

export type PlainObject<T extends Record<string, unknown> = any> = {
  [P in keyof T]: T;
};

export interface RuleType<V, D, E> {
  onValid: ValidCallbackType<V, D, E>;
  errorMessage: E;
}

export type CheckType<X, T, ErrorMsgType = string> = X extends string
  ? StringType<T, ErrorMsgType> | DateType<T, ErrorMsgType> | NumberType<T, ErrorMsgType>
  : X extends number
  ? NumberType<T, ErrorMsgType>
  : X extends boolean
  ? BooleanType<T, ErrorMsgType>
  : X extends Date
  ? DateType<T, ErrorMsgType>
  : X extends Array<any>
  ? ArrayType<T, ErrorMsgType>
  : X extends Record<string, unknown>
  ? ObjectType<T, ErrorMsgType>
  :
      | StringType<T, ErrorMsgType>
      | NumberType<T, ErrorMsgType>
      | BooleanType<T, ErrorMsgType>
      | ArrayType<T, ErrorMsgType>
      | DateType<T, ErrorMsgType>
      | ObjectType<T, ErrorMsgType>;

export type SchemaDeclaration<T, ErrorMsgType = string> = {
  [P in keyof T]: CheckType<T[P], T, ErrorMsgType>;
};

export type SchemaCheckResult<T, ErrorMsgType> = {
  [P in keyof T]: CheckResult<ErrorMsgType>;
};
