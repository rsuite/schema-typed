import { ArrayType } from './ArrayType';
import { BooleanType } from './BooleanType';
import { DateType } from './DateType';
import { NumberType } from './NumberType';
import { StringType } from './StringType';
import { ObjectType } from './ObjectType';

export type CheckType<X, T, ErrorMsgType = string> =
    X extends string ? StringType<T, ErrorMsgType> | DateType<T, ErrorMsgType> | NumberType<T, ErrorMsgType>:
        X extends number ? NumberType<T, ErrorMsgType>:
            X extends boolean ? BooleanType<T, ErrorMsgType>:
                X extends Date ? DateType<T, ErrorMsgType>:
                    X extends Array<infer I> ? ArrayType<I, T, ErrorMsgType>:
                        X extends object ? ObjectType<X, T, ErrorMsgType> :
                            StringType<T, ErrorMsgType> |
                            NumberType<T, ErrorMsgType> |
                            BooleanType<T, ErrorMsgType> |
                            ArrayType<any, T, ErrorMsgType> |
                            DateType<T, ErrorMsgType> |
                            ObjectType<X, T, ErrorMsgType>;

export type SchemaDeclaration<T, ErrorMsgType = string> = {
    [P in keyof T]: CheckType<T[P], T, ErrorMsgType>;
}