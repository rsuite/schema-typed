import { CheckType } from './SchemaDeclaration';
import { Type } from './Type';

export declare class ArrayType<ValueType = any, DataType = any, ErrorMsgType = string> extends Type<ValueType, DataType, ErrorMsgType> {
    readonly name: 'array';
    constructor(errorMessage?: ErrorMsgType);
    rangeLength: (minLength: number, maxLength: number, errorMessage?: ErrorMsgType) => this;
    minLength: (minLength: number, errorMessage?: ErrorMsgType) => this;
    maxLength: (maxLength: number, errorMessage?: ErrorMsgType) => this;
    unrepeatable: (errorMessage?: ErrorMsgType) => this;
    of: (type: CheckType<ValueType, DataType, ErrorMsgType>, errorMessage?: ErrorMsgType) => this;
}

declare function getArrayType<ValueType = any, DataType = any, ErrorMsgType = string>(errorMessage?: ErrorMsgType): ArrayType<ValueType, DataType, ErrorMsgType>;

type exportType = typeof getArrayType;

export default exportType;