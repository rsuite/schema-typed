import StringType from './StringType';

export class Schema {
  constructor(schema) {
    this.schema = schema;
  }

  getFieldType(fieldName) {
    return this.schema[fieldName] || new StringType();
  }

  getKeys() {
    return Object.keys(this.schema);
  }

  checkForField(fieldName, fieldValue, data) {
    const fieldChecker = this.schema[fieldName];
    if (!fieldChecker) {
      // fieldValue can be anything if no schema defined
      return { hasError: false };
    }
    return fieldChecker.check(fieldValue, data);
  }

  check(data) {
    const checkResult = {};
    Object.keys(this.schema).forEach(key => {
      checkResult[key] = this.checkForField(key, data[key], data);
    });
    return checkResult;
  }

  checkForFieldAsync(fieldName, fieldValue, data) {
    const fieldChecker = this.schema[fieldName];
    if (!fieldChecker) {
      // fieldValue can be anything if no schema defined
      return Promise.resolve({ hasError: false });
    }
    return fieldChecker.checkAsync(fieldValue, data);
  }

  checkAsync(data) {
    const checkResult = {};
    const promises = [];
    const keys = [];

    Object.keys(this.schema).forEach(key => {
      keys.push(key);
      promises.push(this.checkForFieldAsync(key, data[key], data));
    });

    return Promise.all(promises).then(values => {
      for (let i = 0; i < values.length; i += 1) {
        checkResult[keys[i]] = values[i];
      }
      return checkResult;
    });
  }
}

export const SchemaModel = o => new Schema(o);

SchemaModel.combine = (...models) =>
  new Schema(
    models
      .map(model => model.schema)
      .reduce((accumulator, currentValue) => Object.assign(accumulator, currentValue), {})
  );
