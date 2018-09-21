import _ from 'lodash';

import { asyncParallelArray } from './util';

class Schema {
  constructor(schema) {
    this.schema = schema;
  }

  getFieldType(fieldName) {
    return this.schema[fieldName];
  }

  getKeys() {
    return Object.keys(this.schema);
  }

  checkForField(fieldName, fieldValue, data, cb) {
    if (_.isFunction(data)) {
      cb = data;
      data = {};
    }

    let fieldChecker = this.schema[fieldName];

    return new Promise(resolve => {
      if (!fieldChecker) {
        cb && cb({ hasError: false }); // fieldValue can be anything if no schema defined

        return resolve({ hasError: false });
      }

      return fieldChecker.check(fieldValue, data, result => {
        cb && cb(result);

        return resolve(result);
      });
    });
  }

  check(data, cb) {
    return new Promise(resolve => {
      asyncParallelArray(
        Object.keys(this.schema),
        (key, index, next) => this.checkForField(key, _.get(data, key), data, next),
        result => {
          cb && cb(result);

          return resolve(result);
        }
      );
    });
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
