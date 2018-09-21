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
    super.addRule(
      (v, _, next) => next(/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(v)),
      errorMessage
    );
  }

  isInteger(errorMessage) {
    super.addRule((v, _, next) => next(/^-?\d+$/.test(v)), errorMessage);

    return this;
  }

  pattern(regexp, errorMessage) {
    super.addRule((v, _, next) => next(regexp.test(v)), errorMessage);

    return this;
  }

  isOneOf(numLst, errorMessage) {
    super.addRule((v, _, next) => next(numLst.includes(FN(v))), errorMessage);

    return this;
  }

  range(min, max, errorMessage) {
    super.addRule((v, _, next) => next(FN(v) >= min && FN(v) <= max), errorMessage);

    return this;
  }

  min(min, errorMessage) {
    super.addRule((v, _, next) => next(FN(v) >= min), errorMessage);

    return this;
  }

  max(max, errorMessage) {
    super.addRule((v, _, next) => next(FN(v) <= max), errorMessage);

    return this;
  }
}

export default errorMessage => new NumberType(errorMessage);
