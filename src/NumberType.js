import Type from './Type';

function _f(value) {
  return +value;
}



class NumberType extends Type {
  static from(n) {
    return n;
  }

  constructor(errorMessage = 'Please enter a valid number') {
    super('number');
    super.addRule(value => /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value), errorMessage);
  }

  isInteger() {
    super.addRule(value => /^-?\d+$/.test(value), errorMessage);
  }

  pattern(regexp, errorMessage) {
    super.addRule(value => regexp.test(value), errorMessage);
    return this;
  }

  isOneOf(numLst, errorMessage) {
    super.addRule(value => _f(value) in numLst, errorMessage);
    return this;
  }

  range(min, max, errorMessage) {
    super.addRule(value => _f(value) >= min && _f(value) <= max, errorMessage);
    return this;
  }

  min(min, errorMessage) {
    super.addRule(value => _f(value) >= min, errorMessage);
    return this;
  }

  max(max, errorMessage) {
    super.addRule(value => _f(value) <= max, errorMessage);
    return this;
  }
}

export default (errorMessage) => new NumberType(errorMessage);
