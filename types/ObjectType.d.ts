import { SchemaDeclaration } from './SchemaDeclaration';
import { Type } from './Type';

export declare class ObjectType<ValueType = any, DataType = any, ErrorMsgType = string> extends Type<ValueType, DataType, ErrorMsgType> {
    name: 'object';
    readonly shapeType: SchemaDeclaration<ValueType, ErrorMsgType>;
    constructor(errorMessage?: ErrorMsgType);
    shape: (types: SchemaDeclaration<ValueType, ErrorMsgType>) => this;
}

declare function getObjectType<ValueType = any, DataType = any, ErrorMsgType = string>(errorMessage?: ErrorMsgType): ObjectType<ValueType, DataType, ErrorMsgType>;

type exportType = typeof getObjectType;

export default exportType;