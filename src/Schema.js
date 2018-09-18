import _ from 'lodash';

import StringType from './StringType';

class Schema {
  constructor(schema) {
    this.schema = schema;
  }

  getFieldType(fieldName) {
    return this.schema[fieldName] || new StringType();
  }

  getKeys() {
    return Object.keys(this.schema);
  }

  checkForField(fieldName, fieldValue, data, cb) {
    let fieldChecker = _.get(this.schema, fieldName);

    if (!fieldChecker) {
      return cb && cb({ hasError: false }); // fieldValue can be anything if no schema defined
    }

    return fieldChecker.check(fieldValue, data, cb);
  }

  check(data, cb) {
    let checkResult = {};

    Object.keys(this.schema).forEach(key =>
      this.checkForField(key, data[key], data, result => {
        _.set(checkResult, key, result);
      })
    );

    return _.isEmpty(checkResult) ? cb && cb(null) : cb && cb(checkResult);
  }
}

const SchemaModel = o => new Schema(o);

SchemaModel.combine = (...models) =>
  new Schema(
    models
      .map(model => model.schema)
      .reduce((accumulator, currentValue) => Object.assign(accumulator, currentValue), {})
  );

export { Schema, SchemaModel };
