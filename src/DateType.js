import Type from './Type';

class DateType extends Type {
  static from(n) {
    return n;
  }

  constructor(errorMessage = 'Please enter a valid date') {
    super('date');
    super.pushCheck(value => !/Invalid|NaN/.test(new Date(value)), errorMessage);
  }

  range(min, max, errorMessage) {
    super.pushCheck(
      value => new Date(value) >= new Date(min) && new Date(value) <= new Date(max),
      errorMessage
    );
    return this;
  }

  min(min, errorMessage) {
    super.pushCheck(value => new Date(value) >= new Date(min), errorMessage);
    return this;
  }

  max(max, errorMessage) {
    super.pushCheck(value => new Date(value) <= new Date(max), errorMessage);
    return this;
  }
}

export default errorMessage => new DateType(errorMessage);
