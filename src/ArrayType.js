import Type from './Type';

class ArrayType extends Type {
  static from(n) {
    return n;
  }

  constructor(errorMessage = 'Please enter a valid array') {
    super('array');
    super.pushCheck(v => Array.isArray(v), errorMessage);
  }

  rangeLength(minLength, maxLength, errorMessage) {
    super.pushCheck(value => value.length >= minLength && value.length <= maxLength, errorMessage);
    return this;
  }

  minLength(minLength, errorMessage) {
    super.pushCheck(value => value.length >= minLength, errorMessage);
    return this;
  }

  maxLength(maxLength, errorMessage) {
    super.pushCheck(value => value.length <= maxLength, errorMessage);
    return this;
  }

  unrepeatable(errorMessage) {
    super.pushCheck(items => {
      let hash = {};
      /* eslint-disable */
      for (let i in items) {
        if (hash[items[i]]) {
          return false;
        }
        hash[items[i]] = true;
      }
      return true;
    }, errorMessage);
    return this;
  }

  /**
   * @example
   * ArrayType('这是一个数组').of(
   *      StringType().isOneOf(['数码','体育','游戏','旅途','其他'],
   *      '只能是选择中的值'
   * )
   */
  of(type, errorMessage) {
    super.pushCheck(items => {
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
