import ArrayType, { ArrayType as ArrayCheckType } from './ArrayType';
import BooleanType, { BooleanType as BooleanCheckType } from './BooleanType';
import DateType, { DateType as DateCheckType } from './DateType';
import NumberType, { NumberType as NumberCheckType } from './NumberType';
import StringType, { StringType as StringCheckType } from './StringType';
import ObjectType, { ObjectType as ObjectCheckType } from './ObjectType';
import SchemaModel, { Schema } from './Schema';
import { SchemaDeclaration } from './SchemaDeclaration';

export type CheckType<DataType = any> =
    ArrayCheckType<any, DataType>
    | BooleanCheckType<DataType>
    | DateCheckType<DataType>
    | NumberCheckType<DataType>
    | StringCheckType<DataType>
    | ObjectCheckType<any, DataType>;

declare const ArrayType: ArrayType;
declare const BooleanType: BooleanType;
declare const DateType: DateType;
declare const StringType: StringType;
declare const ObjectType: ObjectType;
declare const NumberType: NumberType;

export {
    ArrayType,
    BooleanType,
    DateType,
    StringType,
    ObjectType,
    NumberType,
    SchemaModel,
    SchemaDeclaration,
    Schema
}

declare namespace SchemaNs {
    const Model: typeof SchemaModel;
    const Types: {
        StringType: StringType;
        NumberType: NumberType;
        ArrayType: ArrayType;
        DateType: DateType;
        ObjectType: ObjectType;
        BooleanType: BooleanType;
    };
}

export default SchemaNs;