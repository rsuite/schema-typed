import { StringType } from './types.js';

export class Schema {
    constructor(schema) {
        this.schema = schema;
    }

    getFieldType(fieldName) {
        return this.schema[fieldName] || StringType();
    }

    checkForField(fieldName, fieldValue) {
        let fieldChecker = this.schema[fieldName];
        if(!fieldChecker) {
            return { err: false };  // fieldValue can be anything if no schema defined
        }
        return fieldChecker.check(fieldValue);
    }

    check(value, cb) {
        let checkResult = {};
        for(let fieldName in this.schema) {
            let fieldValue = value[fieldName];
            checkResult[fieldName] = this.checkForField(fieldName, fieldValue);
        }
        return checkResult;
    }
}

export const SchemaBuilder = (o) => new Schema(o);
export * from './types.js';

