import { CheckType, SchemaDeclaration } from './SchemaDeclaration';
import { CheckResult } from './Type';

type SchemaCheckResult<T, ErrorMsgType> = {
    [P in keyof T]: CheckResult<ErrorMsgType>
};

export declare class Schema<DataType = any, ErrorMsgType = string> {
    constructor(schema: SchemaDeclaration<DataType, ErrorMsgType>);
    schema: SchemaDeclaration<DataType, ErrorMsgType>;
    getFieldType: <K extends keyof DataType>(fieldName: K) => CheckType<DataType[K], DataType, ErrorMsgType>;
    getKeys: () => string[];
    checkForField: <K extends keyof DataType>(fieldName: K, fieldValue: DataType[K], data?: DataType) => CheckResult<ErrorMsgType>;
    checkForFieldAsync: <K extends keyof DataType>(fieldName: K, fieldValue: DataType[K], data?: DataType) => Promise<CheckResult<ErrorMsgType>>;
    check: (data: DataType) => SchemaCheckResult<DataType, ErrorMsgType>;
    checkAsync: (data: DataType) => Promise<SchemaCheckResult<DataType, ErrorMsgType>>;
}

declare function SchemaModel<DataType = any, ErrorMsgType = string>(schema: SchemaDeclaration<DataType, ErrorMsgType>): Schema<DataType>;

declare namespace SchemaModel {
    const combine: <DataType = any, ErrorMsgType = string>(...models: Array<Schema<any, ErrorMsgType>>) =>
        Schema<DataType, ErrorMsgType>;
}

export default SchemaModel;