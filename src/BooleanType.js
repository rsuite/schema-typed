import Type from './Type';

class BooleanType extends Type {
  static from(n) {
    return n;
  }

  constructor(errorMessage = 'Please enter a valid `boolean`') {
    super('boolean');
    super.pushCheck(v => typeof v === 'boolean', errorMessage);
  }
}

export default errorMessage => new BooleanType(errorMessage);
