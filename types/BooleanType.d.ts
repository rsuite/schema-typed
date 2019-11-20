import { Type } from './Type';

export declare class BooleanType<DataType = any, ErrorMsgType = string> extends Type<boolean, DataType, ErrorMsgType> {
    readonly name: 'boolean';
    constructor(errorMessage?: ErrorMsgType);
}

declare function getBooleanType<DataType = any, ErrorMsgType = string>(errorMessage?: ErrorMsgType): BooleanType<DataType, ErrorMsgType>;

type exportType = typeof getBooleanType;

export default exportType;