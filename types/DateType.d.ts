import { Type } from './Type';

export declare class DateType<DataType = any, ErrorMsgType = string> extends Type<string | Date, DataType, ErrorMsgType> {
    readonly name: 'date';
    constructor(errorMessage?: ErrorMsgType);
    range: (min: string | Date, max: string | Date, errorMessage?: ErrorMsgType) => this;
    min: (min: string | Date, errorMessage?: ErrorMsgType) => this;
    max: (max: string | Date, errorMessage?: ErrorMsgType) => this;
}

declare function getDateType<DataType = any, ErrorMsgType = string>(errorMessage?: ErrorMsgType): DateType<DataType, ErrorMsgType>;

type exportType = typeof getDateType;

export default exportType;