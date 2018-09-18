import Type from './Type';

class DateType extends Type {
  static from(n) {
    return n;
  }

  constructor(errorMessage = 'Please enter a valid date') {
    super('date');
    super.addRule((v, _, next) => next(!/Invalid|NaN/.test(new Date(v))), errorMessage);
  }

  range(min, max, errorMessage) {
    super.addRule(
      (v, _, next) => next(new Date(v) >= new Date(min) && new Date(v) <= new Date(max)),
      errorMessage
    );

    return this;
  }

  min(min, errorMessage) {
    super.addRule((v, _, next) => next(new Date(v) >= new Date(min)), errorMessage);

    return this;
  }

  max(max, errorMessage) {
    super.addRule((v, _, next) => next(new Date(v) <= new Date(max)), errorMessage);

    return this;
  }
}

export default errorMessage => new DateType(errorMessage);
