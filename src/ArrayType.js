import Type from './Type';

class ArrayType extends Type {
  static from(n) {
    return n;
  }

  constructor(errorMessage = 'Please enter a valid array') {
    super('array');
    super.addRule((v, _, cb) => cb(Array.isArray(v)), errorMessage);
  }

  rangeLength(minLength, maxLength, errorMessage) {
    super.addRule((v, _, cb) => cb(v.length >= minLength && v.length <= maxLength), errorMessage);

    return this;
  }

  minLength(minLength, errorMessage) {
    super.addRule((v, _, cb) => cb(v.length >= minLength), errorMessage);

    return this;
  }

  maxLength(maxLength, errorMessage) {
    super.addRule((v, _, cb) => cb(v.length <= maxLength), errorMessage);

    return this;
  }

  unrepeatable(errorMessage) {
    super.addRule((v, _, cb) => {
      let hash = {};

      /* eslint-disable */
      for (let i in v) {
        if (hash[v[i]]) {
          return cb(false);
        }

        hash[v[i]] = true;
      }

      return cb(true);
    }, errorMessage);
    return this;
  }

  /**
   * @example
   *  ArrayType('这是一个数组').of(
   *    StringType().isOneOf(['数码','体育','游戏','旅途','其他'],
   *    '只能是选择中的值'
   *  )
   */
  of(type, errorMessage) {
    super.addRule(items => {
      let valids = items.map(value => type.check(value));
      let errors = valids.filter(item => item.hasError) || [];

      if (errors.length) {
        return errors[0];
      }

      return errors.length === 0;
    }, errorMessage);

    return this;
  }
}

export default errorMessage => new ArrayType(errorMessage);
