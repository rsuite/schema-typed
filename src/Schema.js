import _ from 'lodash';

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
    const promises = [];
    let checkResult = {};

    Object.keys(this.schema).forEach(key => {
      promises.push(
        new Promise(resolve =>
          this.checkForField(
            key,
            _.get(data, key),
            data,
            result => _.set(checkResult, key, result) && resolve()
          )
        )
      );
    });

    return Promise.all(promises).then(() => {
      cb && cb(checkResult);

      return checkResult;
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
