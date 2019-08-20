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
    super.pushRule(value => /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value), errorMessage);
  }

  isInteger(errorMessage) {
    super.pushRule(value => /^-?\d+$/.test(value), errorMessage);
    return this;
  }

  pattern(regexp, errorMessage) {
    super.pushRule(value => regexp.test(value), errorMessage);
    return this;
  }

  isOneOf(numLst, errorMessage) {
    super.pushRule(value => numLst.includes(FN(value)), errorMessage);
    return this;
  }

  range(min, max, errorMessage) {
    super.pushRule(value => FN(value) >= min && FN(value) <= max, errorMessage);
    return this;
  }

  min(min, errorMessage) {
    super.pushRule(value => FN(value) >= min, errorMessage);
    return this;
  }

  max(max, errorMessage) {
    super.pushRule(value => FN(value) <= max, errorMessage);
    return this;
  }
}

export default errorMessage => new NumberType(errorMessage);
