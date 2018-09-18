import _ from 'lodash';

import Type from './Type';
import { asyncParallelArray } from './util';

class ObjectType extends Type {
  static from(n) {
    return n;
  }

  constructor(errorMessage = 'Please enter a valid `object`') {
    super('object');
    super.addRule((v, __, next) => next(typeof v === 'object'), errorMessage);
  }

  /**
   * @example
   *   ObjectType('这是一个对象').shape({
   *     name: StringType(),
   *     age: NumberType()
   *   })
   */
  shape(types) {
    super.addRule((v, d, cb) => {
      const keys = Object.entries(types);
      let called = false;

      asyncParallelArray(
        keys,
        (key, __, next) =>
          types[key].check(_.get(v, key), d, result => {
            if (result.hasError && !called) {
              called = true;

              cb(result);
            }

            next(result);
          }),
        () => {
          if (!called) cb({ hasError: false });
        }
      );
    }, null);

    return this;
  }
}

export default errorMessage => new ObjectType(errorMessage);
