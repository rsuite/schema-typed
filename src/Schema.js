import StringType from './StringType';

export class Schema {
  constructor(schema) {
    this.schema = schema;
  }

  getFieldType(fieldName) {
    return this.schema[fieldName] || new StringType();
  }

  checkForField(fieldName, fieldValue, data) {
    let fieldChecker = this.schema[fieldName];
    if (!fieldChecker) {
      return { hasError: false }; // fieldValue can be anything if no schema defined
    }
    return fieldChecker.check(fieldValue, data);
  }

  check(data) {
    let checkResult = {};
    Object.keys(this.schema).forEach(key => {
      checkResult[key] = this.checkForField(key, data[key], data);
    });
    return checkResult;
  }
}

export const SchemaModel = o => new Schema(o);
