import { Type } from './Type';

export declare class NumberType<DataType = any, ErrorMsgType = string> extends Type<number, DataType, ErrorMsgType> {
    readonly name: 'number';
    constructor(errorMessage?: ErrorMsgType);
    isInteger: (errorMessage?: ErrorMsgType) => this;
    pattern: (regexp: RegExp, errorMessage?: ErrorMsgType) => this;
    isOneOf: (numLst: number[], errorMessage?: ErrorMsgType) => this;
    range: (min: number, max: number, errorMessage?: ErrorMsgType) => this;
    min: (min: number, errorMessage?: ErrorMsgType) => this;
    max: (max: number, errorMessage?: ErrorMsgType) => this;
}

declare function getNumberType<DataType = any, ErrorMsgType = string>(errorMessage?: ErrorMsgType): NumberType<DataType, ErrorMsgType>;

type exportType = typeof getNumberType;

export default exportType;