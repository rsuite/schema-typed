import { Type } from './Type';

export declare class StringType<DataType = any, ErrorMsgType = string> extends Type<string, DataType, ErrorMsgType> {
    readonly name: 'string';
    constructor(errorMessage?: ErrorMsgType);
    containsLetter: (errorMessage?: ErrorMsgType) => this;
    containsUppercaseLetter: (errorMessage?: ErrorMsgType) => this;
    containsLowercaseLetter: (errorMessage?: ErrorMsgType) => this;
    containsLetterOnly: (errorMessage?: ErrorMsgType) => this;
    containsNumber: (errorMessage?: ErrorMsgType) => this;
    isOneOf: (strArr: string[], errorMessage?: ErrorMsgType) => this;
    isEmail: (errorMessage?: ErrorMsgType) => this;
    isURL: (errorMessage?: ErrorMsgType) => this;
    isHex: (errorMessage?: ErrorMsgType) => this;
    pattern: (regexp: RegExp, errorMessage?: ErrorMsgType) => this;
    rangeLength: (minLength: number, maxLength: number, errorMessage?: ErrorMsgType) => this;
    minLength: (minLength: number, errorMessage?: ErrorMsgType) => this;
    maxLength: (maxLength: number, errorMessage?: ErrorMsgType) => this;
}

declare function getStringType<DataType = any, ErrorMsgType = string>(errorMessage?: ErrorMsgType): StringType<DataType, ErrorMsgType>;

type exportType = typeof getStringType;

export default exportType;