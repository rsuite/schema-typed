import Type from './Type';

function FN(value) {
  return +value;
}

class NumberType extends Type {
  static from(n) {
    return n;
  }

  constructor(errorMessage = 'Please enter a valid number') {
    super('number');
    super.pushCheck(value => /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value), errorMessage);
  }

  isInteger(errorMessage) {
    super.pushCheck(value => /^-?\d+$/.test(value), errorMessage);
    return this;
  }

  pattern(regexp, errorMessage) {
    super.pushCheck(value => regexp.test(value), errorMessage);
    return this;
  }

  isOneOf(numLst, errorMessage) {
    super.pushCheck(value => numLst.includes(FN(value)), errorMessage);
    return this;
  }

  range(min, max, errorMessage) {
    super.pushCheck(value => FN(value) >= min && FN(value) <= max, errorMessage);
    return this;
  }

  min(min, errorMessage) {
    super.pushCheck(value => FN(value) >= min, errorMessage);
    return this;
  }

  max(max, errorMessage) {
    super.pushCheck(value => FN(value) <= max, errorMessage);
    return this;
  }
}

export default errorMessage => new NumberType(errorMessage);
